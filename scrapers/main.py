import os
import re
import time
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
MAX_REGISTRIES_PER_RUN = int(os.getenv("MAX_REGISTRIES_PER_RUN", 100000))

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
    # Reddit EV Owner Communities (Public RSS)
    "https://www.reddit.com/r/electricvehicles/new/.rss?limit=100",
    "https://www.reddit.com/r/evs/new/.rss?limit=50",
    "https://www.reddit.com/r/TeslaMotors/new/.rss?limit=50",
    "https://www.reddit.com/r/TeslaLounge/new/.rss?limit=50",
    "https://www.reddit.com/r/MachE/new/.rss?limit=50",
    "https://www.reddit.com/r/Ioniq5/new/.rss?limit=50",
    "https://www.reddit.com/r/Rivian/new/.rss?limit=50",
    "https://www.reddit.com/r/VWiD4Owners/new/.rss?limit=50",
    "https://www.reddit.com/r/BoltEV/new/.rss?limit=40",
    "https://www.reddit.com/r/Polestar/new/.rss?limit=40",
    "https://www.reddit.com/r/KiaEV6/new/.rss?limit=40",
    "https://www.reddit.com/r/KiaEV9/new/.rss?limit=40",
    "https://www.reddit.com/r/Lucid/new/.rss?limit=40",
    "https://www.reddit.com/r/BYD/new/.rss?limit=40",
    "https://www.reddit.com/r/EuroEV/new/.rss?limit=40",
    "https://www.reddit.com/r/BMWiX/new/.rss?limit=40",
    "https://www.reddit.com/r/EquinoxEV/new/.rss?limit=40",
    # EV News & Review Portals (Public RSS)
    "https://insideevs.com/rss/news/all/",
    "https://insideevs.com/rss/reviews/all/",
    "https://electrek.co/feed/",
    "https://cleantechnica.com/category/clean-transport/feed/",
    "https://www.electrive.com/feed/",
    "https://www.greencarreports.com/rss/news",
    # Official YouTube EV Review Channels (Public Syndication XML Feeds)
    "https://www.youtube.com/feeds/videos.xml?channel_id=UCG1QcV31eoSaX4rE8avQL4A",  # Bjørn Nyland
    "https://www.youtube.com/feeds/videos.xml?channel_id=UCyUkxZe25fHq3A_bRwWMGfA",  # Out of Spec Reviews
    "https://www.youtube.com/feeds/videos.xml?channel_id=UCdX0BJ9riRNMMJ9O4R9bE6w",  # State Of Charge
    "https://www.youtube.com/feeds/videos.xml?channel_id=UCzz4CoEgSgWNs9ZAvRMhW2A",  # Fully Charged Show
]

NHTSA_EV_MODELS = [
    ("TESLA", "MODEL 3", 2024),
    ("TESLA", "MODEL Y", 2024),
    ("HYUNDAI", "IONIQ 5", 2024),
    ("FORD", "MUSTANG MACH-E", 2024),
    ("RIVIAN", "R1T", 2024),
    ("VOLKSWAGEN", "ID.4", 2024),
    ("KIA", "EV6", 2024),
    ("CHEVROLET", "BOLT EV", 2023),
]


def fetch_nhtsa_complaints():
    """Fetches public-domain owner complaints from the official US NHTSA API (100% legal & free)."""
    complaints = []
    for make, model, year in NHTSA_EV_MODELS:
        url = (
            f"https://api.nhtsa.gov/complaints/complaintsByVehicle"
            f"?make={requests.utils.quote(make)}&model={requests.utils.quote(model)}&modelYear={year}"
        )
        try:
            print(f"Fetching NHTSA Public API: {make} {model} ({year})")
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                payload = resp.json()
                for item in (payload.get("results") or [])[:5]:
                    odi_id = item.get("odiNumber")
                    summary = item.get("summary", "")
                    components = item.get("components", "UNKNOWN")
                    if odi_id and summary:
                        complaints.append({
                            "title": f"[NHTSA {make} {model} - {components}]",
                            "summary": summary[:800],
                            "link": f"https://www.nhtsa.gov/vehicle/{year}/{make}/{model}#odi-{odi_id}",
                            "published": datetime.now().isoformat(),
                        })
        except Exception as e:
            print(f"Warning fetching NHTSA for {make} {model}: {e}")
    return complaints


