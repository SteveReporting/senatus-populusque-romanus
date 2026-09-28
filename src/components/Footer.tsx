import logo from "@/assets/sjc-logo.png";
import SocialLinks from "./SocialLinks";

export const Footer = () => (
  <footer className="mt-24 border-t-4 border-crimson bg-card">
    <div className="container py-10 grid gap-8 md:grid-cols-3 items-center border-b border-border">
      <div className="flex items-center gap-3">
        <img src={logo} alt="SPQR crest" className="h-10 w-10" />
        <div>
          <div className="font-display text-gold text-xs tracking-[0.3em]">SPQR</div>
          <div className="font-serif text-lg">Senatus Populusque Romanus</div>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground tracking-widest uppercase">
        Official archive · refreshed every LX seconds
      </div>
      <div className="flex md:justify-end items-center gap-4">
        <SocialLinks />
        <div className="text-xs text-muted-foreground">
           Curated by <span className="text-gold-soft">SJC</span>
        </div>
      </div>
    </div>
    <div className="container py-4 flex flex-col gap-2 text-center text-[9px] uppercase tracking-[0.28em] text-muted-foreground md:flex-row md:justify-between">
      <span>Roma Aeterna · Mainframe Operations</span>
      <span>Senatus Populusque Romanus</span>
    </div>
  </footer>
);

export default Footer;
