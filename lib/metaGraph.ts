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
  // Echten Grund von Facebook merken — sonst steht man bei Fehlern im Dunkeln
  // und muss raten, ob der Token abgelaufen, ungültig oder nur Meta kurz weg ist.
  let metaGrund = "";
  try {
    const accRes = await fetch(
      `${GRAPH}/me/accounts?fields=id,access_token&access_token=${encodeURIComponent(storedToken)}`,
    );
    const accJson = (await accRes.json()) as {
      data?: { id?: string; access_token?: string }[];
      error?: { message?: string; type?: string; code?: number };
    };
    if (accRes.ok && Array.isArray(accJson.data) && accJson.data.length) {
      const treffer = accJson.data.find((p) => p.id === wunschPageId) || accJson.data[0];
      if (treffer?.id && treffer?.access_token) {
        pageId = treffer.id;
        pageToken = treffer.access_token;
      } else {
        metaGrund = "Der Zugang listet keine Facebook-Seite (fehlende Seiten-Berechtigung?).";
      }
    } else if (accJson.error?.message) {
      metaGrund = `${accJson.error.message}${accJson.error.code ? ` (Code ${accJson.error.code})` : ""}`;
    } else if (accRes.ok) {
      metaGrund = "Der Zugang gehört zu keiner Facebook-Seite.";
    }
  } catch {
    metaGrund = "Facebook war nicht erreichbar (Netzwerkfehler).";
  }
  if (!pageId) {
    try {
      const meRes = await fetch(`${GRAPH}/me?fields=id&access_token=${encodeURIComponent(pageToken)}`);
      const meJson = (await meRes.json()) as { id?: string; error?: { message?: string; code?: number } };
      if (meRes.ok && meJson.id) pageId = meJson.id;
      else if (meJson.error?.message && !metaGrund) {
        metaGrund = `${meJson.error.message}${meJson.error.code ? ` (Code ${meJson.error.code})` : ""}`;
      }
    } catch {
      if (!metaGrund) metaGrund = "Facebook war nicht erreichbar (Netzwerkfehler).";
    }
  }
  if (!pageId) {
    return {
      fehler: metaGrund
        ? `Facebook meldet: „${metaGrund}" — bitte den Zugriffstoken erneuern.`
        : "Die Facebook-Seite konnte nicht bestimmt werden. Bitte den Zugriffstoken erneuern.",
      status: 502,
    };
  }
  return { pageId, pageToken };
}

// Ermittelt die mit der Facebook-Seite verbundene Instagram-Business-Konto-Nummer.
// Gibt null zurück, wenn (noch) kein Instagram-Konto verknüpft ist oder die
// Berechtigung (instagram_basic) fehlt. Bricht das Facebook-Posten NIE ab.
export async function resolveInstagramAccountId(pageId: string, pageToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${GRAPH}/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(pageToken)}`,
    );
    const json = (await res.json()) as { instagram_business_account?: { id?: string } };
    return json?.instagram_business_account?.id ?? null;
  } catch {
    return null;
  }
}

// Veröffentlicht EIN Bild mit Text auf Instagram (Graph API, zweistufig:
// erst Medien-Container anlegen, dann veröffentlichen).
// Instagram verlangt IMMER ein Bild — reine Text-Beiträge sind nicht möglich.
export async function postToInstagram(
  igUserId: string,
  token: string,
  text: string,
  bildUrl: string,
): Promise<{ ok: true; id: string } | { ok: false; fehler: string }> {
  try {
    // Schritt 1: Medien-Container mit Bild + Beschriftung anlegen.
    const createParams = new URLSearchParams({ access_token: token, image_url: bildUrl, caption: text });
    const createRes = await fetch(`${GRAPH}/${igUserId}/media`, { method: "POST", body: createParams });
    const createJson = (await createRes.json()) as { id?: string; error?: { message?: string } };
    if (!createRes.ok || createJson.error || !createJson.id) {
      return { ok: false, fehler: createJson.error?.message || "Instagram hat das Bild abgelehnt." };
    }
    // Schritt 2: den Container tatsächlich veröffentlichen.
    const pubParams = new URLSearchParams({ access_token: token, creation_id: createJson.id });
    const pubRes = await fetch(`${GRAPH}/${igUserId}/media_publish`, { method: "POST", body: pubParams });
    const pubJson = (await pubRes.json()) as { id?: string; error?: { message?: string } };
    if (!pubRes.ok || pubJson.error || !pubJson.id) {
      return { ok: false, fehler: pubJson.error?.message || "Instagram konnte nicht veröffentlichen." };
    }
    return { ok: true, id: pubJson.id };
  } catch {
    return { ok: false, fehler: "Verbindung zu Instagram fehlgeschlagen." };
  }
}
