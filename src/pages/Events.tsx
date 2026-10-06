import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Radio } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { EventCard } from "@/components/hub/Cards";
import { EVENTS, upcomingEvents, pastEvents, eventIsLive, formatEventDate, type EventType } from "@/data/community";
import { cn } from "@/lib/utils";

const useNow = (ms = 1000) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
};

const Countdown = ({ iso, now }: { iso: string; now: number }) => {
  const d = Math.max(0, +new Date(iso) - now);
  const parts = [
    ["Days", Math.floor(d / 86400000)],
    ["Hours", Math.floor(d / 3600000) % 24],
    ["Min", Math.floor(d / 60000) % 60],
    ["Sec", Math.floor(d / 1000) % 60],
  ] as const;
  return (
    <div className="flex gap-3">
      {parts.map(([l, v]) => (
        <div key={l} className="min-w-16 rounded-xl border border-gold/30 bg-background/60 px-3 py-2 text-center">
          <div className="font-display text-3xl font-bold text-gold tabular-nums">{String(v).padStart(2, "0")}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{l}</div>
        </div>
      ))}
    </div>
  );
};

const Events = () => {
  const now = useNow();
  const types = useMemo(() => ["All", ...Array.from(new Set(EVENTS.map((e) => e.type)))] as ("All" | EventType)[], []);
  const [type, setType] = useState<"All" | EventType>("All");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const upcoming = upcomingEvents(now);
  const next = upcoming[0];
  const list = (tab === "upcoming" ? upcoming : pastEvents(now)).filter((e) => type === "All" || e.type === type);

  return (
    <div className="container py-12 md:py-16 animate-fade-in">
      <SectionHeader eyebrow="Fasti" title="Events" subtitle="Trainings, Senate sessions, ceremonies and operations across Rome." />

      {next && (
        <section className="mt-8 relative overflow-hidden rounded-2xl border border-gold/30 bg-card p-6 md:p-8 shadow-imperial">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-gold" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 eyebrow">
                {eventIsLive(next, now) ? (<><Radio className="h-3.5 w-3.5 text-crimson animate-pulse" /> Happening now</>) : "Next event"}
              </div>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold text-foreground">{next.title}</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">{next.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-gold" />{formatEventDate(next.date).full} · {formatEventDate(next.date).time}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gold" />{next.location}</span>
                <span>Hosted by {next.host}</span>
              </div>
            </div>
            {!eventIsLive(next, now) && <Countdown iso={next.date} now={now} />}
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {(["upcoming", "past"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("rounded-md px-4 py-1.5 text-xs font-semibold capitalize transition-colors", tab === t ? "bg-secondary text-gold" : "text-muted-foreground hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-colors", type === t ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold/40")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display text-xl text-foreground">No {tab} events</p>
          <p className="text-sm text-muted-foreground">Check back soon — leadership posts new events regularly.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => <EventCard key={e.id} e={e} />)}
        </div>
      )}
    </div>
  );
};

export default Events;
