import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { resend, RESEND_FROM } from "@/lib/resend";
import { CONTACT_EMAIL } from "@/lib/legal";

// Öffentlicher Chat-Assistent für die Landingpage, betrieben mit Claude
// (Anthropic). Es werden nur die eingegebenen Chat-Texte an Anthropic
// übermittelt (keine Konto- oder Mitarbeiterdaten), nichts wird gespeichert.
// Ohne ANTHROPIC_API_KEY antwortet die Route mit einem freundlichen Hinweis
// statt eines Fehlers.
//
// Zusätzlich kann der Assistent ein Support-Ticket aufnehmen: Wenn ein
// Besucher eine Nachricht hinterlassen will, sammelt der Bot Name, E-Mail und
// Anliegen ein und ruft das Werkzeug "ticket_aufnehmen" auf. Die Route
// verschickt das Ticket dann per Resend an CONTACT_EMAIL.

const SYSTEM_PROMPT = `Du bist der freundliche Chat-Assistent auf der Website von uVise (uvise.de).
Du kennst das Produkt in- und auswendig und beantwortest Fragen von Website-Besuchern.

# Was ist uVise?
uVise ist eine deutsche Software, mit der kleine und mittlere Betriebe die
Arbeitsschutz-Unterweisungen und Qualifikationen ihrer Mitarbeiter digital
verwalten, statt mit Papier und Excel. Zielgruppe: Chefs/Inhaber kleiner Betriebe
(Handwerk, Produktion, Gastronomie, Lager, Bau/Montage), typischerweise 5-30
Mitarbeiter, die wenig Zeit für Bürokratie haben. Daten liegen auf Servern in der
EU (Region Irland), DSGVO-konform.

# Die vier Oberflächen (alle greifen auf dieselbe Datenbank zu, getrennt nach Rolle)
1. **Marketing-Website (uvise.de)** – öffentliche Startseite mit Live-Demo, Preisen, FAQ, Kontakt.
2. **Chef-Website (Web-Dashboard)** – der Chef/Beauftragte verwaltet hier am Computer alles: Mitarbeiter, Unterweisungen, Qualifikationen, Rückfragen, Archiv, Einstellungen, Abo.
3. **Chef-App (Handy-App für Beauftragte)** – dasselbe wie das Web-Dashboard, nur fürs Handy, mit ☰-Menü.
4. **Mitarbeiter-App (Handy-App für normale Mitarbeiter)** – der Mitarbeiter sieht nur seine eigenen Unterweisungen, liest sie und unterschreibt digital.

Ein Konto kann entweder Chef (Beauftragter) oder normaler Mitarbeiter sein. Meldet
man sich in der falschen App/Ansicht an, erscheint ein freundlicher Hinweis.

# Wichtigste Funktionen
- **Unterweisungen erstellen und zuweisen**: Der Chef erstellt eine Unterweisung (Titel, Inhalt, optional Ablaufdatum) oder nutzt Vorlagen/Bundles, und weist sie einzelnen Mitarbeitern oder Kategorien zu.
- **Digital unterschreiben**: Der Mitarbeiter bekommt die Unterweisung aufs Handy, liest sie und unterschreibt mit dem Finger. Die Unterschrift ist mit Server-Zeitstempel und Gerätekennung fälschungssicher dokumentiert und lässt sich nachträglich NICHT mehr ändern (Nachweis-Sicherheit).
- **Ampelsystem**: Zeigt auf einen Blick, was aktuell (grün), bald fällig (gelb) oder überfällig (rot) ist – für Unterweisungen und Qualifikationen.
- **Automatische Erinnerungen**: E-Mail-Erinnerungen an die Beauftragten (wöchentlich, wenn etwas ansteht) und Push-Benachrichtigungen aufs Handy (neue Unterweisung, Rückfrage/Antwort, ablaufende Qualifikation).
- **Vorlesen & Übersetzen**: In der Mitarbeiter-App können Unterweisungen vorgelesen und übersetzt werden – hilft Mitarbeitern, die schlecht Deutsch lesen.
- **Qualifikationen verwalten**: Nachweise wie Ersthelfer, Staplerschein etc. mit Ablaufdatum; das Ampelsystem warnt vor Ablauf.
- **Rückfragen**: Mitarbeiter können zu einer Unterweisung eine Frage stellen; der Chef beantwortet sie – wie ein kleiner Chat, in Echtzeit.
- **Archiv & Export**: Nachweise und Qualifikationen als CSV/Excel oder PDF exportieren – z.B. für Prüfungen durch die Berufsgenossenschaft.
- **Mitarbeiter einladen**: per Einladungscode; Mitarbeiter ohne Smartphone können auch nur mit Telefonnummer geführt werden.

# Preise (7 Tage kostenlos testen, monatlich kündbar, keine Mindestlaufzeit)
- **Starter**: 19 €/Monat, bis 5 Mitarbeiter – Unterweisungen & Fristen, Ampelsystem & Badges, E-Mail-Erinnerungen.
- **Team**: 29 €/Monat, bis 15 Mitarbeiter – alles aus Starter + Bundle-Vorlagen + App-Push-Erinnerungen.
- **Betrieb**: 49 €/Monat, bis 30 Mitarbeiter – alles aus Team + priorisierter Support + erweitertes Archiv.
- Bei jährlicher Zahlung 20 % günstiger (Starter 182 €, Team 278 €, Betrieb 470 € pro Jahr).
- Bezahlung sicher über Stripe (Karte, Apple Pay, Google Pay, Lastschrift, PayPal, Klarna) – Kartendaten werden nie bei uVise gespeichert.

# Support-Ticket aufnehmen (Werkzeug "ticket_aufnehmen")
Du kannst für den Besucher eine Nachricht an das uVise-Team hinterlassen. Nutze das
Werkzeug "ticket_aufnehmen", wenn der Besucher:
- ausdrücklich Kontakt aufnehmen, eine Nachricht hinterlassen oder ein Ticket erstellen möchte,
- ein konkretes Problem/Anliegen hat, das du im Chat nicht abschließend lösen kannst,
- ein individuelles Angebot, eine Rückrufbitte oder eine persönliche Beratung wünscht.
Frage vor dem Aufruf freundlich nach den fehlenden Angaben: **Name**, **E-Mail** und
das **Anliegen**. Rufe das Werkzeug erst auf, wenn du alle drei hast. Bestätige dem
Besucher danach kurz, dass die Nachricht beim Team angekommen ist und sich jemand
per E-Mail meldet. Erfinde niemals Name oder E-Mail – die müssen vom Besucher kommen.

# Feedback melden (Werkzeug "feedback_melden")
Rufe zusätzlich das Werkzeug "feedback_melden" auf, sobald der Besucher eine
Meinung zum Produkt äußert — Lob, Kritik, einen Verbesserungs- oder Funktionswunsch
oder einen Hinweis auf ein Problem/einen Fehler. Das läuft im Hintergrund fürs
uVise-Team; sprich es dem Besucher gegenüber nicht groß an, antworte einfach
normal und freundlich weiter. Nutze es NICHT für reine Sachfragen (Preis, wie
funktioniert X), sondern nur, wenn wirklich eine Bewertung, ein Wunsch oder eine
Beschwerde dabei ist. Du kannst es zusammen mit einer normalen Antwort aufrufen.

# Regeln für deine Antworten
- Antworte kurz, freundlich, auf Deutsch, per "du". Meistens 2-5 Sätze.
- Schreibe reinen Fließtext OHNE Markdown-Formatierung: KEINE Sternchen (** oder *), KEINE Rauten (#), KEINE Aufzählungszeichen wie "-" oder "*" am Zeilenanfang. Wenn du etwas aufzählst, nutze normale kurze Sätze oder eine Nummerierung wie "1)", "2)". Hebe Wörter durch die Wortwahl hervor, nie durch Sternchen – der Chat zeigt Sternchen sonst als sichtbare Zeichen an.
- Antworte NUR mit deiner finalen Antwort an den Besucher – kein lautes Nachdenken, keine Meta-Kommentare.
- Bleib beim Thema uVise und Arbeitsschutz-Unterweisungen. Bei völlig fremden Fragen freundlich zurückführen.
- Erfinde keine Funktionen, Zahlen oder Kundenstimmen. Wenn du etwas nicht sicher weißt, sag das ehrlich und biete an, ein Ticket aufzunehmen oder verweise auf das Kontaktformular (uvise.de/kontakt).
- Mach keine rechtsverbindlichen Aussagen zu konkreten Arbeitsschutzpflichten – verweise dafür freundlich auf eigene Prüfung oder Fachberatung.
- Wenn jemand kaufen/testen will: freu dich und weise auf "7 Tage kostenlos testen" oben auf der Seite hin.`;

