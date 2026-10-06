import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, BookOpen, CalendarDays, Clock3, Gamepad2, Gavel, Hammer, Landmark,
  MapPinned, Scale, ScrollText, Search, Shield, Users, Crown
} from "lucide-react";
import logo from "@/assets/sjc-logo.png";
import battleAsset from "@/assets/roman-battle.webp.asset.json";
import siegeAsset from "@/assets/roman-siege.webp.asset.json";
import patternImg from "@/assets/roman-pattern.jpg";
import { Button } from "@/components/ui/button";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG } from "@/config/trello";
import { SOCIAL_LINKS } from "@/config/social";
import { ANNOUNCEMENTS, sortAnnouncements, upcomingEvents } from "@/data/community";
import { devItems, STAGE_STYLE } from "@/lib/development";
import { cn } from "@/lib/utils";

const PILLARS = [
  { icon: Crown, title: "The Cursus Honorum", text: "Career advancement paths for civic politicians and legionaries.", to: "/cursus-honorum" },
  { icon: Scale, title: "Lex Romana", text: "The codified laws, judicial rules and public legal records of Rome.", to: "/lex" },
  { icon: MapPinned, title: "Forum & Territory Map", text: "Operational map of the Forum, Curia, Castra and principal districts.", to: "/map" },
  { icon: Gavel, title: "Senate Voting Docket", text: "Track proposals, debate status, deadlines and enacted decrees.", to: "/senate/docket" },
];

const PROMPTS = [
  "How do I join a Legion?",
  "What does a Quaestor do?",
  "When is the next Senate session?",
  "Combat weapon keybinds",
];

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const Wrap = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("mx-auto w-full max-w-[1560px] px-[clamp(1rem,3vw,3rem)]", className)}>{children}</div>
);

