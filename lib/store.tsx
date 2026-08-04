"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { notifyPush } from "@/lib/notifyPush";
import { useToast } from "@/components/Toast";
import {
  type Employee,
  type Training,
  type Bundle,
  type Qualification,
  type Question,
  type EmployeeTraining,
  type Category,
  qualIcon,
  istMinderjaehrig,
  AMPEL_WARN_TAGE,
} from "@/lib/types";
import { RECENT_SIGNED_DAYS } from "@/lib/recentlySigned";

// Wirft den Supabase/Postgrest-Fehler als echte Error-Instanz weiter. Ohne
// .throwOnError() liefert postgrest-js bei einer fehlgeschlagenen Anfrage nur
// ein einfaches Objekt ({message, code, ...}), kein Error-Objekt — ein
// nachgelagertes `err instanceof Error` (z.B. für Fehlermeldungen im UI)
// schlägt dann immer fehl, selbst wenn `error.message` die eigentliche,
// hilfreiche DB-Meldung enthält (z.B. aus einem Trigger wie in Migration 0042).
export function throwIfError(error: unknown): asserts error is null {
  if (!error) return;
  throw error instanceof Error
    ? error
    : new Error(
        (error as { message?: string })?.message ?? "Unbekannter Fehler"
      );
}

// Erkennt "E-Mail schon vergeben" — egal ob aus der Vorab-Prüfung
// (email_taken) oder vom Unique-Index der Datenbank (Migration 0038).
export function istEmailKonflikt(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return msg === "email_taken" || msg.includes("employees_email_unique");
}

