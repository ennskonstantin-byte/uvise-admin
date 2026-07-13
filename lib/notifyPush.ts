// Ruft die eigene Push-Route auf. Läuft bewusst "fire and forget" — schlägt
// der Versand fehl (z.B. kein Empfänger hat einen Push-Token), soll das die
// eigentliche Aktion (Zuweisen, Antworten) nicht blockieren oder anzeigen.
export async function notifyPush(accessToken: string, employeeIds: string[], title: string, body: string) {
  try {
    await fetch("/api/notify-push", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ employeeIds, title, body }),
    });
  } catch {
    // still — Push ist ein Zusatz, kein Pflichtfeature.
  }
}
