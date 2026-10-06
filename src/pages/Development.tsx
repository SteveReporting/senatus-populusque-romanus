import { useEffect, useMemo, useState } from "react";
import { Search, ExternalLink, SlidersHorizontal, ArrowRight } from "lucide-react";
import TrelloEmptyState from "@/components/TrelloEmptyState";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG } from "@/config/trello";
import { getCardImage } from "@/lib/trello";
import {
  devItems, type DevItem, type DevStage, PIPELINE, categoryOf, isSpotlight, relTime, activityLog, dayLabel, plainText,
} from "@/lib/development";
import { DevDetail, DevVisual, StageChip } from "@/components/dev/DevParts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import buildImg from "@/assets/home-build.jpg";
import { cn } from "@/lib/utils";

type View = "overview" | "board" | "archive";
const BUILDING: DevStage[] = ["In Development", "Testing", "Polishing"];
const NEXT: DevStage[] = ["Planning", "Idea"];
const shortDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—");

function Heading({ eyebrow, title, sub, right }: { eyebrow: string; title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2 className="mt-2 font-display text-3xl md:text-4xl tracking-[0.08em] uppercase text-foreground">{title}</h2>
        {sub && <p className="mt-2 text-base text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function BigCard({ item, onOpen }: { item: DevItem; onOpen: (i: DevItem) => void }) {
  const cat = categoryOf(item);
  const desc = plainText(item.card.desc);
  return (
    <button onClick={() => onOpen(item)} className="group text-left imperial-panel rounded-md overflow-hidden flex flex-col hover:-translate-y-1 hover:border-gold/40 transition-all duration-300">
      <div className="relative aspect-[16/9] overflow-hidden"><DevVisual item={item} /></div>
      <div className="p-6 md:p-8 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-3"><StageChip item={item} />{cat && <span className="text-sm text-gold-soft">{cat}</span>}</div>
        <h3 className="mt-4 font-display text-2xl md:text-3xl tracking-wide uppercase text-foreground group-hover:text-gold transition-colors break-words">{item.name}</h3>
        {desc && <p className="mt-3 text-base text-foreground/75 line-clamp-3">{desc}</p>}
        <div className="mt-auto pt-6 flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">{item.updated ? `Updated ${shortDate(item.updated)}` : ""}</span>
          <span className="text-gold font-semibold">View development →</span>
        </div>
      </div>
    </button>
  );
}

const Development = () => {
  const { data, isLoading, error, refetch } = useTrelloBoard(TRELLO_CONFIG.developmentBoardId);
  const [view, setView] = useState<View>("overview");
  const [cat, setCat] = useState("All");
  const [stage, setStage] = useState<DevStage | "All">("All");
  const [q, setQ] = useState("");
  const [aq, setAq] = useState("");
  const [open, setOpen] = useState<DevItem | null>(null);
  const [showAll, setShowAll] = useState(false);

  const items = useMemo(() => devItems(data).sort((a, b) => +new Date(b.updated ?? 0) - +new Date(a.updated ?? 0)), [data]);
  const ids = useMemo(() => new Set(items.map((i) => i.card.id)), [items]);
  const log = useMemo(() => activityLog(data?.actions, ids), [data, ids]);
  const building = items.filter((i) => BUILDING.includes(i.stage));
  const buildingStages = PIPELINE.filter((s) => BUILDING.includes(s) && building.some((i) => i.stage === s));
  const buildingCats = [...new Set(building.map(categoryOf).filter(Boolean) as string[])].sort();

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return building.filter((i) => (cat === "All" || categoryOf(i) === cat) && (stage === "All" || i.stage === stage)
      && (!t || i.name.toLowerCase().includes(t) || i.card.desc.toLowerCase().includes(t)));
  }, [building, cat, stage, q]);

  // Never show an empty filter result: reset filters automatically.
  useEffect(() => {
    if (building.length && !shown.length && (cat !== "All" || stage !== "All")) { setCat("All"); setStage("All"); }
  }, [building.length, shown.length, cat, stage]);

  const completed = items.filter((i) => i.stage === "Completed");
  const next = items.filter((i) => NEXT.includes(i.stage)).sort((a, b) => NEXT.indexOf(a.stage) - NEXT.indexOf(b.stage)).slice(0, 4);
  const featured = items.find(isSpotlight);
  const recent = useMemo(() => {
    const seen = new Set<string>();
    return log.filter((e) => e.kind !== "create" && e.cardId && !seen.has(e.cardId) && seen.add(e.cardId)).slice(0, 6);
  }, [log]);
  const lastUpdate = data?.dateLastActivity ?? items[0]?.updated;
  const devCount = items.filter((i) => i.stage === "In Development").length;
  const testCount = items.filter((i) => i.stage === "Testing").length;
  const stats = [
    devCount > 0 && { v: String(devCount), l: "Active systems" },
    testCount > 0 && { v: String(testCount), l: "In testing" },
    lastUpdate && { v: shortDate(lastUpdate), l: "Last update" },
  ].filter(Boolean) as { v: string; l: string }[];

  const archive = useMemo(() => {
    const t = aq.trim().toLowerCase();
    return items.filter((i) => !BUILDING.includes(i.stage) || i.stage === "Completed")
      .filter((i) => i.stage === "Completed" || i.stage === "Paused")
      .filter((i) => !t || i.name.toLowerCase().includes(t) || i.card.desc.toLowerCase().includes(t));
  }, [items, aq]);

  const go = (v: View) => { setView(v); requestAnimationFrame(() => document.getElementById("dev-main")?.scrollIntoView({ behavior: "smooth" })); };

  const Timeline = ({ entries, withTime }: { entries: typeof log; withTime?: boolean }) => {
    const groups: [string, typeof log][] = [];
    for (const e of entries) { const d = dayLabel(e.date); const g = groups.find((x) => x[0] === d); g ? g[1].push(e) : groups.push([d, [e]]); }
    return (
      <div className="relative pl-7">
        <div className="absolute left-2 top-1 bottom-1 w-px bg-gradient-to-b from-gold/60 via-crimson/40 to-transparent" />
        {groups.map(([day, es]) => (
          <div key={day} className="mb-8 last:mb-0">
            <div className="relative -ml-7 mb-3 flex items-center gap-3">
              <span className="h-4 w-4 rotate-45 border border-gold bg-background ml-0.5 shrink-0" />
              <span className="font-display tracking-[0.15em] uppercase text-base text-gold">{day}</span>
            </div>
            <ul className="space-y-3">
              {es.map((e) => {
                const it = items.find((i) => i.card.id === e.cardId);
                return (
                  <li key={e.id}>
                    <button onClick={() => it && setOpen(it)} className="w-full text-left flex gap-4 items-baseline group">
                      {withTime && <span className="text-xs tabular-nums text-muted-foreground w-12 shrink-0">{new Date(e.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
                      <span className="text-base text-foreground/90 group-hover:text-gold transition-colors break-words min-w-0">{e.text}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-background overflow-x-hidden">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <img src={buildImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="container relative py-14 md:py-20">
          <div className="text-[11px] tracking-[0.4em] uppercase text-gold">Imperial Engineering</div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-7xl tracking-[0.08em] uppercase text-foreground">Building Rome.</h1>
          <p className="mt-5 max-w-xl text-base md:text-lg text-foreground/75">Follow the systems, environments and technology being developed across the Roman experience.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => go("overview")} className="px-5 py-3 bg-gradient-gold text-background text-xs tracking-[0.25em] uppercase rounded-sm">View development</button>
            <button onClick={() => go("board")} className="px-5 py-3 border border-gold/40 text-gold text-xs tracking-[0.25em] uppercase rounded-sm hover:bg-gold/10">View board</button>
          </div>
        </div>
      </section>

      {isLoading && <div className="container py-16 grid md:grid-cols-2 gap-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="imperial-panel rounded-md h-80 animate-pulse" />)}</div>}
      {error && <div className="container py-16"><TrelloEmptyState message="Development board unavailable" hint="Make sure the Imperial Development board is public." onRetry={() => refetch()} /></div>}

      {data && (
        <>
          {stats.length > 0 && (
            <section className="border-b border-border bg-surface-1">
              <div className={cn("container grid divide-y sm:divide-y-0 sm:divide-x divide-border", stats.length === 3 ? "sm:grid-cols-3" : stats.length === 2 ? "sm:grid-cols-2" : "")}>
                {stats.map((s) => (
                  <div key={s.l} className="py-6 md:py-8 px-2 sm:px-6 flex sm:block items-baseline gap-4">
                    <div className="font-display text-4xl md:text-5xl text-foreground tabular-nums uppercase">{s.v}</div>
                    <div className="sm:mt-2 text-sm tracking-[0.15em] uppercase text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div id="dev-main" className="container pt-10 scroll-mt-20">
            <div className="inline-flex gap-1 p-1 rounded-sm border border-border bg-surface-1">
              {(["overview", "board", "archive"] as View[]).map((v) => (
                <button key={v} onClick={() => setView(v)} className={cn("px-4 sm:px-5 py-2 text-xs tracking-[0.2em] uppercase rounded-sm transition", view === v ? "bg-gold/15 text-gold" : "text-muted-foreground hover:text-foreground")}>{v}</button>
              ))}
            </div>
          </div>

          <div className="container py-12 space-y-20 md:space-y-24">
            {view === "overview" && (
              <>
                {building.length > 0 && (
                  <section>
                    <Heading eyebrow="In progress" title="What we're building" sub="The systems currently being developed for Rome."
                      right={
                        <div className="flex gap-2 w-full md:w-auto">
                          <label className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search development…" aria-label="Search development"
                              className="w-full bg-surface-1 border border-border rounded-sm pl-9 pr-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-gold/50" />
                          </label>
                          <Popover>
                            <PopoverTrigger className={cn("inline-flex items-center gap-2 px-4 py-2.5 border rounded-sm text-xs tracking-[0.2em] uppercase shrink-0", cat !== "All" || stage !== "All" ? "border-gold text-gold" : "border-border text-foreground/80")}>
                              <SlidersHorizontal className="h-4 w-4" />Filter
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-64 bg-surface-1 border-border">
                              {[{ t: "Status", opts: ["All", ...buildingStages], val: stage, set: (v: string) => setStage(v as DevStage | "All") },
                                ...(buildingCats.length ? [{ t: "Category", opts: ["All", ...buildingCats], val: cat, set: setCat }] : [])].map((g) => (
                                <div key={g.t} className="mb-4 last:mb-0">
                                  <div className="eyebrow mb-2">{g.t}</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {g.opts.map((o) => <button key={o} onClick={() => g.set(o)} className={cn("px-2.5 py-1 text-sm rounded-sm border", g.val === o ? "border-gold text-gold bg-gold/10" : "border-border text-muted-foreground hover:text-foreground")}>{o}</button>)}
                                  </div>
                                </div>
                              ))}
                            </PopoverContent>
                          </Popover>
                        </div>
                      } />
                    {shown.length ? (
                      <>
                        <div className="grid md:grid-cols-2 gap-6 md:gap-8">{(showAll ? shown : shown.slice(0, 4)).map((i) => <BigCard key={i.card.id} item={i} onOpen={setOpen} />)}</div>
                        {shown.length > 4 && !showAll && <button onClick={() => setShowAll(true)} className="mt-8 text-sm font-semibold text-gold">View all development ({shown.length}) →</button>}
                      </>
                    ) : <p className="text-muted-foreground">No development matches "{q}".</p>}
                  </section>
                )}

                {featured && (
                  <section>
                    <Heading eyebrow="Spotlight" title="Featured development" />
                    <button onClick={() => setOpen(featured)} className="group w-full text-left grid lg:grid-cols-[1.3fr_1fr] imperial-panel rounded-md overflow-hidden hover:border-gold/40 transition">
                      <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[360px] overflow-hidden"><DevVisual item={featured} /></div>
                      <div className="p-6 md:p-10 flex flex-col">
                        <StageChip item={featured} className="self-start" />
                        <h3 className="mt-4 font-display text-3xl md:text-4xl tracking-wide uppercase text-foreground group-hover:text-gold transition-colors break-words">{featured.name}</h3>
                        {featured.card.desc && <p className="mt-4 text-base text-foreground/75 line-clamp-5">{plainText(featured.card.desc)}</p>}
                        <span className="mt-auto pt-8 inline-flex self-start px-5 py-3 border border-gold/40 text-gold text-xs tracking-[0.25em] uppercase rounded-sm">View update</span>
                      </div>
                    </button>
                  </section>
                )}

                {(recent.length > 0 || next.length > 0) && (
                  <div className="grid lg:grid-cols-2 gap-16">
                    {recent.length > 0 && (
                      <section>
                        <Heading eyebrow="Latest changes" title="Recent development" />
                        <Timeline entries={recent} />
                        <button onClick={() => go("archive")} className="mt-6 text-sm font-semibold text-gold">View all activity →</button>
                      </section>
                    )}
                    {next.length > 0 && (
                      <section>
                        <Heading eyebrow="Coming next" title="What's next" />
                        <ol className="space-y-3">
                          {next.map((i, n) => (
                            <li key={i.card.id}>
                              <button onClick={() => setOpen(i)} className="group w-full text-left flex items-center gap-5 imperial-panel rounded-md p-5 hover:border-gold/40 transition">
                                <span className="font-display text-3xl text-gold/70 tabular-nums w-10 shrink-0">{String(n + 1).padStart(2, "0")}</span>
                                <span className="min-w-0 flex-1">
                                  <span className="block font-serif text-xl text-foreground group-hover:text-gold break-words">{i.name}</span>
                                  {categoryOf(i) && <span className="block mt-1 text-sm text-muted-foreground">{categoryOf(i)}</span>}
                                </span>
                                <ArrowRight className="h-4 w-4 text-gold/50 shrink-0" />
                              </button>
                            </li>
                          ))}
                        </ol>
                        <button onClick={() => go("board")} className="mt-6 text-sm font-semibold text-gold">View roadmap →</button>
                      </section>
                    )}
                  </div>
                )}

                {completed.length > 0 && (
                  <section>
                    <Heading eyebrow="Finished" title="Recently completed" sub="The latest systems and improvements completed for Rome." />
                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">{completed.slice(0, 4).map((i) => <BigCard key={i.card.id} item={i} onOpen={setOpen} />)}</div>
                  </section>
                )}

                <section className="imperial-panel rounded-md p-8 md:p-12 text-center">
                  <h2 className="font-display text-2xl md:text-3xl tracking-[0.1em] uppercase">Explore development</h2>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button onClick={() => go("board")} className="px-5 py-3 bg-gradient-gold text-background text-xs tracking-[0.25em] uppercase rounded-sm">View board</button>
                    <button onClick={() => go("archive")} className="px-5 py-3 border border-gold/40 text-gold text-xs tracking-[0.25em] uppercase rounded-sm hover:bg-gold/10">View archive</button>
                  </div>
                </section>
              </>
            )}

            {view === "board" && (
              <section>
                <Heading eyebrow="Full workflow" title="Development board" sub="Every item on the board, from first idea to release." />
                <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
                  {PIPELINE.filter((s) => items.some((i) => i.stage === s)).map((s) => {
                    const col = items.filter((i) => i.stage === s);
                    return (
                      <div key={s} className="snap-start w-[80vw] max-w-[320px] shrink-0 rounded-md border border-border bg-surface-1/80">
                        <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                          <span className="font-display text-sm tracking-[0.2em] uppercase text-gold">{s}</span>
                          <span className="text-sm text-muted-foreground tabular-nums">{col.length}</span>
                        </div>
                        <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
                          {col.map((i) => {
                            const img = getCardImage(i.card);
                            return (
                              <button key={i.card.id} onClick={() => setOpen(i)} className="w-full text-left rounded-sm border border-border bg-surface-2/70 hover:border-gold/40 transition overflow-hidden">
                                {img && <img src={img} alt="" loading="lazy" className="w-full h-28 object-cover" />}
                                <div className="p-3">
                                  <div className="text-base text-foreground break-words">{i.name}</div>
                                  <div className="mt-1 flex justify-between gap-2 text-xs text-muted-foreground"><span className="truncate">{categoryOf(i) ?? ""}</span><span className="shrink-0">{relTime(i.updated)}</span></div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {view === "archive" && (
              <>
                <section>
                  <Heading eyebrow="History" title="Development archive" sub="Completed, paused and historic systems."
                    right={<label className="relative w-full md:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input value={aq} onChange={(e) => setAq(e.target.value)} placeholder="Search the archive…" aria-label="Search archive"
                        className="w-full bg-surface-1 border border-border rounded-sm pl-9 pr-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-gold/50" /></label>} />
                  {archive.length
                    ? <div className="grid md:grid-cols-2 gap-6 md:gap-8">{archive.map((i) => <BigCard key={i.card.id} item={i} onOpen={setOpen} />)}</div>
                    : <p className="text-muted-foreground">{aq ? `Nothing in the archive matches "${aq}".` : "No completed development yet."}</p>}
                </section>
                {log.length > 0 && (
                  <section className="max-w-3xl">
                    <Heading eyebrow="Every change" title="All activity" />
                    <Timeline entries={log.filter((e) => !aq || e.text.toLowerCase().includes(aq.toLowerCase()))} withTime />
                  </section>
                )}
              </>
            )}

            <a href={`https://trello.com/b/${TRELLO_CONFIG.developmentBoardId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-gold">
              Open the original board <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </>
      )}

      <DevDetail item={open} board={data} onClose={() => setOpen(null)} />
    </div>
  );
};

export default Development;
