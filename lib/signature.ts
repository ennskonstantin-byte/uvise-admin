// [H-04] Screenreader-Alternative zur Freihand-Wischgeste im SignaturePad
// (sicherakte-App): statt der gezeichneten Unterschrift wird dort eine
// getippte Namens-Bestätigung in dasselbe Feld (signatur_bild_url)
// geschrieben, mit diesem Präfix erkennbar markiert. Anzeige-Stellen hier im
// Web-Dashboard müssen den Präfix vor dem Pfad-Rendering prüfen, sonst wird
// der Text fälschlich als Bild-URL/SVG-Pfaddaten interpretiert. Duplikat von
// sicherakte/lib/signature.ts -- bewusst nicht cross-package geteilt (N-11/
// N-12-Muster), da eigenes Next.js-Paket.
export const TYPED_SIGNATURE_PREFIX = 'TYPED_CONFIRM::';

export function isTypedSignature(data: string | null | undefined): boolean {
  return !!data && data.startsWith(TYPED_SIGNATURE_PREFIX);
}

export function typedSignatureName(data: string): string {
  return data.slice(TYPED_SIGNATURE_PREFIX.length);
}
