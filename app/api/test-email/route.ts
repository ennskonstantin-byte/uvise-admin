import { NextResponse } from "next/server";
import { resend, RESEND_FROM } from "@/lib/resend";

export async function POST(request: Request) {
  const { to } = await request.json();
  if (!to || typeof to !== "string") {
    return NextResponse.json({ error: "Fehlende E-Mail-Adresse" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: RESEND_FROM,
    to,
    subject: "uVise — Test-E-Mail",
    html: `
      <div style="font-family: sans-serif; padding: 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;"><tr>
          <td><img src="https://www.uvise.de/logo-mark.png" width="36" height="36" alt="uVise" style="border-radius:8px; display:block;" /></td>
          <td style="padding-left:10px; font-size:20px; font-weight:700; color:#2563eb;">uVise</td>
        </tr></table>
        <p>Diese Test-E-Mail bestätigt: Der E-Mail-Versand über Resend funktioniert.</p>
        <p style="color:#71717a; font-size: 13px;">Sobald eine eigene Domain eingerichtet ist, kommen automatische Erinnerungen genauso an.</p>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
