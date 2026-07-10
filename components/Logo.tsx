export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="uviseBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="uviseCheck" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c7e9fd" />
          <stop offset="1" stopColor="#4db4f7" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="96" height="96" rx="26" fill="url(#uviseBg)" />
      <path d="M36 26 L36 53 A14.5 14.5 0 0 0 65 53 L65 40" stroke="#ffffff" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M46 56 L58 69 L70 19" stroke="url(#uviseCheck)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
