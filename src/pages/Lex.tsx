import { useMemo, useState } from "react";
import { Check, Copy, Search, Scale } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG } from "@/config/trello";
import { JURISDICTIONS, courtCitation, lawRecords } from "@/lib/communityRecords";

export default function Lex() {
  const [q, setQ] = useState("");
  const [jur, setJur] = useState<string>("All");
  const [copied, setCopied] = useState<string | null>(null);
  const info = useTrelloBoard(TRELLO_CONFIG.informationBoardId);
  const records = useMemo(() => (info.data ? lawRecords(info.data) : []), [info.data]);
  const shown = records.filter((r) => (jur === "All" || r.jurisdiction === jur) && `${r.card.name} ${r.card.desc} ${r.branch}`.toLowerCase().includes(q.toLowerCase()));

  const copy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="container py-10 md:py-14">
      <SectionHeader eyebrow="Lex Romana" title="Law Codex" subtitle="Search official law records by jurisdiction and copy a source-backed citation for court." />
      <div className="imperial-panel mb-4 flex items-center gap-3 rounded-lg px-4">
        <Search className="h-4 w-4 text-gold" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search law, offence, office or keyword…" className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {["All", ...JURISDICTIONS].map((j) => (
          <button key={j} onClick={() => setJur(j)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${jur === j ? "border-gold bg-gold/15 text-gold" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {j} <span className="opacity-60">{j === "All" ? records.length : records.filter((r) => r.jurisdiction === j).length}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {shown.map(({ card, jurisdiction, branch }) => (
          <article key={card.id} className="relative overflow-hidden rounded-xl border border-gold/20 bg-surface-2 p-5">
            <Scale className="absolute right-4 top-4 h-12 w-12 text-gold/10" />
            <div className="eyebrow">{jurisdiction}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{branch}</div>
            <h2 className="mt-1 pr-10 font-serif text-xl font-bold text-foreground">{card.name}</h2>
            <p className="mt-3 line-clamp-5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{card.desc || "No text has been published in the source record."}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => copy(card.id, courtCitation(card))} className="inline-flex items-center gap-2 rounded-md border border-gold/35 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold/10">
                {copied === card.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied === card.id ? "Copied" : "Copy for Court"}
              </button>
              {card.url && <a href={card.url} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">Original record ↗</a>}
            </div>
          </article>
        ))}
      </div>
      {!info.isLoading && shown.length === 0 && <div className="rounded-xl border border-border bg-surface-2 p-8 text-center text-muted-foreground">No law records matched. Only records actually present on the official board are shown.</div>}
    </div>
  );
}
