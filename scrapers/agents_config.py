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
