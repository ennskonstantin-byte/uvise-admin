"use client";

export function Switch({
  checked,
  onChange,
  label,
  activeColor = "var(--accent-violet)",
  inactiveColor = "var(--border)",
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  activeColor?: string;
  inactiveColor?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 rounded-full transition-colors shrink-0"
      style={{ background: checked ? activeColor : inactiveColor }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
        style={{ left: checked ? 22 : 2 }}
      />
    </button>
  );
}
