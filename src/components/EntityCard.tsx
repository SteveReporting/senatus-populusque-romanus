import { Link } from "react-router-dom";
import { type TrelloCard, getCardImage, slugify } from "@/lib/trello";
import { cn } from "@/lib/utils";
import pattern from "@/assets/roman-pattern.jpg";
import crest from "@/assets/sjc-logo.png";

interface Props {
  card: TrelloCard;
  category?: string;
  variant?: "default" | "legion";
  className?: string;
  /** Optional fallback image URL (no longer used for imageless cards). */
  fallbackImage?: string | null;
}

// Convert 1..3999 to a Roman numeral. Used for visual indexing on
// placeholder thumbnails — purely decorative.
function toRoman(num: number): string {
  if (num <= 0) return "";
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let n = num;
  let out = "";
  for (const [v, s] of map) {
    while (n >= v) { out += s; n -= v; }
  }
  return out;
}

// Stable hash for picking a deterministic numeral per card.
function shortHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const PlaceholderArt = ({ name, isLegion }: { name: string; isLegion: boolean }) => {
  const initials = name
    .replace(/[^A-Za-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const numeral = toRoman((shortHash(name) % 39) + 1); // I..XXXIX

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* tiled pattern base */}
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `url(${pattern})`,
          backgroundSize: isLegion ? "260px 260px" : "320px 320px",
          backgroundRepeat: "repeat",
        }}
        aria-hidden
      />
      {/* dark wash + radial spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--background)/0.2),hsl(var(--background)/0.92))]" />
      <div className="absolute inset-0 bg-gradient-to-br from-crimson-deep/30 via-transparent to-gold/5" />

      {/* gold inner border */}
      <div className="absolute inset-3 rounded-sm border border-gold/30" />

      {/* central seal */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <img
          src={crest}
          alt=""
          aria-hidden
          className="h-16 w-16 opacity-90 drop-shadow-[0_0_18px_hsl(var(--gold)/0.4)]"
        />
        <div className="mt-2 font-display text-gold text-xs tracking-[0.45em]">
          {numeral}
        </div>
        {initials && (
          <div className="font-serif text-3xl text-foreground/85 mt-0.5">
            {initials}
          </div>
        )}
      </div>

      {/* corner serifs */}
      {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((p) => (
        <span key={p} className={`absolute ${p} h-3 w-3 border-gold/60`}
          style={{
            borderTopWidth: p.includes("top") ? 1 : 0,
            borderBottomWidth: p.includes("bottom") ? 1 : 0,
            borderLeftWidth: p.includes("left") ? 1 : 0,
            borderRightWidth: p.includes("right") ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
};

export const EntityCard = ({ card, category = "entity", variant = "default", className }: Props) => {
  const img = getCardImage(card);
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
          <PlaceholderArt name={card.name} isLegion={isLegion} />
        )}
        {/* bottom fade only when there is an image, so placeholder seal stays clean */}
        {img && (
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        )}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
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
