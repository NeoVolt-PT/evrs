import re
import urllib.parse

# 1. Agente 3: Exército de Sub-Agentes de Incentivos & Leis Governamentais por País (Google News RSS Nativo)
COUNTRY_POLICY_AGENTS = [
    {
        "country": "Portugal",
        "query": '"Fundo Ambiental" elétricos OR incentivo carros elétricos Portugal OR isenção ISV IUC elétricos when:7d',
        "hl": "pt-PT",
        "gl": "PT",
        "ceid": "PT:pt-150",
    },
    {
        "country": "Brazil",
        "query": '"carros elétricos" incentivo Brasil OR imposto importação elétricos Brasil OR IPVA carro elétrico when:7d',
        "hl": "pt-BR",
        "gl": "BR",
        "ceid": "BR:pt-419",
    },
    {
        "country": "Spain",
        "query": '"Plan MOVES" coches eléctricos OR ayuda compra coche eléctrico España OR deducción IRPF eléctrico when:7d',
        "hl": "es",
        "gl": "ES",
        "ceid": "ES:es",
    },
    {
        "country": "France",
        "query": '"bonus écologique" voiture électrique OR "leasing social" électrique France when:7d',
        "hl": "fr",
        "gl": "FR",
        "ceid": "FR:fr",
    },
    {
        "country": "Germany",
        "query": '"Elektroauto Förderung" Deutschland OR Umweltbonus OR Dienstwagen Elektroauto Steuer when:7d',
        "hl": "de",
        "gl": "DE",
        "ceid": "DE:de",
    },
    {
        "country": "United Kingdom",
        "query": '"electric car grant" UK OR OZEV grant UK OR EV salary sacrifice BiK tax UK when:7d',
        "hl": "en-GB",
        "gl": "GB",
        "ceid": "GB:en",
    },
    {
        "country": "United States",
        "query": '"EV tax credit" IRS OR "electric vehicle rebate" state US OR NEVI charging grant when:7d',
        "hl": "en-US",
        "gl": "US",
        "ceid": "US:en",
    },
    {
        "country": "European Union",
        "query": '"European Union" EV subsidy OR EU electric car tariff incentive OR AFIR charging regulation when:7d',
        "hl": "en",
        "gl": "IE",
        "ceid": "IE:en",
    },
    {
        "country": "Norway",
        "query": 'Norway electric car VAT exemption OR Norway EV toll incentive policy when:7d',
        "hl": "en",
        "gl": "US",
        "ceid": "US:en",
    },
    {
        "country": "China",
        "query": 'China NEV subsidy trade-in OR China electric vehicle purchase tax exemption when:7d',
        "hl": "en",
        "gl": "US",
        "ceid": "US:en",
    },
    {
        "country": "Canada",
        "query": 'Canada iZEV rebate electric vehicle OR Quebec Ontario BC EV rebate when:7d',
        "hl": "en-CA",
        "gl": "CA",
        "ceid": "CA:en",
    },
    {
        "country": "Australia",
        "query": 'Australia EV rebate FBT exemption electric car incentive when:7d',
        "hl": "en-AU",
        "gl": "AU",
        "ceid": "AU:en",
    },
]

# 2. Agente 1: Especialista em Reviews & Autonomia Real por Modelo (Google News RSS)
MODEL_REVIEW_SEARCH_QUERIES = [
    '("Tesla Model 3" OR "Tesla Model Y" OR "Hyundai Ioniq 5" OR "Kia EV6") ("real world range" OR "range test" OR "highway range" OR "review") when:7d',
    '("BYD Seal" OR "BYD Dolphin" OR "BYD Atto 3" OR "Volvo EX30" OR "Polestar 2") ("range test" OR "review" OR "reliability") when:7d',
    '("Volkswagen ID.4" OR "Volkswagen ID.7" OR "Ford Mustang Mach-E" OR "Rivian R1T" OR "Rivian R1S") ("range test" OR "review" OR "issues") when:7d',
    '("BMW i4" OR "BMW iX" OR "Porsche Taycan" OR "Mercedes EQE" OR "Audi Q4 e-tron" OR "Chevrolet Equinox EV") ("range" OR "review") when:7d',
]

# 3. Agente 2: Lista Expandida de 24 Modelos na API Oficial Gratuita da NHTSA
EXPANDED_NHTSA_MODELS = [
    ("TESLA", "MODEL 3", 2024),
    ("TESLA", "MODEL Y", 2024),
    ("TESLA", "MODEL S", 2024),
    ("TESLA", "CYBERTRUCK", 2024),
    ("HYUNDAI", "IONIQ 5", 2024),
    ("HYUNDAI", "IONIQ 6", 2024),
    ("HYUNDAI", "KONA ELECTRIC", 2024),
    ("KIA", "EV6", 2024),
    ("KIA", "EV9", 2024),
    ("KIA", "NIRO EV", 2024),
    ("FORD", "MUSTANG MACH-E", 2024),
    ("FORD", "F-150 LIGHTNING", 2024),
    ("RIVIAN", "R1T", 2024),
    ("RIVIAN", "R1S", 2024),
    ("VOLKSWAGEN", "ID.4", 2024),
    ("CHEVROLET", "BOLT EV", 2023),
    ("CHEVROLET", "EQUINOX EV", 2024),
    ("CHEVROLET", "BLAZER EV", 2024),
    ("BMW", "I4", 2024),
    ("BMW", "IX", 2024),
    ("VOLVO", "XC40", 2024),
    ("PORSCHE", "TAYCAN", 2024),
    ("NISSAN", "ARIYA", 2024),
    ("LUCID", "AIR", 2024),
]

