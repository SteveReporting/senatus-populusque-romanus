import { useMemo } from "react";
import { Shield } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import EntityCard from "@/components/EntityCard";
import TrelloEmptyState from "@/components/TrelloEmptyState";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG, LIST_CATEGORY_HINTS } from "@/config/trello";
import { cardsByList } from "@/lib/trello";

const Military = () => {
  const { data, isLoading, error, refetch } = useTrelloBoard(TRELLO_CONFIG.informationBoardId);

  const sections = useMemo(() => {
    if (!data) return [];
    const grouped = cardsByList(data);
    const hints = LIST_CATEGORY_HINTS.military;
    return data.lists
      .slice().sort((a, b) => a.pos - b.pos)
      .filter((l) => hints.some((h) => l.name.toLowerCase().includes(h)))
      .map((l) => ({ list: l, cards: grouped.get(l.id) ?? [] }));
  }, [data]);

  const totalLegions = sections.reduce((acc, s) => acc + s.cards.length, 0);

  return (
    <div className="container py-16">
      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end mb-12">
        <SectionHeader
          className="mb-0"
          eyebrow="Legio Romana"
          title="Military Command"
          subtitle="Legions, auxilia, and command structure of the imperial armed forces."
        />
        <div className="imperial-panel rounded-md px-5 py-4 flex items-center gap-4">
          <Shield className="h-8 w-8 text-gold" />
          <div>
            <div className="font-display text-2xl text-gold">{totalLegions || "—"}</div>
            <div className="text-[10px] tracking-widest uppercase text-muted-foreground">Active Units</div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="imperial-panel rounded-md aspect-[4/3] animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <TrelloEmptyState
          message="Mainframe link unavailable"
          hint="Set the Information Board ID and make the board Public."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !error && sections.length === 0 && (
        <TrelloEmptyState
          message="No legions detected"
          hint="No Trello lists matched military keywords (legio, legion, auxilia, navy, praetoria…)."
        />
      )}

      <div className="space-y-16">
        {sections.map(({ list, cards }) => (
          <div key={list.id}>
            <div className="flex items-end justify-between mb-5">
              <h3 className="font-serif text-2xl text-gold">{list.name}</h3>
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                {cards.length} unit{cards.length !== 1 && "s"}
              </span>
            </div>
            <div className="gold-divider mb-6" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cards.map((c) => (
                <EntityCard key={c.id} card={c} category="military" variant="legion" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Military;
