import { useMemo } from "react";
import SectionHeader from "@/components/SectionHeader";
import EntityCard from "@/components/EntityCard";
import TrelloEmptyState from "@/components/TrelloEmptyState";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG, LIST_CATEGORY_HINTS } from "@/config/trello";
import { cardsByList, buildListImageFallbacks } from "@/lib/trello";

interface Props {
  category?: keyof typeof LIST_CATEGORY_HINTS | "all";
  eyebrow: string;
  title: string;
  subtitle?: string;
  entitySlug: string;
  emptyHint?: string;
}

export const TrelloPage = ({ category = "all", eyebrow, title, subtitle, entitySlug, emptyHint }: Props) => {
  const { data, isLoading, error, refetch } = useTrelloBoard(TRELLO_CONFIG.informationBoardId);

  const sections = useMemo(() => {
    if (!data) return [];
    const grouped = cardsByList(data);
    const fallbacks = buildListImageFallbacks(data);
    const lists = data.lists.slice().sort((a, b) => a.pos - b.pos);

    const filtered =
      category === "all"
        ? lists
        : lists.filter((l) =>
            (LIST_CATEGORY_HINTS[category] ?? []).some((h) =>
              l.name.toLowerCase().includes(h)
            )
          );
    return filtered.map((l) => ({
      list: l,
      cards: grouped.get(l.id) ?? [],
      fallback: fallbacks.get(l.id) ?? null,
    }));
  }, [data, category]);

  return (
    <div className="container py-16">
      <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />

      {isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="imperial-panel rounded-md aspect-[16/10] animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <TrelloEmptyState
          message="Mainframe link unavailable"
          hint={emptyHint ?? "Configure the Information Board ID in src/config/trello.ts and ensure the board is Public."}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !error && sections.length === 0 && (
        <TrelloEmptyState
          message="No matching lists found"
          hint={`No Trello lists matched the "${category}" category. Rename a list or adjust LIST_CATEGORY_HINTS in src/config/trello.ts.`}
        />
      )}

      <div className="space-y-16">
        {sections.map(({ list, cards, fallback }) => (
          <div key={list.id}>
            <div className="flex items-end justify-between mb-5">
              <h3 className="font-serif text-2xl text-gold">{list.name}</h3>
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                {cards.length} {cards.length === 1 ? "record" : "records"}
              </span>
            </div>
            <div className="gold-divider mb-6" />
            {cards.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No records in this list.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cards.map((c) => (
                  <EntityCard key={c.id} card={c} category={entitySlug} fallbackImage={fallback} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrelloPage;
