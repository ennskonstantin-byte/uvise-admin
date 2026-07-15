// Gemeinsame Helfer für die Meta Graph API (Facebook-Seite der uVise-Marke).
// META_PAGE_ACCESS_TOKEN darf ein langlebiger NUTZER-Token sein: dann liefert
// /me/accounts den (nicht ablaufenden) Seiten-Token. Ist bereits ein
// Seiten-Token gespeichert, greift der /me-Rückfall.

export const GRAPH = "https://graph.facebook.com/v21.0";

export type PageAuth = { pageId: string; pageToken: string };

export async function resolvePageAuth(): Promise<PageAuth | { fehler: string; status: number }> {
  const storedToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!storedToken) {
    return {
      fehler:
        "Der Facebook-Zugang ist noch nicht eingerichtet. Bitte den Zugriffstoken als META_PAGE_ACCESS_TOKEN bei Vercel eintragen und neu deployen.",
      status: 503,
    };
  }

  const wunschPageId = process.env.META_PAGE_ID || "1248245941695462";
  let pageId = "";
  let pageToken = storedToken;
  try {
    const accRes = await fetch(
      `${GRAPH}/me/accounts?fields=id,access_token&access_token=${encodeURIComponent(storedToken)}`,
    );
    const accJson = (await accRes.json()) as { data?: { id?: string; access_token?: string }[] };
    if (accRes.ok && Array.isArray(accJson.data) && accJson.data.length) {
      const treffer = accJson.data.find((p) => p.id === wunschPageId) || accJson.data[0];
      if (treffer?.id && treffer?.access_token) {
        pageId = treffer.id;
        pageToken = treffer.access_token;
      }
    }
  } catch {
    // Netzfehler ignorieren — unten folgt der /me-Rückfall.
  }
  if (!pageId) {
    try {
      const meRes = await fetch(`${GRAPH}/me?fields=id&access_token=${encodeURIComponent(pageToken)}`);
      const meJson = (await meRes.json()) as { id?: string };
      if (meRes.ok && meJson.id) pageId = meJson.id;
    } catch {
      // ignorieren — Prüfung folgt.
    }
  }
  if (!pageId) {
    return {
      fehler: "Die Facebook-Seite konnte nicht bestimmt werden. Bitte den Zugriffstoken erneuern.",
      status: 502,
    };
  }
  return { pageId, pageToken };
}
