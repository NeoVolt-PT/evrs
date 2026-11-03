import { NextResponse } from "next/server";
import { sendErrorReport } from "@/services/errorReporter";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, "report-error", 5, 600_000)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const body = await request.json();
    const errorMessage = typeof body?.errorMessage === "string" ? body.errorMessage.slice(0, 1500) : "Unknown client error";
    const context = typeof body?.context === "string" ? body.context.slice(0, 120) : "Frontend Error";

    await sendErrorReport(errorMessage, context);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API /api/report-error] Failed to process error report:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
