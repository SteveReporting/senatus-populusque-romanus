import { useMemo, useState } from "react";
import { ExternalLink, Shield, Landmark, ChevronRight, X } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG } from "@/config/trello";

const CIVIC = ["Plebeian","Citizen","Magistrate","Aedile","Quaestor","Praetor","Senator","Consul"];
const MILITARY = ["Tiro","Miles","Optio","Centurion","Primus Pilus","Tribunus Militum","Legatus Legionis"];

export default function CursusHonorum() {
  const [selected, setSelected] = useState<string | null>(null);
  const info = useTrelloBoard(TRELLO_CONFIG.informationBoardId);
  const record = useMemo(() => {
    if (!selected || !info.data) return null;
    const q = selected.toLowerCase();
    return info.data.cards.find((c) => c.name.toLowerCase().includes(q)) ?? null;
  }, [selected, info.data]);

  const renderTrunk = (title: string, icon: typeof Shield, ranks: string[]) => {
    const Icon = icon;
    return (
      <section className="imperial-panel rounded-xl p-5 md:p-7">
        <div className="mb-6 flex items-center gap-3">
          <Icon className="h-5 w-5 text-gold"/>
          <div>
            <div className="eyebrow">{title}</div>
            <div className="font-serif text-xl font-bold">Progression trunk</div>
          </div>
        </div>
        <div className="relative space-y-2 before:absolute before:bottom-5 before:left-[17px] before:top-5 before:w-px before:bg-gold/25">
          {ranks.map((rank, i) => (
            <button key={rank} onClick={() => setSelected(rank)} className="group relative flex w-full items-center gap-3 rounded-lg border border-border bg-surface-2 p-3 text-left hover:border-gold/45">
              <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-background font-display text-xs text-gold">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif font-bold text-foreground group-hover:text-gold">{rank}</span>
                <span className="text-xs text-muted-foreground">Open rank dossier</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gold"/>
            </button>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="container py-10 md:py-14">
      <SectionHeader eyebrow="Cursus Honorum" title="The Career Tree" subtitle="Two advancement paths through Roman civic office and military command. Select a rank to inspect its official record."/>
      <div className="grid gap-5 lg:grid-cols-2">
        {renderTrunk("Civic / Political", Landmark, CIVIC)}
        {renderTrunk("Military", Shield, MILITARY)}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/65" onClick={() => setSelected(null)}>
          <aside onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-xl overflow-y-auto border-l border-gold/20 bg-background p-6 md:p-8">
            <button onClick={() => setSelected(null)} className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-border"><X className="h-4 w-4"/></button>
            <div className="eyebrow mt-4">Rank dossier</div>
            <h2 className="mt-2 font-display text-4xl font-black uppercase text-foreground">{selected}</h2>
            {record ? (
              <>
                <div className="mt-6 rounded-lg border border-gold/20 bg-surface-2 p-5">
                  <div className="eyebrow">Official archive record</div>
                  <h3 className="mt-2 font-serif text-xl font-bold">{record.name}</h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{record.desc || "This Trello record currently has no written description."}</p>
                </div>
                {record.url && <a href={record.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold">Open source record <ExternalLink className="h-4 w-4"/></a>}
              </>
            ) : (
              <div className="mt-6 rounded-lg border border-border bg-surface-2 p-5 text-sm text-muted-foreground">
                No matching official Trello record was found for this rank yet. The progression node remains available without inventing requirements that are not in the archives.
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
