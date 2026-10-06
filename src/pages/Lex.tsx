import { useMemo, useState } from "react";
import { Copy, Search, Scale } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG } from "@/config/trello";

const bookFor = (text: string) => {
  const s = text.toLowerCase();
  if (/military|legion|desert|insubordin|discipline/.test(s)) return "Book III · Military Discipline";
  if (/senate|magistr|consul|praetor|assembly|vot/.test(s)) return "Book IV · Senate & Magistracy";
  if (/treason|riot|crime|criminal|public order|majest/.test(s)) return "Book II · Public Order";
  return "Book I · Civil Law & Property";
};

export default function Lex() {
  const [q, setQ] = useState("");
  const info = useTrelloBoard(TRELLO_CONFIG.informationBoardId);
  const records = useMemo(() => {
    if (!info.data) return [];
    const listNames = new Map(info.data.lists.map((l) => [l.id, l.name]));
    return info.data.cards
      .filter((c) => {
        const hay = (c.name + " " + c.desc + " " + (listNames.get(c.idList) || "")).toLowerCase();
        return /lex|law|legal|judic|court|statute|crime|senate|military discipline/.test(hay);
      })
      .map((c, i) => ({ c, book: bookFor(c.name + " " + c.desc), article: "Art. " + (i + 1) }));
  }, [info.data]);

  const shown = records.filter((r) => (r.c.name + " " + r.c.desc + " " + r.book).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container py-10 md:py-14">
      <SectionHeader eyebrow="Lex Romana" title="Law Codex" subtitle="Search the official information board for Roman laws, judicial rules and institutional records, then copy a courtroom-ready citation."/>
      <div className="imperial-panel mb-8 flex items-center gap-3 rounded-lg px-4">
        <Search className="h-4 w-4 text-gold"/>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search law, offence, office or keyword…" className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"/>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {shown.map(({ c, book, article }) => (
          <article key={c.id} className="group relative overflow-hidden rounded-xl border border-gold/20 bg-[linear-gradient(145deg,hsl(var(--surface-2)),hsl(var(--background)))] p-5">
            <Scale className="absolute right-4 top-4 h-12 w-12 text-gold/10"/>
            <div className="eyebrow">{book}</div>
            <div className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-soft">{article}</div>
            <h2 className="mt-1 pr-10 font-serif text-xl font-bold text-foreground">{c.name}</h2>
            <p className="mt-3 line-clamp-5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{c.desc || "No description has been published in the source record."}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => navigator.clipboard.writeText(article + " — " + c.name)} className="inline-flex items-center gap-2 rounded-md border border-gold/35 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold/10">
                <Copy className="h-3.5 w-3.5"/>Copy for Court
              </button>
              {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">Original record ↗</a>}
            </div>
          </article>
        ))}
      </div>
      {!info.isLoading && shown.length === 0 && <div className="rounded-xl border border-border bg-surface-2 p-8 text-center text-muted-foreground">No codex records matched this search. This view only exposes law-related records actually present in the official board.</div>}
    </div>
  );
}
