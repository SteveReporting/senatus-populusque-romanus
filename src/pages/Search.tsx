import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, ImageIcon } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useTrelloBoard } from "@/hooks/useTrelloBoard";
import { TRELLO_CONFIG } from "@/config/trello";
import { getCardImage, slugify } from "@/lib/trello";

const Search = () => {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const info = useTrelloBoard(TRELLO_CONFIG.informationBoardId);
  const dev = useTrelloBoard(TRELLO_CONFIG.developmentBoardId);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out: { source: "info" | "dev"; listName: string; id: string; name: string; desc: string; img: string | null }[] = [];
    if (info.data) {
      const listMap = new Map(info.data.lists.map((l) => [l.id, l.name]));
      for (const c of info.data.cards) {
        if (c.name.toLowerCase().includes(term) || (c.desc || "").toLowerCase().includes(term)) {
          out.push({ source: "info", listName: listMap.get(c.idList) ?? "", id: c.id, name: c.name, desc: c.desc, img: getCardImage(c) });
        }
      }
    }
    if (dev.data) {
      const listMap = new Map(dev.data.lists.map((l) => [l.id, l.name]));
      for (const c of dev.data.cards) {
        if (c.name.toLowerCase().includes(term) || (c.desc || "").toLowerCase().includes(term)) {
          out.push({ source: "dev", listName: listMap.get(c.idList) ?? "", id: c.id, name: c.name, desc: c.desc, img: getCardImage(c) });
        }
      }
    }
    return out.slice(0, 80);
  }, [q, info.data, dev.data]);

  return (
    <div className="container py-16">
      <SectionHeader
        eyebrow="Archivium"
        title="Global Search"
        subtitle="Search across entities, legions, departments, and development items."
      />

      <div className="imperial-panel rounded-md p-2 flex items-center gap-2">
        <SearchIcon className="h-5 w-5 text-gold ml-3" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the imperial archives…"
          className="flex-1 bg-transparent border-0 focus:outline-none px-2 py-3 text-foreground placeholder:text-muted-foreground"
        />
        {q && (
          <button onClick={() => setQ("")} className="text-xs text-muted-foreground hover:text-gold px-3">
            clear
          </button>
        )}
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        {q ? `${results.length} result${results.length !== 1 ? "s" : ""}` : "Type to search both Trello mainframes."}
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((r) => {
          const to =
            r.source === "info"
              ? `/entity/all/${r.id}/${slugify(r.name)}`
              : `/development`;
          return (
            <Link
              key={`${r.source}-${r.id}`}
              to={to}
              className="imperial-panel rounded-md overflow-hidden hover:border-gold/50 hover:-translate-y-0.5 transition-all group"
            >
              <div className="aspect-[16/9] relative bg-surface-2">
                {r.img ? (
                  <img src={r.img} alt={r.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-imperial">
                    <ImageIcon className="h-8 w-8 text-gold/30" />
                  </div>
                )}
                <span className="absolute top-2 left-2 text-[10px] tracking-widest uppercase px-2 py-0.5 rounded border border-gold/40 bg-background/70 text-gold-soft">
                  {r.source === "info" ? r.listName || "Archive" : "Development"}
                </span>
              </div>
              <div className="p-4">
                <div className="font-serif text-lg group-hover:text-gold transition-colors">{r.name}</div>
                {r.desc && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.desc.replace(/[#*_>`]/g, "")}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Search;
