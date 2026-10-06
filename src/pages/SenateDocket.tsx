import { useMemo, useState } from "react";
import { Gavel, Search } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG } from "@/config/trello";

const TABS = ["Under Debate","Voting in Session","Passed & Enacted","Vetoed / Rejected"] as const;
type Tab = typeof TABS[number];

function statusFrom(text: string): Tab {
  const s = text.toLowerCase();
  if (/veto|reject|defeat|failed/.test(s)) return "Vetoed / Rejected";
  if (/pass|enact|ratif|approved/.test(s)) return "Passed & Enacted";
  if (/vote|ballot/.test(s)) return "Voting in Session";
  return "Under Debate";
}

export default function SenateDocket() {
  const [tab, setTab] = useState<Tab>("Under Debate");
  const [q, setQ] = useState("");
  const info = useTrelloBoard(TRELLO_CONFIG.informationBoardId);
  const bills = useMemo(() => {
    if (!info.data) return [];
    const lists = new Map(info.data.lists.map((l) => [l.id, l.name]));
    return info.data.cards
      .filter((c) => /bill|senatus consult|proposal|motion|decree/i.test(c.name + " " + c.desc + " " + (lists.get(c.idList) || "")))
      .map((c) => ({ c, status: statusFrom(c.name + " " + c.desc + " " + (lists.get(c.idList) || "")) }));
  }, [info.data]);

  const shown = bills.filter((b) => b.status === tab && (b.c.name + " " + b.c.desc).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container py-10 md:py-14">
      <SectionHeader eyebrow="Senatus Consulta" title="Senate Voting Docket" subtitle="A live-facing docket that surfaces Senate proposals from official information records without fabricating vote counts."/>
      <div className="flex gap-2 overflow-x-auto border-b border-border pb-3">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={"shrink-0 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider " + (tab === t ? "bg-gold text-background" : "border border-border text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-4">
        <Search className="h-4 w-4 text-gold"/>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search docket…" className="w-full bg-transparent py-3 text-sm outline-none"/>
      </div>
      <div className="mt-6 space-y-3">
        {shown.map(({ c, status }) => (
          <article key={c.id} className="imperial-panel rounded-xl p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><div className="eyebrow">{status}</div><h2 className="mt-2 font-serif text-xl font-bold">{c.name}</h2></div>
              <Gavel className="h-5 w-5 text-gold"/>
            </div>
            <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{c.desc || "No bill text has been published in this source record."}</p>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              {c.due && <span>Deadline: {new Date(c.due).toLocaleString()}</span>}
              {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-gold">Open source ↗</a>}
            </div>
          </article>
        ))}
      </div>
      {!info.isLoading && shown.length === 0 && <div className="mt-6 rounded-xl border border-border bg-surface-2 p-10 text-center text-muted-foreground">No official records are currently classified under “{tab}”.</div>}
    </div>
  );
}
