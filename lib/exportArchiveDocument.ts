"use client";

import { jsPDF } from "jspdf";
import type { EmployeeTraining } from "@/lib/types";

// Lädt ein Bild (URL oder data:-URI) als Data-URL, damit jsPDF es einbetten
// kann -- jsPDF selbst kann keine Bilder per URL nachladen.
async function toDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Speichert den Nachweis als echte PDF-Datei (nicht nur über den
// Drucken-Dialog) -- für den Fall, dass der Nachweis sonst verloren geht.
export async function saveArchiveDocumentPdf(
  entry: EmployeeTraining,
  trainingName: string,
  employeeName: string
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  let y = 64;

  doc.setFontSize(18);
  doc.text("Unterschrifts-Nachweis", marginX, y);
  y += 32;

  doc.setFontSize(11);
  function row(label: string, value: string) {
    doc.setTextColor(120);
    doc.text(label, marginX, y);
    doc.setTextColor(20);
    doc.text(value, marginX, y + 16);
    y += 40;
  }
  row("Unterweisung", trainingName);
  row("Mitarbeiter", employeeName);
  row("Signiert am", entry.signiertAm ?? "—");
  row("Gerät", entry.geraet ?? "Nicht erfasst");

  if (entry.signaturHash) {
    doc.setTextColor(120);
    doc.text("Siegel (Prüfsumme SHA-256)", marginX, y);
    doc.setFontSize(8);
    doc.setTextColor(20);
    doc.text(entry.signaturHash, marginX, y + 14, { maxWidth: 500 });
    doc.setFontSize(11);
    y += 44;
  }

  doc.setTextColor(120);
  doc.text("Unterschrift", marginX, y);
  y += 12;
  if (entry.signaturBildUrl) {
    try {
      const dataUrl = await toDataUrl(entry.signaturBildUrl);
      doc.addImage(dataUrl, "PNG", marginX, y, 300, 130);
    } catch {
      doc.setTextColor(20);
      doc.text("(Unterschriftsbild konnte nicht geladen werden.)", marginX, y + 16);
    }
  } else {
    doc.setTextColor(20);
    doc.text("Kein Unterschriftsbild gespeichert.", marginX, y + 16);
  }

  doc.save(`nachweis-${trainingName}-${employeeName}.pdf`.replace(/\s+/g, "_"));
}
