// Ask the Archives: finds relevant Trello records and streams an AI summary.
const BOARDS = [
  { id: "CJhBZOI4", label: "Information Mainframe" },
  { id: "hSGwyRev", label: "Development Board" },
];
const MODEL = "openai/gpt-6-astra";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";
const RUN_HEADER = "X-Lovable-AIG-Run-ID";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": RUN_HEADER,
};

interface Rec { n: number; id: string; board: string; boardId: string; list: string; title: string; text: string; url: string; score: number }

const clean = (s: string) => (s || "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/[#*_>`]/g, "").replace(/\s+/g, " ").trim();
const STOP = new Set("the a an of to and or is are was were in on for what who how do does did i can with about my me our be it this that which when where why".split(" "));

async function loadRecords(): Promise<Omit<Rec, "n" | "score">[]> {
  const out: Omit<Rec, "n" | "score">[] = [];
  await Promise.all(BOARDS.map(async (b) => {
    const r = await fetch(`https://trello.com/b/${b.id}.json`);
    if (!r.ok) return;
    const j = await r.json();
    const lists = new Map((j.lists ?? []).filter((l: any) => !l.closed).map((l: any) => [l.id, l.name]));
    for (const c of j.cards ?? []) {
      if (c.closed || !lists.has(c.idList)) continue;
      out.push({ id: c.id, board: b.label, boardId: b.id, list: String(lists.get(c.idList)), title: clean(c.name), text: clean(c.desc).slice(0, 1500), url: c.shortUrl || c.url });
    }
  }));
  return out;
}

function rank(recs: Omit<Rec, "n" | "score">[], q: string): Rec[] {
  const terms = q.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((t) => t.length > 2 && !STOP.has(t));
  const scored = recs.map((r) => {
    const t = r.title.toLowerCase(), l = r.list.toLowerCase(), d = r.text.toLowerCase();
    let s = 0;
    for (const w of terms) { if (t.includes(w)) s += 5; if (l.includes(w)) s += 3; if (d.includes(w)) s += 1 + Math.min(3, d.split(w).length - 2); }
    return { ...r, score: s, n: 0 };
  });
  const hits = scored.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
  const pool = (hits.length ? hits : scored).slice(0, 25);
  return pool.map((r, i) => ({ ...r, n: i + 1 }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const { question } = await req.json();
    const q = String(question ?? "").trim().slice(0, 500);
    if (q.length < 3) return json(400, { error: "Please ask a longer question." });
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json(500, { error: "The archives are not configured yet." });

    const records = rank(await loadRecords(), q);
    if (!records.length) return json(503, { error: "The Trello archives could not be reached. Try again shortly." });

    const context = records.map((r) => `[${r.n}] ${r.title} — ${r.board} / ${r.list}\n${r.text || "(no description)"}`).join("\n\n");
    const instructions = "You are the Archivist of a Roman roleplay community on Roblox. Answer citizens' questions about Roman procedures, government, military and development using ONLY the archive records provided. Be concise (under 180 words), clear and friendly, with a light Roman tone. Cite records inline with their bracket numbers like [2]. If the records do not contain the answer, say so plainly and suggest who to ask (e.g. the relevant office or legion). Never invent rules, ranks, dates or names.";

    const runId = req.headers.get(RUN_HEADER)?.trim();
    const upstream = await fetch(GATEWAY, {
      method: "POST",
      signal: req.signal,
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch", ...(runId ? { [RUN_HEADER]: runId } : {}) },
      body: JSON.stringify({
        model: MODEL, stream: true, store: false, instructions,
        input: `Archive records:\n\n${context}\n\nCitizen's question: ${q}`,
        reasoning: { effort: "low", summary: "auto" }, include: ["reasoning.encrypted_content"],
      }),
    });
    if (!upstream.ok || !upstream.body) {
      const t = await upstream.text().catch(() => "");
      let msg = "The Archivist could not answer right now.";
      if (upstream.status === 429) msg = "Too many questions at once — please wait a moment and try again.";
      else if (upstream.status === 402) msg = "The archive's AI credits have run out. Please tell a site administrator.";
      else { try { msg = JSON.parse(t)?.error?.message || JSON.parse(t)?.message || msg; } catch { /* keep */ } }
      return json(upstream.status, { error: msg });
    }

    const enc = new TextEncoder();
    const sources = records.map(({ n, id, title, board, boardId, list, url }) => ({ n, id, title, board, boardId, list, url }));
    const stream = new ReadableStream({
      async start(ctrl) {
        ctrl.enqueue(enc.encode(`data: ${JSON.stringify({ type: "sources", sources })}\n\n`));
        const reader = upstream.body!.getReader();
        try {
          for (;;) { const { done, value } = await reader.read(); if (done) break; ctrl.enqueue(value); }
        } catch (_) { /* client aborted */ }
        ctrl.close();
      },
    });
    const headers = new Headers({ ...cors, "Content-Type": "text/event-stream" });
    const rid = upstream.headers.get(RUN_HEADER); if (rid) headers.set(RUN_HEADER, rid);
    return new Response(stream, { headers });
  } catch (e) {
    if (req.signal.aborted) return new Response(null, { status: 499, headers: cors });
    return json(500, { error: e instanceof Error ? e.message : "Unknown error" });
  }
});
