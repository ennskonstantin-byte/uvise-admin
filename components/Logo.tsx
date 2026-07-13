export function LogoMark({ size = 40 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo-mark.png" alt="uVise" width={size} height={size} style={{ width: size, height: size, borderRadius: size * 0.22 }} />;
}