type Msg = { role: "user" | "assistant"; content: string };

// Werkzeug, mit dem der Assistent ein Support-Ticket an das Team schicken kann.
const TICKET_TOOL: Anthropic.Tool = {
  name: "ticket_aufnehmen",
  description:
    "Nimm eine Nachricht / ein Support-Ticket des Website-Besuchers auf und sende es " +
    "an das uVise-Team. Nur aufrufen, wenn Name, E-Mail und Anliegen des Besuchers " +
    "vorliegen (vorher im Chat erfragen). Erfinde keine Werte.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Name des Besuchers" },
      email: {
        type: "string",
        description: "E-Mail-Adresse des Besuchers, damit das Team antworten kann",
      },
      anliegen: {
        type: "string",
        description: "Das Anliegen bzw. die Nachricht des Besuchers, möglichst konkret",
      },
    },
    required: ["name", "email", "anliegen"],
  },
};

// Werkzeug, mit dem der Assistent Produkt-Feedback fürs Team festhält.
const FEEDBACK_TOOL: Anthropic.Tool = {
  name: "feedback_melden",
  description:
    "Halte Produkt-Feedback des Besuchers für das uVise-Team fest (Lob, Kritik, " +
    "Wunsch, Problem/Fehler). Nur bei echter Bewertung/Wunsch/Beschwerde aufrufen, " +
    "nicht bei reinen Sachfragen.",
  input_schema: {
    type: "object",
    properties: {
      kategorie: {
        type: "string",
        enum: ["lob", "kritik", "wunsch", "problem", "sonstiges"],
        description: "Art des Feedbacks",
      },
      zusammenfassung: {
        type: "string",
        description: "Kurze, sachliche Zusammenfassung des Feedbacks in einem Satz (Deutsch)",
      },
      original: {
        type: "string",
        description: "Der ursprüngliche Wortlaut des Besuchers, so wie er es geschrieben hat",
      },
    },
    required: ["kategorie", "zusammenfassung"],
  },
};

