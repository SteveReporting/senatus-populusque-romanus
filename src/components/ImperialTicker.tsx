import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CircleHelp, Radio, Users } from "lucide-react";
import { SOCIAL_LINKS } from "@/config/social";
import { aucYear, festivalDate, festivalsOn, nextFestival, romanDate, toRoman } from "@/lib/romanCalendar";

const ROME_PLACE_ID = import.meta.env.VITE_ROBLOX_PLACE_ID || "97342994784241";
const DISCORD_INVITE = SOCIAL_LINKS.discord.split("/").filter(Boolean).pop() || "";

export default function ImperialTicker() {
  const [now, setNow] = useState(() => new Date());
  const [robloxPlayers, setRobloxPlayers] = useState<number | null>(null);
  const [discordOnline, setDiscordOnline] = useState<number | null>(null);
  const status = useMemo(() => {
    const today = festivalsOn(now);
    const next = nextFestival(now);
    return {
      label: today.length ? today.map((f) => f.name).join(" · ") : `Next: ${next.name} (${festivalDate(next)})`,
      note: today.length ? today.map((f) => f.note).join(" ") : next.note,
      today: today.length > 0,
    };
  }, [now]);

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
          <span className="truncate text-foreground/80">{romanDate(now)} · {toRoman(aucYear(now) % 10 || 10) && `${aucYear(now)} AUC`}</span>
          <span className="hidden truncate rounded-full border border-gold/25 bg-gold/5 px-2 py-0.5 text-[9px] text-gold sm:inline">{status.today ? "Festival: " : ""}{status.label}</span>
          <CircleHelp className="hidden h-3 w-3 text-muted-foreground md:block" />
          <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-72 rounded-md border border-gold/20 bg-popover p-3 normal-case tracking-normal text-muted-foreground shadow-imperial group-hover:block">
            <div className="font-serif text-sm font-bold text-foreground">Roman Fasti · {now.toLocaleDateString("en-GB")}</div>
            <p className="mt-1 text-xs leading-relaxed">{status.label}. {status.note} Dates use inclusive Roman counting from the Kalends, Nones and Ides; years are counted ab urbe condita.</p>
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
