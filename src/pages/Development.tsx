import { useMemo } from "react";
import SectionHeader from "@/components/SectionHeader";
import TrelloEmptyState from "@/components/TrelloEmptyState";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG } from "@/config/trello";
import { cardsByList } from "@/lib/trello";
import { cn } from "@/lib/utils";

function statusTone(name: string): string {
  const n = name.toLowerCase();
  if (/done|complete|ship|live|release/.test(n)) return "border-emerald-500/40 text-emerald-300 bg-emerald-500/10";
  if (/progress|doing|build|wip|active/.test(n)) return "border-gold/50 text-gold bg-gold/10";
  if (/review|test|qa/.test(n)) return "border-sky-400/40 text-sky-300 bg-sky-500/10";
  if (/block|hold|pause/.test(n)) return "border-destructive/50 text-destructive bg-destructive/10";
  return "border-border text-muted-foreground bg-surface-2";
}

const Development = () => {
  const { data, isLoading, error, refetch } = useTrelloBoard(TRELLO_CONFIG.developmentBoardId);

  const lists = useMemo(() => {
    if (!data) return [];
    const grouped = cardsByList(data);
    return data.lists
      .slice().sort((a, b) => a.pos - b.pos)
      .map((l) => ({ list: l, cards: grouped.get(l.id) ?? [] }));
  }, [data]);

  return (
    <div className="container py-16">
      <SectionHeader
        eyebrow="Imperial Development"
        title="Development Tracker"
        subtitle="Live feature roadmap and engineering progress, fed from the Imperial Development board."
      />

      {isLoading && (
        <div className="grid md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="imperial-panel rounded-md h-96 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <TrelloEmptyState
          message="Development board unavailable"
          hint="Set the Development Board ID in src/config/trello.ts and make the board Public."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !error && lists.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {lists.map(({ list, cards }) => (
            <div key={list.id} className="imperial-panel rounded-md flex flex-col">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-serif text-lg text-gold">{list.name}</h3>
                <span className={cn("px-2 py-0.5 rounded-full border text-[10px] tracking-widest uppercase", statusTone(list.name))}>
                  {cards.length}
                </span>
              </div>
              <div className="p-4 space-y-3 flex-1">
                {cards.length === 0 && (
                  <p className="text-xs text-muted-foreground italic px-1">No items.</p>
                )}
                {cards.map((c) => (
                  <div key={c.id} className="rounded-md border border-border bg-surface-2/60 p-3 hover:border-gold/40 transition">
                    <div className="font-medium text-sm text-foreground">{c.name}</div>
                    {c.desc && (
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-3">
                        {c.desc.replace(/[#*_>`]/g, "")}
                      </p>
                    )}
                    {c.labels && c.labels.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {c.labels.map((l) => (
                          <span key={l.id} className="text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded border border-gold/30 text-gold-soft bg-gold/5">
                            {l.name || l.color}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Development;