# Palavras de exclusão (Poupador de Tokens — descarta artigos que não são carros elétricos)
EXCLUDED_NON_CAR_KEYWORDS = (
    "e-bike",
    "ebike",
    "electric bike",
    "electric bicycle",
    "minibike",
    "dirt bike",
    "e-moto",
    "electric motorcycle",
    "livewire",
    "e-scooter",
    "electric scooter",
    "moped",
    "segway",
    "lectric",
    "heybike",
    "amflow",
    "lawn mower",
    "mowers",
    "power station",
    "bluetti",
    "ecoflow",
    "jackery",
    "anker solix",
    "electric flight",
    "airliner",
    "electric boat",
    "electric couch",
)


def build_google_news_rss_url(query: str, hl: str = "en-US", gl: str = "US", ceid: str = "US:en") -> str:
    encoded_q = urllib.parse.quote(query)
    return f"https://news.google.com/rss/search?q={encoded_q}&hl={hl}&gl={gl}&ceid={ceid}"


def should_analyze_article(title: str, summary: str) -> bool:
    """
    Deterministic zero-token pre-filter:
    Rejects articles about e-bikes, scooters, power stations, mowers, planes, etc.
    so 100% of free AI tokens are spent on EV cars and EV government policies.
    """
    combined = f"{title or ''} {summary or ''}".lower()
    if any(kw in combined for kw in EXCLUDED_NON_CAR_KEYWORDS):
        return False
    return True


CANONICAL_MODELS_MAP = {
    "leaf": "Leaf",
    "ariya": "Ariya",
    "ioniq 5": "Ioniq 5",
    "ioniq5": "Ioniq 5",
    "ioniq 5 n": "Ioniq 5 N",
    "ioniq5n": "Ioniq 5 N",
    "ioniq 6": "Ioniq 6",
    "ioniq6": "Ioniq 6",
    "ioniq 6 n": "Ioniq 6 N",
    "ioniq6n": "Ioniq 6 N",
    "ioniq 9": "Ioniq 9",
    "ioniq9": "Ioniq 9",
    "ioniq 3": "Ioniq 3",
    "ioniq3": "Ioniq 3",
    "id.3": "ID.3",
    "id3": "ID.3",
    "id 3": "ID.3",
    "id.4": "ID.4",
    "id4": "ID.4",
    "id 4": "ID.4",
    "id.5": "ID.5",
    "id5": "ID.5",
    "id.6": "ID.6",
    "id6": "ID.6",
    "id.7": "ID.7",
    "id7": "ID.7",
    "id 7": "ID.7",
    "id.buzz": "ID. Buzz",
    "id. buzz": "ID. Buzz",
    "id buzz": "ID. Buzz",
    "idbuzz": "ID. Buzz",
    "id.polo": "ID. Polo",
    "id polo": "ID. Polo",
    "id. polo": "ID. Polo",
    "id.cross": "ID. Cross",
    "id cross": "ID. Cross",
    "id. cross": "ID. Cross",
    "mach-e": "Mustang Mach-E",
    "mach e": "Mustang Mach-E",
    "mache": "Mustang Mach-E",
    "mustang mach-e": "Mustang Mach-E",
    "mustang mach e": "Mustang Mach-E",
    "f150 lightning": "F-150 Lightning",
    "f-150 lightning": "F-150 Lightning",
    "bz4x": "bZ4X",
    "bz": "bZ4X",
    "ix": "iX",
    "ix1": "iX1",
    "ix2": "iX2",
    "ix3": "iX3",
    "ix5": "iX5",
    "ix7": "iX7",
    "i3": "i3",
    "i4": "i4",
    "i5": "i5",
    "i7": "i7",
    "7x": "7X",
    "7gt": "7GT",
    "7 gt": "7GT",
    "ex2": "EX2",
    "ex30": "EX30",
    "ex40": "EX40",
    "ex60": "EX60",
    "ex90": "EX90",
    "ev3": "EV3",
    "ev4": "EV4",
    "ev5": "EV5",
    "ev6": "EV6",
    "ev9": "EV9",
    "model 3": "Model 3",
    "model3": "Model 3",
    "model y": "Model Y",
    "modely": "Model Y",
    "model s": "Model S",
    "models": "Model S",
    "model x": "Model X",
    "modelx": "Model X",
    "escalade iq": "Escalade IQ",
    "escaladeiq": "Escalade IQ",
    "es 350e": "ES 350e",
    "es350e": "ES 350e",
}


