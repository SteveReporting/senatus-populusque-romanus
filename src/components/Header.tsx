import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/sjc-logo.png";
import SocialLinks from "./SocialLinks";
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
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container">
        <div className="hidden md:flex h-7 items-center justify-between border-b border-border/70 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>Senatus Populusque Romanus</span>
          <span>Roman Information Management Mainframe</span>
          <span className="text-gold">Systema Operativum</span>
        </div>
        <div className="flex items-center justify-between h-[72px]">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logo}
            alt="SPQR — Senatus Populusque Romanus crest"
            className="h-11 w-11 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="hidden sm:block">
            <div className="font-display text-gold text-xs tracking-[0.28em] leading-tight">SPQR</div>
            <div className="font-serif text-foreground text-base leading-tight">Imperial Gazette</div>
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
                   "px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors relative",
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
                     <span className="absolute left-3 right-3 -bottom-1 h-0.5 bg-crimson" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/search"
            className="hidden md:flex items-center gap-2 px-3 py-2 border border-border bg-card text-muted-foreground hover:text-gold hover:border-gold/50 transition-colors text-xs"
          >
            <Search className="h-4 w-4" />
            <span>Search archives…</span>
            <kbd className="ml-2 text-[10px] px-1.5 py-0.5 rounded border border-border bg-background/60">/</kbd>
          </Link>
          <SocialLinks className="hidden md:flex" />
           <Button
             variant="ghost"
             size="icon"
            onClick={() => setOpen((o) => !o)}
             className="lg:hidden text-foreground"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
           </Button>
        </div>
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
      {loc.pathname === "/" && <div className="h-0.5 bg-crimson" />}
    </header>
  );
};

export default Header;
