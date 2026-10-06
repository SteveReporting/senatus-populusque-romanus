import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search, Menu, X, ChevronDown, ScrollText } from "lucide-react";
import logo from "@/assets/sjc-logo.png";
import SocialLinks from "./SocialLinks";
import ImperialTicker from "./ImperialTicker";
import { SOCIAL_LINKS } from "@/config/social";
import { JUDICIAL_URL } from "@/config/trello";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string; desc?: string; external?: boolean };
type Group = { label: string; to?: string; items?: Item[] };

const NAV: Group[] = [
  { label: "Home", to: "/" },
  {
    label: "Community",
    items: [
      { to: "/announcements", label: "Announcements", desc: "Official decrees and notices" },
      { to: "/events", label: "Events Calendar", desc: "Trainings, sessions and ceremonies" },
      { to: "/census", label: "Citizen Census", desc: "Roblox citizen lookup" },
    ],
  },
  {
    label: "Rome",
    items: [
      { to: "/government", label: "Government", desc: "Institutions and offices" },
      { to: "/military", label: "Military Legions", desc: "Legions, guards and command" },
      { to: "/cursus-honorum", label: "Cursus Honorum", desc: "Civic and military career tree" },
      { to: "/senate/docket", label: "Senate Docket", desc: "Bills, debate and enactments" },
      { to: "/map", label: "Map of Rome", desc: "Forum and operational zones" },
    ],
  },
  { label: "Development", to: "/development" },
  {
    label: "Resources",
    items: [
      { to: "/lex", label: "Lex Romana", desc: "Searchable law codex" },
      { to: JUDICIAL_URL, label: "Judicial Database", desc: "Court records and cases", external: true },
      { to: SOCIAL_LINKS.roblox, label: "Roblox Group", external: true },
      { to: SOCIAL_LINKS.discord, label: "Discord", external: true },
    ],
  },
];

const isActiveGroup = (g: Group, path: string) =>
  g.to ? (g.to === "/" ? path === "/" : path.startsWith(g.to)) : !!g.items?.some((i) => !i.external && path.startsWith(i.to.split("#")[0]));

const Dropdown = ({ g, active }: { g: Group; active: boolean }) => {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1 rounded-md px-2.5 py-2 text-[12px] font-semibold transition-colors xl:px-3 xl:text-[13px]",
          active ? "text-gold" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {g.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2 animate-scale-in">
          <div className="w-72 rounded-xl border border-border bg-popover p-1.5 shadow-imperial">
            {g.items!.map((i) =>
              i.external ? (
                <a key={i.to} href={i.to} target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2.5 hover:bg-secondary">
                  <div className="text-sm font-semibold text-foreground">{i.label} ↗</div>
                  {i.desc && <div className="text-xs text-muted-foreground">{i.desc}</div>}
                </a>
              ) : (
                <Link key={i.to} to={i.to} className="block rounded-lg px-3 py-2.5 hover:bg-secondary group">
                  <div className="text-sm font-semibold text-foreground transition-colors group-hover:text-gold">{i.label}</div>
                  {i.desc && <div className="text-xs text-muted-foreground">{i.desc}</div>}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = /input|textarea|select/i.test(target.tagName) || target.isContentEditable;
      if (typing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        nav("/search");
      } else if (e.key === "/") {
        e.preventDefault();
        nav("/search");
      }
    };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [nav]);

  return (
    <header className={cn(
      "sticky top-0 z-40 border-b transition-colors duration-300",
      scrolled ? "border-border bg-background/90 backdrop-blur-xl" : "border-border/60 bg-background/75 backdrop-blur-lg"
    )}>
      <ImperialTicker />

      <div className="mx-auto flex h-16 max-w-[1560px] items-center justify-between gap-3 px-[clamp(1rem,3vw,3rem)]">
        <Link to="/" className="group flex shrink-0 items-center gap-3">
          <img src={logo} alt="SPQR crest" className="h-10 w-10 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_hsl(var(--gold)/0.45)]" />
          <div className="hidden leading-tight sm:block">
            <div className="font-display text-sm font-bold tracking-[0.2em] text-foreground">SPQR</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Imperial Mainframe</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((g) =>
            g.items ? (
              <Dropdown key={g.label} g={g} active={isActiveGroup(g, loc.pathname)} />
            ) : (
              <NavLink
                key={g.label}
                to={g.to!}
                end={g.to === "/"}
                className={({ isActive }) =>
                  cn("relative rounded-md px-2.5 py-2 text-[12px] font-semibold transition-colors xl:px-3 xl:text-[13px]", isActive ? "text-gold" : "text-muted-foreground hover:text-foreground")
                }
              >
                {({ isActive }) => (
                  <>
                    {g.label}
                    {isActive && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-gradient-gold" />}
                  </>
                )}
              </NavLink>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/ask" className="hidden items-center gap-2 rounded-lg border border-gold/40 px-3 py-2 text-xs text-gold transition-colors hover:bg-gold/10 md:flex">
            <ScrollText className="h-4 w-4" /><span>Ask Archives</span>
          </Link>
          <Link to="/search" aria-label="Search Rome" className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card/60 px-2.5 text-xs text-muted-foreground transition-colors hover:border-gold/50 hover:text-foreground">
            <Search className="h-4 w-4" />
            <kbd className="hidden rounded border border-border bg-background px-1.5 text-[9px] xl:inline">Ctrl K</kbd>
          </Link>
          <SocialLinks className="hidden 2xl:flex" />
          <button onClick={() => setOpen((o) => !o)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground lg:hidden" aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-6rem)] overflow-y-auto border-t border-border bg-background animate-fade-in lg:hidden">
          <div className="mx-auto max-w-[1560px] space-y-5 px-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <Link to="/ask" className="flex items-center gap-2 rounded-lg border border-gold/40 bg-card px-3 py-3 text-sm text-gold"><ScrollText className="h-4 w-4" /> Ask Archives</Link>
              <Link to="/search" className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-3 text-sm text-muted-foreground"><Search className="h-4 w-4" /> Search</Link>
            </div>
            {NAV.map((g) => (
              <div key={g.label}>
                {g.to ? (
                  <NavLink to={g.to} end={g.to === "/"} className={({ isActive }) => cn("block py-1.5 text-base font-semibold", isActive ? "text-gold" : "text-foreground")}>{g.label}</NavLink>
                ) : (
                  <>
                    <div className="eyebrow mb-2">{g.label}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {g.items!.map((i) =>
                        i.external ? (
                          <a key={i.to} href={i.to} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm">{i.label} ↗</a>
                        ) : (
                          <Link key={i.to} to={i.to} className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm">{i.label}</Link>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
            <SocialLinks variant="labeled" />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
