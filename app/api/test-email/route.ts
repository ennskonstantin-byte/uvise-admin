import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, RESEND_FROM } from "@/lib/resend";

// CORS nötig, weil die native Chef-App (sicherakte/) diese Route von einem
// anderen Origin aus aufruft (im Web-Build der App bzw. lokal beim Testen).
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  // [Audit-Fund AUTH & SESSION, 27.07.2026] Diese Route hatte gar keinen
  // Auth-Check + Wildcard-CORS -> offenes E-Mail-Relay: jeder beliebige
  // Aufrufer konnte über den uVise-Resend-Account an eine frei wählbare
  // Adresse Mails verschicken. Jetzt wie /api/uebersetzen: nur mit gültigem
  // Supabase-Access-Token.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: "Serverseitig nicht konfiguriert." }, { status: 500, headers: CORS_HEADERS });
  }
  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!accessToken) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401, headers: CORS_HEADERS });
  }
  const {
    data: { user },
  } = await createClient(supabaseUrl, supabaseAnonKey).auth.getUser(accessToken);
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401, headers: CORS_HEADERS });
  }

  const { to } = await request.json();
  if (!to || typeof to !== "string") {
    return NextResponse.json({ error: "Fehlende E-Mail-Adresse" }, { status: 400, headers: CORS_HEADERS });
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
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