def canonicalize_model_name(model_str: str) -> str:
    clean = re.sub(r"\s+", " ", (model_str or "").strip())
    if not clean:
        return ""
    lower = clean.lower()
    compact = re.sub(r"[\s._-]+", "", lower)

    if lower in CANONICAL_MODELS_MAP:
        return CANONICAL_MODELS_MAP[lower]
    if compact in CANONICAL_MODELS_MAP:
        return CANONICAL_MODELS_MAP[compact]

    clean = re.sub(r"\be-tron\b", "e-tron", clean, flags=re.IGNORECASE)
    words = []
    for w in clean.split(" "):
        if re.match(r"^[A-Za-z]{4,}$", w) and (w.isupper() or w.islower()):
            words.append(w[0].upper() + w[1:].lower())
        else:
            words.append(w)
    return " ".join(words)


def get_alnum_vehicle_key(brand: str, model: str) -> str:
    b_key = re.sub(r"[^a-z0-9]", "", (brand or "").lower())
    m_key = re.sub(r"[^a-z0-9]", "", (model or "").lower())
    return f"{b_key}|{m_key}"


def deduplicate_database_vehicles(supabase, normalize_fn):
    """
    Scans the Supabase 'vehicles' table, detects duplicate vehicles with different
    capitalization/punctuation (e.g. 'Nissan Leaf' vs 'Nissan LEAF', 'Hyundai Ioniq 5' vs 'Hyundai IONIQ 5'),
    moves all reports to the canonical vehicle record, deletes duplicate vehicle rows,
    and normalizes the canonical brand & model names in place.
    """
    if not supabase:
        return

    print("Running database vehicle deduplication & canonicalization check...")
    try:
        res = supabase.table("vehicles").select("id, brand, model, created_at").order("created_at", desc=False).execute()
        rows = res.data or []
        if not rows:
            return

        groups = {}
        invalid_deleted = 0
        for v in rows:
            raw_b = (v.get("brand") or "").strip()
            raw_m = (v.get("model") or "").strip()
            if raw_b.lower() == "incentives":
                norm_b, norm_m = "Incentives", raw_m
            else:
                # Delete legacy invalid rows (e.g. 'Unknown', 'General', or comma-separated multi-brands)
                if (
                    raw_m.lower() in {"unknown", "general", "multiple", "n/a", "none", ""}
                    or "," in raw_b
                    or "," in raw_m
                ):
                    try:
                        supabase.table("vehicles").delete().eq("id", v["id"]).execute()
                        invalid_deleted += 1
                    except Exception:
                        pass
                    continue
                norm_b, norm_m = normalize_fn(raw_b, raw_m)
                if not norm_m:
                    try:
                        supabase.table("vehicles").delete().eq("id", v["id"]).execute()
                        invalid_deleted += 1
                    except Exception:
                        pass
                    continue
            key = get_alnum_vehicle_key(norm_b, norm_m)
            groups.setdefault(key, []).append((v, norm_b, norm_m))

        merged_count = 0
        renamed_count = 0

        for key, items in groups.items():
            primary_item = items[0]
            for candidate in items:
                v_row, nb, nm = candidate
                if v_row["brand"] == nb and v_row["model"] == nm:
                    primary_item = candidate
                    break

            primary_row, canon_brand, canon_model = primary_item
            primary_id = primary_row["id"]

            for v_row, _, _ in items:
                dup_id = v_row["id"]
                if dup_id == primary_id:
                    continue
                try:
                    supabase.table("reports").update({"vehicle_id": primary_id}).eq("vehicle_id", dup_id).execute()
                    supabase.table("stats").delete().eq("vehicle_id", dup_id).execute()
                    supabase.table("vehicles").delete().eq("id", dup_id).execute()
                    merged_count += 1
                    print(f" -> Merged duplicate vehicle '{v_row['brand']} {v_row['model']}' into '{canon_brand} {canon_model}'")
                except Exception as merge_err:
                    print(f"Warning merging {dup_id}: {merge_err}")

            if canon_brand and canon_model and (primary_row["brand"] != canon_brand or primary_row["model"] != canon_model):
                try:
                    supabase.table("vehicles").update({"brand": canon_brand, "model": canon_model}).eq("id", primary_id).execute()
                    renamed_count += 1
                    print(f" -> Canonicalized '{primary_row['brand']} {primary_row['model']}' -> '{canon_brand} {canon_model}'")
                except Exception as ren_err:
                    print(f"Warning canonicalizing {primary_id}: {ren_err}")

        print(f"Deduplication complete: {merged_count} duplicate vehicles merged, {renamed_count} vehicle names canonicalized.")
    except Exception as e:
        print(f"Warning during vehicle deduplication: {e}")


