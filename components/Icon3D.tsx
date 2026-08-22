// Begriffs-Symbol des Glas-3D-Designs, Web-Port von
// sicherakte/components/design/Icon3D.tsx. REGEL: Begriffe bekommen Icon3D
// (gerendertes PNG aus public/i3d-hq/), Bedienelemente (Chevron, Menü,
// Zurück, Häkchen) bleiben lucide-react.
import Image from "next/image";
import { ICON, resolveSemanticIcon, type IconKey, type SemanticIconKey } from "@/lib/icons";

const SIZE_PX = { lg: 39, md: 28, sm: 23, xs: 17 } as const;
type Size = keyof typeof SIZE_PX;

// [Phase 8 / Commit 1] Minimale Resolvervorbereitung: zusätzlich zum
// bestehenden `name`-Prop (IconKey) kann ein SemanticIconKey übergeben
// werden. Nichts an Größe, Layout oder Darstellung ändert sich.
export function Icon3D({
  name,
  semantic,
  size = "md",
  className,
}: {
  name?: IconKey;
  semantic?: SemanticIconKey;
  size?: Size;
  className?: string;
}) {
  const px = SIZE_PX[size];
  const src = semantic ? resolveSemanticIcon(semantic) : name ? ICON[name] : undefined;
  if (!src) return null;
  return (
    <Image
      src={src}
      alt=""
      width={px}
      height={px}
      className={className}
      style={{ width: px, height: px, objectFit: "contain" }}
      aria-hidden
    />
  );
}

// Für dynamische Pfade (resolveDynamicIcon), wo kein fester IconKey vorliegt.
export function IconImg({
  src,
  size = "md",
  className,
}: {
  src: string;
  size?: Size;
  className?: string;
}) {
  const px = SIZE_PX[size];
  return (
    <Image
      src={src}
      alt=""
      width={px}
      height={px}
      className={className}
      style={{ width: px, height: px, objectFit: "contain" }}
      aria-hidden
    />
  );
}
