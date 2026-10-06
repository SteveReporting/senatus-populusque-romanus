import { Link } from "react-router-dom";
import logo from "@/assets/sjc-logo.png";
import SocialLinks from "./SocialLinks";
import { SOCIAL_LINKS } from "@/config/social";
import { JUDICIAL_URL } from "@/config/trello";

const GROUPS: { title: string; links: { to: string; label: string; ext?: boolean }[] }[] = [
  { title: "Community", links: [{ to: "/", label: "Hub" }, { to: "/announcements", label: "Announcements" }, { to: "/events", label: "Events" }, { to: "/census", label: "Citizen Census" }] },
  { title: "Rome", links: [{ to: "/government", label: "Government" }, { to: "/cursus-honorum", label: "Cursus Honorum" }, { to: "/map", label: "Map of Rome" }, { to: "/senate/docket", label: "Senate Docket" }] },
  { title: "Law", links: [{ to: "/lex", label: "Lex Romana" }, { to: JUDICIAL_URL, label: "Judicial Database", ext: true }, { to: "/ask", label: "Ask the Archives" }] },
  { title: "Command", links: [{ to: "/military", label: "Legions & Guards" }, { to: "/departments", label: "Organisations" }, { to: "/development", label: "Development" }] },
  { title: "Join", links: [{ to: SOCIAL_LINKS.roblox, label: "Roblox Community", ext: true }, { to: SOCIAL_LINKS.discord, label: "Discord", ext: true }] },
];

export const Footer = () => (
  <footer className="relative border-t border-border bg-surface-1">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
    <div className="container grid gap-10 py-14 lg:grid-cols-[1.1fr_2fr]">
      <div>
        <div className="flex items-center gap-3">
          <img src={logo} alt="SPQR crest" className="h-16 w-16" />
          <div>
            <div className="font-display text-lg font-bold tracking-[0.2em]">SPQR</div>
            <div className="text-sm text-muted-foreground">Senatus Populusque Romanus</div>
          </div>
        </div>
        <p className="mt-4 max-w-sm text-sm text-muted-foreground">
          The official Roman community portal for government, military command, law, development and citizen records.
        </p>
        <SocialLinks variant="labeled" className="mt-5" />
      </div>
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <div className="eyebrow mb-4">{g.title}</div>
            <ul className="space-y-2.5">
              {g.links.map((l) => (
                <li key={l.label}>
                  {l.ext ? (
                    <a href={l.to} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l.label}</a>
                  ) : (
                    <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    <div className="border-t border-border">
      <div className="container flex flex-col gap-2 py-5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:flex-row md:justify-between">
        <span>Roma Aeterna · Imperial Mainframe</span>
        <span className="font-display text-gold">S · P · Q · R</span>
      </div>
    </div>
  </footer>
);

export default Footer;
