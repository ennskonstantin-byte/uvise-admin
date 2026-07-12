// Kleine illustrierte Beispiel-Avatare für die Marketing-Seite — bewusst
// keine echten Fotos (keine Stock-Fotos/Lizenzfragen, keine echten
// Mitarbeiter), aber "sprechender" als ein reiner Farbkreis: Gesicht +
// Frisur variieren pro Person, damit die Vorschau nach echten Menschen
// statt nach abstrakten Kacheln aussieht.
const SKIN = ["#f4c9a6", "#e8ad83", "#c98a5e", "#f0d4b8", "#d99b6c"];
const HAIR = ["#2b2320", "#6b4226", "#111111", "#8a5a2c", "#3d2b1f"];

function Hair({ variant, color }: { variant: number; color: string }) {
  switch (variant % 5) {
    case 0: // kurze, runde Frisur
      return <path d="M14 34 A22 22 0 0 1 58 34 L58 24 A22 20 0 0 0 14 24 Z" fill={color} />;
    case 1: // Seitenscheitel
      return <path d="M12 32 Q16 10 36 10 Q54 10 60 30 L60 22 Q52 14 36 14 Q18 14 14 26 Z" fill={color} />;
    case 2: // Dutt/Zopf
      return (
        <>
          <path d="M14 30 A22 22 0 0 1 58 30 L58 22 A22 18 0 0 0 14 22 Z" fill={color} />
          <circle cx={36} cy={8} r={6} fill={color} />
        </>
      );
    case 3: // Kurzhaarschnitt mit Übergang
      return <path d="M13 28 A23 23 0 0 1 59 28 L58 18 Q36 6 14 18 Z" fill={color} />;
    default: // längeres Haar mit Seitenpartien
      return (
        <>
          <path d="M12 44 L12 24 A24 24 0 0 1 60 24 L60 44 L54 44 L54 26 A18 18 0 0 0 18 26 L18 44 Z" fill={color} />
        </>
      );
  }
}

export function PersonAvatar({
  seed = 0,
  size = 48,
  ring,
}: {
  seed?: number;
  size?: number;
  ring?: string;
}) {
  const skin = SKIN[seed % SKIN.length];
  const hair = HAIR[(seed + 2) % HAIR.length];
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx={36} cy={36} r={35} fill={skin} stroke={ring ?? "transparent"} strokeWidth={ring ? 2 : 0} />
      <circle cx={26} cy={38} r={3} fill="#2b2320" />
      <circle cx={46} cy={38} r={3} fill="#2b2320" />
      <path d="M27 49 Q36 56 45 49" stroke="#2b2320" strokeWidth={3} strokeLinecap="round" fill="none" />
      <Hair variant={seed} color={hair} />
    </svg>
  );
}
