import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const memoryCache = new Map<string, string>();
const SUPPORTED_LANGS = new Set(["pt", "en", "fr", "es", "de"]);

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, "translate", 80, 60_000)) {
      return NextResponse.json({ translatedText: "" }, { status: 429 });
    }

    const body = await request.json();
    const text = (body?.text || "").trim().slice(0, 2500);
    const rawLang = (body?.targetLang || "pt").toLowerCase().slice(0, 2);
    const targetLang = SUPPORTED_LANGS.has(rawLang) ? rawLang : "en";

    if (!text) {
      return NextResponse.json({ translatedText: "" });
    }

    const cacheKey = `${targetLang}:${text}`;
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ translatedText: cached });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; EVRS_Translator/1.0)",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ translatedText: text });
    }

    const data = await res.json();
    const sentences = Array.isArray(data?.[0])
      ? data[0].map((part: unknown[]) => (typeof part?.[0] === "string" ? part[0] : "")).join("")
      : text;

    const finalResult = sentences || text;
    if (memoryCache.size < 2000) {
      memoryCache.set(cacheKey, finalResult);
    }

    return NextResponse.json({ translatedText: finalResult });
  } catch {
    return NextResponse.json({ translatedText: "" }, { status: 500 });
  }
}
