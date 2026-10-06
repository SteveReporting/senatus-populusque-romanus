import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG } from "@/config/trello";
import { extractLinks, getAttachmentImage, getCardImage, type TrelloAttachment } from "@/lib/trello";
import pattern from "@/assets/roman-pattern.jpg";
import crest from "@/assets/sjc-logo.png";
import { getUnitArtwork } from "@/lib/unitArtwork";

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

function shortHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const PlaceholderSeal = ({ name }: { name: string }) => {
  const initials = name
    .replace(/[^A-Za-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const numeral = toRoman((shortHash(name) % 39) + 1);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `url(${pattern})`,
          backgroundSize: "360px 360px",
          backgroundRepeat: "repeat",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--background)/0.2),hsl(var(--background)/0.92))]" />
      <div className="absolute inset-0 bg-gradient-to-br from-crimson-deep/30 via-transparent to-gold/5" />
      <div className="absolute inset-4 rounded-sm border border-gold/30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <img
          src={crest}
          alt=""
          aria-hidden
          className="h-24 w-24 opacity-90 drop-shadow-[0_0_24px_hsl(var(--gold)/0.45)]"
        />
        <div className="mt-3 font-display text-gold text-sm tracking-[0.5em]">
          {numeral}
        </div>
        {initials && (
          <div className="font-serif text-5xl text-foreground/85 mt-1">
            {initials}
          </div>
        )}
      </div>
      {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((p) => (
        <span key={p} className={`absolute ${p} h-4 w-4 border-gold/60`}
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

function tidyMarkdown(source: string): string {
  const normalized = source.replace(/\r\n?/g, "\n").trim();
  return normalized
    // Trello descriptions often put several bold role names into one giant paragraph.
    // Give each role its own readable paragraph without changing the source data.
    .replace(/([.!?])\s+(?=\*\*[^*\n]{2,100}\*\*\s*(?:[–—-]|:))/g, "$1\n\n")
    .replace(/\n{3,}/g, "\n\n");
}

const EntityHeroMedia = ({ src, name, isUnit = false }: { src: string | null; name: string; isUnit?: boolean }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <PlaceholderSeal name={name} />;
  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`absolute inset-0 h-full w-full ${isUnit ? "object-contain p-6" : "object-cover"}`}
    />
  );
};

const AttachmentMedia = ({ attachment }: { attachment: TrelloAttachment }) => {
  const [failed, setFailed] = useState(false);
  const src = getAttachmentImage(attachment);
  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-2 p-2 text-center text-[10px] leading-snug text-muted-foreground">
        {attachment.name}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={attachment.name}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
};

const Entity = () => {
  const { category, id } = useParams();
  const { data, isLoading } = useTrelloBoard(TRELLO_CONFIG.informationBoardId);

  const card = useMemo(
    () => data?.cards.find((c) => c.id === id),
    [data, id]
  );
  const list = useMemo(
    () => (card ? data?.lists.find((l) => l.id === card.idList) : undefined),
    [data, card]
  );

  if (isLoading) {
    return (
      <div className="container py-20">
        <div className="imperial-panel rounded-md h-96 animate-pulse" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-serif text-3xl">Record not found</h1>
        <p className="text-muted-foreground mt-2">This entity is not present in the mainframe archive.</p>
        <Link to={`/${category ?? ""}`} className="inline-flex items-center gap-2 mt-6 text-gold hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>
    );
  }

  const unitArtwork = getUnitArtwork(card.name);
  const img = unitArtwork?.src ?? getCardImage(card);
  const rawDesc = card.desc || "";
  const links = extractLinks(rawDesc);
  const desc = tidyMarkdown(rawDesc);

  return (
    <div className="container py-12">
      <Link to={`/${category ?? ""}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to {category}
      </Link>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-10">
        <div>
          <div className="imperial-panel rounded-lg overflow-hidden aspect-square bg-surface-2 relative">
            <EntityHeroMedia key={card.id} src={img} name={card.name} isUnit={Boolean(unitArtwork)} />
          </div>
          {card.attachments && card.attachments.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {card.attachments.slice(0, 8).map((a) => (
                <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="aspect-square overflow-hidden rounded border border-border hover:border-gold/50">
                  <AttachmentMedia attachment={a} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          {list && (
            <div className="text-[11px] tracking-[0.4em] uppercase text-gold/80 mb-3">
              {list.name}
            </div>
          )}
          <h1 className="font-serif text-5xl text-foreground leading-tight">{card.name}</h1>
          <div className="gold-divider my-6" />

          {desc ? (
            <div className="entity-markdown max-w-[82ch]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noreferrer" />
                  ),
                }}
              >
                {desc}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-muted-foreground italic">No dossier provided.</p>
          )}

          {links.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display text-xs tracking-[0.3em] text-gold mb-4">Linked Records</h3>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.url}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-foreground hover:text-gold transition border border-border hover:border-gold/50 rounded-md px-3 py-2 bg-surface-2/60"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-gold" />
                      <span className="truncate max-w-[40ch]">{l.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {card.url && (
            <a
              href={card.url}
              target="_blank"
              rel="noreferrer"
              className="mt-10 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-gold"
            >
              View source on Trello <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Entity;
