export interface IncentiveMeasure {
  id: string;
  vehicle_id: string;
  type: string;
  description: string;
  source_link?: string | null;
  report_date: string;
  language_original?: string;
  contradictory_info?: boolean;
  estimated_range_km?: number | null;
  vehicle_brand?: string;
  vehicle_model?: string;
  country?: string;
}

const COUNTRY_PATTERNS: [string, RegExp][] = [
  ["Portugal", /\b(portugal|portuguese|fundo ambiental|isv|iuc|lisboa|lisbon)\b/i],
  ["United States", /\b(u\.?s\.?a?\.?|united states|america|american|ira\b|irs\b|california|pa\.|pennsylvania|seattle|arizona|massachusetts|new jersey|houston|federal tax credit|\$7,?500)\b/i],
  ["European Union", /\b(eu\b|european union|europe|europeia|brussels)\b/i],
  ["United Kingdom", /\b(uk\b|u\.k\.|united kingdom|britain|british|london|ozev)\b/i],
  ["Germany", /\b(germany|german|alemanha|berlin|umweltbonus|kfw)\b/i],
  ["France", /\b(france|french|frança|bonus écologique|leasing social|paris)\b/i],
  ["Spain", /\b(spain|spanish|espanha|plan moves|moves iii)\b/i],
  ["China", /\b(china|chinese|beijing|shanghai|nev\b)\b/i],
  ["Norway", /\b(norway|norwegian|noruega|oslo)\b/i],
  ["Canada", /\b(canada|canadian|izev|quebec|ontario|british columbia)\b/i],
  ["Australia", /\b(australia|australian|sydney|melbourne)\b/i],
  ["Brazil", /\b(brazil|brasil|rota 2030|mover)\b/i],
];

export function detectCountryFromReport(text: string, fallbackModel?: string): string {
  if (
    fallbackModel &&
    ![
      "general",
      "unknown",
      "multiple",
      "n/a",
      "none",
      "all",
      "ev",
    ].includes(fallbackModel.toLowerCase())
  ) {
    for (const [country, regex] of COUNTRY_PATTERNS) {
      if (regex.test(fallbackModel)) return country;
    }
  }

  for (const [country, regex] of COUNTRY_PATTERNS) {
    if (regex.test(text)) return country;
  }

  return "Global";
}

export function isIncentiveText(text: string): boolean {
  return /\b(tax credit|subsidy|subsidies|incentive|incentives|rebate|rebates|discount|discounts|price cut|price drop|funding|grant|grants|tariff|tariffs|fundo ambiental|apoio|incentivo|desconto|isenção|isv|iuc|plan moves|bonus écologique|leasing)\b/i.test(
    text
  );
}

