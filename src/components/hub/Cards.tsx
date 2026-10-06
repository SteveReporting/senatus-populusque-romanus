import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, Pin, ArrowUpRight, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Announcement, type RomanEvent, eventIsLive, formatEventDate, timeAgo } from "@/data/community";
import { type DevItem, STAGE_STYLE, PIPELINE, plainText } from "@/lib/development";

export const IMPORTANCE_STYLE = {
  normal: { border: "", tag: "border-border text-muted-foreground", label: "" },
  important: { border: "border-gold/40", tag: "border-gold/50 text-gold bg-gold/10", label: "Important" },
  critical: { border: "border-crimson/60", tag: "border-crimson/60 text-accent-foreground bg-crimson", label: "Imperial" },
} as const;

export const AnnouncementCard = ({ a, large }: { a: Announcement; large?: boolean }) => {
  const imp = IMPORTANCE_STYLE[a.importance];
  return (
    <Link
      to={`/announcements#${a.id}`}
      className={cn("hub-card hub-card-hover group flex flex-col overflow-hidden", imp.border, large ? "p-7 md:p-9" : "p-5")}
    >
      {a.importance === "critical" && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-crimson" />}
      <div className="flex flex-wrap items-center gap-2">
        <span className="tag border-border text-foreground/80">
          <Megaphone className="h-3 w-3" /> {a.category}
        </span>
        {imp.label && <span className={cn("tag", imp.tag)}>{imp.label}</span>}
        {a.pinned && (
          <span className="tag border-gold/40 text-gold">
            <Pin className="h-3 w-3" /> Pinned
          </span>
        )}
      </div>
      <h3 className={cn("mt-4 font-display font-semibold leading-tight text-foreground group-hover:text-gold transition-colors", large ? "text-2xl md:text-4xl" : "text-lg")}>
        {a.title}
      </h3>
      <p className={cn("mt-3 text-muted-foreground", large ? "text-base max-w-2xl" : "text-sm line-clamp-2")}>{a.description}</p>
      <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
        <span>
          {a.author}
          {a.organisation && ` · ${a.organisation}`} · {timeAgo(a.date)}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-gold opacity-80 group-hover:opacity-100">
          Read <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
};

export const DateBlock = ({ iso, className }: { iso: string; className?: string }) => {
  const d = formatEventDate(iso);
  return (
    <div className={cn("flex w-16 shrink-0 flex-col items-center rounded-lg border border-gold/30 bg-background/60 py-2", className)}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-crimson">{d.month}</span>
      <span className="font-display text-2xl font-bold leading-none text-foreground">{d.day}</span>
    </div>
  );
};

export const EventCard = ({ e, compact }: { e: RomanEvent; compact?: boolean }) => {
  const d = formatEventDate(e.date);
  const live = eventIsLive(e);
  return (
    <div id={e.id} className="hub-card hub-card-hover flex gap-4 p-5 scroll-mt-24">
      <DateBlock iso={e.date} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tag border-border text-foreground/80">{e.type}</span>
          {live && (
            <span className="tag border-success/40 text-success">
              <span className="live-dot" /> Live now
            </span>
          )}
          {e.status === "cancelled" && <span className="tag border-crimson/50 text-crimson">Cancelled</span>}
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold leading-tight">{e.title}</h3>
        <div className="mt-1 text-xs text-gold-soft">Hosted by {e.host}</div>
        {!compact && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{e.description}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{d.weekday}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{d.time}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{e.location}</span>
        </div>
      </div>
    </div>
  );
};

export const StageBadge = ({ stage }: { stage: DevItem["stage"] }) => (
  <span className={cn("tag", STAGE_STYLE[stage])}>{stage}</span>
);

export const StagePipeline = ({ stage }: { stage: DevItem["stage"] }) => {
  const idx = PIPELINE.indexOf(stage);
  return (
    <div className="flex gap-1" aria-label={`Stage: ${stage}`}>
      {PIPELINE.map((s, i) => (
        <span
          key={s}
          title={s}
          className={cn("h-1 flex-1 rounded-full", idx >= 0 && i <= idx ? (stage === "Completed" ? "bg-success" : "bg-gradient-gold") : "bg-surface-3")}
        />
      ))}
    </div>
  );
};

export const DevCard = ({ item }: { item: DevItem }) => (
  <Link
    to={`/entity/development/${item.card.id}`}
    className="hub-card hub-card-hover group flex flex-col p-5"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background/60 text-lg">
        {item.emoji || "⚙️"}
      </div>
      <StageBadge stage={item.stage} />
    </div>
    <h3 className="mt-4 font-display text-lg font-semibold group-hover:text-gold transition-colors">{item.name}</h3>
    {item.card.desc && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{plainText(item.card.desc)}</p>}
    <div className="mt-auto pt-5">
      <StagePipeline stage={item.stage} />
      {item.updated && <div className="mt-2 text-[11px] text-muted-foreground">Updated {timeAgo(item.updated)}</div>}
    </div>
  </Link>
);
