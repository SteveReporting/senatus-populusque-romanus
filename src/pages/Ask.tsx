import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ScrollText, Send, Square, ExternalLink } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { TRELLO_CONFIG } from "@/config/trello";
import { slugify } from "@/lib/trello";

interface Source { n: number; id: string; title: string; board: string; boardId: string; list: string; url: string }

const EXAMPLES = [
  "How do I join a Legion?",
  "What does a Quaestor do?",
  "When is the next Senate session?",
  "Combat weapon keybinds",
];

const URL_FN = import.meta.env.VITE_SUPABASE_URL + "/functions/v1/ask-archives";

export default function Ask() {
  const [params] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [asked, setAsked] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const abort = useRef<AbortController | null>(null);
  const autoAsked = useRef(false);

  const ask = async (question: string) => {
    const text = question.trim();
    if (text.length < 3 || busy) return;
    setAsked(text);
    setAnswer("");
    setSources([]);
    setErr("");
    setBusy(true);
    const ctrl = new AbortController();
    abort.current = ctrl;

    try {
      const res = await fetch(URL_FN, {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: "Bearer " + import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ question: text }),
      });

      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "The Archivist could not answer right now.");
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "", got = false;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n");
        buf = parts.pop() ?? "";
        for (const line of parts) {
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          let ev: any;
          try { ev = JSON.parse(data); } catch { continue; }
          if (ev.type === "sources") setSources(ev.sources);
          else if (ev.type === "response.output_text.delta") { got = true; setAnswer((a) => a + ev.delta); }
          else if (ev.type === "error" || ev.type === "response.failed") throw new Error(ev.error?.message || ev.response?.error?.message || "The answer was interrupted.");
        }
      }

      if (!got) throw new Error("The Archivist returned no answer. Try asking differently.");
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
      abort.current = null;
    }
  };

  useEffect(() => {
    if (!autoAsked.current && initial.trim().length >= 3) {
      autoAsked.current = true;
      void ask(initial);
    }
    // Run once for the URL-supplied question.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cited = sources.filter((s) => new RegExp("\\[" + s.n + "\\]").test(answer));
  const linkFor = (s: Source) => s.boardId === TRELLO_CONFIG.informationBoardId ? "/entity/all/" + s.id + "/" + slugify(s.title) : "/development";

  return (
    <div className="container max-w-4xl py-12 md:py-16">
      <SectionHeader eyebrow="Tabularium" title="Ask the Archives" subtitle="Ask about Roman procedures, government, the legions, laws or development. The Archivist reads the official records and summarises what they say." />

      <form onSubmit={(e) => { e.preventDefault(); void ask(q); }} className="imperial-panel flex items-center gap-2 rounded-md p-2">
        <ScrollText className="ml-2 h-5 w-5 shrink-0 text-gold sm:ml-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={500}
          placeholder="Ask anything about Rome…"
          aria-label="Your question"
          className="min-w-0 flex-1 border-0 bg-transparent px-2 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {busy ? (
          <button type="button" onClick={() => abort.current?.abort()} className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-gold"><Square className="h-3.5 w-3.5" />Stop</button>
        ) : (
          <button type="submit" disabled={q.trim().length < 3} className="inline-flex items-center gap-2 rounded-sm bg-gradient-gold px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-background disabled:opacity-40"><Send className="h-3.5 w-3.5" /><span className="hidden sm:inline">Consult</span></button>
        )}
      </form>

      {!asked && (
        <div className="mt-6 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button key={example} onClick={() => { setQ(example); void ask(example); }} className="rounded-sm border border-border px-3 py-2 text-sm text-foreground/80 transition hover:border-gold/50 hover:text-gold">{example}</button>
          ))}
        </div>
      )}

      {asked && (
        <section className="mt-10">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold/80">You asked</div>
          <p className="mt-2 font-serif text-xl text-foreground">{asked}</p>
          <div className="imperial-panel mt-6 rounded-md p-6">
            {err ? <p className="text-crimson">{err}</p>
              : answer ? <p className="whitespace-pre-line leading-relaxed text-foreground/90">{answer}</p>
              : <p className="animate-pulse text-muted-foreground">The Archivist is searching the records…</p>}
          </div>

          {cited.length > 0 && (
            <div className="mt-8">
              <h3 className="eyebrow mb-3">Records consulted</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {cited.map((s) => (
                  <li key={s.id} className="imperial-panel flex items-start justify-between gap-3 rounded-md p-4">
                    <Link to={linkFor(s)} className="group min-w-0">
                      <div className="text-xs text-gold">[{s.n}] {s.board} · {s.list}</div>
                      <div className="mt-1 truncate font-serif text-foreground group-hover:text-gold">{s.title}</div>
                    </Link>
                    {s.url && <a href={s.url} target="_blank" rel="noreferrer" aria-label="Open on Trello" className="shrink-0 text-muted-foreground hover:text-gold"><ExternalLink className="h-4 w-4" /></a>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-6 text-xs text-muted-foreground">Answers are AI summaries of the official connected records and may be incomplete. Check the cited source for authoritative wording.</p>
        </section>
      )}
    </div>
  );
}
