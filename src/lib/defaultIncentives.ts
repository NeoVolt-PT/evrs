export interface IncentiveMeasure {
  id: string;
  vehicle_id: string;
  type: string;
  description: string;
  description_pt?: string;
  description_en?: string;
  source_link?: string | null;
  report_date: string;
  language_original?: string;
  contradictory_info?: boolean;
  estimated_range_km?: number | null;
  vehicle_brand?: string;
  vehicle_model?: string;
  model_pt?: string;
  model_en?: string;
  country?: string;
}

const COUNTRY_TRANSLATIONS_PT: Record<string, string> = {
  "Portugal": "Portugal",
  "United States": "Estados Unidos",
  "European Union": "União Europeia",
  "United Kingdom": "Reino Unido",
  "Germany": "Alemanha",
  "France": "França",
  "Spain": "Espanha",
  "China": "China",
  "Norway": "Noruega",
  "Canada": "Canadá",
  "Australia": "Austrália",
  "Brazil": "Brasil",
  "Global": "Global",
};

export function localizeCountryName(country: string | undefined, lang: string): string {
  if (!country) return "Global";
  if (lang === "pt") {
    return COUNTRY_TRANSLATIONS_PT[country] || country;
  }
  return country;
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
    model_pt: "Fundo Ambiental",
    model_en: "Environmental Fund Grant",
    report_date: "2026-01-15",
    source_link: "https://www.fundoambiental.pt",
    description:
      "Portugal maintains the **Fundo Ambiental** incentive program for 100% electric passenger vehicles, offering a direct state grant of up to **€4,000** when scrapping a combustion vehicle older than 10 years, alongside **€500** support for domestic **wallbox** installation and Condominium **charging** infrastructure.",
    description_en:
      "Portugal maintains the **Fundo Ambiental** incentive program for 100% electric passenger vehicles, offering a direct state grant of up to **€4,000** when scrapping a combustion vehicle older than 10 years, alongside **€500** support for domestic **wallbox** installation and condominium **charging** infrastructure.",
    description_pt:
      "Portugal mantém o programa de apoio do **Fundo Ambiental** para veículos ligeiros de passageiros **100% elétricos**, atribuindo um **incentivo** direto do Estado até **€4.000** (mediante abate de veículo a combustão com mais de 10 anos), além de um **apoio** de **€500** para a aquisição e instalação de carregadores domésticos (**wallbox**) e infraestrutura de **carregamento** em condomínios.",
  },
  {
    id: "inc-pt-2",
    vehicle_id: "inc-pt",
    type: "Incentives",
    country: "Portugal",
    vehicle_brand: "Portugal",
    vehicle_model: "Isenção ISV, IUC & IVA",
    model_pt: "Isenção de ISV, IUC e Dedução de IVA",
    model_en: "ISV, IUC & Corporate VAT Exemption",
    report_date: "2026-02-01",
    source_link: "https://www.portaldasfinancas.gov.pt",
    description:
      "In Portugal, 100% electric vehicles benefit from **100% ISV exemption** (Vehicle Tax) and **100% IUC exemption** (Annual Circulation Tax). Companies and ENIs also benefit from **100% VAT deduction** on acquisition costs up to **€62,500** (+VAT) and reduced Autonomous Taxation (**0%** up to €62,500) plus full deduction of electricity **charging** expenses.",
    description_en:
      "In Portugal, 100% electric vehicles benefit from **100% ISV exemption** (Vehicle Tax) and **100% IUC exemption** (Annual Circulation Tax). Companies and sole proprietors also benefit from **100% VAT deduction** on acquisition costs up to **€62,500** (+VAT) and reduced Autonomous Taxation (**0%** up to €62,500) plus full deduction of electricity **charging** expenses.",
    description_pt:
      "Em Portugal, os veículos **100% elétricos** beneficiam de **isenção de 100% no ISV** (Imposto Sobre Veículos) e **isenção de 100% no IUC** (Imposto Único de Circulação). As empresas e ENIs beneficiam ainda da **dedução de 100% do IVA** na aquisição até **€62.500** (+IVA), **isenção** de Tributação Autónoma (**0%** até €62.500) e dedução total dos custos de eletricidade para **carregamento**.",
  },
  {
    id: "inc-pt-3",
    vehicle_id: "inc-pt",
    type: "Incentives",
    country: "Portugal",
    vehicle_brand: "Portugal",
    vehicle_model: "Tarifa Verde & Mobilidade",
    model_pt: "Dístico Verde e Tarifas de Mobilidade",
    model_en: "Green Parking Badge & EV Tariffs",
    report_date: "2026-03-10",
    source_link: "https://www.mobie.pt",
    description:
      "Portuguese municipalities including Lisbon, Porto, and Loures provide **free or discounted public parking badges** (Dístico Verde) for 100% battery **electric vehicles**, combined with bi-hourly night **charging** electricity tariffs that cut home charging costs below **€2.50 per 100 km**.",
    description_en:
      "Portuguese municipalities including Lisbon, Porto, and Loures provide **free or discounted public parking badges** (Dístico Verde) for 100% battery **electric vehicles**, combined with bi-hourly night **charging** electricity tariffs that cut home charging costs below **€2.50 per 100 km**.",
    description_pt:
      "Vários municípios portugueses (incluindo Lisboa, Porto e Loures) atribuem o **Dístico Verde** com estacionamento público gratuito ou com **desconto** para veículos **100% elétricos**, aliado às tarifas bi-horárias de **carregamento** noturno que reduzem o **consumo** e custo real de energia em casa para menos de **€2,50 por 100 km**.",
  },
  {
    id: "inc-us-1",
    vehicle_id: "inc-us",
    type: "Incentives",
    country: "United States",
    vehicle_brand: "United States",
    vehicle_model: "Federal Clean Vehicle Credit",
    model_pt: "Crédito Fiscal Federal (Clean Vehicle Credit)",
    model_en: "Federal Clean Vehicle Credit",
    report_date: "2026-01-20",
    source_link: "https://fueleconomy.gov/feg/tax2023.shtml",
    description:
      "The US Clean Vehicle Credit (Section 30D) provides up to **$7,500 point-of-sale tax credit** for qualifying new North American-assembled **electric vehicles** with compliant **battery** mineral and component sourcing, plus up to **$4,000** for used EVs priced under **$25,000**.",
    description_en:
      "The US Clean Vehicle Credit (Section 30D) provides up to **$7,500 point-of-sale tax credit** for qualifying new North American-assembled **electric vehicles** with compliant **battery** mineral and component sourcing, plus up to **$4,000** for used EVs priced under **$25,000**.",
    description_pt:
      "Nos Estados Unidos, o programa Federal Clean Vehicle Credit (Secção 30D) concede um **incentivo** e crédito fiscal direto de até **$7.500** no ato da compra para veículos elétricos novos montados na América do Norte que cumpram os requisitos de minerais e componentes da **bateria**, além de um **apoio** até **$4.000** na compra de EVs usados abaixo de **$25.000**.",
  },
  {
    id: "inc-us-2",
    vehicle_id: "inc-us",
    type: "Incentives",
    country: "United States",
    vehicle_brand: "United States",
    vehicle_model: "NEVI & State EV Rebates",
    model_pt: "Programa NEVI & Apoios Estaduais",
    model_en: "NEVI & State EV Rebates",
    report_date: "2026-04-05",
    source_link: "https://afdc.energy.gov/laws",
    description:
      "Under the **$5 billion NEVI program** and state-level rebates (Colorado up to **$5,000**, Massachusetts MOR-EV **$3,500**, Pennsylvania & California charging grants), US drivers receive stacked state purchase **rebates** and utility **Level 2 charger** installation credits.",
    description_en:
      "Under the **$5 billion NEVI program** and state-level rebates (Colorado up to **$5,000**, Massachusetts MOR-EV **$3,500**, Pennsylvania & California charging grants), US drivers receive stacked state purchase **rebates** and utility **Level 2 charger** installation credits.",
    description_pt:
      "Através do programa federal **NEVI de $5 mil milhões** e dos programas estaduais (Colorado até **$5.000**, Massachusetts MOR-EV **$3.500**, Pensilvânia e Califórnia), os condutores norte-americanos podem acumular **descontos** estaduais diretos na compra do veículo e subsídios para instalação de postos de **carregamento** domésticos.",
  },
  {
    id: "inc-eu-1",
    vehicle_id: "inc-eu",
    type: "Incentives",
    country: "European Union",
    vehicle_brand: "European Union",
    vehicle_model: "AFIR & Fleet Zero-Emission",
    model_pt: "Regulamento AFIR & Frotas Zero Emissões",
    model_en: "AFIR & Fleet Zero-Emission",
    report_date: "2026-02-18",
    source_link: "https://transport.ec.europa.eu",
    description:
      "The European Union's **AFIR regulation** mandates **150 kW+ fast-charging** stations every **60 km** along TEN-T highway corridors with transparent ad-hoc card payment, while EU corporate fleet policies accelerate **zero-emission** company car tax **incentives** across member states.",
    description_en:
      "The European Union's **AFIR regulation** mandates **150 kW+ fast-charging** stations every **60 km** along TEN-T highway corridors with transparent ad-hoc card payment, while EU corporate fleet policies accelerate **zero-emission** company car tax **incentives** across member states.",
    description_pt:
      "O regulamento **AFIR** da União Europeia obriga à instalação de postos de **carregamento** rápido de **150 kW+** a cada **60 km** nas principais autoestradas europeias (rede TEN-T) com pagamento direto por multibanco, enquanto as diretivas comunitárias reforçam os **incentivos** fiscais para frotas empresariais **100% elétricas**.",
  },
  {
    id: "inc-fr-1",
    vehicle_id: "inc-fr",
    type: "Incentives",
    country: "France",
    vehicle_brand: "France",
    vehicle_model: "Bonus Écologique & Leasing",
    model_pt: "Bonus Écologique & Leasing Social",
    model_en: "Bonus Écologique & Social Leasing",
    report_date: "2026-01-30",
    source_link: "https://www.service-public.fr",
    description:
      "France offers the **Bonus Écologique** purchase subsidy of up to **€4,000** for passenger EVs meeting European environmental **eco-score** criteria, alongside the **Leasing Social** program enabling low-income households to lease new electric cars from **€100/month**.",
    description_en:
      "France offers the **Bonus Écologique** purchase subsidy of up to **€4,000** for passenger EVs meeting European environmental **eco-score** criteria, alongside the **Leasing Social** program enabling low-income households to lease new electric cars from **€100/month**.",
    description_pt:
      "A França atribui o subsídio estatal **Bonus Écologique** até **€4.000** na compra de veículos elétricos ligeiros que cumpram os critérios de pegada de carbono europeia, em conjunto com o programa **Leasing Social** que permite a famílias elegíveis alugar um carro elétrico novo a partir de **€100/mês**.",
  },
  {
    id: "inc-es-1",
    vehicle_id: "inc-es",
    type: "Incentives",
    country: "Spain",
    vehicle_brand: "Spain",
    vehicle_model: "Plan MOVES & IRPF Deduction",
    model_pt: "Plan MOVES & Dedução de 15% no IRPF",
    model_en: "Plan MOVES & IRPF Tax Deduction",
    report_date: "2026-02-12",
    source_link: "https://www.idae.es",
    description:
      "Spain provides up to **€7,000 in direct EV purchase grants** (with vehicle scrappage) or **€4,500** without scrappage under the national **MOVES program**, combined with a **15% IRPF personal income tax deduction** (up to €3,000) and **70%–80% subsidy** for home **charging** point installation.",
    description_en:
      "Spain provides up to **€7,000 in direct EV purchase grants** (with vehicle scrappage) or **€4,500** without scrappage under the national **MOVES program**, combined with a **15% IRPF personal income tax deduction** (up to €3,000) and **70%–80% subsidy** for home **charging** point installation.",
    description_pt:
      "Espanha disponibiliza um **apoio** direto até **€7.000** na compra de veículos elétricos (com abate) ou **€4.500** sem abate através do programa nacional **Plan MOVES**, acumulável com uma **dedução fiscal de 15% no IRPF** (até **€3.000**) e comparticipação de **70% a 80%** na instalação de pontos de **carregamento**.",
  },
  {
    id: "inc-de-1",
    vehicle_id: "inc-de",
    type: "Incentives",
    country: "Germany",
    vehicle_brand: "Germany",
    vehicle_model: "Kfz-Steuer & 0.25% Dienstwagen",
    model_pt: "Isenção Kfz-Steuer & Taxa 0,25% Frotas",
    model_en: "Kfz-Steuer Exemption & 0.25% Company Car Rate",
    report_date: "2026-03-01",
    source_link: "https://www.bundesfinanzministerium.de",
    description:
      "Germany grants a **10-year motor vehicle tax exemption** (Kfz-Steuerbefreiung until 2030) for pure **battery electric vehicles** and a preferential **0.25% monthly benefit-in-kind tax rate** for electric company cars (Dienstwagenprivileg) with a list price up to **€95,000**, plus major OEM **manufacturer discounts**.",
    description_en:
      "Germany grants a **10-year motor vehicle tax exemption** (Kfz-Steuerbefreiung until 2030) for pure **battery electric vehicles** and a preferential **0.25% monthly benefit-in-kind tax rate** for electric company cars (Dienstwagenprivileg) with a list price up to **€95,000**, plus major OEM **manufacturer discounts**.",
    description_pt:
      "A Alemanha concede **isenção de imposto de circulação até 10 anos** (Kfz-Steuerbefreiung até 2030) para veículos **100% elétricos** a **bateria**, além de uma taxa fiscal reduzida de **0,25%** para carros elétricos de empresa com preço até **€95.000** e **descontos** diretos dos fabricantes.",
  },
  {
    id: "inc-uk-1",
    vehicle_id: "inc-uk",
    type: "Incentives",
    country: "United Kingdom",
    vehicle_brand: "United Kingdom",
    vehicle_model: "2% BiK Salary Sacrifice & OZEV",
    model_pt: "Taxa Reduzida BiK & Apoio Carregadores OZEV",
    model_en: "2% BiK Salary Sacrifice & OZEV Grants",
    report_date: "2026-02-22",
    source_link: "https://www.gov.uk/plug-in-vehicle-grants",
    description:
      "The UK supports electrification through a low **2%–4% Benefit-in-Kind (BiK)** salary sacrifice tax rate that saves EV drivers **30% to 50%** on monthly lease costs, alongside **OZEV EV chargepoint grants** (up to **£350** off home chargers for renters/flats) and **Zero-Emission Vehicle (ZEV)** mandate manufacturer discounts.",
    description_en:
      "The UK supports electrification through a low **2%–4% Benefit-in-Kind (BiK)** salary sacrifice tax rate that saves EV drivers **30% to 50%** on monthly lease costs, alongside **OZEV EV chargepoint grants** (up to **£350** off home chargers for renters/flats) and **Zero-Emission Vehicle (ZEV)** mandate manufacturer discounts.",
    description_pt:
      "O Reino Unido incentiva a eletrificação através da taxa fiscal reduzida **Benefit-in-Kind (BiK) de 2% a 4%** em programas salariais que permitem poupar **30% a 50%** no leasing mensal, juntamente com subsídios **OZEV até £350** para instalação de postos de **carregamento** em apartamentos e **descontos** associados ao mandato ZEV.",
  },
  {
    id: "inc-no-1",
    vehicle_id: "inc-no",
    type: "Incentives",
    country: "Norway",
    vehicle_brand: "Norway",
    vehicle_model: "VAT Exemption under 500k NOK",
    model_pt: "Isenção de IVA até 500.000 NOK & Portagens",
    model_en: "VAT Exemption under 500k NOK & Toll Discounts",
    report_date: "2026-01-10",
    source_link: "https://elbil.no",
    description:
      "Norway exempts electric vehicles from the **25% VAT** on the first **500,000 NOK** (~€43,000) of the purchase price, alongside statutory **50% maximum road/ferry toll discounts** compared to combustion cars, propelling EV market share past **90%** of all new car registrations.",
    description_en:
      "Norway exempts electric vehicles from the **25% VAT** on the first **500,000 NOK** (~€43,000) of the purchase price, alongside statutory **50% maximum road/ferry toll discounts** compared to combustion cars, propelling EV market share past **90%** of all new car registrations.",
    description_pt:
      "A Noruega garante **isenção de 25% de IVA** nos primeiros **500.000 NOK** (~€43.000) do valor de compra de veículos elétricos, além de **descontos** mínimos de **50%** em portagens e ferries face a carros a combustão, impulsionando a quota de mercado de elétricos para mais de **90%** das vendas novas.",
  },
  {
    id: "inc-cn-1",
    vehicle_id: "inc-cn",
    type: "Incentives",
    country: "China",
    vehicle_brand: "China",
    vehicle_model: "NEV Purchase Tax Exemption & Trade-In",
    model_pt: "Isenção Fiscal NEV & Subsídio de Abate",
    model_en: "NEV Purchase Tax Exemption & Trade-In",
    report_date: "2026-03-15",
    source_link: "https://www.gov.cn",
    description:
      "China offers a nationwide **20,000 RMB (~$2,800) EV trade-in subsidy** for replacing older vehicles with New Energy Vehicles (**NEVs**), combined with a **purchase tax exemption** up to **30,000 RMB** per vehicle and free green **EV license plates** in major megacities.",
    description_en:
      "China offers a nationwide **20,000 RMB (~$2,800) EV trade-in subsidy** for replacing older vehicles with New Energy Vehicles (**NEVs**), combined with a **purchase tax exemption** up to **30,000 RMB** per vehicle and free green **EV license plates** in major megacities.",
    description_pt:
      "A China concede um **apoio** nacional de abate até **20.000 RMB (~$2.800)** na troca de veículos antigos por carros de nova energia (**NEVs**), acumulado com **isenção de imposto de compra** até **30.000 RMB** por veículo e atribuição gratuita de matrículas verdes sem sorteio nas grandes metrópoles.",
  },
];

