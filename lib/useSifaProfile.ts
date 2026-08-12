"use client";

// SiFa-Profil + eigene Firmen-Zugriffe (Web-Port von Phase 5/App,
// Migration 0078). Leichtes Pendant zum großen AppDataProvider -- eine SiFa
// hat kein eigenes company-scoped Datenmodell, nur ihr Profil + Zugriffe.
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { SifaGrant, SifaProfile } from "@/lib/types";
import { throwIfError } from "@/lib/store";

export function useSifaProfile(session: Session | null) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [profile, setProfile] = useState<SifaProfile | null>(null);
  const [grants, setGrants] = useState<SifaGrant[]>([]);

  const load = useCallback(async () => {
    if (!session) {
      setProfile(null);
      setGrants([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(false);
    try {
      const { data: profileRows, error: profileError } = await supabase
        .from("sifa_profiles")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .limit(1);
      throwIfError(profileError);
      const row = profileRows?.[0];
      if (!row) {
        setProfile(null);
        setGrants([]);
        return;
      }
      setProfile({
        vorname: row.vorname,
        nachname: row.nachname,
        firmenSchaetzung: row.firmen_schaetzung ?? null,
        onboardingCompletedAt: row.onboarding_completed_at ?? null,
      });

      const { data: grantRows, error: grantError } = await supabase
        .from("sifa_grants")
        .select("id, company_id, status, requested_at, companies(name)")
        .eq("auth_user_id", session.user.id)
        .neq("status", "entfernt")
        .order("requested_at", { ascending: false });
      throwIfError(grantError);
      setGrants(
        (grantRows ?? []).map((g: any) => ({
          id: g.id,
          companyId: g.company_id,
          companyName: g.companies?.name ?? "Unbekannte Firma",
          status: g.status,
          requestedAt: g.requested_at,
        }))
      );
    } catch (err) {
      setLoadError(true);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  async function createProfile(vorname: string, nachname: string) {
    const { error } = await supabase.rpc("create_sifa_profile", {
      p_vorname: vorname,
      p_nachname: nachname,
    });
    throwIfError(error);
    await load();
  }

  async function completeOnboarding(firmenSchaetzung: "1-3" | "4-10" | "11-25" | "25+") {
    const { error } = await supabase.rpc("complete_sifa_onboarding", {
      p_firmen_schaetzung: firmenSchaetzung,
    });
    throwIfError(error);
    await load();
  }

  async function requestAccess(sifaCode: string) {
    const { error } = await supabase.rpc("request_sifa_access", { p_sifa_code: sifaCode });
    throwIfError(error);
    await load();
  }

  return {
    loading,
    loadError,
    profile,
    grants,
    reload: load,
    createProfile,
    completeOnboarding,
    requestAccess,
  };
}
