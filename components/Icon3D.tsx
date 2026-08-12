// Begriffs-Symbol des Glas-3D-Designs, Web-Port von
// sicherakte/components/design/Icon3D.tsx. REGEL: Begriffe bekommen Icon3D
// (gerendertes PNG aus public/i3d-hq/), Bedienelemente (Chevron, Menü,
// Zurück, Häkchen) bleiben lucide-react.
import Image from "next/image";
import { ICON, type IconKey } from "@/lib/icons";

const SIZE_PX = { lg: 39, md: 28, sm: 23, xs: 17 } as const;
type Size = keyof typeof SIZE_PX;

export function Icon3D({
  name,
  size = "md",
  className,
}: {
  name: IconKey;
  size?: Size;
  className?: string;
}) {
  const px = SIZE_PX[size];
  return (
    <Image
      src={ICON[name]}
      alt=""
      width={px}
      height={px}
      className={className}
      style={{ width: px, height: px, objectFit: "contain" }}
      aria-hidden
    />
  );
}

// Für dynamische Pfade (trainingIconSrc/categoryIconSrc/qualificationIconSrc),
// wo kein fester IconKey vorliegt.
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
