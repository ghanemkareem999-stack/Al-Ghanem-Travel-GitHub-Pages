import type { CorporateInquiryInput } from "./inquiries";

const OWNER_EMAIL = "alghanemtravel@gmail.com";

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, character =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!
  );

export async function sendCorporateInquiryEmail(
  id: number,
  input: CorporateInquiryInput,
  content: string
): Promise<"sent" | "deferred" | "failed"> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return "deferred";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `al-ghanem-inquiry-${id}`,
        "User-Agent": "Al-Ghanem-Travel/1.0",
      },
      body: JSON.stringify({
        from,
        to: [OWNER_EMAIL],
        reply_to: input.email,
        subject: `New B2B inquiry: ${input.companyName}`,
        text: content,
        html: `<main style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto"><h1>New Al Ghanem Travel B2B inquiry</h1><p style="white-space:pre-line">${escapeHtml(content)}</p></main>`,
      }),
    });
    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}
