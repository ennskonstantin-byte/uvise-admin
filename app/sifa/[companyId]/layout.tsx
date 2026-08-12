"use client";

// Rahmen für alle firmen-gescopten SiFa-Seiten (Dashboard/Mitarbeiter/
// Unterweisungen/Qualifikationen/Rückfragen/Archiv). Lädt den Firmennamen
// aus den eigenen sifa_grants (schon geladen, kein Extra-Request) und
// blockt, solange die Firma nicht (mehr) freigegeben ist -- verhindert,
// dass jemand über eine alte/erratene URL versucht, eine nicht (mehr)
// freigegebene Firma zu öffnen (RLS würde ohnehin leere Daten liefern,
// das hier ist nur die passende Fehlermeldung statt einer leeren Seite).
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAppData } from "@/lib/store";
import { useSifaProfile } from "@/lib/useSifaProfile";
import { SifaCompanyDataProvider } from "@/lib/sifaCompanyData";
import { SifaShell } from "@/components/SifaShell";
import { Card } from "@/components/Card";

export default function SifaCompanyLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ companyId: string }>();
  const companyId = params.companyId;
  const { session } = useAppData();
  const sifa = useSifaProfile(session);

  if (sifa.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg text-foreground/65 text-sm">
        Lädt…
      </div>
    );
  }

  const grant = sifa.grants.find((g) => g.companyId === companyId && g.status === "freigegeben");

  if (!grant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg px-4">
        <Card className="max-w-sm text-center">
          <h1 className="text-lg font-semibold mb-2">Keine Freigabe für diese Firma</h1>
          <p className="text-sm text-foreground/60 mb-6">
            Entweder wurde der Zugriff entzogen, oder die Firma hat dich (noch) nicht freigegeben.
          </p>
          <Link
            href="/sifa"
            className="inline-block rounded-full px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: "var(--accent-gradient)" }}
          >
            Zu meinen Firmen
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <SifaCompanyDataProvider companyId={companyId}>
      <SifaShell mode="inner" companyId={companyId} companyName={grant.companyName}>
        {children}
      </SifaShell>
    </SifaCompanyDataProvider>
  );
}
