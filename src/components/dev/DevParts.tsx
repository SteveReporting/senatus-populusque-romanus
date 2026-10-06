import { useEffect, useRef, useState } from "react";
import { Check, Circle, CircleDot, ExternalLink, Hammer, Paperclip, Calendar, Users } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { TrelloBoard } from "@/lib/trello";
import { getCardImage, extractLinks } from "@/lib/trello";
import {
  type DevItem, STAGE_STYLE, categoryOf, cardImages, beforeAfter, checklistsFor, checklistTotals,
  membersFor, relTime, isRecent, labelName, activityLog,
} from "@/lib/development";
import { cn } from "@/lib/utils";

export function LiveBadge({ text = "Live development data" }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
      <span className="live-dot" /> {text}
    </span>
  );
}

export function StageChip({ item, className }: { item: DevItem; className?: string }) {
  return (
    <span className={cn("px-2 py-0.5 rounded-sm border text-[10px] tracking-[0.2em] uppercase whitespace-nowrap", STAGE_STYLE[item.stage], className)}>
      {item.listName}
    </span>
  );
}

/** Animates width once visible in viewport. */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.2 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return { ref, seen };
}

export function Bar({ pct, className }: { pct: number; className?: string }) {
  const { ref, seen } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={cn("h-1.5 rounded-full bg-surface-3 overflow-hidden", className)}>
      <div className="h-full bg-gradient-gold transition-[width] duration-1000 ease-out" style={{ width: seen ? `${pct}%` : 0 }} />
    </div>
  );
}

export function DevVisual({ item, className }: { item: DevItem; className?: string }) {
  const img = getCardImage(item.card);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [item.card.id, img]);

  if (img && !failed) {
    return (
      <img
        src={img}
        alt={item.name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={cn("w-full h-full object-cover transition-transform duration-700 group-hover:scale-105", className)}
      />
    );
  }

  return (
    <div className={cn("w-full h-full blueprint-grid bg-surface-2 flex items-center justify-center relative", className)}>
      <div className="absolute inset-6 border border-gold/10" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gold/10" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gold/10" />
      <span className="relative text-4xl opacity-70">{item.emoji || <Hammer className="h-8 w-8 text-gold/50" />}</span>
    </div>
  );
}

export function DevCard({ item, board, onOpen, size = "md" }: { item: DevItem; board?: TrelloBoard; onOpen: (i: DevItem) => void; size?: "sm" | "md" }) {
  const cat = categoryOf(item);
  const { done, total } = checklistTotals(checklistsFor(item.card.id, board?.checklists));
  const desc = item.card.desc ? item.card.desc.replace(/[#*_>`]/g, "").trim() : "";
  return (
    <button onClick={() => onOpen(item)} className="group text-left imperial-panel rounded-md overflow-hidden flex flex-col hover:-translate-y-1 hover:border-gold/40 transition-all duration-300 fade-in-up">
      <div className={cn("relative overflow-hidden", size === "sm" ? "aspect-[16/8]" : "aspect-[16/9]")}>
        <DevVisual item={item} />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        {isRecent(item.updated, 3) && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-success bg-background/70 px-2 py-1 rounded-sm">
            <span className="live-dot" /> Updated recently
          </span>
        )}
        <StageChip item={item} className="absolute top-3 right-3 bg-background/70" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        {cat && <div className="text-[10px] tracking-[0.25em] uppercase text-gold/80">{cat}</div>}
        <h3 className="mt-1 font-serif text-lg text-foreground leading-snug group-hover:text-gold transition-colors">{item.name}</h3>
        {desc && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{desc}</p>}
        {total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5"><span>Checklist</span><span>{done} / {total}</span></div>
            <Bar pct={(done / total) * 100} />
          </div>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{item.updated ? `Updated ${relTime(item.updated)}` : ""}</span>
          <span className="text-gold tracking-widest uppercase text-[10px] opacity-70 group-hover:opacity-100">View →</span>
        </div>
      </div>
    </button>
  );
}

export function Checklists({ cardId, board }: { cardId: string; board?: TrelloBoard }) {
  const lists = checklistsFor(cardId, board?.checklists);
  if (!lists.length) return null;
  return (
    <div className="space-y-5">
      {lists.map((cl) => {
        const items = [...cl.checkItems].sort((a, b) => a.pos - b.pos);
        const done = items.filter((i) => i.state === "complete").length;
        const firstOpen = items.findIndex((i) => i.state !== "complete");
        const pct = items.length ? Math.round((done / items.length) * 100) : 0;
        return (
          <div key={cl.id} className="rounded-md border border-border bg-surface-2/50 p-5">
            <div className="flex items-baseline justify-between">
              <h4 className="font-display tracking-[0.2em] uppercase text-sm text-gold">{cl.name}</h4>
              <span className="text-xs text-muted-foreground">{done} / {items.length} complete</span>
            </div>
            <ul className="mt-4 space-y-2">
              {items.map((i, idx) => (
                <li key={i.id} className="flex items-start gap-3 text-sm">
                  {i.state === "complete" ? <Check className="h-4 w-4 mt-0.5 text-success shrink-0" />
                    : idx === firstOpen ? <CircleDot className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                    : <Circle className="h-4 w-4 mt-0.5 text-muted-foreground/50 shrink-0" />}
                  <span className={cn(i.state === "complete" ? "text-foreground/70" : "text-foreground")}>{i.name}</span>
                </li>
              ))}
            </ul>
            <Bar pct={pct} className="mt-4" />
            <div className="mt-2 text-[10px] tracking-[0.25em] uppercase text-gold/80">{pct}% checklist complete</div>
          </div>
        );
      })}
    </div>
  );
}

export function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative aspect-video rounded-md overflow-hidden select-none border border-border">
      <img src={after} alt="After" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before} alt="Before" referrerPolicy="no-referrer" className="absolute inset-0 h-full object-cover" style={{ width: `${10000 / Math.max(pos, 1)}%`, maxWidth: "none" }} />
      </div>
      <div className="absolute top-0 bottom-0 w-px bg-gold" style={{ left: `${pos}%` }} />
      <span className="absolute top-3 left-3 text-[10px] tracking-[0.25em] uppercase bg-background/70 px-2 py-1">Before</span>
      <span className="absolute top-3 right-3 text-[10px] tracking-[0.25em] uppercase bg-background/70 px-2 py-1">After</span>
      <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(+e.target.value)} aria-label="Compare before and after"
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize" />
    </div>
  );
}

