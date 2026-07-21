"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useToast } from "@/components/Toast";
import { useAppData } from "@/lib/store";
import { exportNachweiseCsv, exportQualifikationenCsv } from "@/lib/exportCsv";
import { exportGesamtBackupZip } from "@/lib/exportZip";
import { SUPPORT_EMAIL, CONTACT_EMAIL } from "@/lib/legal";
import { PLANS } from "@/lib/types";
import { supabase } from "@/lib/supabase";

const ABO_STATUS_LABELS: Record<string, string> = {
  canceled: "gekündigt",
  past_due: "Zahlung überfällig",
  unpaid: "nicht bezahlt",
  incomplete: "nicht abgeschlossen",
  incomplete_expired: "abgelaufen (nicht abgeschlossen)",
  trialing: "in der Testphase",
  paused: "pausiert",
};

export default function EinstellungenPage() {
  const {
    company,
    session,
    updateCompany,
    uploadCompanyLogo,
    employees,
    trainings,
    qualifications,
    employeeTrainings,
  } = useAppData();
  const { showToast, ToastView } = useToast();
  const [firmenname, setFirmenname] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [adresse, setAdresse] = useState("");
  const [adminName, setAdminName] = useState("");
  const [billing, setBilling] = useState<"monatlich" | "jaehrlich">("monatlich");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [sendingTestMail, setSendingTestMail] = useState(false);
  const [zippingBackup, setZippingBackup] = useState(false);
  const [startingCheckout, setStartingCheckout] = useState<string | null>(null);
  const [deletingCompany, setDeletingCompany] = useState(false);

  // DSGVO + Konsistenz zu den Apps: Firma & Konto endgültig löschbar.
  // Zwei Sicherheitsabfragen, weil unwiderruflich und weitreichend.
  async function handleDeleteCompany() {
    const bestaetigt = window.confirm(
      `„${company?.name ?? "Deine Firma"}" wird mit ALLEN Mitarbeitern, Unterweisungen, Nachweisen und Logins endgültig gelöscht. Das lässt sich nicht rückgängig machen.\n\nWirklich fortfahren?`,
    );
    if (!bestaetigt) return;
    const wortlaut = window.prompt(
      'Letzte Sicherheitsabfrage: Tippe LÖSCHEN (in Großbuchstaben), um die Firma endgültig zu löschen.',
    );
    if (wortlaut !== "LÖSCHEN") {
      showToast("Löschung abgebrochen.");
      return;
    }
    setDeletingCompany(true);
    try {
      const { error } = await supabase.rpc("delete_own_company_account");
      if (error) throw error;
      // Konto ist gelöscht — Abmelden darf keinen Fehler mehr werfen.
      await supabase.auth.signOut().catch(() => {});
    } catch {
      setDeletingCompany(false);
      showToast("Die Firma konnte nicht gelöscht werden. Bitte später erneut versuchen.");
    }
  }

  async function startCheckout(planName: string) {
    if (!session?.access_token) {
      showToast("Bitte neu einloggen und erneut versuchen.");
      return;
    }
    setStartingCheckout(planName);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ planName, billing }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        showToast(`Fehlgeschlagen: ${json.error ?? "Unbekannter Fehler"}`);
        return;
      }
      window.location.href = json.url;
    } finally {
      setStartingCheckout(null);
    }
  }

  async function sendTestMail() {
    if (!session?.user.email) return;
    setSendingTestMail(true);
    try {
      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: session.user.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unbekannter Fehler");
      showToast(`Test-E-Mail an ${session.user.email} verschickt.`);
    } catch (e) {
      showToast(`Fehlgeschlagen: ${e instanceof Error ? e.message : "Unbekannter Fehler"}`);
    } finally {
      setSendingTestMail(false);
    }
  }

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      await uploadCompanyLogo(file);
      showToast("Firmenlogo gespeichert.");
    } catch {
      showToast("Logo-Upload fehlgeschlagen. Ist der Datei-Speicher (Migration 0010) eingerichtet?");
    } finally {
      setUploadingLogo(false);
    }
  }

  useEffect(() => {
    if (company) {
      setFirmenname(company.name);
      setAdresse(company.address ?? "");
      setAdminName(company.chefName ?? "");
    }
  }, [company]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateCompany({ name: firmenname, address: adresse, chefName: adminName });
      showToast("Firmenprofil gespeichert.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell>
      <PageHeader title="Einstellungen" />

      <div className="space-y-8">
        <section>
          <h2 className="font-medium">Firmen-Setup</h2>
          <p className="text-foreground/60 text-sm mb-4">
            Euer Erscheinungsbild — so sehen dich Chef und alle Mitarbeiter in der App.
          </p>

          <Card className="max-w-lg mx-auto text-center">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {company?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logoUrl}
                    alt="Firmenlogo"
                    className="h-24 w-24 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div
                    className="h-24 w-24 rounded-full flex items-center justify-center text-white text-2xl font-semibold"
                    style={{ background: "var(--accent-gradient)" }}
                  >
                    {firmenname
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                )}
                <label
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full text-white flex items-center justify-center text-lg cursor-pointer"
                  style={{ background: "var(--accent-gradient)" }}
                  aria-label="Firmenlogo hochladen"
                >
                  +
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                </label>
              </div>
              {uploadingLogo && <p className="text-xs text-foreground/65 mt-2">Lädt Logo hoch…</p>}

              {editingName ? (
                <input
                  autoFocus
                  value={firmenname}
                  onChange={(e) => setFirmenname(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  className="mt-4 text-xl font-semibold text-center rounded-full border border-border bg-surface px-4 py-1.5 outline-none"
                />
              ) : (
                <button onClick={() => setEditingName(true)} className="mt-4 text-center">
                  <p className="text-xl font-semibold">{firmenname}</p>
                  <p className="text-xs text-foreground/65">Firmenname antippen, um ihn zu ändern</p>
                </button>
              )}
            </div>

            <div className="space-y-4 text-left">
              <label className="block">
                <span className="text-xs text-foreground/65 mb-1 block">Admin-Name</span>
                <input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
                />
                <span className="text-xs text-foreground/65 mt-1 block">
                  Wird statt „Chef&quot; angezeigt — z.B. bei Rückfragen und Erinnerungen.
                </span>
              </label>
              <label className="block">
                <span className="text-xs text-foreground/65 mb-1 block">Firmenadresse</span>
                <input
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
                />
                <span className="text-xs text-foreground/65 mt-1 block">
                  Adresse eintippen — Vorschläge erscheinen automatisch. Erscheint z.B. auf
                  exportierten Archiv-PDFs.
                </span>
              </label>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "var(--accent-gradient)" }}
            >
              {saving ? "Speichert…" : "Speichern"}
            </button>
          </Card>
        </section>

        <section>
          <h2 className="font-medium">E-Mail-Erinnerungen</h2>
          <p className="text-foreground/60 text-sm mb-4 max-w-xl">
            Automatische Erinnerungen (Ablauf, Rückfragen) werden verschickt, sobald eine eigene
            Absender-Domain eingerichtet ist. Bis dahin kannst du hier eine Test-E-Mail an dich
            selbst schicken, um zu prüfen, ob der Versand grundsätzlich funktioniert.
          </p>
          <Card className="max-w-lg">
            <button
              onClick={sendTestMail}
              disabled={sendingTestMail || !session?.user.email}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "var(--accent-gradient)" }}
            >
              {sendingTestMail ? "Sendet…" : `✉️ Test-E-Mail an ${session?.user.email ?? "dich"} senden`}
            </button>
          </Card>
        </section>

        <section>
          <h2 className="font-medium">Backup & Export</h2>
          <p className="text-foreground/60 text-sm mb-4 max-w-xl">
            Alle Nachweise und Qualifikationen als CSV-Datei herunterladen — z.B. für
            Prüfungen durch die Berufsgenossenschaft oder als eigene Sicherung. Die Dateien
            lassen sich direkt in Excel öffnen.
          </p>
          <Card className="max-w-lg">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const n = exportNachweiseCsv(employees, trainings, employeeTrainings);
                  showToast(`${n} Nachweis-Zeile(n) exportiert.`);
                }}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
                style={{ background: "var(--accent-gradient)" }}
              >
                📄 Nachweise als CSV
              </button>
              <button
                onClick={() => {
                  const n = exportQualifikationenCsv(employees, qualifications);
                  showToast(`${n} Qualifikation(en) exportiert.`);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-foreground/30"
              >
                🎖️ Qualifikationen als CSV
              </button>
              <button
                onClick={async () => {
                  setZippingBackup(true);
                  try {
                    await exportGesamtBackupZip(company, employees, trainings, employeeTrainings, qualifications);
                    showToast("Gesamt-Backup als ZIP heruntergeladen.");
                  } finally {
                    setZippingBackup(false);
                  }
                }}
                disabled={zippingBackup}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-foreground/30 disabled:opacity-50"
              >
                🗜️ {zippingBackup ? "Erstellt ZIP…" : "Gesamt-Backup als ZIP"}
              </button>
            </div>
            <p className="text-xs text-foreground/65 mt-3">
              „Gesamt-Backup&quot; bündelt beide CSV-Dateien in einer ZIP-Datei. Tipp: Für ein
              druckbares PDF einzelner Jahre gibt es im Archiv den Knopf
              „Gesamtes Jahr als PDF drucken&quot;.
            </p>
          </Card>
        </section>

        <section>
          <h2 className="font-medium">Support & Hilfe</h2>
          <p className="text-foreground/60 text-sm mb-4">
            Fragen oder Probleme? Schreib uns — wir melden uns so schnell wie möglich.
          </p>
          <Card className="max-w-lg flex flex-wrap gap-3">
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=uVise%20Support`}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-foreground/30"
            >
              ✉️ Support: {SUPPORT_EMAIL}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=uVise%20Kontakt`}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-foreground/30"
            >
              ✉️ Kontakt: {CONTACT_EMAIL}
            </a>
          </Card>
        </section>

        <section>
          <h2 className="font-medium">Preise & Abo</h2>
          <p className="text-foreground/60 text-sm mb-4 max-w-xl">
            7 Tage kostenlos testen. Danach automatische Umstellung auf das gewählte Paket.
            Bezahlung per Apple Pay, Google Pay, Visa, Lastschrift, PayPal oder Klarna — echte
            Bezahlung wird aktiv, sobald Stripe angebunden ist.
          </p>

          {company?.subscriptionStatus === "active" && company.plan && (
            <p className="text-sm mb-4 rounded-2xl bg-green-500/10 text-green-700 dark:text-green-400 px-4 py-2.5 max-w-xl">
              ✅ Aktives Abo: <strong>{company.plan}</strong>
              {company.billing === "jaehrlich" ? " (jährlich)" : " (monatlich)"}
            </p>
          )}
          {company?.subscriptionStatus && company.subscriptionStatus !== "active" && (
            <p className="text-sm mb-4 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2.5 max-w-xl">
              ⚠️ Abo-Status: {ABO_STATUS_LABELS[company.subscriptionStatus] ?? company.subscriptionStatus}
            </p>
          )}

          <div className="inline-flex rounded-full border border-border p-1 text-sm mb-6">
            <button
              onClick={() => setBilling("monatlich")}
              className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                billing === "monatlich" ? "text-white" : "text-foreground/60"
              }`}
              style={billing === "monatlich" ? { background: "var(--accent-gradient)" } : undefined}
            >
              Monatlich
            </button>
            <button
              onClick={() => setBilling("jaehrlich")}
              className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                billing === "jaehrlich" ? "text-white" : "text-foreground/60"
              }`}
              style={billing === "jaehrlich" ? { background: "var(--accent-gradient)" } : undefined}
            >
              Jährlich <span className="opacity-80">· 20% sparen</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {PLANS.map((plan) => {
              const active = company?.subscriptionStatus === "active" && company.plan === plan.name;
              return (
                <Card
                  key={plan.name}
                  className={`p-6 ${active ? "border-2" : ""}`}
                  style={active ? { borderColor: "var(--accent-violet)" } : undefined}
                >
                  <p className="font-medium mb-1">{plan.name}</p>
                  <p className="text-2xl font-semibold">
                    {billing === "monatlich" ? (
                      <>
                        {plan.preis}€<span className="text-sm font-normal text-foreground/65">/Monat</span>
                      </>
                    ) : (
                      <>
                        {plan.preisJaehrlich}€<span className="text-sm font-normal text-foreground/65">/Jahr</span>
                      </>
                    )}
                  </p>
                  <p className="text-sm text-foreground/65 mb-4">
                    {plan.limit}
                    {active ? " · aktuell aktiv" : ""}
                  </p>
                  <ul className="text-sm space-y-1.5 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-foreground/70">
                        <Check size={14} className="text-foreground/65 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => startCheckout(plan.name)}
                    disabled={startingCheckout !== null}
                    className={`w-full rounded-full py-2.5 text-sm font-medium disabled:opacity-50 ${
                      active ? "text-white" : "border border-border"
                    }`}
                    style={active ? { background: "var(--accent-gradient)" } : undefined}
                  >
                    {startingCheckout === plan.name
                      ? "Leitet weiter…"
                      : active
                        ? "Erneut abonnieren"
                        : "Jetzt abonnieren"}
                  </button>
                </Card>
              );
            })}
          </div>

          <p className="text-xs text-foreground/65 max-w-xl">
            Zahlung und Kartendaten werden sicher über Stripe abgewickelt — nie direkt bei uVise
            gespeichert. Nach dem Klick auf &bdquo;Jetzt abonnieren&ldquo; geht es auf Stripes
            eigener, gesicherter Seite weiter.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-red-500">Firma &amp; Konto löschen</h2>
          <p className="text-sm text-foreground/70 mt-1 mb-3 max-w-xl">
            Löscht deine Firma mit allen Mitarbeitern, Unterweisungen, Nachweisen und Logins
            endgültig. Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <Card className="max-w-lg border-red-500/40">
            <button
              onClick={handleDeleteCompany}
              disabled={deletingCompany}
              className="w-full rounded-full border border-red-500 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10 disabled:opacity-50"
            >
              {deletingCompany ? "Wird gelöscht…" : "🗑 Firma & Konto endgültig löschen"}
            </button>
          </Card>
        </section>
      </div>
      <ToastView />
    </DashboardShell>
  );
}
