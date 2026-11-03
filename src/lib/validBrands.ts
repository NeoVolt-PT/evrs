const NON_CAR_BRANDS = new Set([
  "aaa",
  "abb",
  "also",
  "amble",
  "american e.v.",
  "amflow",
  "ampstar",
  "aniioki",
  "anker",
  "anker solix",
  "anyland",
  "apple",
  "archer aviation",
  "ariel rider",
  "astraux",
  "ather",
  "aventon",
  "bluetti",
  "bosch",
  "catl",
  "chargepoint",
  "ecoflow",
  "ego",
  "ego commercial",
  "electrify america",
  "eli",
  "elysian",
  "energica",
  "enviolo",
  "fortescue",
  "garmin",
  "gogoro",
  "harley-davidson",
  "heybike",
  "ionity",
  "jackery",
  "jasion",
  "joby",
  "kenda",
  "kuka",
  "lectric",
  "livewire",
  "niu",
  "nvidia",
  "ola",
  "ola electric",
  "panasonic",
  "priority",
  "rad power",
  "range energy",
  "redwood",
  "rio tinto",
  "segway",
  "sonnen",
  "specialized",
  "stark",
  "super73",
  "surron",
  "sykeruns",
  "talaria",
  "trek",
  "tritium",
  "uber",
  "uscale",
  "velotric",
  "wallbox",
  "waymo",
  "xcmg",
  "yadea",
  "yozma",
  "zero",
  "zero motorcycles",
  "incentives",
  "unknown",
  "general",
  "multiple",
]);

const NON_CAR_MODEL_KEYWORDS = [
  "e-bike",
  "ebike",
  "bike",
  "scooter",
  "motorcycle",
  "moto",
  "mower",
  "solix",
  "power station",
  "charger",
  "supercharger",
  "aircraft",
  "airliner",
  "drone",
  "boat",
  "trailer",
  "bus",
  "semi",
  "reefer",
  "tractor",
  "forklift",
];

const INVALID_MODEL_NAMES = new Set([
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
  "",
]);

const CANONICAL_BRANDS: Record<string, string> = {
  tesla: "Tesla",
  hyundai: "Hyundai",
  kia: "Kia",
  ford: "Ford",
  volkswagen: "Volkswagen",
  vw: "Volkswagen",
  rivian: "Rivian",
  byd: "BYD",
  bmw: "BMW",
  mercedes: "Mercedes-Benz",
  "mercedes-benz": "Mercedes-Benz",
  "mercedes benz": "Mercedes-Benz",
  audi: "Audi",
  porsche: "Porsche",
  volvo: "Volvo",
  polestar: "Polestar",
  nissan: "Nissan",
  chevrolet: "Chevrolet",
  chevy: "Chevrolet",
  lucid: "Lucid",
  "lucid motors": "Lucid",
  nio: "Nio",
  xpeng: "XPeng",
  zeekr: "Zeekr",
  mg: "MG",
  peugeot: "Peugeot",
  renault: "Renault",
  fiat: "Fiat",
  citroen: "Citroën",
  citroën: "Citroën",
  opel: "Opel",
  vauxhall: "Vauxhall",
  skoda: "Skoda",
  škoda: "Skoda",
  cupra: "Cupra",
  dacia: "Dacia",
  toyota: "Toyota",
  lexus: "Lexus",
  subaru: "Subaru",
  honda: "Honda",
  acura: "Acura",
  mazda: "Mazda",
  mini: "Mini",
  smart: "Smart",
  jaguar: "Jaguar",
  "land rover": "Land Rover",
  "range rover": "Land Rover",
  cadillac: "Cadillac",
  gmc: "GMC",
  jeep: "Jeep",
  dodge: "Dodge",
  ram: "Ram",
  chrysler: "Chrysler",
  alfa: "Alfa Romeo",
  "alfa romeo": "Alfa Romeo",
  maserati: "Maserati",
  ferrari: "Ferrari",
  lamborghini: "Lamborghini",
  bentley: "Bentley",
  "rolls-royce": "Rolls-Royce",
  "aston martin": "Aston Martin",
  lotus: "Lotus",
  alpine: "Alpine",
  genesis: "Genesis",
  vinfast: "VinFast",
  xiaomi: "Xiaomi",
  geely: "Geely",
  aito: "AITO",
  chery: "Chery",
  omoda: "Omoda",
  jaecoo: "Jaecoo",
  leapmotor: "Leapmotor",
  gwm: "GWM",
  "great wall": "GWM",
  ora: "ORA",
  roewe: "Roewe",
  maxus: "Maxus",
  hongqi: "Hongqi",
  li: "Li Auto",
  "li auto": "Li Auto",
  avatr: "Avatr",
  denza: "Denza",
  yangwang: "Yangwang",
  fisker: "Fisker",
  canoo: "Canoo",
  faraday: "Faraday Future",
  "faraday future": "Faraday Future",
  scout: "Scout",
  slate: "Slate",
  mitsubishi: "Mitsubishi",
  suzuki: "Suzuki",
  isuzu: "Isuzu",
  ds: "DS Automobiles",
  lancia: "Lancia",
};

