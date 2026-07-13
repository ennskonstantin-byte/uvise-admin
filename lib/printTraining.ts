"use client";

import type { Training } from "@/lib/types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}

// Öffnet ein eigenes Druck-Fenster mit nur dem Inhalt dieser Unterweisung
// (statt der ganzen App) und startet direkt den Browser-Druckdialog — darin
// lässt sich drucken, als PDF speichern oder (browserabhängig) teilen.
export function printTraining(training: Training) {
  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(training.name)}</title>
        <style>
          body { font-family: -apple-system, Roboto, Arial, sans-serif; padding: 40px; color: #171717; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          .meta { color: #65656d; font-size: 13px; margin-bottom: 28px; }
          .content { font-size: 15px; line-height: 1.7; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>${training.icon ?? ""} ${escapeHtml(training.name)}</h1>
        <p class="meta">Läuft ab: ${escapeHtml(training.ablaufdatum)}</p>
        <div class="content">${escapeHtml(training.inhalt || "Für diese Unterweisung wurde noch kein Inhaltstext hinterlegt.")}</div>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  // Kurze Verzögerung, damit der Browser das geschriebene Dokument fertig
  // gerendert hat, bevor der Druckdialog aufgeht.
  setTimeout(() => win.print(), 250);
}
