import logo from "@/assets/sjc-logo.png";
import SocialLinks from "./SocialLinks";

export const Footer = () => (
  <footer className="mt-24 border-t border-border bg-surface-1/60">
    <div className="meander h-1" />
    <div className="container py-10 grid gap-8 md:grid-cols-3 items-center">
      <div className="flex items-center gap-3">
        <img src={logo} alt="SPQR crest" className="h-10 w-10" />
        <div>
          <div className="font-display text-gold text-xs tracking-[0.3em]">SPQR</div>
          <div className="font-serif text-sm">Senatus Populusque Romanus</div>
        </div>
      </div>
      <div className="text-center text-xs text-muted-foreground tracking-widest uppercase">
        Roma Aeterna — Imperial Mainframe v1.0
      </div>
      <div className="flex md:justify-end items-center gap-4">
        <SocialLinks />
        <div className="text-xs text-muted-foreground">
          Owner: <span className="text-gold-soft">SJC</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
