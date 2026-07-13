import { initials } from "@/lib/types";

// Einheitliches Mitarbeiter-Bild (Foto oder Initialen-Kreis) — überall in
// der App gleich, statt an jeder Stelle einzeln nachgebaut.
export function EmployeeAvatar({
  vorname,
  nachname,
  fotoUrl,
  size = 40,
  grayscale = false,
}: {
  vorname: string;
  nachname: string;
  fotoUrl?: string | null;
  size?: number;
  grayscale?: boolean;
}) {
  const px = `${size}px`;
  if (fotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fotoUrl}
        alt=""
        className={`rounded-full object-cover shrink-0 ${grayscale ? "grayscale" : ""}`}
        style={{ height: px, width: px }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{
        height: px,
        width: px,
        fontSize: size * 0.36,
        background: grayscale ? "var(--foreground)" : "var(--accent-gradient)",
        opacity: grayscale ? 0.4 : 1,
      }}
    >
      {initials(vorname, nachname)}
    </div>
  );
}