export const CURATED_INCENTIVES: IncentiveMeasure[] = [
  {
    id: "inc-pt-1",
    vehicle_id: "inc-pt",
    type: "Incentives",
    country: "Portugal",
    vehicle_brand: "Portugal",
    vehicle_model: "Fundo Ambiental",
    report_date: "2026-01-15",
    source_link: "https://www.fundoambiental.pt",
    description:
      "Portugal maintains the **Fundo Ambiental** incentive program for 100% electric passenger vehicles, offering a direct state grant of up to **€4,000** when scrapping a combustion vehicle older than 10 years, alongside **€500** support for domestic **wallbox** installation and Condominium **charging** infrastructure.",
  },
  {
    id: "inc-pt-2",
    vehicle_id: "inc-pt",
    type: "Incentives",
    country: "Portugal",
    vehicle_brand: "Portugal",
    vehicle_model: "Isenção ISV, IUC & IVA",
    report_date: "2026-02-01",
    source_link: "https://www.portaldasfinancas.gov.pt",
    description:
      "In Portugal, 100% electric vehicles benefit from **100% ISV exemption** (Vehicle Tax) and **100% IUC exemption** (Annual Circulation Tax). Companies and ENIs also benefit from **100% VAT deduction** on acquisition costs up to **€62,500** (+VAT) and reduced Autonomous Taxation (**0%** up to €62,500) plus full deduction of electricity **charging** expenses.",
  },
  {
    id: "inc-pt-3",
    vehicle_id: "inc-pt",
    type: "Incentives",
    country: "Portugal",
    vehicle_brand: "Portugal",
    vehicle_model: "Tarifa Verde & Mobilidade",
    report_date: "2026-03-10",
    source_link: "https://www.mobie.pt",
    description:
      "Portuguese municipalities including Lisbon, Porto, and Loures provide **free or discounted public parking badges** (Dístico Verde) for 100% battery **electric vehicles**, combined with bi-hourly night **charging** electricity tariffs that cut home charging costs below **€2.50 per 100 km**.",
  },
  {
    id: "inc-us-1",
    vehicle_id: "inc-us",
    type: "Incentives",
    country: "United States",
    vehicle_brand: "United States",
    vehicle_model: "Federal Clean Vehicle Credit",
    report_date: "2026-01-20",
    source_link: "https://fueleconomy.gov/feg/tax2023.shtml",
    description:
      "The US Clean Vehicle Credit (Section 30D) provides up to **$7,500 point-of-sale tax credit** for qualifying new North American-assembled **electric vehicles** with compliant **battery** mineral and component sourcing, plus up to **$4,000** for used EVs priced under **$25,000**.",
  },
  {
    id: "inc-us-2",
    vehicle_id: "inc-us",
    type: "Incentives",
    country: "United States",
    vehicle_brand: "United States",
    vehicle_model: "NEVI & State EV Rebates",
    report_date: "2026-04-05",
    source_link: "https://afdc.energy.gov/laws",
    description:
      "Under the **$5 billion NEVI program** and state-level rebates (Colorado up to **$5,000**, Massachusetts MOR-EV **$3,500**, Pennsylvania & California charging grants), US drivers receive stacked state purchase **rebates** and utility **Level 2 charger** installation credits.",
  },
  {
    id: "inc-eu-1",
    vehicle_id: "inc-eu",
    type: "Incentives",
    country: "European Union",
    vehicle_brand: "European Union",
    vehicle_model: "AFIR & Fleet Zero-Emission",
    report_date: "2026-02-18",
    source_link: "https://transport.ec.europa.eu",
    description:
      "The European Union's **AFIR regulation** mandates **150 kW+ fast-charging** stations every **60 km** along TEN-T highway corridors with transparent ad-hoc card payment, while EU corporate fleet policies accelerate **zero-emission** company car tax **incentives** across member states.",
  },
  {
    id: "inc-fr-1",
    vehicle_id: "inc-fr",
    type: "Incentives",
    country: "France",
    vehicle_brand: "France",
    vehicle_model: "Bonus Écologique & Leasing",
    report_date: "2026-01-30",
    source_link: "https://www.service-public.fr",
    description:
      "France offers the **Bonus Écologique** purchase subsidy of up to **€4,000** for passenger EVs meeting European environmental **eco-score** criteria, alongside the **Leasing Social** program enabling low-income households to lease new electric cars from **€100/month**.",
  },
  {
    id: "inc-es-1",
    vehicle_id: "inc-es",
    type: "Incentives",
    country: "Spain",
    vehicle_brand: "Spain",
    vehicle_model: "Plan MOVES & IRPF Deduction",
    report_date: "2026-02-12",
    source_link: "https://www.idae.es",
    description:
      "Spain provides up to **€7,000 in direct EV purchase grants** (with vehicle scrappage) or **€4,500** without scrappage under the national **MOVES program**, combined with a **15% IRPF personal income tax deduction** (up to €3,000) and **70%–80% subsidy** for home **charging** point installation.",
  },
  {
    id: "inc-de-1",
    vehicle_id: "inc-de",
    type: "Incentives",
    country: "Germany",
    vehicle_brand: "Germany",
    vehicle_model: "Kfz-Steuer & 0.25% Dienstwagen",
    report_date: "2026-03-01",
    source_link: "https://www.bundesfinanzministerium.de",
    description:
      "Germany grants a **10-year motor vehicle tax exemption** (Kfz-Steuerbefreiung until 2030) for pure **battery electric vehicles** and a preferential **0.25% monthly benefit-in-kind tax rate** for electric company cars (Dienstwagenprivileg) with a list price up to **€95,000**, plus major OEM **manufacturer discounts**.",
  },
  {
    id: "inc-uk-1",
    vehicle_id: "inc-uk",
    type: "Incentives",
    country: "United Kingdom",
    vehicle_brand: "United Kingdom",
    vehicle_model: "2% BiK Salary Sacrifice & OZEV",
    report_date: "2026-02-22",
    source_link: "https://www.gov.uk/plug-in-vehicle-grants",
    description:
      "The UK supports electrification through a low **2%–4% Benefit-in-Kind (BiK)** salary sacrifice tax rate that saves EV drivers **30% to 50%** on monthly lease costs, alongside **OZEV EV chargepoint grants** (up to **£350** off home chargers for renters/flats) and **Zero-Emission Vehicle (ZEV)** mandate manufacturer discounts.",
  },
  {
    id: "inc-no-1",
    vehicle_id: "inc-no",
    type: "Incentives",
    country: "Norway",
    vehicle_brand: "Norway",
    vehicle_model: "VAT Exemption under 500k NOK",
    report_date: "2026-01-10",
    source_link: "https://elbil.no",
    description:
      "Norway exempts electric vehicles from the **25% VAT** on the first **500,000 NOK** (~€43,000) of the purchase price, alongside statutory **50% maximum road/ferry toll discounts** compared to combustion cars, propelling EV market share past **90%** of all new car registrations.",
  },
  {
    id: "inc-cn-1",
    vehicle_id: "inc-cn",
    type: "Incentives",
    country: "China",
    vehicle_brand: "China",
    vehicle_model: "NEV Purchase Tax Exemption & Trade-In",
    report_date: "2026-03-15",
    source_link: "https://www.gov.cn",
    description:
      "China offers a nationwide **20,000 RMB (~$2,800) EV trade-in subsidy** for replacing older vehicles with New Energy Vehicles (**NEVs**), combined with a **purchase tax exemption** up to **30,000 RMB** per vehicle and free green **EV license plates** in major megacities.",
  },
];

