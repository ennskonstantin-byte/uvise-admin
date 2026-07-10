"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
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
} from "@/lib/mockData";

type Company = {
  id: string;
  name: string;
  address: string | null;
  chefName: string | null;
  logoUrl: string | null;
};

type NewEmployeeInput = Omit<
  Employee,
  "id" | "ampel" | "offenePunkte" | "qualifikationsIcons" | "fotoUrl" | "archiviert" | "minderjaehrig"
>;
type NewTrainingInput = Omit<Training, "id"> & { bundleId?: string | null };
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
  addBundle: (input: NewBundleInput) => Promise<void>;
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
  assignTraining: (trainingId: string, employeeIds: string[]) => Promise<void>;
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
  uploadCompanyLogo: (file: File) => Promise<void>;
  answerQuestion: (id: string, antwort: string) => Promise<void>;
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
  if (days < 30) return "laeuft_ab";
  return "gueltig";
}

function trainingStatus(ablaufdatum: string | null): "aktuell" | "laeuft_ab" {
  if (!ablaufdatum) return "aktuell";
  const daysLeft = (new Date(ablaufdatum).getTime() - Date.now()) / 86_400_000;
  return daysLeft < 30 ? "laeuft_ab" : "aktuell";
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

  const loadData = useCallback(async () => {
    setDataLoading(true);

    const [
      { data: companies },
      { data: employeeRows },
      { data: trainingRows },
      { data: bundleRows },
      { data: bundleTrainingRows },
      { data: categoryRows },
      { data: qualificationRows },
      { data: questionRows },
      { data: employeeTrainingRows },
    ] = await Promise.all([
      supabase.from("companies").select("*").limit(1),
      supabase.from("employees").select("*"),
      supabase.from("trainings").select("*"),
      supabase.from("bundles").select("*"),
      supabase.from("bundle_trainings").select("*"),
      supabase.from("categories").select("*"),
      supabase.from("qualifications").select("*"),
      supabase.from("questions").select("*"),
      supabase.from("employee_trainings").select("*"),
    ]);

    const empTrainings = (employeeTrainingRows ?? []).map((et) => ({
      id: et.id,
      employeeId: et.employee_id,
      trainingId: et.training_id,
      status: et.status,
      signiertAm: et.signiert_am ? formatDate(et.signiert_am) : null,
      signaturBildUrl: et.signatur_bild_url ?? null,
      geraet: et.geraet ?? null,
    }));

    const quals = (qualificationRows ?? []).map((q) => ({
      id: q.id,
      employeeId: q.employee_id,
      name: q.name,
      icon: qualIcon(q.name),
      ablaufdatum: formatDate(q.ablaufdatum),
      status: qualStatus(q.ablaufdatum),
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
        fotoUrl: e.foto_url ?? null,
        kategorie: e.kategorie ?? "Sonstiges",
        archiviert: e.archiviert ?? false,
        minderjaehrig: istMinderjaehrig(e.geburtsdatum ?? null),
        ampel: offenePunkte > 0 ? "rot" : "gruen",
        offenePunkte,
        qualifikationsIcons: ownQualIcons,
        istBeauftragter: e.ist_beauftragter,
      };
    });

    const mappedTrainings: Training[] = (trainingRows ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      typ: t.typ === "hochgeladen" ? "hochgeladen" : "online",
      icon: t.icon ?? (t.typ === "hochgeladen" ? "📄" : "✍️"),
      inhalt: t.inhalt,
      erstelltAm: formatDate(t.erstellt_am),
      ablaufdatum: formatDate(t.ablaufdatum),
      status: trainingStatus(t.ablaufdatum),
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

    if (companies && companies[0]) {
      setCompany({
        id: companies[0].id,
        name: companies[0].name,
        address: companies[0].address,
        chefName: companies[0].chef_name,
        logoUrl: companies[0].logo_url ?? null,
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

  async function addEmployee(input: NewEmployeeInput): Promise<Employee> {
    if (!company) throw new Error("Keine Firma geladen");
    const { data, error } = await supabase
      .from("employees")
      .insert({
        company_id: company.id,
        vorname: input.vorname,
        nachname: input.nachname,
        personalnummer: input.personalnummer,
        email: input.email,
        telefon: input.telefon,
        geburtsdatum: input.geburtsdatum,
        kategorie: input.kategorie,
        ist_beauftragter: input.istBeauftragter,
      })
      .select()
      .single();
    if (error) throw error;
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
      istBeauftragter: data.ist_beauftragter,
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
    if (error) throw error;
    if (input.bundleId && data) {
      await supabase
        .from("bundle_trainings")
        .insert({ bundle_id: input.bundleId, training_id: data.id });
    }
    await loadData();
    return {
      id: data.id,
      name: data.name,
      typ: data.typ === "hochgeladen" ? "hochgeladen" : "online",
      icon: data.icon ?? (data.typ === "hochgeladen" ? "📄" : "✍️"),
      inhalt: data.inhalt,
      erstelltAm: formatDate(data.erstellt_am),
      ablaufdatum: formatDate(data.ablaufdatum),
      status: trainingStatus(data.ablaufdatum),
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
    const { error } = await supabase
      .from("employees")
      .update({
        vorname: input.vorname,
        nachname: input.nachname,
        personalnummer: input.personalnummer,
        email: input.email,
        telefon: input.telefon,
        geburtsdatum: input.geburtsdatum,
        kategorie: input.kategorie,
        ist_beauftragter: input.istBeauftragter,
      })
      .eq("id", id);
    if (error) throw error;
    await loadData();
  }

  async function uploadEmployeePhoto(employeeId: string, file: File) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${employeeId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("employee-photos")
      .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("employee-photos").getPublicUrl(path);
    const { error } = await supabase
      .from("employees")
      .update({ foto_url: data.publicUrl })
      .eq("id", employeeId);
    if (error) throw error;
    await loadData();
  }

  async function updateTraining(
    id: string,
    input: { name: string; icon: string; inhalt: string | null; ablaufdatum: string | null }
  ) {
    const { error } = await supabase
      .from("trainings")
      .update({
        name: input.name,
        icon: input.icon,
        inhalt: input.inhalt,
        ablaufdatum: input.ablaufdatum,
      })
      .eq("id", id);
    if (error) throw error;
    await loadData();
  }

  async function addBundle(input: NewBundleInput) {
    if (!company) return;
    const { data, error } = await supabase
      .from("bundles")
      .insert({ company_id: company.id, name: input.name, icon: input.icon })
      .select()
      .single();
    if (error) throw error;
    if (input.trainingIds.length > 0 && data) {
      await supabase
        .from("bundle_trainings")
        .insert(input.trainingIds.map((trainingId) => ({ bundle_id: data.id, training_id: trainingId })));
    }
    await loadData();
  }

  async function deleteEmployee(id: string) {
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) throw error;
    await loadData();
  }

  async function deleteTraining(id: string) {
    const { error } = await supabase.from("trainings").delete().eq("id", id);
    if (error) throw error;
    await loadData();
  }

  async function deleteBundle(id: string) {
    const { error } = await supabase.from("bundles").delete().eq("id", id);
    if (error) throw error;
    await loadData();
  }

  async function updateBundle(
    id: string,
    input: { name: string; icon: string; trainingIds: string[] }
  ) {
    const { error } = await supabase
      .from("bundles")
      .update({ name: input.name, icon: input.icon })
      .eq("id", id);
    if (error) throw error;

    const { error: deleteError } = await supabase
      .from("bundle_trainings")
      .delete()
      .eq("bundle_id", id);
    if (deleteError) throw deleteError;

    if (input.trainingIds.length > 0) {
      const { error: insertError } = await supabase
        .from("bundle_trainings")
        .insert(input.trainingIds.map((trainingId) => ({ bundle_id: id, training_id: trainingId })));
      if (insertError) throw insertError;
    }
    await loadData();
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    await loadData();
  }

  async function addCategory(input: { name: string; icon: string }) {
    if (!company) return;
    const { error } = await supabase
      .from("categories")
      .insert({ company_id: company.id, name: input.name, icon: input.icon });
    if (error) throw error;
    await loadData();
  }

  async function updateCategory(id: string, input: { name: string; icon: string }) {
    const { error } = await supabase
      .from("categories")
      .update({ name: input.name, icon: input.icon })
      .eq("id", id);
    if (error) throw error;
    await loadData();
  }

  // Archivieren statt löschen (gekündigte MA bleiben erhalten) bzw. wiederherstellen
  async function setEmployeeArchived(id: string, archiviert: boolean) {
    const { error } = await supabase.from("employees").update({ archiviert }).eq("id", id);
    if (error) throw error;
    await loadData();
  }

  // Einen Mitarbeiter einer Kategorie zuordnen (oder mit "" abwählen)
  async function setEmployeeCategory(employeeId: string, kategorie: string) {
    const { error } = await supabase.from("employees").update({ kategorie }).eq("id", employeeId);
    if (error) throw error;
    await loadData();
  }

  async function addQualification(input: {
    employeeId: string;
    name: string;
    ablaufdatum: string | null;
  }) {
    const { error } = await supabase.from("qualifications").insert({
      employee_id: input.employeeId,
      name: input.name,
      ablaufdatum: input.ablaufdatum,
      status: "gueltig",
    });
    if (error) throw error;
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
    if (error) throw error;
    await loadData();
  }

  async function uploadCompanyLogo(file: File) {
    if (!company) return;
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `company-${company.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("employee-photos")
      .upload(path, file, { upsert: true, contentType: file.type || "image/png" });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("employee-photos").getPublicUrl(path);
    const { error } = await supabase.from("companies").update({ logo_url: data.publicUrl }).eq("id", company.id);
    if (error) throw error;
    await loadData();
  }

  async function updateCompany(input: { name: string; address: string; chefName: string }) {
    if (!company) return;
    const { error } = await supabase
      .from("companies")
      .update({ name: input.name, address: input.address, chef_name: input.chefName })
      .eq("id", company.id);
    if (error) throw error;
    await loadData();
  }

  async function answerQuestion(id: string, antwort: string) {
    const { error } = await supabase
      .from("questions")
      .update({ antwort, status: "beantwortet" })
      .eq("id", id);
    if (error) throw error;
    await loadData();
  }

  async function signOut() {
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
        assignTraining,
        updateEmployee,
        updateTraining,
        deleteEmployee,
        setEmployeeArchived,
        uploadEmployeePhoto,
        deleteTraining,
        deleteBundle,
        deleteCategory,
        updateCompany,
        answerQuestion,
        uploadCompanyLogo,
        reload: loadData,
        signOut,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
