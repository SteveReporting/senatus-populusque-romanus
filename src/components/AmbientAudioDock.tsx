import { useEffect, useMemo, useRef, useState } from "react";
import { Music2, Pause, Play, Volume2, VolumeX, ChevronUp } from "lucide-react";

const TRACKS = [
  { id: "lyre", name: "Apollo's Lyre", subtitle: "Classical Roman ambience" },
  { id: "camp", name: "Castra Campfire", subtitle: "Night watch ambience" },
  { id: "rain", name: "Forum Romanum Rain", subtitle: "Rain over marble" },
];

export default function AmbientAudioDock() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(() => Number(localStorage.getItem("spqr-audio-volume") ?? 35));
  const [track, setTrack] = useState(() => localStorage.getItem("spqr-audio-track") ?? "lyre");
  const ctx = useRef<AudioContext | null>(null);
  const nodes = useRef<{ osc?: OscillatorNode; gain?: GainNode; noise?: AudioBufferSourceNode }>({});
  const selected = useMemo(() => TRACKS.find((t) => t.id === track) ?? TRACKS[0], [track]);

  const stop = () => {
    try { nodes.current.osc?.stop(); } catch {}
    try { nodes.current.noise?.stop(); } catch {}
    nodes.current = {};
    setPlaying(false);
  };

  const start = () => {
    stop();
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const c = ctx.current ?? new AudioCtx();
    ctx.current = c;
    const gain = c.createGain();
    gain.gain.value = Math.max(0, Math.min(1, volume / 100)) * 0.08;
    gain.connect(c.destination);

    if (track === "lyre") {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 220;
      osc.connect(gain);
      osc.start();
      nodes.current = { osc, gain };
    } else {
      const buffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = c.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = c.createBiquadFilter();
      filter.type = track === "rain" ? "highpass" : "lowpass";
      filter.frequency.value = track === "rain" ? 1200 : 500;
      noise.connect(filter);
      filter.connect(gain);
      noise.start();
      nodes.current = { noise, gain };
    }
    setPlaying(true);
  };

  useEffect(() => {
    localStorage.setItem("spqr-audio-volume", String(volume));
    if (nodes.current.gain) nodes.current.gain.gain.value = (volume / 100) * 0.08;
  }, [volume]);

  useEffect(() => {
    localStorage.setItem("spqr-audio-track", track);
    if (playing) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  useEffect(() => () => stop(), []);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-[290px] rounded-xl border border-gold/25 bg-background/95 p-4 shadow-imperial backdrop-blur-xl">
          <div className="eyebrow">Ambient Rome</div>
          <div className="mt-1 font-serif text-lg font-bold text-foreground">{selected.name}</div>
          <div className="text-xs text-muted-foreground">{selected.subtitle}</div>
          <select value={track} onChange={(e) => setTrack(e.target.value)} className="mt-4 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground">
            {TRACKS.map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}
          </select>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={playing ? stop : start} className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/35 text-gold hover:bg-gold/10" aria-label={playing ? "Pause ambience" : "Play ambience"}>
              {playing ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4"/>}
            </button>
            {volume === 0 ? <VolumeX className="h-4 w-4 text-muted-foreground"/> : <Volume2 className="h-4 w-4 text-muted-foreground"/>}
            <input aria-label="Ambient volume" type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="min-w-0 flex-1 accent-[hsl(var(--gold))]"/>
            <span className="w-8 text-right text-xs text-muted-foreground">{volume}%</span>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">Muted by default. Preferences are stored locally. The soundscapes are generated in-browser, so no external audio service is required.</p>
        </div>
      )}
      <button onClick={() => setOpen((v) => !v)} className="animate-pulse-gold flex h-12 items-center gap-2 rounded-full border border-gold/45 bg-background/95 px-4 text-gold shadow-imperial backdrop-blur-xl" aria-label="Roman ambient audio">
        <Music2 className="h-4 w-4"/><span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] sm:block">Ambient</span><ChevronUp className={"h-3.5 w-3.5 transition-transform " + (open ? "rotate-180" : "")}/>
      </button>
    </div>
  );
}
