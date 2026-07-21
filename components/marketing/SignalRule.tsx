// Die Ampel-Leiste — durchgehendes Signatur-Element der Landingpage.
// Ersetzt generische Trennlinien zwischen Abschnitten durch die drei
// echten Ampel-Farben (rot/gelb/grün) des Ampel-System-Features und
// macht das Kernfeature der App zum strukturellen Gestaltungsmittel
// statt nur zu einem Icon in einer Karte.
export function SignalRule({ animate = false }: { animate?: boolean }) {
  return (
    <div className={`mk-rule${animate ? " mk-rule-animate" : ""}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}
