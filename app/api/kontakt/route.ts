import { NextResponse } from "next/server";
import { resend, RESEND_FROM } from "@/lib/resend";
import { CONTACT_EMAIL } from "@/lib/legal";

// CORS nötig, weil die native Chef-App (sicherakte/) diese Route von einem
// anderen Origin aus aufruft (im Web-Build der App bzw. lokal beim Testen).
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// Nimmt das öffentliche Kontaktformular entgegen und schickt den Inhalt
// per E-Mail an die Kontakt-Adresse. Reply-To ist die Absender-Adresse,
// damit man im Postfach direkt auf die Anfrage antworten kann.
export async function POST(request: Request) {
  const { name, email, nachricht, firma } = await request.json();

  // "firma" ist ein unsichtbares Honeypot-Feld: Menschen lassen es leer,
  // Spam-Bots füllen es aus — dann tun wir so, als wäre alles ok, ohne zu senden.
  if (firma) {
    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  }

  if (
    !name || typeof name !== "string" || name.length > 200 ||
    !email || typeof email !== "string" || !email.includes("@") || email.length > 200 ||
    !nachricht || typeof nachricht !== "string" || nachricht.length > 5000
  ) {
    return NextResponse.json({ error: "Bitte alle Felder korrekt ausfüllen." }, { status: 400, headers: CORS_HEADERS });
  }

  const { error } = await resend.emails.send({
    from: RESEND_FROM,
    to: CONTACT_EMAIL,
    replyTo: email,
    subject: `uVise Kontaktanfrage von ${name}`,
    html: `
      <div style="font-family: sans-serif; padding: 24px; max-width: 560px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;"><tr>
          <td><img src="https://www.uvise.de/logo-mark.png" width="36" height="36" alt="uVise" style="border-radius:8px; display:block;" /></td>
          <td style="padding-left:10px; font-size:20px; font-weight:700; color:#2563eb;">Neue Kontaktanfrage</td>
        </tr></table>
        <p><strong>Name:</strong> ${name.replace(/</g, "&lt;")}</p>
        <p><strong>E-Mail:</strong> ${email.replace(/</g, "&lt;")}</p>
        <p style="white-space:pre-wrap; border-left:3px solid #2563eb; padding-left:12px; margin-top:16px;">${nachricht.replace(/</g, "&lt;")}</p>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json({ error: "Versand fehlgeschlagen. Bitte später erneut versuchen." }, { status: 500, headers: CORS_HEADERS });
  }
  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
