const METRIC_LANGS = new Set(["pt", "fr", "es", "de"]);

function parseNum(raw: string): number {
  const cleaned = raw.trim();
  // Handle thousands comma vs decimal comma (e.g. "2,716" vs "2,5")
  if (/^\d{1,3}(,\d{3})+$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/,/g, ""));
  }
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, ""));
  }
  return parseFloat(cleaned.replace(",", "."));
}

/**
 * Converts distance (miles <-> km), speed (mph <-> km/h), and volume (gallons <-> liters)
 * inside report text depending on whether the display language uses the Metric system
 * (PT, FR, ES, DE) or Imperial system (EN).
 */
export function convertUnitsInText(text: string, lang: string): string {
  if (!text) return "";
  const shortLang = (lang || "pt").slice(0, 2).toLowerCase();
  const useMetric = METRIC_LANGS.has(shortLang);

  let result = text;

  if (useMetric) {
    // 1. Convert mph -> km/h
    result = result.replace(
      /\b(\d+(?:[.,]\d+)?)\s*(?:mph|mi\/h|miles per hour)\b/gi,
      (_, numStr) => {
        const val = parseNum(numStr);
        if (Number.isNaN(val)) return _;
        return `${Math.round(val * 1.60934)} km/h`;
      }
    );

    // 2. Convert miles / milhas / Meilen / milles -> km
    result = result.replace(
      /\b(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(?:-|\s)?(?:miles|mile|milhas|milha|Meilen|Meile|milles|mi)\b/gi,
      (_, numStr) => {
        const val = parseNum(numStr);
        if (Number.isNaN(val) || val <= 0) return _;
        const km = Math.round(val * 1.60934);
        return `${km} km`;
      }
    );

    // 3. Convert gallons / galões / galones / Gallonen -> Litros (L)
    result = result.replace(
      /\b(\d+(?:[.,]\d+)?)\s*(?:gallons|gallon|galões|galão|galones|galón|Gallonen|Gallone|gal)\b/gi,
      (_, numStr) => {
        const val = parseNum(numStr);
        if (Number.isNaN(val) || val <= 0) return _;
        const liters = (val * 3.78541).toFixed(1).replace(/\.0$/, "");
        const unitLabel =
          shortLang === "pt" || shortLang === "es"
            ? "litros"
            : shortLang === "fr"
            ? "litres"
            : "Liter";
        return `${liters} ${unitLabel}`;
      }
    );

    // 4. Convert MPG -> L/100km
    result = result.replace(
      /\b(\d+(?:[.,]\d+)?)\s*mpg\b/gi,
      (_, numStr) => {
        const val = parseNum(numStr);
        if (Number.isNaN(val) || val <= 0) return _;
        const l100 = (235.215 / val).toFixed(1);
        return `${l100} L/100km`;
      }
    );
  } else {
    // English (Imperial): Convert km/h -> mph, km -> miles, and liters -> gallons
    // 1. Convert km/h -> mph
    result = result.replace(
      /\b(\d+(?:[.,]\d+)?)\s*km\/h\b/gi,
      (_, numStr) => {
        const val = parseNum(numStr);
        if (Number.isNaN(val)) return _;
        return `${Math.round(val * 0.621371)} mph`;
      }
    );

    // 2. Convert km -> miles (avoid matching km/h or Wh/km)
    result = result.replace(
      /(?<![\/a-zA-Z])\b(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)\s*(?:km|kilometers|kilometres|quilómetros|quilômetros)\b(?![\/a-zA-Z])/gi,
      (_, numStr) => {
        const val = parseNum(numStr);
        if (Number.isNaN(val) || val <= 0) return _;
        const miles = Math.round(val * 0.621371);
        return `${miles} miles`;
      }
    );

    // 3. Convert liters / litros -> gallons
    result = result.replace(
      /\b(\d+(?:[.,]\d+)?)\s*(?:liters|litres|liter|litre|litros|litro)\b/gi,
      (_, numStr) => {
        const val = parseNum(numStr);
        if (Number.isNaN(val) || val <= 0) return _;
        const gallons = (val * 0.264172).toFixed(1).replace(/\.0$/, "");
        return `${gallons} gallons`;
      }
    );
  }

  return result;
}