const CANONICAL_MODELS: Record<string, string> = {
  leaf: "Leaf",
  ariya: "Ariya",
  "ioniq 5": "Ioniq 5",
  ioniq5: "Ioniq 5",
  "ioniq 5 n": "Ioniq 5 N",
  ioniq5n: "Ioniq 5 N",
  "ioniq 6": "Ioniq 6",
  ioniq6: "Ioniq 6",
  "ioniq 6 n": "Ioniq 6 N",
  ioniq6n: "Ioniq 6 N",
  "ioniq 9": "Ioniq 9",
  ioniq9: "Ioniq 9",
  "ioniq 3": "Ioniq 3",
  ioniq3: "Ioniq 3",
  "id.3": "ID.3",
  id3: "ID.3",
  "id 3": "ID.3",
  "id.4": "ID.4",
  id4: "ID.4",
  "id 4": "ID.4",
  "id.5": "ID.5",
  id5: "ID.5",
  "id.6": "ID.6",
  id6: "ID.6",
  "id.7": "ID.7",
  id7: "ID.7",
  "id 7": "ID.7",
  "id.buzz": "ID. Buzz",
  "id. buzz": "ID. Buzz",
  "id buzz": "ID. Buzz",
  idbuzz: "ID. Buzz",
  "id.polo": "ID. Polo",
  "id polo": "ID. Polo",
  "id. polo": "ID. Polo",
  "id.cross": "ID. Cross",
  "id cross": "ID. Cross",
  "id. cross": "ID. Cross",
  "mach-e": "Mustang Mach-E",
  "mach e": "Mustang Mach-E",
  mache: "Mustang Mach-E",
  "mustang mach-e": "Mustang Mach-E",
  "mustang mach e": "Mustang Mach-E",
  "f150 lightning": "F-150 Lightning",
  "f-150 lightning": "F-150 Lightning",
  bz4x: "bZ4X",
  bz: "bZ4X",
  ix: "iX",
  ix1: "iX1",
  ix2: "iX2",
  ix3: "iX3",
  ix5: "iX5",
  ix7: "iX7",
  i3: "i3",
  i4: "i4",
  i5: "i5",
  i7: "i7",
  "7x": "7X",
  "7gt": "7GT",
  "7 gt": "7GT",
  ex2: "EX2",
  ex30: "EX30",
  ex40: "EX40",
  ex60: "EX60",
  ex90: "EX90",
  ev3: "EV3",
  ev4: "EV4",
  ev5: "EV5",
  ev6: "EV6",
  ev9: "EV9",
  "model 3": "Model 3",
  model3: "Model 3",
  "model y": "Model Y",
  modely: "Model Y",
  "model s": "Model S",
  models: "Model S",
  "model x": "Model X",
  modelx: "Model X",
  "escalade iq": "Escalade IQ",
  escaladeiq: "Escalade IQ",
  "es 350e": "ES 350e",
  es350e: "ES 350e",
};

export function normalizeVehicleIdentity(
  rawBrand?: string | null,
  rawModel?: string | null
): { brand: string; model: string } {
  let brand = (rawBrand || "").trim().replace(/\s+/g, " ");
  let model = (rawModel || "").trim().replace(/\s+/g, " ");

  const lowerBrand = brand.toLowerCase();
  if (CANONICAL_BRANDS[lowerBrand]) {
    brand = CANONICAL_BRANDS[lowerBrand];
  } else if (brand.length > 3 && (brand === brand.toUpperCase() || brand === brand.toLowerCase())) {
    brand = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
  }

  // Strip duplicated brand prefix from model
  if (brand && model.toLowerCase().startsWith(brand.toLowerCase() + " ")) {
    model = model.slice(brand.length).trim();
  }

  const lowerModel = model.toLowerCase();
  const compactModel = lowerModel.replace(/[\s._-]+/g, "");

  if (CANONICAL_MODELS[lowerModel]) {
    model = CANONICAL_MODELS[lowerModel];
  } else if (CANONICAL_MODELS[compactModel]) {
    model = CANONICAL_MODELS[compactModel];
  } else {
    // Normalize e-tron casing
    model = model.replace(/\be-tron\b/gi, "e-tron");
    // If a longer word (>4 letters, purely alphabetic) is ALL CAPS or all lowercase (like "LEAF" or "leaf"), Title-Case it
    model = model
      .split(" ")
      .map((word) => {
        if (/^[A-Za-z]{4,}$/.test(word) && (word === word.toUpperCase() || word === word.toLowerCase())) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word;
      })
      .join(" ");
  }

  return { brand, model };
}

/**
 * Generates a case-insensitive, punctuation-insensitive key so
 * ("Nissan", "Leaf"), ("Nissan", "LEAF"), ("Volkswagen", "ID.4"), ("Volkswagen", "id4")
 * always map to the exact same canonical vehicle key.
 */
export function getCanonicalVehicleKey(rawBrand?: string | null, rawModel?: string | null): string {
  const { brand, model } = normalizeVehicleIdentity(rawBrand, rawModel);
  const bKey = brand.toLowerCase().replace(/[^a-z0-9]/g, "");
  const mKey = model.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${bKey}|${mKey}`;
}

export function isValidCarBrandAndModel(brand?: string | null, model?: string | null): boolean {
  const b = (brand || "").trim();
  const m = (model || "").trim();
  if (b.length < 2 || m.length < 2) return false;

  const lowerB = b.toLowerCase();
  const lowerM = m.toLowerCase();

  if (NON_CAR_BRANDS.has(lowerB)) return false;
  if (INVALID_MODEL_NAMES.has(lowerM)) return false;
  if (lowerB === lowerM) return false;

  if (NON_CAR_MODEL_KEYWORDS.some((kw) => lowerM.includes(kw) || lowerB.includes(kw))) {
    return false;
  }

  return true;
}
