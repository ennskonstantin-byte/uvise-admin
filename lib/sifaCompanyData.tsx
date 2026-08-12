"use client";

// SiFa-Mehrfirmen-Anbindung (Web-Port von Phase 5/App, Migration 0078).
// Eine SiFa kann mehrere Firmen freigegeben bekommen -- lib/store.tsx ist
// strukturell auf "ein User = eine Firma via RLS" ausgelegt (.limit(1) auf
// companies, keine der Kern-Queries filtert explizit nach company_id) und
// wird deshalb NICHT angefasst (Regressionsrisiko für den produktiven
// Chef-Pfad). Stattdessen: derselbe AppDataContext (aus lib/store.tsx
// exportiert) wird hier lokal mit firmen-gescopten Daten überschrieben --
// jede bestehende Seite/jedes Modal, das useAppData() aufruft, funktioniert
// dadurch unverändert auch unter <SifaCompanyDataProvider companyId={...}>,
// ohne selbst angefasst zu werden.
//
// Bewusste Sicherheits-Grenze (wie im RN-Vorbild
// chef/lib/useSifaCompanyData.ts): updateAufbewahrungsfrist/updateCompany/
// uploadCompanyLogo bleiben No-ops -- SiFa bekommt nie Zugriff auf
// Firmenprofil-Änderungen, unabhängig davon, ob eine SiFa-Seite sie je
// aufruft (sie werden aktuell nur von der Chef-Einstellungen-Seite
// aufgerufen, die SiFa-Seiten haben keine Einstellungen-Route).
import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  AppDataContext,
  throwIfError,
  istGueltigeEmail,
  type AppDataContextValue,
} from "@/lib/store";

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

function assertMaxLen(value: string | null | undefined, max: number, feldname: string) {
  if (value && value.trim().length > max) {
    throw new Error(`${feldname} darf höchstens ${max} Zeichen lang sein.`);
  }
}

