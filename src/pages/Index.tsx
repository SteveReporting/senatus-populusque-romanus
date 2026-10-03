import { Link } from "react-router-dom";
import { ArrowRight, Building2, Shield, Network, Cog, Scale, Search, Activity, Landmark, Users, BookOpen } from "lucide-react";
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
      <section className="container py-8 md:py-14">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-imperial">
          <div className="grid items-stretch lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-center p-8 md:p-14 lg:p-16">
              <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-crimson">
                <span className="h-0.5 w-9 bg-crimson" /> Senate and People of Rome
              </div>
              <h1 className="font-serif text-6xl font-bold leading-[0.9] text-foreground sm:text-7xl lg:text-8xl">
                Welcome to
                <span className="mt-2 block text-crimson">SPQR</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Join Senatus Populusque Romanus, a living Roman roleplay community on Roblox. Find your place in the legions, government, civil organizations, or among the citizens of Rome.
              </p>
              <div className="mt-8">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                  <Users className="h-4 w-4 text-gold" /> Join the community
                </div>
                <SocialLinks variant="labeled" size="md" />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="outline" size="lg" className="border-laurel rounded-md bg-transparent">
                  <Link to="/government"><BookOpen /> Explore the archives</Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="text-crimson hover:bg-crimson/10 hover:text-crimson">
                  <Link to="/development">See development <ArrowRight /></Link>
                </Button>
              </div>
            </div>

            <div className="relative flex min-h-[440px] items-center justify-center overflow-hidden border-t border-border bg-secondary lg:min-h-[620px] lg:border-l lg:border-t-0">
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(45deg,hsl(var(--gold)/0.12)_25%,transparent_25%,transparent_75%,hsl(var(--gold)/0.12)_75%),linear-gradient(45deg,hsl(var(--gold)/0.12)_25%,transparent_25%,transparent_75%,hsl(var(--gold)/0.12)_75%)] [background-position:0_0,20px_20px] [background-size:40px_40px]" />
              <div className="absolute inset-x-0 top-0 h-2 bg-gold" />
              <img
                src={logo}
                alt="Senatus Populusque Romanus golden eagle crest"
                className="relative z-10 w-[78%] max-w-md object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-[1.03]"
              />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[10px] uppercase tracking-[0.25em] text-gold-deep">Senatus · Populusque · Romanus</div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-t border-border bg-background/50 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border-b border-r border-border p-5 text-center md:border-b-0 last:border-r-0">
                <div className="font-serif text-3xl font-semibold text-foreground">{s.value}</div>
                <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-24">
        <SectionHeader
          eyebrow="Discover the Community"
          title="Find your place in Rome"
          subtitle="Explore the institutions, legions, organizations, and projects that make up the SPQR community."
        />
        <div className="grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((s, i) => (
            <Link
              key={s.title}
              to={s.href}
              style={{ animationDelay: `${i * 80}ms` }}
              className="group relative min-h-[290px] border-b border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-panel sm:border-r lg:border-b-0 last:border-r-0 animate-fade-up"
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

      <RotatingQuotes />


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
          <div className="flex min-h-52 items-center justify-center border-t border-border bg-secondary md:border-t-0">
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