def fetch_rss_data():
    """Fetches and parses RSS feeds (Reddit, EV News, YouTube XML) plus NHTSA public API."""
    articles = []
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) EVRS_Bot/1.0"}
    
    for url in RSS_FEEDS:
        print(f"Fetching RSS: {url}")
        try:
            feed = feedparser.parse(url, request_headers=headers)
            for entry in feed.entries:
                summary = getattr(entry, "summary", "") or getattr(entry, "description", "")
                articles.append({
                    "title": entry.title,
                    "summary": summary[:1000],
                    "link": entry.link,
                    "published": getattr(entry, "published", datetime.now().isoformat())
                })
        except Exception as e:
            print(f"Warning parsing RSS {url}: {e}")

    articles.extend(fetch_nhtsa_complaints())
    return articles

BRAND_ALIASES = {
    "vw": "Volkswagen",
    "volkswagen": "Volkswagen",
    "mercedes": "Mercedes-Benz",
    "mercedes-benz": "Mercedes-Benz",
    "mercedes benz": "Mercedes-Benz",
    "chevy": "Chevrolet",
    "chevrolet": "Chevrolet",
    "lucid motors": "Lucid",
    "lucid": "Lucid",
    "tesla": "Tesla",
    "hyundai": "Hyundai",
    "kia": "Kia",
    "ford": "Ford",
    "rivian": "Rivian",
    "bmw": "BMW",
    "byd": "BYD",
    "mg": "MG",
    "nio": "Nio",
    "xpeng": "XPeng",
    "zeekr": "Zeekr",
    "polestar": "Polestar",
    "volvo": "Volvo",
    "porsche": "Porsche",
    "audi": "Audi",
    "nissan": "Nissan",
    "peugeot": "Peugeot",
    "renault": "Renault",
    "fiat": "Fiat",
    "skoda": "Skoda",
    "škoda": "Skoda",
    "cupra": "Cupra",
    "dacia": "Dacia",
    "toyota": "Toyota",
    "subaru": "Subaru",
    "honda": "Honda",
    "lexus": "Lexus",
    "mazda": "Mazda",
    "mini": "Mini",
    "smart": "Smart",
    "jaguar": "Jaguar",
    "aston martin": "Aston Martin",
    "omoda": "Omoda",
}

VALID_REPORT_TYPES = {"Real Range", "Mechanical", "Battery", "Positives"}

# Prioritized list of Groq chat/text models (updated for current GroqCloud production models)
PREFERRED_GROQ_MODELS = [
    os.getenv("GROQ_MODEL", "").strip(),
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
]
PREFERRED_GROQ_MODELS = [m for m in PREFERRED_GROQ_MODELS if m]

NON_CHAT_MODEL_KEYWORDS = (
    "whisper",
    "orpheus",
    "guard",
    "safeguard",
    "tts",
    "playai",
    "embed",
    "allam",
)

CANDIDATE_MODELS = []


def init_groq_models():
    """Discovers active chat models available to this GROQ_API_KEY, ordered by preference."""
    global CANDIDATE_MODELS
    if not groq_client:
        CANDIDATE_MODELS = list(PREFERRED_GROQ_MODELS)
        return

    try:
        models_resp = groq_client.models.list()
        available_ids = [
            m.id for m in getattr(models_resp, "data", [])
            if getattr(m, "id", None)
            and not any(kw in m.id.lower() for kw in NON_CHAT_MODEL_KEYWORDS)
        ]
        if available_ids:
            ordered = [m for m in PREFERRED_GROQ_MODELS if m in available_ids]
            for m in available_ids:
                if m not in ordered:
                    ordered.append(m)
            CANDIDATE_MODELS = ordered
            print(f"Discovered active Groq chat models: {CANDIDATE_MODELS[:5]}")
            return
    except Exception as e:
        print(f"Could not list Groq models dynamically, using fallback list: {e}")

    CANDIDATE_MODELS = list(PREFERRED_GROQ_MODELS)


init_groq_models()


def parse_json_response(raw_content: str):
    """Extracts and parses a JSON object from LLM text response."""
    if not raw_content:
        return None
    cleaned = raw_content.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except Exception:
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            return json.loads(match.group(0))
        raise


INVALID_MODELS = {
    "general",
    "unknown",
    "multiple",
    "n/a",
    "none",
    "all",
    "ev",
    "evs",
    "electric",
    "unspecified",
    "various",
    "lineup",
    "models",
    "car",
    "cars",
    "suv",
    "sedan",
    "truck",
    "",
}