function assertGueltigesDatum(value: string | null | undefined, feldname: string) {
  if (!value) return;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${feldname} ist kein gültiges Datum.`);
  }
}

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

export function SifaCompanyDataProvider({
  companyId,
  children,
}: {
  companyId: string;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [company, setCompany] = useState<AppDataContextValue["company"]>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [employeeTrainings, setEmployeeTrainings] = useState<EmployeeTraining[]>([]);

  const loadChainRef = useRef<Promise<void>>(Promise.resolve());
  const loadQueuedRef = useRef<Promise<void> | null>(null);
  const loadGenerationRef = useRef(0);

  const runLoad = useCallback(async () => {
    if (!companyId) return;
    const generation = loadGenerationRef.current;

    // Stufe 1: Tabellen mit direkter company_id-Spalte (bzw. id für
    // companies selbst) -- parallel, exakt nach dem Muster von
    // chef/lib/useSifaCompanyData.ts:120-138 im App-Repo.
    const [
      { data: companies, error: companiesError },
      { data: employeeRows, error: employeesError },
      { data: trainingRows, error: trainingsError },
      { data: bundleRows, error: bundlesError },
      { data: categoryRows, error: categoriesError },
    ] = await Promise.all([
      supabase.from("companies").select("*").eq("id", companyId).limit(1),
      supabase
        .from("employees")
        .select(
          "id, vorname, nachname, personalnummer, email, telefon, geburtsdatum, foto_url, kategorie, archiviert, ist_beauftragter, auth_user_id, version"
        )
        .eq("company_id", companyId)
        .order("created_at"),
      supabase.from("trainings").select("*").eq("company_id", companyId).order("erstellt_am"),
      supabase.from("bundles").select("*").eq("company_id", companyId).order("created_at"),
      supabase.from("categories").select("*").eq("company_id", companyId).order("created_at"),
    ]);

    const stage1Error = companiesError ?? employeesError ?? trainingsError ?? bundlesError ?? categoriesError;
    if (stage1Error) console.error("Laden der Firmendaten (SiFa) teilweise fehlgeschlagen:", stage1Error);

    const employeeIds = (employeeRows ?? []).map((e) => e.id);
    const bundleIds = (bundleRows ?? []).map((b) => b.id);

    // Stufe 2: Tabellen ohne eigene company_id-Spalte -- über die Mitarbeiter-
    // /Bundle-IDs aus Stufe 1 eingeschränkt (RLS würde sonst Zeilen aus ALLEN
    // freigegebenen Firmen dieser SiFa gemischt zurückgeben, s. Datei-Kopf).
    const [
      { data: bundleTrainingRows, error: bundleTrainingsError },
      { data: qualificationRows, error: qualificationsError },
      { data: questionRows, error: questionsError },
      { data: employeeTrainingRows, error: employeeTrainingsError },
    ] = await Promise.all([
      bundleIds.length > 0
        ? supabase.from("bundle_trainings").select("*").in("bundle_id", bundleIds)
        : Promise.resolve({ data: [] as any[], error: null }),
      employeeIds.length > 0
        ? supabase.from("qualifications").select("*").in("employee_id", employeeIds).order("created_at")
        : Promise.resolve({ data: [] as any[], error: null }),
      employeeIds.length > 0
        ? supabase.from("questions").select("*").in("employee_id", employeeIds).order("created_at")
        : Promise.resolve({ data: [] as any[], error: null }),
      employeeIds.length > 0
        ? supabase
            .from("employee_trainings")
            .select(
              "id, employee_id, training_id, status, signiert_am, geraet, signiert_als, created_at, updated_at"
            )
            .in("employee_id", employeeIds)
            .or(`status.eq.offen,signiert_am.gte.${recentSignedCutoff()}`)
            .order("created_at")
        : Promise.resolve({ data: [] as any[], error: null }),
    ]);

    const stage2Error = bundleTrainingsError ?? qualificationsError ?? questionsError ?? employeeTrainingsError;
    if (stage2Error) console.error("Laden der Firmendaten (SiFa) teilweise fehlgeschlagen:", stage2Error);

    const signedUrlMap = await resolveSignedUrls([
      companies?.[0]?.logo_url,
      ...(employeeRows ?? []).map((e) => e.foto_url),
    ]);
    function resolvePhoto(pathOrUrl: string | null | undefined): string | null {
      if (!pathOrUrl) return null;
      if (pathOrUrl.startsWith("http")) return pathOrUrl;
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
      const ownQualIcons = quals.filter((q) => q.employeeId === e.id).map((q) => q.icon);
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

    if (loadGenerationRef.current !== generation) return;

    if (companies && companies[0]) {
      setCompany({
        id: companies[0].id,
        name: companies[0].name,
        address: companies[0].address,
        strasse: companies[0].strasse,
        plz: companies[0].plz,
        ort: companies[0].ort,
        chefName: companies[0].chef_name,
        logoUrl: resolvePhoto(companies[0].logo_url),
        plan: companies[0].plan,
        billing: companies[0].billing,
        subscriptionStatus: companies[0].subscription_status,
        createdAt: companies[0].created_at,
        contractStartedAt: companies[0].contract_started_at,
        cancelAt: companies[0].cancel_at,
        aufbewahrungsfristMonate: companies[0].aufbewahrungsfrist_monate,
      });
    } else {
      setCompany(null);
    }
    setEmployees(mappedEmployees);
    setTrainings(mappedTrainings);
    setBundles(mappedBundles);
    setCategories(mappedCategories);
    setQualifications(quals);
    setQuestions(mappedQuestions);
    setEmployeeTrainings(empTrainings);
  }, [companyId]);

  const loadData = useCallback((): Promise<void> => {
    if (loadQueuedRef.current) return loadQueuedRef.current;
    const queued = loadChainRef.current.then(async () => {
      loadQueuedRef.current = null;
      await runLoad();
    });
    loadChainRef.current = queued.catch(() => {});
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const { showToast, ToastView } = useToast();

  // Automatische Abmeldung nach Inaktivität -- läuft zusätzlich zum
  // globalen AppDataProvider (redundant, aber harmlos: signOut() ist
  // idempotent), damit eine SiFa nicht allein dadurch angemeldet bleibt,
  // dass sie gerade eine Firmenansicht offen hat.
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

  const employeesRef = useRef(employees);
  useEffect(() => {
    employeesRef.current = employees;
  }, [employees]);
  const trainingsRef = useRef(trainings);
  useEffect(() => {
    trainingsRef.current = trainings;
  }, [trainings]);

  // Live-Meldungen (neue Rückfrage / neue Signatur) -- bewusst vereinfacht
  // gegenüber lib/store.tsx: kein Firmen-Filter auf Postgres-Changes-Ebene
  // (RLS lässt ohnehin nur Zeilen aus freigegebenen Firmen durch), daher
  // client-seitig gegen die bereits geladene, company-gescopte
  // employees-Liste geprüft, damit eine Aktivität in einer ANDEREN
  // freigegebenen Firma hier keinen (verwirrenden) Toast auslöst.
  useEffect(() => {
    if (!session || !companyId) return;
    const channel = supabase
      .channel(`sifa-questions-inserts-${companyId}`)
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
          if (!employeesRef.current.some((e) => e.id === row.employee_id)) return;
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
  }, [session?.user.id, companyId]);

  useEffect(() => {
    if (!session || !companyId) return;
    const channel = supabase
      .channel(`sifa-employee-trainings-updates-${companyId}`)
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
          if (!employeesRef.current.some((e) => e.id === row.employee_id)) return;
          setEmployeeTrainings((prev) => {
            const bestehend = prev.find((et) => et.id === row.id);
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
  }, [session?.user.id, companyId]);

  function assertEmailFrei(email: string | null, ignoreId?: string) {
    if (!email) return;
    if (!istGueltigeEmail(email)) throw new Error("email_invalid");
    const lower = email.toLowerCase();
    const taken = employees.some((e) => e.id !== ignoreId && e.email?.toLowerCase() === lower);
    if (taken) throw new Error("email_taken");
  }

  async function addEmployee(input: NewEmployeeInput): Promise<Employee> {
    if (!company) throw new Error("Keine Firma geladen");
    assertEmailFrei(input.email);
    assertMaxLen(input.telefon, 40, "Telefonnummer");
    assertGueltigesDatum(input.geburtsdatum, "Geburtsdatum");
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
    let pdfPath: string | null = null;
    try {
      if (input.bundleId && data) {
        const { error: bundleError } = await supabase
          .from("bundle_trainings")
          .insert({ bundle_id: input.bundleId, training_id: data.id });
        throwIfError(bundleError);
      }
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
    const path = `${company.id}/${employeeId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("employee-photos")
      .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (upErr) throw upErr;
    const { error } = await supabase.from("employees").update({ foto_url: path }).eq("id", employeeId);
    throwIfError(error);
    await loadData();
  }

  async function updateTraining(
    id: string,
    input: { name: string; icon: string; inhalt: string | null; ablaufdatum: string | null }
  ) {
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
    if (company) {
      const { data: files, error: listError } = await supabase.storage.from("employee-photos").list(company.id);
      if (listError) {
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

  async function updateBundle(id: string, input: { name: string; icon: string; trainingIds: string[] }) {
    assertMaxLen(input.name, 120, "Bundle-Name");
    assertMaxLen(input.icon, 10, "Bundle-Icon");
    const { error } = await supabase
      .from("bundles")
      .update({ name: input.name.trim(), icon: input.icon })
      .eq("id", id);
    throwIfError(error);

    const { error: deleteError } = await supabase.from("bundle_trainings").delete().eq("bundle_id", id);
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

  async function setEmployeeArchived(id: string, archiviert: boolean) {
    const { error } = await supabase.from("employees").update({ archiviert }).eq("id", id);
    throwIfError(error);
    await loadData();
  }

  async function setEmployeeCategory(employeeId: string, kategorie: string) {
    const { error } = await supabase.from("employees").update({ kategorie }).eq("id", employeeId);
    throwIfError(error);
    await loadData();
  }

  async function addQualification(input: { employeeId: string; name: string; ablaufdatum: string | null }) {
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

  async function updateQualification(id: string, input: { name: string; ablaufdatum: string | null }) {
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

  async function qualifikationTerminVereinbart(id: string) {
    const { error } = await supabase.rpc("qualifikation_termin_vereinbart", { p_id: id });
    throwIfError(error);
    await loadData();
  }

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

  async function regenerateInviteToken(employeeId: string) {
    const { data, error } = await supabase.rpc("regenerate_invite_token", { p_employee_id: employeeId });
    throwIfError(error);
    await loadData();
    return data as string;
  }

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

  // Für SiFa nicht verfügbar -- Firmenprofil bleibt exklusiv beim Chef
  // (keine SiFa-Seite ruft diese Funktionen auf, s. Datei-Kopf).
  async function uploadCompanyLogo(_file: File): Promise<never> {
    throw new Error("Für SiFa nicht verfügbar -- nur der Chef kann das Firmenlogo ändern.");
  }
  async function updateCompany(_input: {
    name: string;
    strasse: string;
    plz: string;
    ort: string;
    chefName: string;
  }): Promise<never> {
    throw new Error("Für SiFa nicht verfügbar -- nur der Chef kann das Firmenprofil ändern.");
  }
  async function updateAufbewahrungsfrist(_monate: number | null): Promise<never> {
    throw new Error("Für SiFa nicht verfügbar -- nur der Chef kann die Aufbewahrungsfrist ändern.");
  }

  async function fetchInviteToken(employeeId: string): Promise<string | null> {
    const { data, error } = await supabase.from("employees").select("invite_token").eq("id", employeeId).single();
    throwIfError(error);
    return data?.invite_token ?? null;
  }

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

  async function answerQuestion(id: string, antwort: string) {
    const { error } = await supabase.from("questions").update({ antwort, status: "beantwortet" }).eq("id", id);
    throwIfError(error);
    await loadData();
    const employeeId = questions.find((q) => q.id === id)?.employeeId;
    if (session && employeeId) {
      notifyPush(session.access_token, [employeeId], "Antwort auf deine Rückfrage", antwort);
    }
  }

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
