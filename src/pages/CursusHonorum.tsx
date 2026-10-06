import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink, Shield, Landmark, ChevronRight, X } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG } from "@/config/trello";
import { CAREER_PATHS, matchRank } from "@/lib/communityRecords";
import { slugify } from "@/lib/trello";

export default function CursusHonorum() {
  const [selected, setSelected] = useState<string | null>(null);
  const info = useTrelloBoard(TRELLO_CONFIG.informationBoardId);
  const matches = useMemo(() => {
    const out = new Map<string, ReturnType<typeof matchRank>>();
    if (info.data) CAREER_PATHS.forEach((p) => p.ranks.forEach((r) => out.set(r, matchRank(info.data!, r))));
    return out;
  }, [info.data]);
  const record = selected ? matches.get(selected) ?? null : null;
  const branch = record && info.data?.lists.find((l) => l.id === record.idList);

  return (
    <div className="container py-10 md:py-14">
      <SectionHeader eyebrow="Cursus Honorum" title="The Career Tree" subtitle="Two advancement paths through civic office and military command. Select a rank to read its official requirements and open its Trello branch." />
      <div className="grid gap-5 lg:grid-cols-2">
        {CAREER_PATHS.map((path, pi) => {
          const Icon = pi === 0 ? Landmark : Shield;
          return (
            <section key={path.name} className="imperial-panel rounded-xl p-5 md:p-7">
              <div className="mb-6 flex items-center gap-3">
                <Icon className="h-5 w-5 text-gold" />
                <div><div className="eyebrow">{path.name}</div><div className="font-serif text-xl font-bold">Progression trunk</div></div>
              </div>
              <div className="relative space-y-2 before:absolute before:bottom-5 before:left-[17px] before:top-5 before:w-px before:bg-gold/25">
                {path.ranks.map((rank, i) => {
                  const m = matches.get(rank);
                  return (
                    <button key={rank} onClick={() => setSelected(rank)} className="group relative flex w-full items-center gap-3 rounded-lg border border-border bg-surface-2 p-3 text-left hover:border-gold/45">
                      <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-background font-display text-xs text-gold">{i + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-serif font-bold text-foreground group-hover:text-gold">{rank}</span>
                        <span className="text-xs text-muted-foreground">{info.isLoading ? "Checking archives…" : m ? `Official record: ${m.name}` : "No official record yet"}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gold" />
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-foreground/50" onClick={() => setSelected(null)}>
          <aside onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-xl overflow-y-auto border-l border-gold/20 bg-background p-6 md:p-8">
            <button aria-label="Close" onClick={() => setSelected(null)} className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-border"><X className="h-4 w-4" /></button>
            <div className="eyebrow mt-4">Rank dossier</div>
            <h2 className="mt-2 font-display text-4xl font-black uppercase text-foreground">{selected}</h2>
            {record ? (
              <>
                <div className="mt-6 rounded-lg border border-gold/20 bg-surface-2 p-5">
                  <div className="eyebrow">Requirements · {record.name}</div>
                  <div className="prose-sm mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{record.desc || "This record has no written requirements yet."}</ReactMarkdown>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to={`/entity/info/${record.id}/${slugify(record.name)}`} className="inline-flex items-center gap-2 rounded-md border border-gold/35 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/10">Open full record</Link>
                  {branch && <a href={`https://trello.com/b/${TRELLO_CONFIG.informationBoardId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Branch: {branch.name} <ExternalLink className="h-4 w-4" /></a>}
                  {record.url && <a href={record.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Trello card <ExternalLink className="h-4 w-4" /></a>}
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-lg border border-border bg-surface-2 p-5 text-sm text-muted-foreground">No matching official Trello record was found for this rank yet, so no requirements are shown rather than inventing them.</div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
