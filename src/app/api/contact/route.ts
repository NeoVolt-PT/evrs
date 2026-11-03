import { NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit, escapeHtml, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, "contact-form", 4, 600_000)) {
      return NextResponse.json(
        { ok: false, error: "Too many messages. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot anti-bot field: if filled by a spam bot, silently succeed without sending email
    if (body?.website_url && String(body.website_url).trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const name = (body?.name || "").trim().slice(0, 120);
    const email = (body?.email || "").trim().slice(0, 160);
    const subject = (body?.subject || "Contacto via EVRS (neovolt.app)").trim().slice(0, 200);
    const message = (body?.message || "").trim().slice(0, 4000);

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #10b981;">📩 Nova Mensagem de Contacto — EVRS (neovolt.app)</h2>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Assunto:</strong> ${escapeHtml(subject)}</p>
        <hr style="border-top: 1px solid #e2e8f0;" />
        <h3 style="color: #1e293b;">Mensagem:</h3>
        <pre style="background: #f8fafc; padding: 12px; border-radius: 6px; white-space: pre-wrap; font-family: inherit;">${escapeHtml(message)}</pre>
      </div>
    `;

    let sentViaResend = false;

    // 1. Primary delivery via Resend API if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const res = await resend.emails.send({
          from: "EVRS Contact <onboarding@resend.dev>",
          to: "filmfer@gmail.com",
          replyTo: email,
          subject: `[EVRS Contacto] ${subject} — de ${name}`,
          html: htmlBody,
        });
        if (!res.error) {
          sentViaResend = true;
        }
      } catch (resendErr) {
        console.error("[Contact API] Resend error:", resendErr);
      }
    }

    // 2. Fallback / secondary delivery via FormSubmit AJAX endpoint
    if (!sentViaResend) {
      try {
        const formSubmitRes = await fetch("https://formsubmit.co/ajax/filmfer@gmail.com", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Origin: "https://www.neovolt.app",
            Referer: "https://www.neovolt.app/",
          },
          body: JSON.stringify({
            name,
            email,
            _replyto: email,
            _subject: `[EVRS Contacto] ${subject} — de ${name}`,
            message,
            _template: "table",
          }),
        });
        if (formSubmitRes.ok) {
          sentViaResend = true;
        }
      } catch (fallbackErr) {
        console.error("[Contact API] FormSubmit fallback error:", fallbackErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Contact API] Failed to process contact form:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
