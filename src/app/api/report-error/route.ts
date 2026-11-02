import { NextResponse } from "next/server";
import { sendErrorReport } from "@/services/errorReporter";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const errorMessage = typeof body?.errorMessage === "string" ? body.errorMessage : "Unknown client error";
    const context = typeof body?.context === "string" ? body.context : "Frontend Error";

    await sendErrorReport(errorMessage, context);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[API /api/report-error] Failed to process error report:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
