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
import { SUPPORT_EMAIL } from "@/lib/legal";
import { PLANS } from "@/lib/types";

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
  const [selectedPlan, setSelectedPlan] = useState("Team");
  const [billing, setBilling] = useState<"monatlich" | "jaehrlich">("monatlich");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [sendingTestMail, setSendingTestMail] = useState(false);
  const [zippingBackup, setZippingBackup] = useState(false);

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
          <Card className="max-w-lg">
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=uVise%20Support`}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-foreground/30"
            >
              ✉️ {SUPPORT_EMAIL}
            </a>
          </Card>
        </section>

        <section>
          <h2 className="font-medium">Preise & Abo</h2>
          <p className="text-foreground/60 text-sm mb-4 max-w-xl">
            7 Tage kostenlos testen. Danach automatische Umstellung auf das gewählte Paket.
            Bezahlung per Apple Pay, Google Pay, Visa, Lastschrift, PayPal oder Klarna.
          </p>

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
              const active = selectedPlan === plan.name;
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
                    onClick={() => setSelectedPlan(plan.name)}
                    disabled={active}
                    className={`w-full rounded-full py-2.5 text-sm font-medium ${
                      active ? "text-white" : "border border-border"
                    }`}
                    style={active ? { background: "var(--accent-gradient)" } : undefined}
                  >
                    {active ? "Aktuell aktiv" : "Auswählen"}
                  </button>
                </Card>
              );
            })}
          </div>

          <Card>
            <h3 className="font-medium mb-4">Zahlungsmethode</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <label className="block">
                <span className="text-xs text-foreground/65 mb-1 block">Karteninhaber</span>
                <input
                  placeholder="Name auf der Karte"
                  className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs text-foreground/65 mb-1 block">Zahlungsart</span>
                <select className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none">
                  <option>Visa / Mastercard</option>
                  <option>SEPA-Lastschrift</option>
                  <option>PayPal</option>
                  <option>Klarna</option>
                  <option>Apple Pay</option>
                  <option>Google Pay</option>
                </select>
              </label>
            </div>
            <button
              onClick={() =>
                showToast(
                  "Echte Zahlungen werden aktiv, sobald Stripe angebunden ist. Bis dahin nur Vorschau."
                )
              }
              className="rounded-full px-6 py-2.5 text-sm font-medium text-white"
              style={{ background: "var(--accent-gradient)" }}
            >
              Speichern
            </button>
          </Card>

          <p className="text-xs text-foreground/65 mt-4 max-w-xl">
            Hinweis: Vertrieb erfolgt als Progressive Web App über einen Link auf der Website —
            dadurch entfallen die 15–20 % Store-Gebühren von Apple/Google.
          </p>
        </section>
      </div>
      <ToastView />
    </DashboardShell>
  );
}
