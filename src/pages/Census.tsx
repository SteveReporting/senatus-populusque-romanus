import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, UserRound, Award, ShieldCheck } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

type Profile = { id: number; name: string; displayName: string; avatar?: string };

export default function Census() {
  const [params] = useSearchParams();
  const initial = params.get("user") ?? "";
  const [q, setQ] = useState(initial);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const auto = useRef(false);

  const runLookup = async (username: string) => {
    const value = username.trim();
    if (!value || busy) return;
    setBusy(true);
    setErr("");
    setProfile(null);

    try {
      const r = await fetch("https://users.roblox.com/v1/usernames/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: [value], excludeBannedUsers: true }),
      });
      if (!r.ok) throw new Error("Roblox profile lookup is unavailable.");
      const j = await r.json();
      const u = j.data?.[0];
      if (!u) throw new Error("No Roblox citizen found with that username.");

      let avatar = "";
      const a = await fetch("https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=" + u.id + "&size=180x180&format=Png&isCircular=false");
      if (a.ok) {
        const aj = await a.json();
        avatar = aj.data?.[0]?.imageUrl || "";
      }
      setProfile({ id: u.id, name: u.name, displayName: u.displayName, avatar });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Lookup failed.");
    } finally {
      setBusy(false);
    }
  };

  const lookup = (e: FormEvent) => {
    e.preventDefault();
    void runLookup(q);
  };

  useEffect(() => {
    if (!auto.current && initial.trim()) {
      auto.current = true;
      void runLookup(initial);
    }
    // Run only for the URL-supplied username.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container py-10 md:py-14">
      <SectionHeader eyebrow="Civium Tabularium" title="Citizen Census" subtitle="Lookup a Roblox citizen. Service history, branch roles and decorations remain authoritative only when connected to verified SPQR records."/>
      <form onSubmit={lookup} className="imperial-panel flex items-center gap-3 rounded-xl p-2">
        <Search className="ml-3 h-5 w-5 text-gold"/>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search citizen by Roblox username…" className="min-w-0 flex-1 bg-transparent px-2 py-3 outline-none"/>
        <button disabled={busy} className="rounded-lg bg-gold px-5 py-3 text-xs font-bold uppercase tracking-wider text-background disabled:opacity-50">{busy ? "Searching…" : "Lookup"}</button>
      </form>

      {err && <p className="mt-4 text-sm text-crimson">{err}</p>}

      {profile && (
        <div className="mt-8 grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
          <section className="imperial-panel rounded-xl p-6 text-center">
            {profile.avatar
              ? <img src={profile.avatar} alt="" className="mx-auto h-40 w-40 rounded-xl border border-gold/25 bg-surface-2 object-cover"/>
              : <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-xl border border-border bg-surface-2"><UserRound className="h-12 w-12 text-muted-foreground"/></div>}
            <h2 className="mt-5 font-display text-2xl font-black uppercase">{profile.displayName}</h2>
            <p className="text-sm text-gold">@{profile.name}</p>
            <p className="mt-2 text-xs text-muted-foreground">Roblox ID {profile.id}</p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="imperial-panel rounded-xl p-5">
              <ShieldCheck className="h-5 w-5 text-gold"/>
              <div className="eyebrow mt-4">Branch & rank</div>
              <p className="mt-2 text-sm text-muted-foreground">Awaiting verified SPQR role source.</p>
            </div>
            <div className="imperial-panel rounded-xl p-5">
              <Award className="h-5 w-5 text-gold"/>
              <div className="eyebrow mt-4">Dona Militaria</div>
              <p className="mt-2 text-sm text-muted-foreground">No verified medals are connected to this census module yet.</p>
            </div>
            <div className="imperial-panel rounded-xl p-5 sm:col-span-2">
              <div className="eyebrow">Past service</div>
              <p className="mt-2 text-sm text-muted-foreground">This area is ready for service-history data once the authoritative role and awards source is connected.</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
