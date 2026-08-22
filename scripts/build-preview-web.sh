#!/bin/bash
# [v3, 18.08.26] Baut den zugangsdatenfreien Vorschau-Export des
# authentifizierten Web-Dashboards (public/preview-web/) neu.
#
# Sicherheit: NEXT_PUBLIC_DEMO_MODE=true schaltet das Login-Gate ab und
# ersetzt echte Daten durch Beispieldaten (lib/demoFixtures.ts). Ein
# Produktions-Build damit schlaegt absichtlich fehl (lib/demoMode.ts,
# assertDemoModeNotInProductionBuild) — NUR dieses Skript setzt zusaetzlich
# UVISE_ALLOW_DEMO_BUILD=1 und kennzeichnet den Build damit ausdruecklich
# als Vorschau-Export. Es wird in eine isolierte Kopie gebaut, damit der
# Arbeitsstand (und ein evtl. laufender Dev-Server) unberuehrt bleibt.
#
# [v4 — P2-3, 18.08.26] WARNUNG: "$BUILD" (die isolierte Kopie samt .next)
# ist ein VOLLSTAENDIGER Next-App-Klon, dessen Client-Bundle DEMO_MODE=true
# fest eingebacken hat (NEXT_PUBLIC_*-Variablen werden beim `next build`
# statisch in den JS-Code kompiliert, nicht erst beim Start gelesen). Die
# Build-Sperre (assertDemoModeNotInProductionBuild) verhindert nur NEUE
# Produktions-Builds mit gesetztem DEMO_MODE -- sie wirkt NICHT rueckwirkend
# auf einen bereits fertig gebauten Ordner: wuerde jemand "$BUILD/.next"
# spaeter per `next start` bedienen oder in einen echten Deploy-Pfad
# kopieren, liefe die komplette Seite dauerhaft im Demo-/Kein-Login-Modus,
# ohne dass diese Sperre das zur Laufzeit noch erkennen koennte. Deshalb:
# (a) Markerdatei sofort nach dem Anlegen der Kopie, (b) `trap`, damit
# "$BUILD" auch bei einem fehlgeschlagenen `next build` garantiert geloescht
# wird und nicht als Leiche im Arbeitsverzeichnis liegen bleibt.
#
# "$BUILD" IST KEIN DEPLOY-ARTEFAKT. Es wird ausschliesslich benutzt, um
# die 6 statischen HTML-Seiten + _next/static nach public/preview-web/ zu
# kopieren (unten), und danach vollstaendig geloescht.
set -e
ADMIN="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="$ADMIN/../.tmp-preview-web-build"

rm -rf "$BUILD"
mkdir -p "$BUILD"
trap 'rm -rf "$BUILD"' EXIT
cat > "$BUILD/NIEMALS-DEPLOYEN.txt" <<'EOF'
NIEMALS DEPLOYEN / NIEMALS PER "next start" BEDIENEN.

Dieser Ordner ist eine WEGWERF-Zwischenkopie von build-preview-web.sh, mit
NEXT_PUBLIC_DEMO_MODE=true gebaut. Sobald .next hier existiert, hat das
Client-Bundle das Demo-/Kein-Login-Verhalten FEST eingebacken (Next.js
kompiliert NEXT_PUBLIC_*-Variablen beim Build statisch in den JS-Code --
das laesst sich nicht mehr per Umgebungsvariable zur Laufzeit abschalten).

Falls dieser Ordner nach einem abgebrochenen Build noch existiert:
einfach loeschen. Er wird von build-preview-web.sh normalerweise
automatisch entfernt (trap). Niemals als Deploy-Quelle verwenden, niemals
`next start` darin ausfuehren, niemals sein .next-Ordner in einen echten
Deploy-Pfad kopieren.
EOF
rsync -a --exclude node_modules --exclude .next --exclude .git "$ADMIN/" "$BUILD/"
ln -s "$ADMIN/node_modules" "$BUILD/node_modules"

# assetPrefix, damit der Export unter /preview-web/ serviert werden kann
node -e "
  const fs = require('fs');
  const p = '$BUILD/next.config.ts';
  let t = fs.readFileSync(p, 'utf8');
  t = t.replace('const nextConfig: NextConfig = {', 'const nextConfig: NextConfig = {\n  assetPrefix: \"/preview-web\",');
  fs.writeFileSync(p, t);
"

cd "$BUILD"
# --webpack: Turbopack lehnt den node_modules-Symlink der isolierten Kopie ab
UVISE_ALLOW_DEMO_BUILD=1 NEXT_PUBLIC_DEMO_MODE=true npx next build --webpack

OUT="$ADMIN/public/preview-web"
rm -rf "$OUT"
mkdir -p "$OUT/_next"
cp -R "$BUILD/.next/static" "$OUT/_next/static"
for p in dashboard mitarbeiter unterweisungen qualifikationen rueckfragen archiv; do
  cp "$BUILD/.next/server/app/$p.html" "$OUT/$p.html"
done
cp "$OUT/dashboard.html" "$OUT/index.html"

echo "preview-web fertig: $OUT"