const SectionTitle = ({ eyebrow, title, action, to }: { eyebrow: string; title: string; action?: string; to?: string }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="mt-2 font-display text-3xl font-black uppercase tracking-wide text-foreground md:text-4xl">{title}</h2>
    </div>
    {to && action && <Link to={to} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold hover:text-gold-soft">{action}<ArrowRight className="h-4 w-4"/></Link>}
  </div>
);

export default function Index() {
  const nav = useNavigate();
  const [ask, setAsk] = useState("");
  const [citizen, setCitizen] = useState("");
  const [now, setNow] = useState(Date.now());
  const info = useTrelloBoard(TRELLO_CONFIG.informationBoardId);
  const dev = useTrelloBoard(TRELLO_CONFIG.developmentBoardId);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const posts = sortAnnouncements(ANNOUNCEMENTS);
  const events = upcomingEvents(now);
  const nextEvent = events[0];
  const allDev = devItems(dev.data);
  const activeDev = allDev.filter((d) => d.stage !== "Completed" && d.stage !== "Idea" && d.stage !== "Paused");

  const magistrates = useMemo(() => {
    if (!info.data) return [];
    return info.data.cards.filter((c) => /consul|praetor|legat/i.test(c.name)).slice(0, 3);
  }, [info.data]);

  const bills = useMemo(() => {
    if (!info.data) return [];
    return info.data.cards.filter((c) => /bill|senatus consult|proposal|motion|decree/i.test(c.name + " " + c.desc)).slice(0, 3);
  }, [info.data]);

  const developmentPulse = [
    activeDev.find((d) => d.stage === "In Development"),
    activeDev.find((d) => d.stage === "Testing"),
    allDev.find((d) => d.stage === "Completed"),
  ];

  const countdown = nextEvent
    ? Math.max(0, +new Date(nextEvent.date) - now)
    : 0;
  const days = Math.floor(countdown / 86_400_000);
  const hours = Math.floor((countdown % 86_400_000) / 3_600_000);
  const mins = Math.floor((countdown % 3_600_000) / 60_000);

  const submitAsk = (e: FormEvent) => {
    e.preventDefault();
    const q = ask.trim();
    if (q) nav("/ask?q=" + encodeURIComponent(q));
  };

  const submitCitizen = (e: FormEvent) => {
    e.preventDefault();
    const q = citizen.trim();
    if (q) nav("/census?user=" + encodeURIComponent(q));
  };

  return (
    <div className="community-home bg-background">
      <section className="home-gfx-hero relative overflow-hidden border-b border-gold/25">
        <img src={battleAsset.url} alt="Roman legionaries clashing shields on the battlefield" fetchPriority="high" className="home-battle-art absolute inset-0 h-full w-full object-cover"/>
        <div className="home-hero-shade absolute inset-0"/>
        <Wrap className="relative flex min-h-[640px] items-center py-12 md:min-h-[680px] md:py-16">
          <div className="w-full max-w-[680px] animate-fade-up">
            <div className="mb-6 flex items-center gap-4">
              <img src={logo} alt="SPQR crest" className="h-14 w-14 object-contain md:h-16 md:w-16"/>
              <div className="border-l border-gold/40 pl-4"><div className="eyebrow">Official Community Portal</div><div className="mt-1 text-xs text-foreground/70">Senate · People · Rome</div></div>
            </div>
            <h1 className="home-title font-serif text-4xl font-bold uppercase leading-[1.13] text-foreground sm:text-5xl lg:text-6xl">
              Senatus<br/>Populusque<br/><span className="text-gold">Romanus</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-foreground/85 md:text-lg">
              The official portal, government tabularium and legionary command centre of Rome.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 bg-gold px-5 text-xs font-semibold text-primary-foreground hover:bg-gold-soft">
                <a href={SOCIAL_LINKS.roblox} target="_blank" rel="noopener noreferrer"><Gamepad2 className="h-4 w-4"/>Enter the Realm<ArrowRight className="h-4 w-4"/></a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-gold/40 bg-background/55 px-5 text-xs font-semibold text-foreground hover:bg-background/80">
                <Link to="/military"><Shield className="h-4 w-4"/>Enlist in a Legion</Link>
              </Button>
            </div>
          </div>
        </Wrap>
      </section>

      <section className="relative border-b border-border bg-surface-2 py-5">
        <Wrap>
          <div className="home-archive-search">
            <form onSubmit={submitAsk} className="flex items-center gap-3">
              <ScrollText className="ml-1 hidden h-5 w-5 shrink-0 text-gold sm:block"/>
              <input value={ask} onChange={(e) => setAsk(e.target.value)} maxLength={500} placeholder="Ask anything about laws, rank requirements, legions, or game mechanics…" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"/>
              <Button type="submit" className="h-11 shrink-0 bg-gold px-3 text-xs font-semibold text-primary-foreground hover:bg-gold-soft">
                <span className="hidden sm:inline">Consult Archives</span><ArrowRight className="h-4 w-4"/>
              </Button>
            </form>
            <div className="mt-2 flex gap-2 overflow-x-auto border-t border-border/70 pt-3">
              {PROMPTS.map((p) => <Button type="button" variant="ghost" size="sm" key={p} onClick={() => nav("/ask?q=" + encodeURIComponent(p))} className="h-8 shrink-0 px-2 text-xs font-normal text-muted-foreground hover:text-gold">{p}<ArrowRight className="h-3 w-3"/></Button>)}
            </div>
          </div>
        </Wrap>
      </section>

      <section className="py-12 md:py-14">
        <Wrap>
          <SectionTitle eyebrow="Imperial Commands" title="Navigate Rome"/>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {PILLARS.map((p) => (
              <Link key={p.title} to={p.to} className="group rounded-lg border border-border bg-surface-2 p-5 transition hover:-translate-y-0.5 hover:border-gold/45">
                <div className="flex items-start justify-between gap-4"><p.icon className="h-6 w-6 text-gold"/><ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-gold"/></div>
                <h3 className="mt-5 font-display text-lg font-bold uppercase text-foreground group-hover:text-gold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </Link>
            ))}
          </div>
        </Wrap>
      </section>

      <section className="border-y border-border bg-surface-1 py-12 md:py-14">
        <Wrap>
          <SectionTitle eyebrow="Citizen Intelligence" title="State of the Empire"/>
          <div className="grid gap-5 xl:grid-cols-[1.45fr_.8fr]">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="imperial-panel rounded-lg p-5">
                <div className="flex items-center justify-between"><div className="eyebrow">Latest Imperial Decrees</div><Link to="/announcements" className="text-xs text-gold">All notices</Link></div>
                <div className="mt-4 space-y-3">
                  {posts.slice(0, 4).map((p) => (
                    <Link to="/announcements" key={p.id} className="block border-b border-border pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2"><span className="rounded border border-crimson/45 bg-crimson/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-crimson">{p.category}</span><span className="text-[10px] text-muted-foreground">{shortDate(p.date)}</span></div>
                      <h3 className="mt-1.5 font-serif text-sm font-bold text-foreground hover:text-gold">{p.title}</h3>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="imperial-panel rounded-lg p-5">
                <div className="flex items-center justify-between"><div className="eyebrow">Active Senate Bills</div><Link to="/senate/docket" className="text-xs text-gold">Open docket</Link></div>
                <div className="mt-4 space-y-3">
                  {bills.length ? bills.map((b) => (
                    <Link to="/senate/docket" key={b.id} className="block border-b border-border pb-3 last:border-0 last:pb-0">
                      <h3 className="font-serif text-sm font-bold text-foreground hover:text-gold">{b.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{b.desc || "Official record published without a description."}</p>
                    </Link>
                  )) : <p className="text-sm text-muted-foreground">{info.isLoading ? "Reading the Senate archives…" : "No active bill records are currently classified."}</p>}
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              <div className="rounded-lg border border-gold/25 bg-surface-2 p-5">
                <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-gold"/><div className="eyebrow">Next Up</div></div>
                {nextEvent ? (
                  <>
                    <h3 className="mt-3 font-display text-xl font-bold uppercase">{nextEvent.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(nextEvent.date).toLocaleString("en-GB")} · {nextEvent.location}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[["Days",days],["Hours",hours],["Mins",mins]].map(([label,value]) => <div key={String(label)} className="rounded-lg border border-border bg-background p-3 text-center"><div className="font-display text-2xl font-black text-gold">{value}</div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div></div>)}
                    </div>
                  </>
                ) : <p className="mt-3 text-sm text-muted-foreground">No scheduled event is currently published.</p>}
              </div>

              <div className="rounded-lg border border-border bg-surface-2 p-5">
                <div className="eyebrow">Magistrates of the Month</div>
                <div className="mt-4 space-y-3">
                  {magistrates.length ? magistrates.map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <img src={logo} alt="" className="h-9 w-9 rounded-full border border-gold/25 bg-background p-1"/>
                      <div className="min-w-0"><div className="truncate text-sm font-semibold text-foreground">{m.name}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Official archive record</div></div>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">Current magistrates will appear here when matching official records are published.</p>}
                </div>
              </div>
            </div>
          </div>
        </Wrap>
      </section>

      <section className="py-12 md:py-14">
        <Wrap>
          <SectionTitle eyebrow="Forum Romanum" title="Interactive Forum Preview" action="Open Full Map" to="/map"/>
          <Link to="/map" className="group relative block min-h-[360px] overflow-hidden rounded-lg border border-gold/25 bg-surface-2">
            <img src={patternImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"/>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,hsl(var(--background)/.78))]"/>
            {[
              ["Curia Julia","52%","39%"],["Castra Praetoria","76%","24%"],["Rostra","56%","61%"],["Basilica Julia","42%","67%"],["Temple of Jupiter","25%","28%"]
            ].map(([name,left,top]) => (
              <span key={name} style={{left,top}} className="absolute -translate-x-1/2 -translate-y-1/2">
                <span className="absolute inset-0 animate-ping rounded-full bg-gold/30"/>
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gold/60 bg-background/90"><Landmark className="h-4 w-4 text-gold"/></span>
                <span className="absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap rounded bg-background/85 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-gold opacity-0 transition group-hover:opacity-100">{name}</span>
              </span>
            ))}
            <div className="absolute bottom-6 left-6 max-w-lg">
              <div className="eyebrow">Operational city view</div>
              <h3 className="mt-2 font-display text-3xl font-black uppercase">The heart of Roman power.</h3>
              <p className="mt-2 text-sm text-foreground/75">Select civic, military, judicial and sacred zones in the full territory map.</p>
            </div>
          </Link>
        </Wrap>
      </section>

      <section className="border-y border-border bg-surface-1 py-12 md:py-14">
        <Wrap>
          <SectionTitle eyebrow="Building Rome" title="Development Pulse" action="Open workbench" to="/development"/>
          <div className="grid gap-4 lg:grid-cols-3">
            {developmentPulse.map((d, i) => {
              const labels = ["Currently in Development", "Testing Stage", "Recently Deployed"];
              return (
                <Link to="/development" key={labels[i]} className="rounded-lg border border-border bg-surface-2 p-5 hover:border-gold/45">
                  <div className="flex items-center justify-between gap-3"><div className="eyebrow">{labels[i]}</div><Hammer className="h-4 w-4 text-gold"/></div>
                  {d ? (
                    <>
                      <h3 className="mt-4 font-serif text-lg font-bold">{d.name}</h3>
                      <span className={cn("mt-3 inline-flex rounded border px-2 py-1 text-[9px] font-bold uppercase tracking-wider", STAGE_STYLE[d.stage])}>{d.stage}</span>
                    </>
                  ) : <p className="mt-4 text-sm text-muted-foreground">{dev.isLoading ? "Loading live Trello data…" : "No matching development card is currently published."}</p>}
                </Link>
              );
            })}
          </div>
        </Wrap>
      </section>

      <section className="py-12 md:py-14">
        <Wrap className="grid items-center gap-6 border-t border-gold/20 py-8 md:grid-cols-[.7fr_1.3fr]">
          <div>
            <div className="eyebrow">Citizen Census</div>
            <h2 className="mt-2 font-display text-3xl font-black uppercase">Find a citizen.</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Lookup a Roblox profile now; verified branch, service and decoration records can be layered onto the same census card.</p>
          </div>
          <form onSubmit={submitCitizen} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
            <Search className="ml-2 h-4 w-4 shrink-0 text-gold"/>
            <input value={citizen} onChange={(e) => setCitizen(e.target.value)} placeholder="Search citizen by Roblox username…" className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none"/>
            <Button type="submit" className="h-11 shrink-0 bg-crimson px-3 text-xs text-accent-foreground hover:bg-crimson-deep"><span className="hidden sm:inline">Search Census</span><Search className="h-4 w-4"/></Button>
          </form>
        </Wrap>
      </section>

      <section className="home-siege-scene relative overflow-hidden border-t border-gold/25 py-20 md:py-24">
        <img src={siegeAsset.url} alt="Roman legionaries and cavalry advancing through a forest siege" loading="lazy" className="absolute inset-0 h-full w-full object-cover"/>
        <div className="home-siege-shade absolute inset-0"/>
        <Wrap className="relative flex flex-col items-center text-center">
          <Users className="h-8 w-8 text-gold"/>
          <h2 className="mt-4 font-display text-3xl font-black uppercase md:text-5xl">Roma Aeterna.</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Government, law, military command, development and community records—organised into one Roman mainframe.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-crimson text-accent-foreground hover:bg-crimson-deep"><a href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer"><Users className="h-4 w-4"/>Join Discord</a></Button>
            <Button asChild variant="outline" className="border-gold/35"><Link to="/ask"><BookOpen className="h-4 w-4"/>Consult Archives</Link></Button>
            <Button asChild variant="outline" className="border-gold/35"><Link to="/events"><CalendarDays className="h-4 w-4"/>View Calendar</Link></Button>
          </div>
        </Wrap>
      </section>
    </div>
  );
}