export function DevDetail({ item, board, onClose }: { item: DevItem | null; board?: TrelloBoard; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [item?.card.id]);
  if (!item) return null;
  const imgs = cardImages(item);
  const ba = beforeAfter(item);
  const cat = categoryOf(item);
  const members = membersFor(item, board?.members);
  const links = extractLinks(item.card.desc);
  const files = (item.card.attachments ?? []).filter((a) => !imgs.some((i) => i.name === a.name));
  const log = activityLog(board?.actions, new Set([item.card.id])).slice(0, 6);
  const paragraphs = (item.card.desc || "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").split(/\n{2,}/).map((p) => p.replace(/[#*_>`]/g, "").trim()).filter(Boolean);

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-surface-1 border-gold/20 p-0">
        <div className="relative aspect-[16/7] overflow-hidden bg-surface-2">
          {imgs.length ? <img src={imgs[idx].url} alt={imgs[idx].name} referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : <DevVisual item={item} />}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-surface-1/30 to-transparent" />
          {imgs.length > 1 && (
            <div className="absolute bottom-4 right-6 flex gap-2">
              {imgs.map((im, i) => (
                <button key={i} onClick={() => setIdx(i)} className={cn("h-12 w-16 rounded-sm overflow-hidden border", i === idx ? "border-gold" : "border-border opacity-60 hover:opacity-100")}>
                  <img src={im.url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="px-8 pb-8 -mt-10 relative">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold/80">{[cat, ...(item.card.labels ?? []).slice(1).map((l) => labelName(l.name)).filter(Boolean)].filter(Boolean).join(" / ")}</div>
          <DialogTitle className="mt-2 font-display text-3xl tracking-wide uppercase text-foreground">{item.name}</DialogTitle>
          <DialogDescription className="sr-only">Development details for {item.name}</DialogDescription>

          <div className="mt-6 grid sm:grid-cols-4 gap-px bg-border border border-border rounded-md overflow-hidden">
            {[
              ["Status", <StageChip key="s" item={item} />],
              ["Last updated", item.updated ? new Date(item.updated).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "—"],
              ["Due", item.card.due ? new Date(item.card.due).toLocaleDateString() : "—"],
              ["Attachments", String(item.card.attachments?.length ?? 0)],
            ].map(([k, v]) => (
              <div key={k as string} className="bg-surface-2 p-4">
                <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{k}</div>
                <div className="mt-1.5 text-sm text-foreground">{v}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid md:grid-cols-[1fr_260px] gap-8">
            <div className="space-y-8">
              <section>
                <h4 className="eyebrow">Overview</h4>
                {paragraphs.length ? paragraphs.map((p, i) => <p key={i} className="mt-3 text-sm leading-relaxed text-foreground/85 whitespace-pre-line">{p}</p>)
                  : <p className="mt-3 text-sm text-muted-foreground italic">No description has been written for this item yet.</p>}
              </section>
              {ba && <section><h4 className="eyebrow mb-3">Before / After</h4><BeforeAfter {...ba} /></section>}
              <Checklists cardId={item.card.id} board={board} />
            </div>
            <aside className="space-y-6 text-sm">
              {members.length > 0 && (
                <div><h4 className="eyebrow flex items-center gap-2"><Users className="h-3 w-3" />Team</h4>
                  {members.map((m) => <div key={m.id} className="mt-2 text-foreground/85">{m.fullName || m.username}</div>)}</div>
              )}
              {log.length > 0 && (
                <div><h4 className="eyebrow flex items-center gap-2"><Calendar className="h-3 w-3" />Recent activity</h4>
                  <ul className="mt-2 space-y-2 border-l border-gold/20 pl-3">
                    {log.map((l) => <li key={l.id}><div className="text-foreground/85">{l.text}</div><div className="text-xs text-muted-foreground">{relTime(l.date)}</div></li>)}
                  </ul></div>
              )}
              {(files.length > 0 || links.length > 0) && (
                <div><h4 className="eyebrow flex items-center gap-2"><Paperclip className="h-3 w-3" />Files & links</h4>
                  {[...files.map((f) => ({ label: f.name, url: f.url })), ...links].map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="mt-2 block truncate text-gold-soft hover:text-gold">{l.label}</a>
                  ))}</div>
              )}
            </aside>
          </div>

          {item.card.url && (
            <a href={item.card.url} target="_blank" rel="noreferrer" className="mt-10 inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-gold border border-gold/40 px-5 py-3 rounded-sm hover:bg-gold/10">
              View original development card <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
