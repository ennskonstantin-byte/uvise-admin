"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const BEGRUESSUNG: Msg = {
  role: "assistant",
  content: "Hallo! 👋 Ich beantworte dir gern Fragen zu uVise — z.B. wie das Unterschreiben funktioniert, was es kostet oder ob es zu deinem Betrieb passt. Was möchtest du wissen?",
};

export function ChatWidget() {
  const [offen, setOffen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([BEGRUESSUNG]);
  const [eingabe, setEingabe] = useState("");
  const [laedt, setLaedt] = useState(false);
  const endeRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (offen) endeRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, offen, laedt]);

  // Textfeld wächst mit dem Inhalt nach unten (bis max. Höhe, dann scrollt es),
  // damit man immer sieht, was man geschrieben hat.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [eingabe, offen]);

  async function abschicken() {
    const text = eingabe.trim();
    if (!text || laedt) return;
    const neu: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(neu);
    setEingabe("");
    setLaedt(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: neu.filter((m) => m !== BEGRUESSUNG) }),
      });
      const json = await res.json();
      setMessages([...neu, { role: "assistant", content: json.antwort ?? json.error ?? "Etwas ist schiefgelaufen." }]);
    } catch {
      setMessages([...neu, { role: "assistant", content: "Verbindung fehlgeschlagen. Bitte gleich nochmal versuchen." }]);
    } finally {
      setLaedt(false);
    }
  }

  function senden(e: React.FormEvent) {
    e.preventDefault();
    abschicken();
  }

  return (
    <>
      {/* Schwebender Öffnen-Knopf */}
      {!offen && (
        <button
          onClick={() => setOffen(true)}
          aria-label="Chat öffnen"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-sky-400 px-5 py-3.5 text-white shadow-lg hover:scale-105 transition-transform"
        >
          <MessageCircle size={20} />
          <span className="text-sm font-semibold hidden sm:inline">Fragen? Chat</span>
        </button>
      )}

      {/* Chat-Fenster */}
      {offen && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col w-[min(92vw,380px)] h-[min(70vh,560px)] rounded-3xl border border-border bg-background shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-sky-400 text-white shrink-0">
            <MessageCircle size={18} />
            <span className="font-semibold text-sm flex-1">uVise-Assistent</span>
            <button onClick={() => setOffen(false)} aria-label="Chat schließen" className="p-1 rounded-full hover:bg-white/20">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "self-end bg-blue-600 text-white rounded-br-sm"
                    : "self-start bg-surface border border-border rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            ))}
            {laedt && (
              <div className="self-start bg-surface border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-foreground/50">
                schreibt…
              </div>
            )}
            <div ref={endeRef} />
          </div>

          <form onSubmit={senden} className="flex items-end gap-2 border-t border-border p-3 shrink-0">
            <textarea
              ref={textareaRef}
              value={eingabe}
              onChange={(e) => setEingabe(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  abschicken();
                }
              }}
              placeholder="Deine Frage…"
              maxLength={1500}
              rows={1}
              className="flex-1 resize-none max-h-[140px] overflow-y-auto rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <button
              type="submit"
              disabled={laedt || !eingabe.trim()}
              aria-label="Senden"
              className="rounded-full bg-blue-600 p-2.5 text-white disabled:opacity-50 shrink-0"
            >
              <Send size={17} />
            </button>
          </form>
          <p className="text-[10px] text-foreground/40 text-center pb-2 px-4">
            KI-Assistent — Angaben ohne Gewähr. Kein Chatverlauf wird gespeichert.
          </p>
        </div>
      )}
    </>
  );
}