def normalize_brand_and_model(brand: str, model: str):
    """Normalizes brand aliases and enforces a specific model name (rejects brand-only records)."""
    clean_brand = (brand or "").strip()
    clean_model = (model or "").strip()

    lower_brand = clean_brand.lower()
    if lower_brand in BRAND_ALIASES:
        clean_brand = BRAND_ALIASES[lower_brand]

    if clean_brand and clean_model.lower().startswith(clean_brand.lower() + " "):
        clean_model = clean_model[len(clean_brand):].strip()

    if (
        clean_model.lower() in INVALID_MODELS
        or clean_model.lower() == clean_brand.lower()
        or len(clean_model) < 2
    ):
        return clean_brand, ""

    return clean_brand, clean_model


def analyze_with_ai(text: str):
    """
    Uses Groq LLM to categorize, translate, and extract structured EV data.
    Automatically falls back across available Groq models if a model is deprecated/unavailable.
    """
    global CANDIDATE_MODELS
    if not groq_client:
        print("Groq API key missing. Skipping AI analysis.")
        return None

    if not CANDIDATE_MODELS:
        init_groq_models()

    prompt = f"""
    Analyze the following text about Electric Vehicles.
    IMPORTANT: We ONLY accept reports that refer to a SPECIFIC Electric Vehicle Brand AND a SPECIFIC Model (e.g., Tesla Model 3, Tesla Model Y, Hyundai Ioniq 5, Kia EV6, Volkswagen ID.4, Ford Mustang Mach-E, Rivian R1T, BYD Seal, Volvo EX30, Porsche Taycan, Chevrolet Bolt EV, BMW i4, etc.).
    If the text is only about a brand in general, stock market news, or does not mention a specific EV model, return {{"error": "No specific EV model"}}.

    Extract the following information in strict JSON format:
    {{
        "brand": "Exact Brand Name (e.g., Tesla, Hyundai, Ford, Volkswagen, Mercedes-Benz, BYD, Kia, Rivian, BMW, Volvo).",
        "model": "Exact Specific Model Name (e.g., Model 3, Model Y, Ioniq 5, ID.4, Mustang Mach-E, EV6, R1T, Seal, EX30). NEVER use 'General', 'Unknown', or 'Multiple'.",
        "type": "Must be exactly one of: 'Real Range', 'Mechanical', 'Battery', or 'Positives'. Choose the best fit.",
        "description": "Write a clear, comprehensive, well-structured technical summary in International English with 4 to 6 complete sentences (minimum 60 words). Explain the exact context, real-world range or consumption figures, battery/charging behavior, mechanical details, driving conditions, and key takeaways. Wrap the 4 to 8 most important technical keywords, metrics, or findings in double asterisks like **450 km real range**, **LFP battery**, **fast charging**, **heat pump**, or **ICCU failure** so they can be highlighted in the UI.",
        "language_original": "e.g., 'EN', 'PT', 'FR'",
        "contradictory_info": true or false (boolean),
        "estimated_range_km": number or null (if a specific real-world range distance is mentioned in the text, convert it to kilometers as a number between 50 and 1500; otherwise null)
    }}
    Return ONLY valid JSON.
    
    Text: {text}
    """

    for model_name in list(CANDIDATE_MODELS):
        try:
            try:
                response = groq_client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model=model_name,
                    response_format={"type": "json_object"},
                    temperature=0.1,
                )
            except Exception as format_err:
                err_str = str(format_err).lower()
                if "response_format" in err_str or "json_object" in err_str:
                    response = groq_client.chat.completions.create(
                        messages=[{"role": "user", "content": prompt}],
                        model=model_name,
                        temperature=0.1,
                    )
                else:
                    raise format_err

            content = response.choices[0].message.content
            return parse_json_response(content)

        except Exception as e:
            err_msg = str(e)
            err_lower = err_msg.lower()

            if (
                "model_not_found" in err_lower
                or "model_decommissioned" in err_lower
                or "does not exist" in err_lower
                or "do not have access" in err_lower
                or "404" in err_lower
            ):
                print(f"Model '{model_name}' unavailable ({err_msg}). Switching to next available model...")
                if model_name in CANDIDATE_MODELS and len(CANDIDATE_MODELS) > 1:
                    CANDIDATE_MODELS.remove(model_name)
                continue

            if "429" in err_lower or "rate_limit" in err_lower or "rate limit" in err_lower:
                print(f"Rate limit hit on '{model_name}', waiting 2s and trying next model...")
                time.sleep(2)
                continue

            print(f"Error during AI analysis with model '{model_name}': {e}")
            return None

    print("Error during AI analysis: No accessible Groq chat models succeeded.")
    return None

