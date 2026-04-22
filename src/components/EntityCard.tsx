import { Link } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import { type TrelloCard, getCardImage, slugify } from "@/lib/trello";
import { cn } from "@/lib/utils";

interface Props {
  card: TrelloCard;
  category?: string;
  variant?: "default" | "legion";
  className?: string;
  /** Optional fallback image URL when the card itself has none. */
  fallbackImage?: string | null;
}

export const EntityCard = ({ card, category = "entity", variant = "default", className, fallbackImage }: Props) => {
  const img = getCardImage(card) ?? fallbackImage ?? null;
  const isLegion = variant === "legion";
  return (
    <Link
      to={`/entity/${category}/${card.id}/${slugify(card.name)}`}
      className={cn(
        "group relative block overflow-hidden imperial-panel rounded-md transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-gold hover:border-gold/40",
        className
      )}
    >
      <div className={cn(
        "relative w-full overflow-hidden bg-surface-2",
        isLegion ? "aspect-[4/3]" : "aspect-[16/10]"
      )}>
        {img ? (
          <img
            src={img}
            alt={card.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-imperial">
            <ImageIcon className="h-10 w-10 text-gold/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-gold" />
          <span className="text-[10px] tracking-[0.25em] uppercase text-gold-soft">Active</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl text-foreground group-hover:text-gold transition-colors leading-tight">
          {card.name}
        </h3>
        {card.desc && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {card.desc.replace(/[#*_>`\-]/g, "").slice(0, 160)}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-widest">
          <span className="text-muted-foreground">View dossier</span>
          <span className="text-gold transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
};

export default EntityCard;
