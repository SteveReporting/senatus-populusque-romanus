import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import logo from "@/assets/sjc-logo.png";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Mainframe" },
  { to: "/government", label: "Government" },
  { to: "/military", label: "Military" },
  { to: "/departments", label: "Departments" },
  { to: "/development", label: "Development" },
  { to: "/judicial", label: "Judicial" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="container flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="SPQR — Senatus Populusque Romanus crest"
            className="h-12 w-12 drop-shadow-[0_0_12px_hsl(var(--gold)/0.35)] transition-transform group-hover:scale-105"
          />
          <div className="hidden sm:block">
            <div className="font-display text-gold text-sm tracking-[0.3em] leading-tight">SPQR</div>
            <div className="font-serif text-foreground text-base leading-tight">Imperial Mainframe</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 text-sm font-medium tracking-wide transition-colors relative",
                  isActive
                    ? "text-gold"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {n.label}
                  {isActive && (
                    <span className="absolute left-3 right-3 -bottom-0.5 h-px bg-gold" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/search"
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-surface-2/60 text-muted-foreground hover:text-gold hover:border-gold/50 transition-colors text-sm"
          >
            <Search className="h-4 w-4" />
            <span>Search archives…</span>
            <kbd className="ml-2 text-[10px] px-1.5 py-0.5 rounded border border-border bg-background/60">/</kbd>
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container py-3 flex flex-col">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "py-2.5 px-2 text-sm font-medium border-b border-border/50 last:border-0",
                    isActive ? "text-gold" : "text-foreground"
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
            <Link
              to="/search"
              onClick={() => setOpen(false)}
              className="py-2.5 px-2 text-sm text-muted-foreground flex items-center gap-2"
            >
              <Search className="h-4 w-4" /> Search archives
            </Link>
          </div>
        </div>
      )}
      {loc.pathname === "/" && <div className="meander h-1" />}
    </header>
  );
};

export default Header;