// Speichert ein Feedback in der Datenbank (service_role, serverseitig).
async function speichereFeedback(input: unknown): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return false;
  const d = (input ?? {}) as { kategorie?: unknown; zusammenfassung?: unknown; original?: unknown };
  const erlaubt = ["lob", "kritik", "wunsch", "problem", "sonstiges"];
  const kategorie = typeof d.kategorie === "string" && erlaubt.includes(d.kategorie) ? d.kategorie : "sonstiges";
  const zusammenfassung = typeof d.zusammenfassung === "string" ? d.zusammenfassung.trim().slice(0, 500) : "";
  const original = typeof d.original === "string" ? d.original.trim().slice(0, 1500) : null;
  if (!zusammenfassung) return false;
  try {
    const db = createClient(url, serviceKey);
    const { error } = await db.from("chat_feedback").insert({ kategorie, zusammenfassung, original });
    return !error;
  } catch {
    return false;
  }
}

// Verschickt ein aufgenommenes Ticket per E-Mail an die Kontakt-Adresse.
// Gibt true zurück, wenn der Versand geklappt hat.
async function sendeTicket(input: unknown): Promise<boolean> {
  const daten = (input ?? {}) as { name?: unknown; email?: unknown; anliegen?: unknown };
  const name = typeof daten.name === "string" ? daten.name.trim().slice(0, 200) : "";
  const email = typeof daten.email === "string" ? daten.email.trim().slice(0, 200) : "";
  const anliegen =
    typeof daten.anliegen === "string" ? daten.anliegen.trim().slice(0, 5000) : "";

  if (!name || !email || !email.includes("@") || !anliegen) return false;

  const esc = (s: string) => s.replace(/</g, "&lt;");
  try {
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `uVise Chatbot-Ticket von ${name}`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 560px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;"><tr>
            <td><img src="https://www.uvise.de/logo-mark.png" width="36" height="36" alt="uVise" style="border-radius:8px; display:block;" /></td>
            <td style="padding-left:10px; font-size:20px; font-weight:700; color:#2563eb;">Neues Ticket aus dem Chatbot</td>
          </tr></table>
          <p><strong>Name:</strong> ${esc(name)}</p>
          <p><strong>E-Mail:</strong> ${esc(email)}</p>
          <p style="white-space:pre-wrap; border-left:3px solid #2563eb; padding-left:12px; margin-top:16px;">${esc(anliegen)}</p>
          <p style="color:#71717a; font-size:12px; margin-top:24px;">Diese Nachricht wurde vom Chat-Assistenten auf uvise.de aufgenommen. Antworte einfach auf diese E-Mail, um dem Besucher zu antworten.</p>
        </div>
      `,
    });
    return !error;
  } catch {
    return false;
  }
}

function textAusAntwort(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  let messages: Msg[] = [];
  try {
    const body = await request.json();
    if (Array.isArray(body.messages)) messages = body.messages;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  // Missbrauchsschutz: Länge und Anzahl begrenzen (öffentliche, kostenpflichtige API).
  const sauber: Msg[] = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));

  if (sauber.length === 0 || sauber[sauber.length - 1].role !== "user") {
    return NextResponse.json({ error: "Keine Frage erhalten." }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({
      antwort:
        "Der Chat-Assistent ist noch nicht aktiv. Schreib uns gern direkt über das Kontaktformular auf uvise.de/kontakt — wir helfen dir schnell weiter!",
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const verlauf: Anthropic.MessageParam[] = sauber.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const ersteAntwort = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [TICKET_TOOL, FEEDBACK_TOOL],
      messages: verlauf,
    });

    let antwort: string;

    if (ersteAntwort.stop_reason === "tool_use") {
      // Der Assistent möchte ein Ticket aufnehmen — Werkzeug(e) ausführen.
      const toolErgebnisse: Anthropic.ToolResultBlockParam[] = [];
      for (const block of ersteAntwort.content) {
        if (block.type === "tool_use" && block.name === "ticket_aufnehmen") {
          const ok = await sendeTicket(block.input);
          toolErgebnisse.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: ok
              ? "Das Ticket wurde erfolgreich per E-Mail an das uVise-Team gesendet."
              : "Das Ticket konnte nicht gesendet werden. Bitte den Besucher freundlich auf das Kontaktformular uvise.de/kontakt hinweisen.",
            is_error: !ok,
          });
        } else if (block.type === "tool_use" && block.name === "feedback_melden") {
          const ok = await speichereFeedback(block.input);
          toolErgebnisse.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: ok ? "Feedback wurde für das Team festgehalten." : "Feedback konnte nicht gespeichert werden.",
            is_error: !ok,
          });
        }
      }

      const zweiteAntwort = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: [TICKET_TOOL, FEEDBACK_TOOL],
        messages: [
          ...verlauf,
          { role: "assistant", content: ersteAntwort.content },
          { role: "user", content: toolErgebnisse },
        ],
      });

      antwort = textAusAntwort(zweiteAntwort);
    } else {
      antwort = textAusAntwort(ersteAntwort);
    }

    return NextResponse.json({
      antwort: antwort || "Das habe ich nicht ganz verstanden — magst du es anders formulieren?",
    });
  } catch {
    return NextResponse.json({
      antwort:
        "Da ist gerade etwas schiefgelaufen. Versuch es bitte gleich nochmal — oder schreib uns über uvise.de/kontakt.",
    });
  }
}
