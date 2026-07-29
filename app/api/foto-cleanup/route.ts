import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// [N-06-Nachtrag / Foto-Storage-Bereinigung] Seit Migration 0057 löschen
// delete_own_employee_account()/delete_own_company_account() keine
// Storage-Objekte mehr direkt per SQL (Supabase blockiert das serverseitig,
// s. K-03). Fotos gelöschter/anonymisierter Mitarbeiter und Firmen bleiben
// seitdem bewusst als verwaiste Objekte im Bucket "employee-photos" liegen
// (foto_url/logo_url sind bereits genullt, das Bild ist von keiner Stelle im
// Produkt mehr erreichbar/verknüpfbar). Diese Route räumt sie regelmäßig über
// die Storage-API auf (die einzige von Supabase erlaubte Löschmethode).
//
// Wird von Vercel Cron aufgerufen (siehe vercel.json). Vercel schickt
// automatisch "Authorization: Bearer <CRON_SECRET>" mit. Ohne gültigen
// Secret läuft die Route nicht.

const BUCKET = "employee-photos";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET ist nicht gesetzt (Vercel → Settings → Environment Variables)." },
      { status: 500 }
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt (Vercel → Settings → Environment Variables)." },
      { status: 500 }
    );
  }

  const db = createClient(supabaseUrl, serviceKey);
  const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";

  // Referenzierte Pfade einsammeln: employees.foto_url + companies.logo_url,
  // jeweils ohne bereits-fertige http(s)-URLs (Alt-Daten vor Migration 0020).
  const [{ data: employees, error: empError }, { data: companies, error: compError }] =
    await Promise.all([
      db.from("employees").select("foto_url").not("foto_url", "is", null),
      db.from("companies").select("logo_url").not("logo_url", "is", null),
    ]);

  if (empError || compError) {
    return NextResponse.json(
      { error: (empError ?? compError)?.message ?? "Konnte referenzierte Fotos nicht laden." },
      { status: 500 }
    );
  }

  const referenced = new Set(
    [...(employees ?? []).map((e) => e.foto_url), ...(companies ?? []).map((c) => c.logo_url)]
      .filter((p): p is string => !!p && !p.startsWith("http"))
  );

  // Bucket ist nach Firmen-Ordnern strukturiert ("<company_id>/<...>").
  // list() ist nicht rekursiv -- erst alle Ordner, dann pro Ordner die Dateien.
  const { data: folders, error: listError } = await db.storage.from(BUCKET).list("", { limit: 1000 });
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }

  const orphaned: string[] = [];
  for (const folder of folders ?? []) {
    // Einträge ohne id sind "echte" Ordner (kein einzelnes Objekt).
    if (folder.id) continue;
    const { data: files, error: filesError } = await db.storage
      .from(BUCKET)
      .list(folder.name, { limit: 1000 });
    if (filesError) continue;
    for (const file of files ?? []) {
      const path = `${folder.name}/${file.name}`;
      if (!referenced.has(path)) orphaned.push(path);
    }
  }

  let removedCount = orphaned.length;
  if (orphaned.length > 0 && !dryRun) {
    // In Batches löschen (Storage-API-Limit pro Aufruf).
    const BATCH = 100;
    let failed = 0;
    for (let i = 0; i < orphaned.length; i += BATCH) {
      const batch = orphaned.slice(i, i + BATCH);
      const { error: removeError } = await db.storage.from(BUCKET).remove(batch);
      if (removeError) {
        console.error("foto-cleanup: Batch-Löschung fehlgeschlagen", removeError);
        failed += batch.length;
      }
    }
    // [Audit-Fund SUPABASE & DATEN, 27.07.2026] Antwort meldete bisher immer
    // orphaned.length als gelöscht, auch wenn ein Batch fehlschlug.
    removedCount = orphaned.length - failed;
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    geprueft: (folders ?? []).length,
    verwaisteObjekte: orphaned.length,
    geloescht: dryRun ? 0 : removedCount,
  });
}
