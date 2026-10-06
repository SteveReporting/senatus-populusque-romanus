import { Link } from "react-router-dom";
import { FileText, ArrowUpRight } from "lucide-react";
import { type TrelloCard, slugify } from "@/lib/trello";
import { cn } from "@/lib/utils";
import { getUnitArtwork } from "@/lib/unitArtwork";

interface Props {
  card: TrelloCard;
  category?: string;
  variant?: "default" | "legion";
  className?: string;
  fallbackImage?: string | null;
}

export const EntityCard = ({ card, category = "entity", className }: Props) => {
  const unit = getUnitArtwork(card.name);
  return (
    <Link to={`/entity/${category}/${card.id}/${slugify(card.name)}`} className={cn("group flex h-full flex-col overflow-hidden rounded-md border border-border bg-surface-1 transition-colors hover:border-gold/50", className)}>
      {unit && <div className="bg-surface-2"><img src={unit.src} alt={`${unit.name} standard`} loading="lazy" className="mx-auto h-52 w-full object-contain p-5" /></div>}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-center justify-between text-gold/70"><FileText className="h-5 w-5" /><ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
        <h3 className="font-serif text-xl leading-snug text-foreground transition-colors group-hover:text-gold">{card.name}</h3>
        {card.desc && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{card.desc.replace(/[#*_>`]/g, "").slice(0, 240)}</p>}
        <div className="mt-auto pt-6 text-xs text-gold">View record →</div>
      </div>
    </Link>
  );
};
export default EntityCard;
