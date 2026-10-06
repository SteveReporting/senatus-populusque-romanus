import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CircleHelp, Radio, Users } from "lucide-react";
import { SOCIAL_LINKS } from "@/config/social";

const roman = (n: number) => {
  const pairs: [number, string][] = [[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  let out = "";
  for (const [v,s] of pairs) while (n >= v) { out += s; n -= v; }
  return out;
};

const MONTHS = ["Ian.","Feb.","Mar.","Apr.","Mai.","Iun.","Iul.","Aug.","Sep.","Oct.","Nov.","Dec."];
const ROME_PLACE_ID = import.meta.env.VITE_ROBLOX_PLACE_ID || "97342994784241";
const DISCORD_INVITE = SOCIAL_LINKS.discord.split("/").filter(Boolean).pop() || "";

function romanDate(d: Date) {
  const day = d.getDate();
  const month = d.getMonth();
  const longMonth = [2,4,6,9].includes(month);
  const nones = longMonth ? 7 : 5;
  const ides = longMonth ? 15 : 13;
  if (day === 1) return "Kal. " + MONTHS[month];
  if (day === nones) return "Non. " + MONTHS[month];
  if (day === ides) return "Id. " + MONTHS[month];
  const target = day < nones ? nones : day < ides ? ides : new Date(d.getFullYear(), month + 1, 1).getDate();
  const marker = day < nones ? "Non." : day < ides ? "Id." : "Kal.";
  const targetMonth = marker === "Kal." ? (month + 1) % 12 : month;
  const inclusive = target - day + 1;
  return inclusive === 2
    ? "prid. " + marker + " " + MONTHS[targetMonth]
    : "a.d. " + roman(inclusive) + " " + marker + " " + MONTHS[targetMonth];
}

function fasti(d: Date) {
  const m = d.getMonth() + 1, day = d.getDate();
  const nefasti = (m === 12 && day >= 17 && day <= 23) || (m === 2 && day === 15) || (m === 3 && day === 15);
  return nefasti
    ? { label: "Dies Nefasti", note: "Religious observance — courts and assemblies traditionally closed." }
    : { label: "Dies Fasti", note: "A day on which civic and judicial business may proceed." };
}

export default function ImperialTicker() {
  const [now, setNow] = useState(() => new Date());
  const [robloxPlayers, setRobloxPlayers] = useState<number | null>(null);
  const [discordOnline, setDiscordOnline] = useState<number | null>(null);
  const status = useMemo(() => fasti(now), [now]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const universeRes = await fetch("https://apis.roblox.com/universes/v1/places/" + ROME_PLACE_ID + "/universe");
        if (universeRes.ok) {
          const universe = await universeRes.json();
          const gamesRes = await fetch("https://games.roblox.com/v1/games?universeIds=" + universe.universeId);
          if (gamesRes.ok) {
            const games = await gamesRes.json();
            if (!cancelled) setRobloxPlayers(games.data?.[0]?.playing ?? null);
          }
        }
      } catch {
        if (!cancelled) setRobloxPlayers(null);
      }

      try {
        if (DISCORD_INVITE) {
          const discordRes = await fetch("https://discord.com/api/v10/invites/" + DISCORD_INVITE + "?with_counts=true&with_expiration=true");
          if (discordRes.ok) {
            const invite = await discordRes.json();
            if (!cancelled) setDiscordOnline(invite.approximate_presence_count ?? null);
          }
        }
      } catch {
        if (!cancelled) setDiscordOnline(null);
      }
    };

    void refresh();
    const id = window.setInterval(refresh, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="border-b border-gold/15 bg-[#080a0f] text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
      <div className="mx-auto flex min-h-8 max-w-[1560px] items-center justify-between gap-4 px-[clamp(1rem,3vw,3rem)]">
        <div className="group relative flex min-w-0 items-center gap-2 py-1.5">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gold" />
          <span className="truncate text-foreground/80">{romanDate(now)} · {status.label}</span>
          <span className="hidden rounded-full border border-gold/25 bg-gold/5 px-2 py-0.5 text-[9px] text-gold sm:inline">{status.label}</span>
          <CircleHelp className="hidden h-3 w-3 text-muted-foreground md:block" />
          <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-72 rounded-md border border-gold/20 bg-popover p-3 normal-case tracking-normal text-muted-foreground shadow-imperial group-hover:block">
            <div className="font-serif text-sm font-bold text-foreground">Roman Fasti</div>
            <p className="mt-1 text-xs leading-relaxed">{status.note} The date is rendered using inclusive Roman counting.</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 py-1.5">
          <span className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-success" />
            <span className="text-foreground/75">⚔ {robloxPlayers ?? "—"} in Rome</span>
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <Users className="h-3.5 w-3.5 text-gold" />
            <span>🏛 {discordOnline ?? "—"} Citizens Online</span>
          </span>
        </div>
      </div>
    </div>
  );
}
