import { Link } from "react-router-dom";
import { ArrowRight, Building2, Shield, Network, Cog, Scale, Search } from "lucide-react";
import logo from "@/assets/sjc-logo.png";
import SocialLinks from "@/components/SocialLinks";
import SectionHeader from "@/components/SectionHeader";
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
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-gold pointer-events-none" />
        <div className="absolute inset-0 scanline opacity-40 pointer-events-none" />
        <div className="container relative pt-20 pb-28 md:pt-28 md:pb-36">
          <div className="grid md:grid-cols-[1.3fr_1fr] gap-12 items-center">
            <div className="animate-fade-up">
              <div className="flex items-center gap-3 text-[11px] tracking-[0.4em] uppercase text-gold/80 mb-6">
                <span className="h-px w-10 bg-gold/60" />
                Senatus · Populusque · Romanus
              </div>
              <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] text-foreground">
                Roman <span className="text-gold">Imperial</span>
                <br />
                Mainframe
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                The central command archive of the Roman state — government, legions,
                departments, development, and judicial records, all in one imperial system.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/government"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:shadow-imperial transition-all"
                >
                  Enter Mainframe <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/judicial"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-gold/50 text-gold hover:bg-gold/10 transition"
                >
                  <Scale className="h-4 w-4" /> Judicial System
                </Link>
              </div>
              <div className="mt-6">
                <div className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
                  Join the Empire
                </div>
                <SocialLinks variant="labeled" />
              </div>
              <div className="mt-10 grid grid-cols-4 gap-4 max-w-lg">
                {stats.map((s) => (
                  <div key={s.label} className="imperial-panel rounded-md px-3 py-3">
                    <div className="font-display text-gold text-lg">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="absolute inset-0 rounded-full bg-gold/10 blur-3xl" />
              <img
                src={logo}
                alt="Senatus Populusque Romanus golden eagle crest"
                className="relative w-full max-w-md mx-auto drop-shadow-[0_0_60px_hsl(var(--gold)/0.35)]"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.5em] text-gold-soft uppercase">
                Aquila Imperii
              </div>
            </div>
          </div>
        </div>
        <div className="meander h-1" />
      </section>

      {/* SECTIONS GRID */}
      <section className="container py-20">
        <SectionHeader
          eyebrow="Mainframe Sections"
          title="Pillars of the State"
          subtitle="Each archive is sourced live from the Imperial Trello mainframe and refreshed every 60 seconds."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SECTIONS.map((s, i) => (
            <Link
              key={s.title}
              to={s.href}
              style={{ animationDelay: `${i * 80}ms` }}
              className="imperial-panel rounded-md p-6 group hover:border-gold/50 hover:-translate-y-1 transition-all duration-300 animate-fade-up"
            >
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-md border border-gold/40 bg-surface-2 flex items-center justify-center text-gold group-hover:bg-gold/10 transition">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="font-display text-xs tracking-[0.3em] text-gold/60">{s.code}</span>
              </div>
              <h3 className="mt-5 font-serif text-2xl text-foreground group-hover:text-gold transition-colors">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.blurb}</p>
              <div className="mt-5 text-[11px] uppercase tracking-widest text-gold/80 inline-flex items-center gap-1">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* JUDICIAL */}
      <section className="container py-20">
        <div className="imperial-panel rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-crimson-deep/30 via-transparent to-gold/5 pointer-events-none" />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-8 p-10 md:p-14 items-center">
            <div>
              <div className="flex items-center gap-3 text-[11px] tracking-[0.4em] uppercase text-gold/80 mb-4">
                <Scale className="h-4 w-4" /> Curia Iustitiae
              </div>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground leading-tight">
                Judicial System
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl">
                Access court records, criminal cases, and legal proceedings of the Roman state.
                The judicial archive is maintained as an external authority and integrated here.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/judicial"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:shadow-imperial transition-all"
                >
                  Open Judicial Database <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-border text-foreground hover:border-gold/50 hover:text-gold transition"
                >
                  <Search className="h-4 w-4" /> Search Archives
                </Link>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center h-32 w-32 rounded-full border-2 border-gold/40 bg-surface-2">
              <Scale className="h-12 w-12 text-gold" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
