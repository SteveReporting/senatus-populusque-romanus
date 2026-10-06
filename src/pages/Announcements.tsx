import { useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { AnnouncementCard } from "@/components/hub/Cards";
import { ANNOUNCEMENTS, sortAnnouncements, type AnnouncementCategory } from "@/data/community";
import { cn } from "@/lib/utils";

const CATS: ("All" | AnnouncementCategory)[] = ["All", "Imperial", "Senate", "Military", "Development", "Community"];

const Announcements = () => {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [q, setQ] = useState("");
  const list = useMemo(
    () =>
      sortAnnouncements(ANNOUNCEMENTS).filter(
        (a) =>
          (cat === "All" || a.category === cat) &&
          (!q || `${a.title} ${a.description} ${a.author}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [cat, q]
  );
  const [lead, ...rest] = list;

  return (
    <div className="container py-12 md:py-16 animate-fade-in">
      <SectionHeader eyebrow="Acta Diurna" title="Announcements" subtitle="Official news and notices from the leadership of Rome." />

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                cat === c ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground hover:border-gold/40 hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search announcements…"
          className="w-full md:w-72 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/60 focus:outline-none"
        />
      </div>

      {!lead ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
          <Megaphone className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display text-xl text-foreground">No announcements found</p>
          <p className="text-sm text-muted-foreground">Try another category or search term.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-3"><AnnouncementCard a={lead} large /></div>
          {rest.map((a) => <AnnouncementCard key={a.id} a={a} />)}
        </div>
      )}
    </div>
  );
};

export default Announcements;