def update_vehicle_stats(vehicle_id: str, new_range_km=None):
    """Updates the stats table (total_reports, average_range_km, average_range_miles) for a vehicle."""
    if not supabase:
        return

    try:
        reports_res = supabase.table('reports').select('*', count='exact').eq('vehicle_id', vehicle_id).execute()
        total_reports = reports_res.count if reports_res.count is not None else len(reports_res.data or [])

        range_values = [
            float(r['estimated_range_km'])
            for r in (reports_res.data or [])
            if r.get('estimated_range_km') is not None
        ]
        if not range_values and new_range_km is not None:
            range_values = [float(new_range_km)]

        avg_km = round(sum(range_values) / len(range_values), 2) if range_values else None
        avg_miles = round(avg_km * 0.621371, 2) if avg_km is not None else None

        stats_payload = {
            "vehicle_id": vehicle_id,
            "total_reports": total_reports,
            "last_updated": datetime.now().isoformat(),
        }
        if avg_km is not None:
            stats_payload["average_range_km"] = avg_km
            stats_payload["average_range_miles"] = avg_miles

        supabase.table('stats').upsert(stats_payload, on_conflict="vehicle_id").execute()
    except Exception as e:
        print(f"Warning: could not update vehicle stats: {e}")


def save_to_supabase(data, link):
    """Saves the structured data to Supabase (vehicles, reports, and stats) and returns True if successful."""
    if not supabase:
        print("Supabase credentials missing. Mocking save operation...")
        print(f"Would save: {data}")
        return False

    try:
        brand, model = normalize_brand_and_model(data.get('brand', ''), data.get('model', ''))
        if not brand or not model:
            print(f" -> Skipped: requires both specific Brand and Model (got brand='{brand}', model='{model}').")
            return False

        report_type = data.get('type', 'Positives')
        if report_type not in VALID_REPORT_TYPES:
            report_type = 'Positives'

        contradictory_info = bool(data.get('contradictory_info', False))
        raw_range = data.get('estimated_range_km')
        estimated_range_km = None
        if isinstance(raw_range, (int, float)) and 50 <= float(raw_range) <= 1500:
            estimated_range_km = round(float(raw_range), 2)

        # 1. Upsert Vehicle
        vehicle_res = supabase.table('vehicles').upsert(
            {"brand": brand, "model": model},
            on_conflict="brand,model"
        ).execute()

        if vehicle_res.data:
            vehicle_id = vehicle_res.data[0]['id']

            report_payload = {
                "vehicle_id": vehicle_id,
                "type": report_type,
                "description": data.get('description', ''),
                "source_link": link,
                "source_count": 1,
                "report_date": datetime.now().strftime("%Y-%m-%d"),
                "language_original": (data.get('language_original') or 'EN')[:10],
                "contradictory_info": contradictory_info,
                "estimated_range_km": estimated_range_km,
            }

            # 2. Insert Report (fallback without optional columns if DB migration hasn't been applied yet)
            try:
                supabase.table('reports').insert(report_payload).execute()
            except Exception:
                report_payload.pop("contradictory_info", None)
                report_payload.pop("estimated_range_km", None)
                supabase.table('reports').insert(report_payload).execute()

            # 3. Update Vehicle Stats
            update_vehicle_stats(vehicle_id, estimated_range_km)

            print(f"Saved report for {brand} {model} to DB.")
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
            
    # Save heartbeat file to keep GitHub Actions schedule active
    heartbeat_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "last_run.json")
    try:
        with open(heartbeat_path, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "last_run_utc": datetime.utcnow().isoformat() + "Z",
                    "new_registries_added": new_registries,
                    "total_registries_in_db": total_registries,
                },
                f,
                indent=2,
            )
    except Exception as e:
        print(f"Warning writing last_run.json: {e}")

    # Send email
    send_summary_email(new_registries, total_registries)

if __name__ == "__main__":
    main()
