import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export function LegalPage({ title, text }: { title: string; text: string }) {
  return (
    <div className="min-h-screen bg-page-bg px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="flex items-center gap-3 mb-8 w-fit">
          <LogoMark size={40} />
          <span className="text-lg font-semibold">uVise</span>
        </Link>

        <div className="rounded-3xl bg-background border border-border p-6 sm:p-10">
          <h1 className="text-2xl font-semibold mb-6">{title}</h1>
          <p className="whitespace-pre-line text-sm leading-6 text-foreground/80">{text}</p>
        </div>

        <nav aria-label="Rechtliches" className="flex flex-wrap gap-4 mt-6 text-sm text-foreground/60">
          <Link href="/" className="hover:text-foreground underline-offset-4 hover:underline">
            ← Zur Anwendung
          </Link>
          <Link href="/impressum" className="hover:text-foreground underline-offset-4 hover:underline">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-foreground underline-offset-4 hover:underline">
            Datenschutz
          </Link>
          <Link href="/agb" className="hover:text-foreground underline-offset-4 hover:underline">
            AGB
          </Link>
        </nav>
      </div>
    </div>
  );
}
