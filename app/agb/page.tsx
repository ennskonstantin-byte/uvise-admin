import { LegalPage } from "@/components/LegalPage";
import { AGB } from "@/lib/legal";

export const metadata = { title: "AGB · uVise" };

export default function AgbPage() {
  return <LegalPage title="Allgemeine Geschäftsbedingungen" text={AGB} />;
}
