"use client";

import { jsPDF } from "jspdf";
import type { EmployeeTraining } from "@/lib/types";
import { isTypedSignature, typedSignatureName } from "@/lib/signature";

// [H-04-Nachtrag] signatur_bild_url speichert rohe SVG-Path-Daten
// (M10,20 L15,25 …), keine Bild-URL/data-URI -- ein fetch() darauf schlug
// immer fehl (die Unterschrift fehlte im Export bisher lautlos, Fallback-
// Text "konnte nicht geladen werden"). Zeichnet den Pfad stattdessen direkt
// auf einen Offscreen-Canvas und liest ihn als PNG-Data-URL aus.
function signaturePathToDataUrl(pathData: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#14161b";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke(new Path2D(pathData));
  return canvas.toDataURL("image/png");
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
  if (entry.signiertAls && entry.signiertAls !== employeeName) {
    row("Damals signiert als", entry.signiertAls);
  }
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
  if (!entry.signaturBildUrl) {
    doc.setTextColor(20);
    doc.text("Kein Unterschriftsbild gespeichert.", marginX, y + 16);
  } else if (isTypedSignature(entry.signaturBildUrl)) {
    doc.setFontSize(16);
    doc.setTextColor(20);
    doc.text(`„${typedSignatureName(entry.signaturBildUrl)}"`, marginX, y + 20);
    doc.setFontSize(11);
  } else {
    try {
      const dataUrl = signaturePathToDataUrl(entry.signaturBildUrl);
      doc.addImage(dataUrl, "PNG", marginX, y, 300, 130);
    } catch {
      doc.setTextColor(20);
      doc.text("(Unterschriftsbild konnte nicht geladen werden.)", marginX, y + 16);
    }
  }

  doc.save(`nachweis-${trainingName}-${employeeName}.pdf`.replace(/\s+/g, "_"));
}
