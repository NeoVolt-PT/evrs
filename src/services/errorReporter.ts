import { Resend } from "resend";

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

/**
 * Sends an error report to the system administrator.
 * @param errorMessage The error message or stack trace.
 * @param context Optional context of where the error occurred (e.g., "Scraper", "Database", "API").
 */
export async function sendErrorReport(errorMessage: string, context: string = "System Error") {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Error Reporter] RESEND_API_KEY is not set. Mocking email send:");
    console.warn(`[Subject] Auto Electric Report System - ${context}`);
    console.warn(`[Body] ${errorMessage}`);
    return;
  }

  try {
    const data = await resend.emails.send({
      from: "EVRS Alerts <onboarding@resend.dev>", // Resend test email domain
      to: "filmfer@gmail.com", // Recipient as per requirements
      subject: `Auto Electric Report System - ${context}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #ef4444;">🚨 EVRS System Alert</h2>
          <p><strong>Context:</strong> ${context}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <hr style="border-top: 1px solid #e2e8f0;" />
          <h3 style="color: #1e293b;">Error Details:</h3>
          <pre style="background: #f8fafc; padding: 12px; border-radius: 4px; overflow-x: auto;">
${errorMessage}
          </pre>
        </div>
      `,
    });
    
    console.log("[Error Reporter] Alert sent successfully:", data);
    return data;
  } catch (error) {
    console.error("[Error Reporter] Failed to send email alert:", error);
    throw error;
  }
}