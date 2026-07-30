import Image from "next/image";

export function LogoMark({ size = 40 }: { size?: number }) {
  // next/image statt <img>: das Quellbild ist 512×512 (281 KB), wird aber
  // überall nur mit 26–52px angezeigt — Next optimiert/verkleinert automatisch
  // und liefert moderne Formate (WebP/AVIF), statt das volle PNG zu laden.
  return (
    <Image
      src="/logo-mark.png"
      alt="uVise"
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
    />
  );
}
