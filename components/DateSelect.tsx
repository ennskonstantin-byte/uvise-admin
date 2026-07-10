"use client";

import { useEffect, useState } from "react";

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

const selectClass =
  "rounded-full border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-foreground/30";

// Datum als drei einfache Dropdowns (Tag/Monat/Jahr) statt dem nativen
// Kalender-Popup — dort lässt sich das Jahr nur durch Eintippen ändern,
// was unübersichtlich ist. Wert/Rückgabe im Format "JJJJ-MM-TT".
export function DateSelect({
  value,
  onChange,
  minYear,
  maxYear,
}: {
  value: string;
  onChange: (value: string) => void;
  minYear: number;
  maxYear: number;
}) {
  // Eigener State für die drei Teile, damit eine bereits getroffene Auswahl
  // (z.B. erst das Jahr) nicht verloren geht, solange das Datum noch
  // unvollständig ist (onChange nach außen liefert erst bei allen 3 einen Wert).
  const parsed = value ? value.split("-").map((n) => parseInt(n, 10)) : [undefined, undefined, undefined];
  const [y, setY] = useState<number | undefined>(parsed[0]);
  const [m, setM] = useState<number | undefined>(parsed[1]);
  const [d, setD] = useState<number | undefined>(parsed[2]);

  useEffect(() => {
    if (!value) {
      setY(undefined);
      setM(undefined);
      setD(undefined);
      return;
    }
    const [vy, vm, vd] = value.split("-").map((n) => parseInt(n, 10));
    setY(vy);
    setM(vm);
    setD(vd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function update(newY?: number, newM?: number, newD?: number) {
    setY(newY);
    setM(newM);
    setD(newD);
    if (!newY || !newM || !newD) {
      onChange("");
      return;
    }
    onChange(`${newY}-${String(newM).padStart(2, "0")}-${String(newD).padStart(2, "0")}`);
  }

  const years: number[] = [];
  for (let year = maxYear; year >= minYear; year--) years.push(year);

  return (
    <div className="flex gap-2">
      <select
        value={d ?? ""}
        onChange={(e) => update(y, m, e.target.value ? Number(e.target.value) : undefined)}
        className={`${selectClass} flex-1`}
        aria-label="Tag"
      >
        <option value="">Tag</option>
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>
      <select
        value={m ?? ""}
        onChange={(e) => update(y, e.target.value ? Number(e.target.value) : undefined, d)}
        className={`${selectClass} flex-[1.5]`}
        aria-label="Monat"
      >
        <option value="">Monat</option>
        {MONTHS.map((name, i) => (
          <option key={name} value={i + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        value={y ?? ""}
        onChange={(e) => update(e.target.value ? Number(e.target.value) : undefined, m, d)}
        className={`${selectClass} flex-1`}
        aria-label="Jahr"
      >
        <option value="">Jahr</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
