import { LegalPage } from "@/components/LegalPage";
import { DATENSCHUTZ } from "@/lib/legal";

export const metadata = { title: "Datenschutz · uVise" };

export default function DatenschutzPage() {
  return <LegalPage title="Datenschutzerklärung" text={DATENSCHUTZ} />;
}
