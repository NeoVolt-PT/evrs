import { NextResponse } from "next/server";

function extractMeta(html: string, property: string): string {
  const regex1 = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const regex2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "i"
  );
  return (html.match(regex1)?.[1] || html.match(regex2)?.[1] || "").trim();
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractParagraphs(html: string): string[] {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "");

  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;

  while ((match = pRegex.exec(cleaned)) !== null) {
    const text = decodeHtmlEntities(
      match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    );
    if (text.length >= 45 && !text.toLowerCase().includes("cookie") && !text.toLowerCase().includes("javascript")) {
      paragraphs.push(text);
    }
    if (paragraphs.length >= 18) break;
  }

  return paragraphs;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return new NextResponse("Invalid protocol", { status: 400 });
    }
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  try {
    if (parsedUrl.hostname.includes("reddit.com")) {
      const jsonUrl = `${parsedUrl.origin}${parsedUrl.pathname.replace(/\/$/, "")}.json`;
      const redditRes = await fetch(jsonUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; EVRS_Preview/1.0; +https://www.neovolt.app)",
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      });

      if (redditRes.ok) {
        const data = await redditRes.json();
        const post = data?.[0]?.data?.children?.[0]?.data;
        const comments = (data?.[1]?.data?.children || [])
          .slice(0, 6)
          .map((c: { data?: { author?: string; body?: string } }) => c?.data)
          .filter((c: { body?: string } | undefined) => c && c.body);

        if (post) {
          const redditHtml = renderReaderHtml({
            sourceDomain: `${post.subreddit_name_prefixed || "r/electricvehicles"} • u/${post.author || "user"}`,
            title: post.title || "Reddit Discussion",
            imageUrl: post.thumbnail?.startsWith("http") ? post.thumbnail : "",
            paragraphs: [
              ...(post.selftext ? post.selftext.split(/\n\n+/).filter(Boolean) : []),
              ...comments.map(
                (c: { author?: string; body?: string }) =>
                  `💬 u/${c.author || "user"}: ${c.body}`
              ),
            ],
            originalUrl: targetUrl,
          });

          return new NextResponse(redditHtml, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
      }
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 3600 },
    });

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = decodeHtmlEntities(
      extractMeta(html, "og:title") ||
        extractMeta(html, "twitter:title") ||
        (titleMatch ? titleMatch[1].trim() : parsedUrl.hostname)
    );
    const description = decodeHtmlEntities(
      extractMeta(html, "og:description") ||
        extractMeta(html, "description") ||
        extractMeta(html, "twitter:description")
    );
    const imageUrl =
      extractMeta(html, "og:image") || extractMeta(html, "twitter:image");

    const paragraphs = extractParagraphs(html);
    if (description && !paragraphs.includes(description)) {
      paragraphs.unshift(description);
    }

    return new NextResponse(
      renderReaderHtml({
        sourceDomain: parsedUrl.hostname.replace(/^www\./, ""),
        title,
        imageUrl,
        paragraphs,
        originalUrl: targetUrl,
      }),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch {
    return new NextResponse(
      renderReaderHtml({
        sourceDomain: parsedUrl.hostname.replace(/^www\./, ""),
        title: parsedUrl.hostname,
        imageUrl: "",
        paragraphs: [
          "Este website protege o artigo contra visualização embutida direta. Clique no botão abaixo para ler a publicação completa diretamente no site de origem.",
        ],
        originalUrl: targetUrl,
      }),
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

function renderReaderHtml({
  sourceDomain,
  title,
  imageUrl,
  paragraphs,
  originalUrl,
}: {
  sourceDomain: string;
  title: string;
  imageUrl: string;
  paragraphs: string[];
  originalUrl: string;
}) {
  const safeParagraphs =
    paragraphs.length > 0
      ? paragraphs
          .map(
            (p) =>
              `<p style="margin: 0 0 14px 0; line-height: 1.65; color: #d4d4d8; font-size: 14px;">${p
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")}</p>`
          )
          .join("")
      : `<p style="color: #a1a1aa; font-size: 14px;">Pré-visualização resumida. Abra o link original abaixo para ver todos os elementos interativos da fonte.</p>`;

  const safeImage =
    imageUrl && imageUrl.startsWith("http")
      ? `<img src="${imageUrl.replace(/"/g, "&quot;")}" alt="" style="width: 100%; max-height: 280px; object-fit: cover; border-radius: 10px; margin-bottom: 18px; border: 1px solid #27272a;" />`
      : "";

  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin: 0; padding: 20px; background: #09090b; color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 760px; margin: 0 auto;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 999px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.35); font-weight: 600;">
        Fonte: ${sourceDomain.replace(/</g, "&lt;")}
      </span>
      <a href="${originalUrl.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; color: #10b981; text-decoration: none; font-weight: 600;">
        Abrir página original ↗
      </a>
    </div>
    <h1 style="font-size: 20px; line-height: 1.35; margin: 0 0 16px 0; color: #ffffff;">${title.replace(/</g, "&lt;")}</h1>
    ${safeImage}
    <div>${safeParagraphs}</div>
  </div>
</body>
</html>`;
}
