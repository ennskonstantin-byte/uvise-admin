// Baut die Fehlermeldung für Formulare/Dialoge -- IMMER aus dem echten
// Server-/Datenbank-Fehler.
//
// Vorgeschichte (Gerätetest 28.07.2026): An 17 Stellen in beiden Apps stand
// im catch-Block der geratene Text "Bist du als Beauftragte/r eingeloggt?".
// Der war fast immer falsch (der Chef WAR eingeloggt und hatte alle Rechte)
// und verschleierte wochenlang die tatsächliche Ursache -- ein Konflikt-
// Fehlalarm des Optimistic Locking. Deshalb gilt ab jetzt ausnahmslos:
// kein geratener Text, immer die echte Meldung zeigen.
export function fehlerText(err: unknown, aktion: string): string {
  const roh =
    err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  const detail = roh.trim();
  return detail
    ? `${aktion} fehlgeschlagen: ${detail}`
    : `${aktion} fehlgeschlagen (der Server hat keinen Fehlertext geliefert).`;
}
