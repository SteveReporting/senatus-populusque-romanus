import { useState } from "react";
import { Landmark, MapPin, Shield, Scale, ScrollText } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

const PLACES = [
  { name: "Curia Julia", x: 52, y: 43, icon: Landmark, role: "Senate house and debate chamber.", guard: "Senatorial precinct" },
  { name: "Castra Praetoria", x: 78, y: 24, icon: Shield, role: "Praetorian barracks and training arena.", guard: "Praetorian command" },
  { name: "Basilica Julia", x: 43, y: 60, icon: Scale, role: "Law courts and magistrate chambers.", guard: "Judicial precinct" },
  { name: "Forum Rostra", x: 56, y: 57, icon: ScrollText, role: "Public platform for decrees, addresses and triumphal announcements.", guard: "Forum watch" },
  { name: "Temple of Jupiter Capitolinus", x: 27, y: 30, icon: Landmark, role: "Religious rites and imperial oaths.", guard: "Sacred precinct" },
];

export default function RomeMap() {
  const [selected, setSelected] = useState(PLACES[0]);

  return (
    <div className="container py-10 md:py-14">
      <SectionHeader eyebrow="Forum & Territory" title="Map of Rome" subtitle="An operational parchment-style overview of Rome's principal civic, military and religious zones."/>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_.65fr]">
        <section className="relative min-h-[560px] overflow-hidden rounded-xl border border-gold/25 bg-[#241d13]">
          <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #c9a22722 0 1px, transparent 1px), linear-gradient(125deg,#8b6b3522,#0000 45%), repeating-linear-gradient(0deg,#0000 0 42px,#d6b35d12 43px)", backgroundSize: "22px 22px,100% 100%,100% 44px" }}/>
          <div className="absolute inset-[7%] rounded-[40%_52%_44%_50%] border border-[#c9a22755] bg-[#7b5b3217] shadow-[inset_0_0_80px_#0008]"/>
          <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M8 72 C28 54, 40 58, 55 42 S78 30, 93 16" stroke="#c9a227" strokeWidth=".5" fill="none"/>
            <path d="M15 20 C34 38, 58 35, 88 73" stroke="#8f1d22" strokeWidth=".8" fill="none"/>
            <path d="M20 84 C40 69, 62 72, 82 54" stroke="#c9a227" strokeWidth=".35" fill="none"/>
          </svg>
          {PLACES.map((p) => {
            const Icon = p.icon;
            return (
              <button key={p.name} onClick={() => setSelected(p)} style={{ left: p.x + "%", top: p.y + "%" }} className="group absolute -translate-x-1/2 -translate-y-1/2">
                <span className="absolute inset-0 animate-ping rounded-full bg-gold/20"/>
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gold/60 bg-background/90 text-gold shadow-imperial"><Icon className="h-5 w-5"/></span>
                <span className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-background/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gold group-hover:block">{p.name}</span>
              </button>
            );
          })}
          <div className="absolute bottom-4 left-4 rounded-md border border-gold/25 bg-background/80 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-gold">Operational schematic · not to scale</div>
        </section>

        <aside className="imperial-panel rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div><div className="eyebrow">Selected district</div><h2 className="mt-2 font-display text-3xl font-black uppercase">{selected.name}</h2></div>
            <MapPin className="h-5 w-5 text-gold"/>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{selected.role}</p>
          <div className="mt-6 border-t border-border pt-5"><div className="eyebrow">Presiding / guarding body</div><p className="mt-2 text-sm text-foreground">{selected.guard}</p></div>
          <div className="mt-6 border-t border-border pt-5"><div className="eyebrow">Orders of the day</div><p className="mt-2 text-sm text-muted-foreground">No live operational order is published for this location.</p></div>
        </aside>
      </div>
    </div>
  );
}
