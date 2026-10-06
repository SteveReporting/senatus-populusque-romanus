import { useMemo } from "react";

import SectionHeader from "@/components/SectionHeader";
import EntityCard from "@/components/EntityCard";
import TrelloEmptyState from "@/components/TrelloEmptyState";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG, LIST_CATEGORY_HINTS } from "@/config/trello";
import { cardsByList, buildListImageFallbacks } from "@/lib/trello";
import { UNIT_ARTWORK } from "@/lib/unitArtwork";

const Military = () => {
  const { data, isLoading, error, refetch } = useTrelloBoard(TRELLO_CONFIG.informationBoardId);

  const sections = useMemo(() => {
    if (!data) return [];
    const grouped = cardsByList(data);
    const fallbacks = buildListImageFallbacks(data);
    const hints = LIST_CATEGORY_HINTS.military;
    return data.lists
      .slice().sort((a, b) => a.pos - b.pos)
      .filter((l) => hints.some((h) => l.name.toLowerCase().includes(h)))
      .map((l) => ({
        list: l,
        cards: grouped.get(l.id) ?? [],
        fallback: fallbacks.get(l.id) ?? null,
      }));
  }, [data]);



  return (
    <div className="container py-16">
      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end mb-12">
        <SectionHeader
          className="mb-0"
          eyebrow="Legio Romana"
          title="Military Command"
          subtitle="Legions, auxilia, and command structure of the imperial armed forces."
        />

      </div>

      <section aria-label="Unit standards" className="mb-16">
        <h2 className="font-serif text-2xl text-gold mb-5">Unit standards</h2>
        <div className="gold-divider mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
          {UNIT_ARTWORK.map((unit) => (
            <figure key={unit.name} className="min-w-0 text-center">
              <img src={unit.src} alt={`${unit.name} standard`} loading="lazy" className="w-full aspect-square object-contain p-3" />
              <figcaption className="mt-3 font-serif text-sm sm:text-base text-foreground leading-snug">{unit.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

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
        {sections.map(({ list, cards, fallback }) => (
          <div key={list.id}>
            <div className="flex items-end justify-between mb-5">
              <h3 className="font-serif text-2xl text-gold">{list.name}</h3>
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                {cards.length} record{cards.length !== 1 && "s"}
              </span>
            </div>
            <div className="gold-divider mb-6" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cards.map((c) => (
                <EntityCard key={c.id} card={c} category="military" variant="legion" fallbackImage={fallback} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Military;
