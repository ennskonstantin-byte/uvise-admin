import { LegalPage } from "@/components/LegalPage";
import { IMPRESSUM } from "@/lib/legal";

export const metadata = { title: "Impressum · uVise" };

export default function ImpressumPage() {
  return <LegalPage title="Impressum" text={IMPRESSUM} />;
}
