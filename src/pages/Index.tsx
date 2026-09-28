import { Link } from "react-router-dom";
import { ArrowRight, Building2, Shield, Network, Cog, Scale, Search, Activity, Landmark } from "lucide-react";
import logo from "@/assets/sjc-logo.png";
import SocialLinks from "@/components/SocialLinks";
import SectionHeader from "@/components/SectionHeader";
import RotatingQuotes from "@/components/RotatingQuotes";
import { Button } from "@/components/ui/button";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG } from "@/config/trello";

const SECTIONS = [

  {
    icon: Building2,
    title: "Government",
    blurb: "Senate, consuls, and imperial offices of the Republic.",
    href: "/government",
    code: "I",
  },
  {
    icon: Shield,
    title: "Military",
    blurb: "Legions, auxilia, and command structure of Rome.",
    href: "/military",
    code: "II",
  },
  {
    icon: Network,
    title: "Departments",
    blurb: "Organizations, ministries, and civil bureaus.",
    href: "/departments",
    code: "III",
  },
  {
    icon: Cog,
    title: "Development",
    blurb: "Active features, builds, and roadmap of the Empire.",
    href: "/development",
    code: "IV",
  },
];

const Index = () => {
  const info = useTrelloBoard(TRELLO_CONFIG.informationBoardId);
  const dev = useTrelloBoard(TRELLO_CONFIG.developmentBoardId);

  const stats = [
    { label: "Lists", value: info.data?.lists.length ?? "—" },
    { label: "Records", value: info.data?.cards.length ?? "—" },
    { label: "Dev Items", value: dev.data?.cards.length ?? "—" },
    { label: "Sync", value: "60s" },
  ];

  return (
    <>
      <section className="container py-8 md:py-12">
        <div className="border-y-4 border-crimson py-5">
          <div className="flex items-center justify-between border-b border-border pb-3 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
            <span>Official State Archive</span>
            <span className="hidden sm:block">Roma · Senatus · Populus</span>
            <span className="text-gold">Live Records</span>
          </div>

          <div className="py-8 text-center md:py-10">
            <div className="mb-4 text-[10px] uppercase tracking-[0.35em] text-gold">Senatus Populusque Romanus</div>
            <h1 className="font-display text-5xl font-bold uppercase leading-[0.9] text-foreground sm:text-7xl lg:text-8xl">
              Roman Imperial
              <span className="mt-2 block text-crimson">Mainframe</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-serif text-xl italic leading-snug text-muted-foreground md:text-2xl">
              The official intelligence archive of Rome—uniting its government, legions, civil offices, and development record.
            </p>
          </div>

          <div className="grid gap-0 border-t border-border lg:grid-cols-12">
            <aside className="py-8 lg:col-span-3 lg:border-r lg:border-border lg:pr-8">
              <div className="flex items-center gap-2 border-b-2 border-crimson pb-2 font-display text-xs uppercase text-gold">
                <Activity className="h-4 w-4" /> Mainframe status
              </div>
              <div className="divide-y divide-border">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-end justify-between py-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</span>
                    <span className="font-serif text-3xl leading-none text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-l-2 border-gold bg-secondary p-4 text-sm leading-relaxed text-muted-foreground">
                Records are synchronized directly from the Roman Information Management Mainframe.
              </div>
            </aside>

            <div className="border-y border-border py-8 lg:col-span-6 lg:border-y-0 lg:px-8">
              <div className="relative mx-auto aspect-square max-w-[520px] overflow-hidden bg-card">
                <div className="absolute inset-4 border border-gold/30" />
                <div className="absolute inset-8 border border-crimson/50" />
                <img
                  src={logo}
                  alt="Senatus Populusque Romanus golden eagle crest"
                  className="relative h-full w-full object-contain p-10 transition-transform duration-700 hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-background/90 px-6 py-4 text-center">
                  <div className="font-display text-xs uppercase tracking-[0.25em] text-gold">Aquila Imperii</div>
                </div>
              </div>
            </div>

            <aside className="py-8 lg:col-span-3 lg:border-l lg:border-border lg:pl-8">
              <div className="border-b-2 border-crimson pb-2 font-display text-xs uppercase text-gold">Access the state</div>
              <h2 className="mt-5 font-serif text-4xl leading-none">All roads lead to Rome.</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Enter the central register or inspect court records through the independent judicial authority.
              </p>
              <div className="mt-7 grid gap-3">
                <Button asChild size="lg" className="justify-between rounded-none bg-crimson text-accent-foreground hover:bg-crimson-deep">
                  <Link to="/government">Enter Mainframe <ArrowRight /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="justify-between rounded-none border-gold/50 bg-transparent text-gold hover:bg-gold/10 hover:text-gold">
                  <Link to="/judicial"><Scale /> Judicial System</Link>
                </Button>
              </div>
              <div className="mt-10 border-t border-border pt-6">
                <div className="mb-3 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">Join the Empire</div>
                <SocialLinks variant="labeled" />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <RotatingQuotes />

      <section className="container py-16 md:py-24">
        <SectionHeader
          eyebrow="The State Register"
          title="Pillars of the Empire"
          subtitle="Four living archives form the administrative record of Rome. Each is synchronized every sixty seconds."
        />
        <div className="grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((s, i) => (
            <Link
              key={s.title}
              to={s.href}
              style={{ animationDelay: `${i * 80}ms` }}
              className="group relative min-h-[290px] border-b border-border p-6 transition-colors duration-300 hover:bg-card sm:border-r lg:border-b-0 last:border-r-0 animate-fade-up"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center border border-gold/40 text-gold transition group-hover:bg-crimson group-hover:text-accent-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="font-serif text-4xl text-gold/30">{s.code}</span>
              </div>
              <h3 className="mt-10 font-serif text-3xl text-foreground group-hover:text-gold transition-colors">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.blurb}</p>
              <div className="absolute bottom-6 left-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gold">
                Open archive <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>


      <section className="border-y border-border bg-card">
        <div className="container grid gap-0 md:grid-cols-[1fr_280px]">
          <div className="py-12 md:border-r md:border-border md:py-16 md:pr-14">
            <div>
              <div className="flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase text-gold mb-4">
                <Scale className="h-4 w-4" /> Curia Iustitiae
              </div>
              <h2 className="font-serif text-5xl md:text-6xl text-foreground leading-none">
                Judicial System
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl">
                Access court records, criminal cases, and legal proceedings. The judicial archive remains an independent authority integrated into the mainframe.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-none bg-crimson text-accent-foreground hover:bg-crimson-deep"><Link to="/judicial">Open Judicial Database <ArrowRight /></Link></Button>
                <Button asChild variant="outline" size="lg" className="rounded-none bg-transparent"><Link to="/search"><Search /> Search Archives</Link></Button>
              </div>
            </div>
          </div>
          <div className="flex min-h-52 items-center justify-center border-t border-border bg-crimson-deep/30 md:border-t-0">
            <div className="text-center">
              <Landmark className="mx-auto h-16 w-16 text-gold" />
              <div className="mt-4 font-display text-xs uppercase tracking-[0.25em] text-gold">Lex · Ordo · Iustitia</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
