import os
import json
import feedparser
import requests
from datetime import datetime
from groq import Groq
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
# Limite máximo de novos registos a adicionar por execução (para controlo de testes e custos da API)
MAX_REGISTRIES_PER_RUN = int(os.getenv("MAX_REGISTRIES_PER_RUN", 1000))

# Initialization
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
else:
    groq_client = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    supabase = None

RSS_FEEDS = [
    "https://www.reddit.com/r/electricvehicles/new/.rss",
    "https://insideevs.com/rss/news/all/"
]

def fetch_rss_data():
    """Fetches and parses RSS feeds for EV news and forum posts."""
    articles = []
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) EVRS_Bot/1.0"}
    
    for url in RSS_FEEDS:
        print(f"Fetching RSS: {url}")
        feed = feedparser.parse(url, request_headers=headers)
        # Extrai todos os artigos disponíveis no feed
        for entry in feed.entries:
            articles.append({
                "title": entry.title,
                "summary": getattr(entry, 'summary', ''),
                "link": entry.link,
                "published": getattr(entry, 'published', datetime.now().isoformat())
            })
    return articles

def analyze_with_ai(text: str):
    """
    Uses Groq LLM to categorize, translate, and extract structured EV data.
    """
    if not groq_client:
        print("Groq API key missing. Skipping AI analysis.")
        return None

    prompt = f"""
    Analyze the following text about Electric Vehicles.
    Extract the following information in strict JSON format:
    {{
        "brand": "Brand Name (e.g., Tesla, Hyundai)",
        "model": "Model Name (e.g., Model 3, Ioniq 5)",
        "type": "Must be exactly one of: 'Real Range', 'Mechanical', 'Battery', or 'Positives'",
        "description": "Translate the main point to International English in 1-2 sentences",
        "language_original": "e.g., 'EN', 'PT', 'FR'",
        "contradictory_info": true or false (boolean)
    }}
    If the text is NOT about a specific EV model, return {{"error": "Not an EV review/report"}}.
    
    Text: {text}
    """

    try:
        response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            response_format={"type": "json_object"},
            temperature=0.1
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error during AI analysis: {e}")
        return None

def save_to_supabase(data, link):
    """Saves the structured data to Supabase (vehicles and reports) and returns True if successful."""
    if not supabase:
        print("Supabase credentials missing. Mocking save operation...")
        print(f"Would save: {data}")
        return False

    try:
        # 1. Upsert Vehicle
        vehicle_res = supabase.table('vehicles').upsert(
            {"brand": data['brand'], "model": data['model']},
            on_conflict="brand,model"
        ).execute()

        if vehicle_res.data:
            vehicle_id = vehicle_res.data[0]['id']
            
            # 2. Insert Report
            supabase.table('reports').insert({
                "vehicle_id": vehicle_id,
                "type": data['type'],
                "description": data['description'],
                "source_link": link,
                "source_count": 1,
                "report_date": datetime.now().strftime("%Y-%m-%d"),
                "language_original": data['language_original']
            }).execute()
            print(f"Saved report for {data['brand']} {data['model']} to DB.")
            return True
    except Exception as e:
        print(f"Error saving to DB: {e}")
        return False
    return False

def send_summary_email(new_count, total_count):
    """Sends a summary report via Resend."""
    if not RESEND_API_KEY:
        print("RESEND_API_KEY missing. Mocking summary email...")
        print(f"New Registries: {new_count} | Total Registries: {total_count}")
        return

    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #10b981;">✅ EVRS Scraper Update Complete</h2>
        <p>The weekly web scraping and database update has finished successfully.</p>
        <hr style="border-top: 1px solid #e2e8f0;" />
        <h3 style="color: #1e293b;">Stats:</h3>
        <ul>
            <li><strong>New Registries Added:</strong> {new_count}</li>
            <li><strong>Total Registries in DB:</strong> {total_count}</li>
        </ul>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Automated by GitHub Actions</p>
    </div>
    """
    
    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "from": "EVRS Alerts <onboarding@resend.dev>",
                "to": "filmfer@gmail.com",
                "subject": f"EVRS Weekly Report: {new_count} New Registries Added",
                "html": html_content
            }
        )
        if response.status_code in [200, 201]:
            print("Summary email sent successfully.")
        else:
            print(f"Failed to send email: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error sending summary email: {e}")

def main():
    print("Starting EVRS Scraper Agent...")
    articles = fetch_rss_data()
    print(f"Found {len(articles)} articles.")
    new_registries = 0
    
    for idx, article in enumerate(articles):
        if new_registries >= MAX_REGISTRIES_PER_RUN:
            print(f"\nAtingido o limite configurado de novos registos ({MAX_REGISTRIES_PER_RUN}). A parar scraper...")
            break
            
        link = article['link']
        
        # Check for duplication before using Groq API
        if supabase:
            try:
                existing = supabase.table('reports').select('id').eq('source_link', link).execute()
                if existing.data and len(existing.data) > 0:
                    print(f"[{idx+1}/{len(articles)}] Skipped (Already processed): {link}")
                    continue
            except Exception as e:
                pass
                
        text_to_analyze = f"{article['title']} - {article['summary']}"
        print(f"[{idx+1}/{len(articles)}] Analyzing: {article['title'][:50]}...")
        
        extracted_data = analyze_with_ai(text_to_analyze)
        
        if extracted_data and 'error' not in extracted_data:
            if 'brand' in extracted_data and 'model' in extracted_data:
                print(f" -> Extracted: {extracted_data['brand']} {extracted_data['model']} | {extracted_data['type']}")
                if save_to_supabase(extracted_data, link):
                    new_registries += 1
        else:
            print(" -> Ignored (Not relevant or error).")
            
    # Fetch total amount of registries
    total_registries = 0
    if supabase:
        try:
            # For Supabase we can fetch the count
            response = supabase.table('reports').select('*', count='exact').limit(1).execute()
            total_registries = response.count if response.count is not None else 0
        except Exception as e:
            print(f"Error fetching total count: {e}")
            
    # Send email
    send_summary_email(new_registries, total_registries)

if __name__ == "__main__":
    main()
