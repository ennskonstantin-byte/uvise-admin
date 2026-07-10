"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { Employee } from "@/lib/mockData";

// Sucheingabe statt langer Liste/Dropdown — bei vielen Mitarbeitern
// (>20-30) wird ein reines Scrollen/Dropdown schnell unpraktisch.
export function EmployeeSearchPicker({
  employees,
  value,
  onChange,
}: {
  employees: Employee[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const selected = employees.find((e) => e.id === value);
  const filtered = employees.filter((e) =>
    `${e.vorname} ${e.nachname}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/65" />
        <input
          value={selected ? `${selected.vorname} ${selected.nachname}` : query}
          onChange={(e) => {
            if (selected) onChange("");
            setQuery(e.target.value);
          }}
          placeholder="Mitarbeiter suchen…"
          className="w-full rounded-full border border-border bg-surface pl-9 pr-4 py-2.5 text-sm outline-none"
        />
      </div>

      {!selected && (
        <div className="mt-2 max-h-40 overflow-y-auto rounded-2xl border border-border divide-y divide-border">
          {filtered.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                onChange(e.id);
                setQuery("");
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-surface"
            >
              {e.vorname} {e.nachname}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-2 text-sm text-foreground/65">Keine Mitarbeiter gefunden.</p>
          )}
        </div>
      )}
    </div>
  );
}