// Einfache Format-Plausibilität für E-Mail-Adressen (Runde-3-Audit, N-13) --
// verlässt sich nicht mehr allein auf Server/Storage. Leere Eingabe ist ok
// (E-Mail ist optional).
export function istGueltigeEmail(email: string | null | undefined): boolean {
  if (!email || email.trim() === "") return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
export function istEmailFormatFehler(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return msg === "email_invalid";
}

// Clientseitige Längen-Prüfung als erste Verteidigungslinie, DB-CHECK-
// Constraints (Migration 0062) fangen den Rest ab -- analog zu
// assertEmailFrei/istGueltigeEmail oben (Audit-Fund "Writes ohne
// Eingabevalidierung", 27.07.2026).
function assertMaxLen(value: string | null | undefined, max: number, feldname: string) {
  if (value && value.trim().length > max) {
    throw new Error(`${feldname} darf höchstens ${max} Zeichen lang sein.`);
  }
}

// Optionales Datum (Qualifikationen/Trainings): leer ist ok, sonst muss es
// ein echtes, gültiges Kalenderdatum sein -- verhindert kaputte Werte wie
// "31.02.2026", die die date-Spalte sonst erst beim Insert/Update ablehnt.
function assertGueltigesDatum(value: string | null | undefined, feldname: string) {
  if (!value) return;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${feldname} ist kein gültiges Datum.`);
  }
}

// [Nachtrag] Erste, schnelle Rückmeldung im Browser, bevor überhaupt ein
// Request rausgeht -- die eigentliche, verbindliche Grenze setzt die RPC
// set_aufbewahrungsfrist (Migration 0065, noch nicht eingespielt) serverseitig
// nochmal durch. null bleibt immer erlaubt ("nie automatisch anonymisieren").
function assertGueltigeAufbewahrungsfrist(monate: number | null) {
  if (monate === null) return;
  if (!Number.isInteger(monate) || monate < 24 || monate > 120) {
    throw new Error(
      'Aufbewahrungsfrist muss zwischen 24 und 120 Monaten liegen (oder leer für „nie automatisch anonymisieren").'
    );
  }
}

type Company = {
  id: string;
  name: string;
  address: string | null;
  chefName: string | null;
  logoUrl: string | null;
  plan: string | null;
  billing: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
  // [M-17] Von der Firma selbst festgelegte Aufbewahrungsfrist für signierte
  // Unterweisungsnachweise, in Monaten. null = nie automatisch anonymisieren
  // (sicherer Standard -- es gibt keine branchenübergreifend richtige Zahl).
  aufbewahrungsfristMonate: number | null;
};

type NewEmployeeInput = Omit<
  Employee,
  | "id"
  | "ampel"
  | "offenePunkte"
  | "qualifikationsIcons"
  | "fotoUrl"
  | "archiviert"
  | "minderjaehrig"
  | "inviteToken"
  | "registriert"
  | "version"
>;
type NewTrainingInput = Omit<Training, "id" | "pdfPath" | "version"> & {
  bundleId?: string | null;
  pdfFile?: File | null;
};
type NewBundleInput = Omit<Bundle, "id">;

type AppDataContextValue = {
  loading: boolean;
  session: Session | null;
  company: Company | null;
  employees: Employee[];
  trainings: Training[];
  bundles: Bundle[];
  categories: Category[];
  qualifications: Qualification[];
  questions: Question[];
  employeeTrainings: EmployeeTraining[];
  addEmployee: (input: NewEmployeeInput) => Promise<Employee>;
  addTraining: (input: NewTrainingInput) => Promise<Training>;
  addBundle: (input: NewBundleInput) => Promise<{ id: string }>;
  addCategory: (input: { name: string; icon: string }) => Promise<void>;
  updateCategory: (id: string, input: { name: string; icon: string }) => Promise<void>;
  setEmployeeCategory: (employeeId: string, kategorie: string) => Promise<void>;
  updateBundle: (
    id: string,
    input: { name: string; icon: string; trainingIds: string[] }
  ) => Promise<void>;
  addQualification: (input: {
    employeeId: string;
    name: string;
    ablaufdatum: string | null;
  }) => Promise<void>;
  updateQualification: (
    id: string,
    input: { name: string; ablaufdatum: string | null }
  ) => Promise<void>;
  deleteQualification: (id: string) => Promise<void>;
  qualifikationTerminVereinbart: (id: string) => Promise<void>;
  qualifikationNochmalErinnern: (id: string) => Promise<void>;
  assignTraining: (trainingId: string, employeeIds: string[]) => Promise<void>;
  assignBundle: (trainingIds: string[], employeeIds: string[]) => Promise<void>;
  regenerateInviteToken: (employeeId: string) => Promise<string>;
  withdrawTraining: (trainingId: string) => Promise<number>;
  updateEmployee: (
    id: string,
    input: {
      vorname: string;
      nachname: string;
      personalnummer: string;
      email: string | null;
      telefon: string | null;
      geburtsdatum: string | null;
      kategorie: string;
      istBeauftragter: boolean;
    }
  ) => Promise<void>;
  updateTraining: (
    id: string,
    input: { name: string; icon: string; inhalt: string | null; ablaufdatum: string | null }
  ) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  setEmployeeArchived: (id: string, archiviert: boolean) => Promise<void>;
  uploadEmployeePhoto: (employeeId: string, file: File) => Promise<void>;
  deleteTraining: (id: string) => Promise<void>;
  deleteBundle: (id: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateCompany: (input: { name: string; address: string; chefName: string }) => Promise<void>;
  updateAufbewahrungsfrist: (monate: number | null) => Promise<void>;
  uploadCompanyLogo: (file: File) => Promise<void>;
  answerQuestion: (id: string, antwort: string) => Promise<void>;
  loadEmployeeArchive: (employeeId: string) => Promise<EmployeeTraining[]>;
  loadTrainingArchive: (trainingId: string) => Promise<EmployeeTraining[]>;
  fetchInviteToken: (employeeId: string) => Promise<string | null>;
  fetchSignatureDetails: (
    employeeTrainingId: string
  ) => Promise<{ signaturBildUrl: string | null; signaturHash: string | null }>;
  reload: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("de-DE");
}

function qualStatus(ablaufdatum: string | null): "gueltig" | "laeuft_ab" | "abgelaufen" {
  if (!ablaufdatum) return "gueltig";
  const days = (new Date(ablaufdatum).getTime() - Date.now()) / 86_400_000;
  if (days < 0) return "abgelaufen";
  if (days < AMPEL_WARN_TAGE) return "laeuft_ab";
  return "gueltig";
}

function trainingStatus(ablaufdatum: string | null): "aktuell" | "laeuft_ab" | "abgelaufen" {
  if (!ablaufdatum) return "aktuell";
  const daysLeft = (new Date(ablaufdatum).getTime() - Date.now()) / 86_400_000;
  if (daysLeft < 0) return "abgelaufen";
  return daysLeft < AMPEL_WARN_TAGE ? "laeuft_ab" : "aktuell";
}

function recentSignedCutoff(): string {
  return new Date(Date.now() - RECENT_SIGNED_DAYS * 86_400_000).toISOString();
}

// ablaufdatumIso muss das ROHE ISO-Datum sein (nicht das deutsch formatierte
// Training.ablaufdatum!) -- new Date("22.7.2026") lässt sich nicht
// zuverlässig parsen, new Date("2026-07-22") schon. Der Aufrufer liefert es
// getrennt an, weil die beiden Aufrufstellen es unterschiedlich beschaffen
// (runLoad hat die rohen trainingRows griffbereit, die Archiv-Nachlade-
// Funktionen joinen stattdessen direkt in der Query).
function mapEmployeeTraining(et: any, ablaufdatumIso: string | null): EmployeeTraining {
  return {
    id: et.id,
    employeeId: et.employee_id,
    trainingId: et.training_id,
    status: et.status,
    signiertAm: et.signiert_am ? formatDate(et.signiert_am) : null,
    signaturBildUrl: et.signatur_bild_url ?? null,
    geraet: et.geraet ?? null,
    signaturHash: et.signatur_hash ?? null,
    signiertAls: et.signiert_als ?? null,
    ablaufdatumIso,
  };
}

// Der Storage-Bucket "employee-photos" ist privat (Migration 0020) — foto_url/
// logo_url speichern nur noch den PFAD, nicht mehr die fertige URL. Hier wird
// beim Laden für alle Fotos auf einmal eine zeitlich begrenzte signierte URL
// erzeugt (günstiger als N Einzelaufrufe).
const PHOTO_URL_TTL_SECONDS = 3600;

async function resolveSignedUrls(pathsOrUrls: (string | null | undefined)[]): Promise<Record<string, string>> {
  const paths = [...new Set(pathsOrUrls.filter((p): p is string => !!p && !p.startsWith("http")))];
  if (paths.length === 0) return {};
  const { data, error } = await supabase.storage.from("employee-photos").createSignedUrls(paths, PHOTO_URL_TTL_SECONDS);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  data.forEach((item, i) => {
    if (item.signedUrl) map[paths[i]] = item.signedUrl;
  });
  return map;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [employeeTrainings, setEmployeeTrainings] = useState<EmployeeTraining[]>([]);

  // Coalescing für loadData (M-09, sichere Teil-Optimierung): Ohne das löste
  // jede Schreibaktion einen eigenen vollständigen Reload aller Kern-Tabellen
  // aus — bei mehreren Aktionen kurz hintereinander liefen die 9 Tabellen-
  // Abfragen mehrfach parallel („Reload-Sturm"). Jetzt wird höchstens EIN
  // Reload gleichzeitig ausgeführt, und höchstens EIN weiterer eingereiht
  // (der die neuesten Daten mitnimmt), statt N gestapelter Läufe.
  const loadChainRef = useRef<Promise<void>>(Promise.resolve());
  const loadQueuedRef = useRef<Promise<void> | null>(null);
  // Zählt jeden signOut() hoch (Audit-Fund "Redirect-Loops nach Logout",
  // 27.07.2026): ein beim Logout noch laufender runLoad() kam bisher trotzdem
  // noch zu Ende und schrieb die (zum Anfragezeitpunkt korrekt geladenen,
  // aber inzwischen veralteten) Daten zurück in den bereits geleerten State.
  const loadGenerationRef = useRef(0);

  const runLoad = useCallback(async () => {
    const generation = loadGenerationRef.current;
    setDataLoading(true);

    const [
      { data: companies, error: companiesError },
      { data: employeeRows, error: employeesError },
      { data: trainingRows, error: trainingsError },
      { data: bundleRows, error: bundlesError },
      { data: bundleTrainingRows, error: bundleTrainingsError },
      { data: categoryRows, error: categoriesError },
      { data: qualificationRows, error: qualificationsError },
      { data: questionRows, error: questionsError },
      { data: employeeTrainingRows, error: employeeTrainingsError },
    ] = await Promise.all([
      // .order(...) macht die (bisher implizite) Reihenfolge deterministisch
      // — Voraussetzung für spätere serverseitige Pagination und verhindert
      // zufällig springende Listen (M-09, sichere Teil-Optimierung).
      supabase.from("companies").select("*").limit(1),
      // [Audit-Fund SUPABASE & DATEN, 28.07.2026] select("*") lud bisher
      // unnötig invite_token (unbegrenzt gültiger Auth-Bypass-Code) und
      // invite_token in jede Mitarbeiterliste mit -- der wird jetzt nur noch
      // gezielt per fetchInviteToken() nachgeladen, wenn eine Detail-Ansicht
      // ihn wirklich braucht (Einladungslink anzeigen).
      // version = Zähler fürs Optimistic Locking (Migration 0064).
      supabase
        .from("employees")
        .select(
          "id, vorname, nachname, personalnummer, email, telefon, geburtsdatum, foto_url, kategorie, archiviert, ist_beauftragter, auth_user_id, version"
        )
        .order("created_at"),
      supabase.from("trainings").select("*").order("erstellt_am"),
      supabase.from("bundles").select("*").order("created_at"),
      supabase.from("bundle_trainings").select("*"),
      supabase.from("categories").select("*").order("created_at"),
      supabase.from("qualifications").select("*").order("created_at"),
      supabase.from("questions").select("*").order("created_at"),
      // [N-16] Nur "offen" (Dashboard-Ampel) + kürzlich signiert (Archiv-
      // "Neu"-Punkt) laden -- die volle Signier-Historie wächst mit jedem
      // Jahr unbegrenzt und wird nur noch gezielt nachgeladen, sobald das
      // Archiv für einen Mitarbeiter/eine Unterweisung geöffnet wird (s.
      // loadEmployeeArchive/loadTrainingArchive unten).
      // [Audit-Fund SUPABASE & DATEN, 28.07.2026] signatur_bild_url/
      // signatur_hash werden bewusst NICHT mehr im Bulk-Load mitgeladen --
      // beide werden nur in Einzel-Detail-Ansichten (ArchiveDocumentModal)
      // gebraucht, jetzt per fetchSignatureDetails() nachgeladen. `geraet`
      // bleibt im Bulk, weil exportCsv.ts darüber iteriert (CSV-Export aller
      // Nachweise).
      supabase
        .from("employee_trainings")
        .select(
          "id, employee_id, training_id, status, signiert_am, geraet, signiert_als, created_at, updated_at"
        )
        .or(`status.eq.offen,signiert_am.gte.${recentSignedCutoff()}`)
        .order("created_at"),
    ]);

    // [Audit-Fund SUPABASE & DATEN, 27.07.2026] Fehler wurden bisher nicht
    // geprüft -- ein Fehlschlag bei einer der 9 Tabellen wurde über "?? []"
    // stillschweigend zu einer leeren Liste statt sichtbar zu werden.
    const bulkLoadError =
      companiesError ?? employeesError ?? trainingsError ?? bundlesError ??
      bundleTrainingsError ?? categoriesError ?? qualificationsError ??
      questionsError ?? employeeTrainingsError;
    if (bulkLoadError) console.error("Laden der Firmendaten teilweise fehlgeschlagen:", bulkLoadError);

    const signedUrlMap = await resolveSignedUrls([
      companies?.[0]?.logo_url,
      ...(employeeRows ?? []).map((e) => e.foto_url),
    ]);
    function resolvePhoto(pathOrUrl: string | null | undefined): string | null {
      if (!pathOrUrl) return null;
      if (pathOrUrl.startsWith("http")) return pathOrUrl; // Rückfall für nicht migrierte Altdaten
      return signedUrlMap[pathOrUrl] ?? null;
    }

    const empTrainings = (employeeTrainingRows ?? []).map((et) =>
      mapEmployeeTraining(et, (trainingRows ?? []).find((t) => t.id === et.training_id)?.ablaufdatum ?? null)
    );

    const quals = (qualificationRows ?? []).map((q) => ({
      id: q.id,
      employeeId: q.employee_id,
      name: q.name,
      icon: qualIcon(q.name),
      ablaufdatum: formatDate(q.ablaufdatum),
      ablaufdatumIso: q.ablaufdatum ?? null,
      status: qualStatus(q.ablaufdatum),
      terminVereinbartAm: q.termin_vereinbart_am ?? null,
      naechsteErinnerungAm: q.naechste_erinnerung_am ?? null,
    }));

    const mappedEmployees: Employee[] = (employeeRows ?? []).map((e) => {
      const ownTrainings = empTrainings.filter((et) => et.employeeId === e.id);
      const offenePunkte = ownTrainings.filter((et) => et.status === "offen").length;
      const ownQualIcons = quals
        .filter((q) => q.employeeId === e.id)
        .map((q) => q.icon);
      return {
        id: e.id,
        vorname: e.vorname,
        nachname: e.nachname,
        personalnummer: e.personalnummer ?? "",
        email: e.email,
        telefon: e.telefon ?? null,
        geburtsdatum: e.geburtsdatum ?? null,
        fotoUrl: resolvePhoto(e.foto_url),
        kategorie: e.kategorie ?? "Sonstiges",
        archiviert: e.archiviert ?? false,
        minderjaehrig: istMinderjaehrig(e.geburtsdatum ?? null),
        ampel: offenePunkte > 0 ? "rot" : "gruen",
        offenePunkte,
        qualifikationsIcons: ownQualIcons,
        istBeauftragter: e.ist_beauftragter,
        // invite_token wird bewusst nicht mehr im Bulk-Load geladen (s.o.) --
        // Detail-Ansichten holen ihn per fetchInviteToken() nach.
        inviteToken: null,
        registriert: !!e.auth_user_id,
        version: e.version,
      };
    });

    const mappedTrainings: Training[] = (trainingRows ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      typ: t.typ === "hochgeladen" ? "hochgeladen" : "online",
      icon: t.icon ?? (t.typ === "hochgeladen" ? "📄" : "✍️"),
      inhalt: t.inhalt,
      pdfPath: t.pdf_path ?? null,
      erstelltAm: formatDate(t.erstellt_am),
      ablaufdatum: formatDate(t.ablaufdatum),
      status: trainingStatus(t.ablaufdatum),
      version: t.version,
    }));

    const mappedBundles: Bundle[] = (bundleRows ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon ?? "📦",
      trainingIds: (bundleTrainingRows ?? [])
        .filter((bt) => bt.bundle_id === b.id)
        .map((bt) => bt.training_id),
    }));

    const mappedCategories: Category[] = (categoryRows ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon ?? "📁",
    }));

    const mappedQuestions: Question[] = (questionRows ?? []).map((q) => ({
      id: q.id,
      employeeId: q.employee_id,
      trainingId: q.training_id,
      frage: q.frage,
      antwort: q.antwort,
      status: q.status,
      gestelltAm: formatDate(q.created_at),
    }));

    // Inzwischen abgemeldet, während diese Anfrage noch unterwegs war? Dann
    // nicht mehr in den (bereits geleerten) State zurückschreiben.
    if (loadGenerationRef.current !== generation) return;

    if (companies && companies[0]) {
      setCompany({
        id: companies[0].id,
        name: companies[0].name,
        address: companies[0].address,
        chefName: companies[0].chef_name,
        logoUrl: resolvePhoto(companies[0].logo_url),
        plan: companies[0].plan,
        billing: companies[0].billing,
        subscriptionStatus: companies[0].subscription_status,
        createdAt: companies[0].created_at,
        aufbewahrungsfristMonate: companies[0].aufbewahrungsfrist_monate,
      });
    }
    setEmployees(mappedEmployees);
    setTrainings(mappedTrainings);
    setBundles(mappedBundles);
    setCategories(mappedCategories);
    setQualifications(quals);
    setQuestions(mappedQuestions);
    setEmployeeTrainings(empTrainings);
    setDataLoading(false);
  }, []);

  const loadData = useCallback((): Promise<void> => {
    // Bereits ein Reload eingereiht, der noch nicht gestartet ist? -> denselben
    // wiederverwenden; er wird ohnehin die neuesten Daten laden.
    if (loadQueuedRef.current) return loadQueuedRef.current;
    const queued = loadChainRef.current.then(async () => {
      loadQueuedRef.current = null; // ab hier läuft dieser Reload -> neue Aufrufe brauchen einen frischen
      await runLoad();
    });
    loadChainRef.current = queued.catch(() => {}); // Kette bei Fehler nicht abreißen lassen
    loadQueuedRef.current = queued;
    return queued;
  }, [runLoad]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
      if (session) loadData();
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadData();
    });

    return () => listener.subscription.unsubscribe();
  }, [loadData]);

  const { showToast, ToastView } = useToast();

  // Automatische Abmeldung nach Inaktivität (M-15, Runde-3-Audit): eine
  // einmal angemeldete Chef-Session blieb bisher unbegrenzt aktiv. Auf einem
  // gemeinsam genutzten/unbeaufsichtigten Rechner konnte so jeder spätere
  // Nutzer ohne erneute Anmeldung auf alle Personendaten zugreifen. Nach
  // 30 Minuten ohne Interaktion wird jetzt automatisch abgemeldet.
  const IDLE_LOGOUT_MS = 30 * 60 * 1000;
  const signOutRef = useRef<() => void>(() => {});
  useEffect(() => {
    signOutRef.current = signOut;
  });
  useEffect(() => {
    if (!session) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => signOutRef.current(), IDLE_LOGOUT_MS);
    };
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Immer aktuelle Listen für den Realtime-Handler unten (ohne dass die
  // Subscription bei jeder Datenänderung neu aufgebaut werden muss).
  const employeesRef = useRef(employees);
  useEffect(() => {
    employeesRef.current = employees;
  }, [employees]);
  const trainingsRef = useRef(trainings);
  useEffect(() => {
    trainingsRef.current = trainings;
  }, [trainings]);

  // Live-Meldung, sobald ein Mitarbeiter eine neue Rückfrage stellt (nicht
  // nur der Zähler im Menü, sondern eine sichtbare Kurzmeldung).
  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel("questions-inserts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "questions" },
        (payload) => {
          const row = payload.new as {
            id: string;
            employee_id: string;
            training_id: string;
            frage: string;
            antwort: string | null;
            status: "offen" | "beantwortet";
            created_at: string;
          };
          setQuestions((prev) =>
            prev.some((q) => q.id === row.id)
              ? prev
              : [
                  ...prev,
                  {
                    id: row.id,
                    employeeId: row.employee_id,
                    trainingId: row.training_id,
                    frage: row.frage,
                    antwort: row.antwort,
                    status: row.status,
                    gestelltAm: formatDate(row.created_at),
                  },
                ]
          );
          const emp = employeesRef.current.find((e) => e.id === row.employee_id);
          const training = trainingsRef.current.find((t) => t.id === row.training_id);
          showToast(
            `💬 Neue Rückfrage${emp ? ` von ${emp.vorname} ${emp.nachname}` : ""}${
              training ? ` zu „${training.name}"` : ""
            }`
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  // [Fix-Cluster 6, Punkt 11] Live-Update, sobald ein Mitarbeiter signiert —
  // vorher sah der Chef eine neue Signatur erst nach manuellem Neuladen
  // (loadData lief bisher nur einmal beim Mounten). Nur die Felder patchen,
  // die der Bulk-Load ohnehin lädt — signaturBildUrl/signaturHash bleiben
  // wie gehabt Lazy-Load über fetchSignatureDetails().
  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel("employee-trainings-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "employee_trainings" },
        (payload) => {
          const row = payload.new as {
            id: string;
            employee_id: string;
            training_id: string;
            status: "offen" | "signiert" | "abgelehnt" | "anonymisiert";
            signiert_am: string | null;
            geraet: string | null;
            signiert_als: string | null;
          };
          setEmployeeTrainings((prev) => {
            const bestehend = prev.find((et) => et.id === row.id);
            // ablaufdatumIso kommt normalerweise aus den rohen trainingRows
            // (s. mapEmployeeTraining oben) -- hier nicht griffbereit, aber
            // die Zuweisung existiert bereits VOR dem Signieren, also bleibt
            // der bereits geladene Wert einfach erhalten statt neu geholt.
            const gepatcht: EmployeeTraining = {
              id: row.id,
              employeeId: row.employee_id,
              trainingId: row.training_id,
              status: row.status,
              signiertAm: row.signiert_am ? formatDate(row.signiert_am) : null,
              signaturBildUrl: bestehend?.signaturBildUrl ?? null,
              geraet: row.geraet ?? null,
              signaturHash: bestehend?.signaturHash ?? null,
              signiertAls: row.signiert_als ?? null,
              ablaufdatumIso: bestehend?.ablaufdatumIso ?? null,
            };
            return bestehend
              ? prev.map((et) => (et.id === row.id ? gepatcht : et))
              : [...prev, gepatcht];
          });
          if (row.status === "signiert") {
            const emp = employeesRef.current.find((e) => e.id === row.employee_id);
            const training = trainingsRef.current.find((t) => t.id === row.training_id);
            showToast(
              `✍️ Neue Signatur${emp ? ` von ${emp.vorname} ${emp.nachname}` : ""}${
                training ? ` zu „${training.name}"` : ""
              }`
            );
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  // Eine E-Mail darf nur einmal vergeben werden (siehe Migration 0038).
  // Vorab-Prüfung gegen die geladene Liste liefert eine verständliche
  // Meldung; der Unique-Index in der Datenbank fängt den Rest ab.
  function assertEmailFrei(email: string | null, ignoreId?: string) {
    if (!email) return;
    if (!istGueltigeEmail(email)) throw new Error("email_invalid");
    const lower = email.toLowerCase();
    const taken = employees.some(
      (e) => e.id !== ignoreId && e.email?.toLowerCase() === lower
    );
    if (taken) throw new Error("email_taken");
  }

  async function addEmployee(input: NewEmployeeInput): Promise<Employee> {
    if (!company) throw new Error("Keine Firma geladen");
    assertEmailFrei(input.email);
    assertMaxLen(input.telefon, 40, "Telefonnummer");
    assertGueltigesDatum(input.geburtsdatum, "Geburtsdatum");
    // ist_beauftragter wird bewusst NICHT mit angelegt — ein Datenbank-Trigger
    // erzwingt ohnehin "false" bei jedem normalen Insert (siehe Migration
    // 0014_employee_role_protection.sql). Die Rolle wird danach separat über
    // die abgesicherte set_beauftragter()-RPC gesetzt, nie direkt vom Client.
    const { data, error } = await supabase
      .from("employees")
      .insert({
        company_id: company.id,
        vorname: input.vorname.trim(),
        nachname: input.nachname.trim(),
        personalnummer: input.personalnummer.trim(),
        email: input.email,
        telefon: input.telefon,
        geburtsdatum: input.geburtsdatum,
        kategorie: input.kategorie,
      })
      .select()
      .single();
    throwIfError(error);
    if (input.istBeauftragter) {
      const { error: roleError } = await supabase.rpc("set_beauftragter", {
        p_employee_id: data.id,
        p_value: true,
      });
      throwIfError(roleError);
    }
    await loadData();
    return {
      id: data.id,
      vorname: data.vorname,
      nachname: data.nachname,
      personalnummer: data.personalnummer ?? "",
      email: data.email,
      telefon: data.telefon ?? null,
      geburtsdatum: data.geburtsdatum ?? null,
      fotoUrl: data.foto_url ?? null,
      kategorie: data.kategorie ?? "Sonstiges",
      archiviert: false,
      minderjaehrig: istMinderjaehrig(data.geburtsdatum ?? null),
      ampel: "gruen",
      offenePunkte: 0,
      qualifikationsIcons: [],
      // data.ist_beauftragter ist direkt nach dem Insert immer false (Trigger).
      // Der tatsächliche Endzustand ist input.istBeauftragter, weil die
      // set_beauftragter()-RPC oben bereits gelaufen ist, bevor wir hier ankommen.
      istBeauftragter: input.istBeauftragter,
      inviteToken: data.invite_token ?? null,
      registriert: false,
      version: data.version,
    };
  }

  async function addTraining(input: NewTrainingInput): Promise<Training> {
    if (!company) throw new Error("Keine Firma geladen");
    const { data, error } = await supabase
      .from("trainings")
      .insert({
        company_id: company.id,
        name: input.name,
        typ: input.typ,
        icon: input.icon,
        inhalt: input.inhalt,
        ablaufdatum: input.ablaufdatum === "—" ? null : input.ablaufdatum,
      })
      .select()
      .single();
    throwIfError(error);
    // [Audit-Fund OFFLINE & SYNC, 28.07.2026] Bundle-Verknüpfung und PDF-
    // Upload laufen NACH dem bereits committeten Insert -- bei einem Fehler
    // dazwischen blieb bisher ein Training ohne PDF/Bundle in der DB liegen.
    // Fix: Kompensations-Löschung des gerade erst angelegten Trainings bei
    // Fehlschlag, statt einen inkonsistenten Zwischenzustand zu hinterlassen.
    let pdfPath: string | null = null;
    try {
      if (input.bundleId && data) {
        const { error: bundleError } = await supabase
          .from("bundle_trainings")
          .insert({ bundle_id: input.bundleId, training_id: data.id });
        throwIfError(bundleError);
      }

      // Die echte PDF hochladen (statt sie zu verwerfen und nur den von Hand
      // eingetippten Text zu behalten). Pfad-Präfix "<company_id>/..." wie bei
      // employee-photos, damit die Storage-Regeln greifen. pdf_path speichert
      // nur den PFAD (Bucket ist privat) — die anzeigende Stelle erzeugt beim
      // Öffnen eine zeitlich begrenzte signierte URL.
      if (input.pdfFile && data) {
        pdfPath = `${company.id}/training-${data.id}.pdf`;
        const { error: uploadErr } = await supabase.storage
          .from("training-documents")
          .upload(pdfPath, input.pdfFile, { upsert: true, contentType: "application/pdf" });
        if (uploadErr) throw uploadErr;
        const { error: pdfPathError } = await supabase
          .from("trainings")
          .update({ pdf_path: pdfPath })
          .eq("id", data.id);
        throwIfError(pdfPathError);
      }
    } catch (err) {
      await supabase.from("trainings").delete().eq("id", data.id);
      throw err;
    }

    // [Migration 0068] Text aus der PDF ziehen, damit die Mitarbeiter-App die
    // Unterweisung vorlesen kann. Läuft serverseitig (pdf-parse ist eine
    // Node-Bibliothek und kann im Browser nicht laufen).
    //
    // BEWUSST AUSSERHALB des try/catch oben: Ein Fehlschlag hier darf die
    // gerade angelegte Unterweisung NICHT wieder löschen. Ohne Text ist die
    // Unterweisung vollständig nutzbar, nur das Vorlesen bleibt inaktiv --
    // das ist ein akzeptabler Zustand, ein verlorenes Training nicht.
    if (pdfPath) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetch("/api/pdf-text", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ trainingId: data.id }),
          });
        }
      } catch (err) {
        // Nur protokollieren -- der Nutzer soll für eine nicht vorlesbare PDF
        // keine Fehlermeldung sehen. Die App zeigt dann die ehrliche
        // "kein Text"-Meldung, was der korrekte Zustand ist.
        console.error("[pdf-text] Aufruf der Textextraktion fehlgeschlagen", err);
      }
    }

    await loadData();
    return {
      id: data.id,
      name: data.name,
      typ: data.typ === "hochgeladen" ? "hochgeladen" : "online",
      icon: data.icon ?? (data.typ === "hochgeladen" ? "📄" : "✍️"),
      inhalt: data.inhalt,
      pdfPath,
      erstelltAm: formatDate(data.erstellt_am),
      ablaufdatum: formatDate(data.ablaufdatum),
      status: trainingStatus(data.ablaufdatum),
      version: data.version,
    };
  }

  async function updateEmployee(
    id: string,
    input: {
      vorname: string;
      nachname: string;
      personalnummer: string;
      email: string | null;
      telefon: string | null;
      geburtsdatum: string | null;
      kategorie: string;
      istBeauftragter: boolean;
    }
  ) {
    assertEmailFrei(input.email, id);
    assertMaxLen(input.telefon, 40, "Telefonnummer");
    assertGueltigesDatum(input.geburtsdatum, "Geburtsdatum");
    const current = employees.find((e) => e.id === id);
    // ist_beauftragter bewusst getrennt von den übrigen Feldern: der
    // Schutz-Trigger blockt Rollenänderungen über ein normales UPDATE (siehe
    // Migration 0014), Rollenwechsel läuft ausschließlich über set_beauftragter().
    // .select().single() ist hier bewusst nicht nur Stil -- ohne .select()
    // meldet ein durch RLS blockiertes UPDATE (0 betroffene Zeilen) fälschlich
    // Erfolg (error: null), weil PostgREST ohne Rückgabe-Anforderung keine
    // Zeilenzahl prüft. .single() erzwingt einen Fehler, wenn nicht genau
    // eine Zeile geändert wurde (Runde-2-Audit, H-03).
    // Zusätzlich .eq("version", ...) als optimistic locking: wurde der
    // Datensatz zwischenzeitlich von jemand anderem geändert (Chef-Web +
    // Chef-App gleichzeitig offen), stimmt der Zähler nicht mehr überein ->
    // 0 Zeilen betroffen -> .single() wirft, statt die fremde Änderung
    // stillschweigend zu überschreiben. Bewusst NICHT updated_at (s. types.ts).
    let query = supabase
      .from("employees")
      .update({
        vorname: input.vorname.trim(),
        nachname: input.nachname.trim(),
        personalnummer: input.personalnummer.trim(),
        email: input.email,
        telefon: input.telefon,
        geburtsdatum: input.geburtsdatum,
        kategorie: input.kategorie,
      })
      .eq("id", id);
    if (current?.version != null) query = query.eq("version", current.version);
    const { error } = await query.select().single();
    if (error && current?.version != null && (error as { code?: string }).code === "PGRST116") {
      throw new Error(
        "Dieser Mitarbeiter wurde inzwischen von jemand anderem geändert. Bitte neu laden und erneut versuchen."
      );
    }
    throwIfError(error);

    if (current && current.istBeauftragter !== input.istBeauftragter) {
      const { error: roleError } = await supabase.rpc("set_beauftragter", {
        p_employee_id: id,
        p_value: input.istBeauftragter,
      });
      throwIfError(roleError);
    }
    await loadData();
  }

  async function uploadEmployeePhoto(employeeId: string, file: File) {
    if (!company) throw new Error("Keine Firma geladen");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    // Pfad-Präfix mit der eigenen Firma — die Storage-Policies (Migration
    // 0019) erlauben Schreiben/Löschen nur noch innerhalb des eigenen Ordners.
    const path = `${company.id}/${employeeId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("employee-photos")
      .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (upErr) throw upErr;
    // Bucket ist privat (Migration 0020) — nur den Pfad speichern, die
    // Anzeige erzeugt beim Laden eine zeitlich begrenzte signierte URL.
    const { error } = await supabase
      .from("employees")
      .update({ foto_url: path })
      .eq("id", employeeId);
    throwIfError(error);
    await loadData();
  }

  async function updateTraining(
    id: string,
    input: { name: string; icon: string; inhalt: string | null; ablaufdatum: string | null }
  ) {
    // [Audit-Fund OFFLINE & SYNC, 28.07.2026] Ohne .select().single() meldet
    // ein durch RLS blockiertes/0-Zeilen-UPDATE fälschlich Erfolg (error: null)
    // -- gleiches Muster wie der bereits gefixte H-03-Fall bei updateEmployee.
    // Zusätzlich .eq("version", ...) als optimistic locking gegen
    // gleichzeitige Bearbeitung derselben Vorlage durch zwei Chefs.
    const current = trainings.find((t) => t.id === id);
    let query = supabase
      .from("trainings")
      .update({
        name: input.name,
        icon: input.icon,
        inhalt: input.inhalt,
        ablaufdatum: input.ablaufdatum,
      })
      .eq("id", id);
    if (current?.version != null) query = query.eq("version", current.version);
    const { error } = await query.select().single();
    if (error && current?.version != null && (error as { code?: string }).code === "PGRST116") {
      throw new Error(
        "Diese Unterweisung wurde inzwischen von jemand anderem geändert. Bitte neu laden und erneut versuchen."
      );
    }
    throwIfError(error);
    await loadData();
  }

  async function addBundle(input: NewBundleInput) {
    if (!company) throw new Error("Keine Firma geladen");
    assertMaxLen(input.name, 120, "Bundle-Name");
    assertMaxLen(input.icon, 10, "Bundle-Icon");
    const { data, error } = await supabase
      .from("bundles")
      .insert({ company_id: company.id, name: input.name.trim(), icon: input.icon })
      .select()
      .single();
    throwIfError(error);
    if (input.trainingIds.length > 0 && data) {
      const { error: bundleTrainingsError } = await supabase
        .from("bundle_trainings")
        .insert(input.trainingIds.map((trainingId) => ({ bundle_id: data.id, training_id: trainingId })));
      throwIfError(bundleTrainingsError);
    }
    await loadData();
    return { id: data.id as string };
  }

  async function deleteEmployee(id: string) {
    // Löschkonzept (DSGVO Art. 17): "Endgültig löschen" soll wirklich alles
    // entfernen. Der Datenbank-Eintrag verschwindet zwar über die Foreign-Key-
    // Kaskaden (Unterweisungen, Qualifikationen, Fragen), das Foto im Storage
    // war davon aber nie erfasst und blieb bisher für immer liegen.
    if (company) {
      const { data: files, error: listError } = await supabase.storage.from("employee-photos").list(company.id);
      if (listError) {
        // Löschung des DB-Datensatzes NICHT davon abhängig machen (die
        // Foto-Referenz ist längst über foto_url erfasst) -- aber sichtbar
        // machen, dass die DSGVO-Foto-Löschung evtl. unvollständig war,
        // statt es lautlos zu verschlucken.
        console.error("Foto-Storage-Listing für Löschung fehlgeschlagen:", listError);
      }
      const ownFiles = (files ?? []).filter((f) => f.name.startsWith(`${id}-`)).map((f) => `${company.id}/${f.name}`);
      if (ownFiles.length > 0) {
        const { error: removeError } = await supabase.storage.from("employee-photos").remove(ownFiles);
        if (removeError) console.error("Foto-Löschung beim Endgültig-Löschen fehlgeschlagen:", removeError);
      }
    }
    const { error } = await supabase.from("employees").delete().eq("id", id);
    throwIfError(error);
    await loadData();
  }

  async function deleteTraining(id: string) {
    const { error } = await supabase.from("trainings").delete().eq("id", id);
    throwIfError(error);
    await loadData();
  }

  async function deleteBundle(id: string) {
    const { error } = await supabase.from("bundles").delete().eq("id", id);
    throwIfError(error);
    await loadData();
  }

  async function updateBundle(
    id: string,
    input: { name: string; icon: string; trainingIds: string[] }
  ) {
    assertMaxLen(input.name, 120, "Bundle-Name");
    assertMaxLen(input.icon, 10, "Bundle-Icon");
    const { error } = await supabase
      .from("bundles")
      .update({ name: input.name.trim(), icon: input.icon })
      .eq("id", id);
    throwIfError(error);

    const { error: deleteError } = await supabase
      .from("bundle_trainings")
      .delete()
      .eq("bundle_id", id);
    throwIfError(deleteError);

    if (input.trainingIds.length > 0) {
      const { error: insertError } = await supabase
        .from("bundle_trainings")
        .insert(input.trainingIds.map((trainingId) => ({ bundle_id: id, training_id: trainingId })));
      throwIfError(insertError);
    }
    await loadData();
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    throwIfError(error);
    await loadData();
  }

  async function addCategory(input: { name: string; icon: string }) {
    if (!company) return;
    const { error } = await supabase
      .from("categories")
      .insert({ company_id: company.id, name: input.name, icon: input.icon });
    throwIfError(error);
    await loadData();
  }

  async function updateCategory(id: string, input: { name: string; icon: string }) {
    const { error } = await supabase
      .from("categories")
      .update({ name: input.name, icon: input.icon })
      .eq("id", id);
    throwIfError(error);
    await loadData();
  }

  // Archivieren statt löschen (gekündigte MA bleiben erhalten) bzw. wiederherstellen
  async function setEmployeeArchived(id: string, archiviert: boolean) {
    const { error } = await supabase.from("employees").update({ archiviert }).eq("id", id);
    throwIfError(error);
    await loadData();
  }

  // Einen Mitarbeiter einer Kategorie zuordnen (oder mit "" abwählen)
  async function setEmployeeCategory(employeeId: string, kategorie: string) {
    const { error } = await supabase.from("employees").update({ kategorie }).eq("id", employeeId);
    throwIfError(error);
    await loadData();
  }

  async function addQualification(input: {
    employeeId: string;
    name: string;
    ablaufdatum: string | null;
  }) {
    assertMaxLen(input.name, 120, "Qualifikations-Name");
    assertGueltigesDatum(input.ablaufdatum, "Ablaufdatum");
    const { error } = await supabase.from("qualifications").insert({
      employee_id: input.employeeId,
      name: input.name.trim(),
      ablaufdatum: input.ablaufdatum,
      status: "gueltig",
    });
    throwIfError(error);
    await loadData();
  }

  // Qualifikationen ließen sich im Web bisher nur anlegen, nicht bearbeiten
  // oder löschen -- die Chef-App konnte beides schon (Runde-1/2-Audit, M-08).
  async function updateQualification(
    id: string,
    input: { name: string; ablaufdatum: string | null }
  ) {
    assertMaxLen(input.name, 120, "Qualifikations-Name");
    assertGueltigesDatum(input.ablaufdatum, "Ablaufdatum");
    const { error } = await supabase
      .from("qualifications")
      .update({ name: input.name.trim(), ablaufdatum: input.ablaufdatum })
      .eq("id", id)
      .select()
      .single();
    throwIfError(error);
    await loadData();
  }

  async function deleteQualification(id: string) {
    const { error } = await supabase.from("qualifications").delete().eq("id", id);
    throwIfError(error);
    await loadData();
  }

  // [Erinnerungs-Flow] "Termin bereits vereinbart" -- Erinnerung ruht bis
  // zum Ablaufdatum. Enges RPC statt direktem Update (normale RLS erlaubt
  // nur Beauftragten Schreibzugriff, s. Migration 0061).
  async function qualifikationTerminVereinbart(id: string) {
    const { error } = await supabase.rpc("qualifikation_termin_vereinbart", { p_id: id });
    throwIfError(error);
    await loadData();
  }

  // "Nochmal erinnern" -- Erinnerung ruht 7 Tage.
  async function qualifikationNochmalErinnern(id: string) {
    const { error } = await supabase.rpc("qualifikation_nochmal_erinnern", { p_id: id });
    throwIfError(error);
    await loadData();
  }

  async function assignTraining(trainingId: string, employeeIds: string[]) {
    if (employeeIds.length === 0) return;
    const { error } = await supabase.from("employee_trainings").insert(
      employeeIds.map((employeeId) => ({
        employee_id: employeeId,
        training_id: trainingId,
        status: "offen",
      }))
    );
    throwIfError(error);
    await loadData();
    const trainingName = trainings.find((t) => t.id === trainingId)?.name ?? "eine Unterweisung";
    if (session) {
      notifyPush(session.access_token, employeeIds, "Neue Unterweisung", `Dir wurde „${trainingName}" zugewiesen.`);
    }
  }

  // Verteilt ALLE Unterweisungen eines Bundles an die gewählten Mitarbeiter --
  // im Web gab es dafür bisher gar keine Funktion, Bundles ließen sich zwar
  // anlegen, aber nicht verschicken (Runde-1-Audit, P1-03). Bereits
  // zugewiesene Kombinationen (Mitarbeiter + Unterweisung) werden
  // übersprungen, damit keine doppelten Zeilen entstehen.
  async function assignBundle(trainingIds: string[], employeeIds: string[]) {
    if (trainingIds.length === 0 || employeeIds.length === 0) return;
    const rows: { employee_id: string; training_id: string; status: "offen" }[] = [];
    for (const trainingId of trainingIds) {
      const already = new Set(
        employeeTrainings.filter((et) => et.trainingId === trainingId).map((et) => et.employeeId)
      );
      for (const employeeId of employeeIds) {
        if (!already.has(employeeId)) rows.push({ employee_id: employeeId, training_id: trainingId, status: "offen" });
      }
    }
    if (rows.length === 0) return;
    const { error } = await supabase.from("employee_trainings").insert(rows);
    throwIfError(error);
    await loadData();
    if (session) {
      notifyPush(session.access_token, employeeIds, "Neue Unterweisungen", "Dir wurden neue Unterweisungen zugewiesen.");
    }
  }

  // Widerruft einen ausgegebenen Einladungscode und erzeugt einen neuen --
  // z.B. wenn der alte versehentlich weitergegeben wurde (Runde-2/3-Audit,
  // M-01: invite_token war bisher unbegrenzt gültig ohne Widerrufsmöglichkeit).
  async function regenerateInviteToken(employeeId: string) {
    const { data, error } = await supabase.rpc("regenerate_invite_token", {
      p_employee_id: employeeId,
    });
    throwIfError(error);
    await loadData();
    return data as string;
  }

  // Zieht eine versehentlich verteilte Unterweisung zurück: löscht alle noch
  // OFFENEN Zuweisungen dieser Vorlage. Bereits signierte Nachweise bleiben
  // unangetastet (die Delete-Policy aus Migration 0039 erlaubt ohnehin nur
  // status = 'offen').
  // [Audit-Fund OFFLINE & SYNC, 28.07.2026] Gibt jetzt die Zahl der
  // tatsächlich zurückgezogenen Zuweisungen zurück (vorher stiller Erfolg
  // auch bei 0 betroffenen Zeilen, z.B. wenn der Mitarbeiter zeitgleich
  // signiert hat).
  async function withdrawTraining(trainingId: string): Promise<number> {
    const { data, error } = await supabase
      .from("employee_trainings")
      .delete()
      .eq("training_id", trainingId)
      .eq("status", "offen")
      .select("id");
    throwIfError(error);
    await loadData();
    return data?.length ?? 0;
  }

  async function uploadCompanyLogo(file: File) {
    if (!company) return;
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    // Muss im eigenen Firmen-Ordner liegen (Migration 0019 prüft den
    // Pfad-Präfix), sonst lehnt die Storage-Policy den Upload ab.
    const path = `${company.id}/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("employee-photos")
      .upload(path, file, { upsert: true, contentType: file.type || "image/png" });
    if (upErr) throw upErr;
    // Bucket ist privat (Migration 0020) — nur den Pfad speichern.
    const { error } = await supabase.from("companies").update({ logo_url: path }).eq("id", company.id);
    throwIfError(error);
    await loadData();
  }

  async function updateCompany(input: { name: string; address: string; chefName: string }) {
    if (!company) return;
    assertMaxLen(input.name, 200, "Firmenname");
    assertMaxLen(input.address, 300, "Adresse");
    assertMaxLen(input.chefName, 120, "Name des Chefs");
    const { error } = await supabase
      .from("companies")
      .update({ name: input.name.trim(), address: input.address.trim(), chef_name: input.chefName.trim() })
      .eq("id", company.id);
    throwIfError(error);
    await loadData();
  }

  // [M-17] monate = null -> nie automatisch anonymisieren (Standard).
  // [Audit-Fund SUPABASE & DATEN, 28.07.2026] invite_token wird nicht mehr im
  // Bulk-Load mitgeladen (s.o.) -- Detail-Seiten, die den Einladungslink
  // anzeigen wollen, holen ihn jetzt gezielt per ID.
  async function fetchInviteToken(employeeId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from("employees")
      .select("invite_token")
      .eq("id", employeeId)
      .single();
    throwIfError(error);
    return data?.invite_token ?? null;
  }

  // Signatur-Bilddaten/-Siegel werden nicht mehr im Bulk-Load mitgeladen (s.o.
  // employee_trainings-Query) -- Archiv-Detail-Ansichten holen sie gezielt
  // nach, sobald ein einzelner Nachweis geöffnet wird.
  async function fetchSignatureDetails(
    employeeTrainingId: string
  ): Promise<{ signaturBildUrl: string | null; signaturHash: string | null }> {
    const { data, error } = await supabase
      .from("employee_trainings")
      .select("signatur_bild_url, signatur_hash")
      .eq("id", employeeTrainingId)
      .single();
    throwIfError(error);
    return {
      signaturBildUrl: data?.signatur_bild_url ?? null,
      signaturHash: data?.signatur_hash ?? null,
    };
  }

  // [Nachtrag] Läuft jetzt über die RPC set_aufbewahrungsfrist (Migration
  // 0065, noch nicht eingespielt) statt eines direkten UPDATEs -- die RPC
  // erzwingt dieselbe Grenze nochmal serverseitig UND protokolliert Zeitpunkt
  // (Server-Uhr) sowie handelnden Mitarbeiter (Auth-Kontext), keins von
  // beidem vom Client behauptet.
  async function updateAufbewahrungsfrist(monate: number | null) {
    if (!company) return;
    assertGueltigeAufbewahrungsfrist(monate);
    const { error } = await supabase.rpc("set_aufbewahrungsfrist", { p_monate: monate });
    throwIfError(error);
    await loadData();
  }

  async function answerQuestion(id: string, antwort: string) {
    const { error } = await supabase
      .from("questions")
      .update({ antwort, status: "beantwortet" })
      .eq("id", id);
    throwIfError(error);
    await loadData();
    const employeeId = questions.find((q) => q.id === id)?.employeeId;
    if (session && employeeId) {
      notifyPush(session.access_token, [employeeId], "Antwort auf deine Rückfrage", antwort);
    }
  }

  // [N-16] Volle Signier-Historie eines einzelnen Mitarbeiters gezielt
  // nachladen -- nicht Teil des Bulk-Loads, da dieser jetzt nur "offen" +
  // kürzlich signiert enthält (s. runLoad oben). Wird von der Archiv-Seite
  // erst aufgerufen, wenn ein Mitarbeiter tatsächlich geöffnet wird.
  // [Audit-Fund SUPABASE & DATEN, 28.07.2026] Auch die Archiv-Listen luden
  // bisher signatur_bild_url/signatur_hash für JEDE Zeile mit, obwohl die
  // Archiv-Liste selbst nur Metadaten anzeigt -- das Signaturbild/-Siegel
  // wird erst gebraucht, wenn ein einzelner Nachweis geöffnet wird
  // (ArchiveDocumentModal holt es dann per fetchSignatureDetails()).
  const ARCHIVE_LIST_COLUMNS =
    "id, employee_id, training_id, status, signiert_am, geraet, signiert_als, created_at, updated_at, trainings(ablaufdatum)";

  async function loadEmployeeArchive(employeeId: string): Promise<EmployeeTraining[]> {
    const { data, error } = await supabase
      .from("employee_trainings")
      .select(ARCHIVE_LIST_COLUMNS)
      .eq("employee_id", employeeId)
      .order("created_at");
    throwIfError(error);
    return (data ?? []).map((et: any) => mapEmployeeTraining(et, et.trainings?.ablaufdatum ?? null));
  }

  // [N-16] Analog für den Modus "Nach Unterweisung": alle signierten Nachweise
  // einer Vorlage, über alle Mitarbeiter und Jahre hinweg.
  async function loadTrainingArchive(trainingId: string): Promise<EmployeeTraining[]> {
    const { data, error } = await supabase
      .from("employee_trainings")
      .select(ARCHIVE_LIST_COLUMNS)
      .eq("training_id", trainingId)
      .eq("status", "signiert")
      .order("created_at");
    throwIfError(error);
    return (data ?? []).map((et: any) => mapEmployeeTraining(et, et.trainings?.ablaufdatum ?? null));
  }

  async function signOut() {
    // Erst hochzählen, damit ein noch laufender runLoad() (gestartet vor
    // diesem Logout) seine Ergebnisse hinterher erkennbar verwirft, statt sie
    // in den gleich geleerten State zurückzuschreiben.
    loadGenerationRef.current += 1;
    loadChainRef.current = Promise.resolve();
    loadQueuedRef.current = null;
    await supabase.auth.signOut();
    setCompany(null);
    setEmployees([]);
    setTrainings([]);
    setBundles([]);
    setCategories([]);
    setQualifications([]);
    setQuestions([]);
    setEmployeeTrainings([]);
  }

  return (
    <AppDataContext.Provider
      value={{
        loading: sessionLoading,
        session,
        company,
        employees,
        trainings,
        bundles,
        categories,
        qualifications,
        questions,
        employeeTrainings,
        addEmployee,
        addTraining,
        addBundle,
        addCategory,
        updateCategory,
        setEmployeeCategory,
        updateBundle,
        addQualification,
        updateQualification,
        deleteQualification,
        qualifikationTerminVereinbart,
        qualifikationNochmalErinnern,
        assignTraining,
        assignBundle,
        regenerateInviteToken,
        withdrawTraining,
        updateEmployee,
        updateTraining,
        deleteEmployee,
        setEmployeeArchived,
        uploadEmployeePhoto,
        deleteTraining,
        deleteBundle,
        deleteCategory,
        updateCompany,
        updateAufbewahrungsfrist,
        answerQuestion,
        uploadCompanyLogo,
        loadEmployeeArchive,
        loadTrainingArchive,
        fetchInviteToken,
        fetchSignatureDetails,
        reload: loadData,
        signOut,
      }}
    >
      {children}
      <ToastView />
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
