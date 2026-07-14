// FAQ-Daten in einer eigenen, neutralen Datei (KEIN "use client"), damit sie
// sowohl von der Client-Komponente MarketingHome als auch serverseitig in
// app/page.tsx (für die strukturierten Daten / JSON-LD) genutzt werden können.
export const FAQ = [
  {
    q: "Ist uVise DSGVO-konform und rechtssicher?",
    a: "Ja. Mitarbeiterdaten werden auf Servern in der EU gespeichert, jede Unterschrift ist nach eIDAS-Grundsätzen mit Zeitstempel und Gerätekennung versehen und lässt sich nachträglich nicht mehr verändern. Details findest du in unserer Datenschutzerklärung.",
  },
  {
    q: "Brauchen meine Mitarbeiter ein Firmen-Handy?",
    a: "Nein. Die Mitarbeiter-App läuft auf dem eigenen Smartphone jedes Mitarbeiters — ein Firmen-Laptop oder -Handy ist nicht nötig.",
  },
  {
    q: "In wie vielen Sprachen können Unterweisungen vorgelesen werden?",
    a: "Jede Unterweisung kann in 41 Sprachen vorgelesen und übersetzt werden, darunter Türkisch, Ukrainisch, Arabisch und Polnisch — so verstehen auch Mitarbeiter mit wenig Deutschkenntnissen den Inhalt, bevor sie unterschreiben.",
  },
  {
    q: "Kann ich uVise jederzeit kündigen?",
    a: "Ja, im Monatsabo ist uVise jederzeit zum Ende des laufenden Monats kündbar, ohne Mindestlaufzeit. Alternativ gibt es ein Jahresabo mit 20% Rabatt.",
  },
  {
    q: "Was passiert nach der 7-tägigen Testphase?",
    a: "Du testest 7 Tage kostenlos und ohne Kreditkarte. Erst danach entscheidest du dich für ein kostenpflichtiges Paket — ohne automatische Kündigungsfalle im Hintergrund.",
  },
  {
    q: "Ersetzt uVise die gesetzliche Pflicht zur Unterweisung?",
    a: "uVise ersetzt nicht die inhaltliche Durchführung der Unterweisung, sondern digitalisiert Planung, Fristen, Nachweise und Unterschriften dafür — verpflichtend bleibt weiterhin, dass der Arbeitgeber seine Mitarbeiter nach dem Arbeitsschutzgesetz und den DGUV-Vorschriften unterweist.",
    link: { label: "Arbeitsschutzgesetz (ArbSchG) im Volltext", href: "https://www.gesetze-im-internet.de/arbschg/" },
  },
];
