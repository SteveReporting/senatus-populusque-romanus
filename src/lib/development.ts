import type { TrelloBoard, TrelloCard, TrelloAction, TrelloChecklist, TrelloMember } from "./trello";
import { getAttachmentImage, isImageAttachment } from "./trello";

export type DevStage = "Idea" | "Planning" | "In Development" | "Testing" | "Polishing" | "Completed" | "Paused";

export function stageFromList(name: string): DevStage | null {
  const n = name.toLowerCase();
  if (/complete|done|ship|live|release/.test(n)) return "Completed";
  if (/hold|pause|block/.test(n)) return "Paused";
  if (/polish/.test(n)) return "Polishing";
  if (/test|balanc|review|qa/.test(n)) return "Testing";
  if (/progress|in dev|doing|build|wip/.test(n)) return "In Development";
  if (/plan|approv/.test(n)) return "Planning";
  if (/backlog|idea/.test(n)) return "Idea";
  return null;
}

export const STAGE_ORDER: DevStage[] = ["In Development", "Testing", "Polishing", "Planning", "Idea", "Completed", "Paused"];

export const STAGE_STYLE: Record<DevStage, string> = {
  "In Development": "border-gold/50 text-gold bg-gold/10",
  Testing: "border-info/40 text-info bg-info/10",
  Polishing: "border-gold-soft/40 text-gold-soft bg-gold-soft/10",
  Planning: "border-border text-foreground/80 bg-surface-3",
  Idea: "border-border text-muted-foreground bg-surface-2",
  Completed: "border-success/40 text-success bg-success/10",
  Paused: "border-crimson/50 text-crimson bg-crimson/10",
};

// Index of the stage along the pipeline (for a non-numeric stage indicator).
export const PIPELINE: DevStage[] = ["Idea", "Planning", "In Development", "Testing", "Polishing", "Completed"];

export function cleanName(s: string) {
  return s.replace(/^[^\p{L}\p{N}]+/u, "").trim() || s;
}
export function leadingEmoji(s: string) {
  const m = s.match(/^[^\p{L}\p{N}\s]+/u);
  return m ? m[0].trim() : "";
}

export interface DevItem {
  card: TrelloCard;
  stage: DevStage;
  listName: string;
  name: string;
  emoji: string;
  updated?: string;
}

/** Turn the development board into typed feature items (meta lists skipped). */
export function devItems(board?: TrelloBoard): DevItem[] {
  if (!board) return [];
  const lists = new Map(board.lists.map((l) => [l.id, l]));
  const out: DevItem[] = [];
  for (const c of board.cards) {
    const l = lists.get(c.idList);
    if (!l) continue;
    const stage = stageFromList(l.name);
    if (!stage) continue;
    out.push({ card: c, stage, listName: cleanName(l.name), name: cleanName(c.name), emoji: leadingEmoji(c.name), updated: c.dateLastActivity });
  }
  return out;
}

export const plainText = (md: string) =>
  (md || "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[#*_>`~|-]/g, " ").replace(/\s+/g, " ").trim();

/* ---------- Command-centre helpers (all derived from real Trello data) ---------- */

export const labelName = (n: string) => cleanName(n || "");

/** Category = first named label on the card (Trello is the source of truth). */
export function categoryOf(item: DevItem): string | null {
  const l = item.card.labels?.find((x) => labelName(x.name));
  return l ? labelName(l.name) : null;
}

export const isSpotlight = (item: DevItem) =>
  !!item.card.labels?.some((l) => /featured|spotlight/i.test(l.name || ""));

export function cardImages(item: DevItem): { url: string; name: string }[] {
  return (item.card.attachments ?? []).filter(isImageAttachment).flatMap((attachment) => {
    const url = getAttachmentImage(attachment);
    return url ? [{ url, name: attachment.name }] : [];
  });
}

/** Only when attachments are explicitly named before/after. */
export function beforeAfter(item: DevItem) {
  const imgs = cardImages(item);
  const b = imgs.find((i) => /before/i.test(i.name));
  const a = imgs.find((i) => /after/i.test(i.name));
  return b && a ? { before: b.url, after: a.url } : null;
}

export function checklistsFor(cardId: string, all?: TrelloChecklist[]) {
  return (all ?? []).filter((c) => c.idCard === cardId).sort((a, b) => a.pos - b.pos);
}

export function checklistTotals(lists: TrelloChecklist[]) {
  let done = 0, total = 0;
  for (const l of lists) for (const i of l.checkItems) { total++; if (i.state === "complete") done++; }
  return { done, total };
}

export function membersFor(item: DevItem, members?: TrelloMember[]) {
  const ids = item.card.idMembers ?? [];
  return (members ?? []).filter((m) => ids.includes(m.id));
}

export function relTime(iso?: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export const isRecent = (iso?: string, days = 7) => !!iso && Date.now() - new Date(iso).getTime() < days * 864e5;

export interface DevLogEntry { id: string; date: string; text: string; cardId?: string; kind: "move" | "create" | "attach" | "checklist" | "update" }

export function activityLog(actions?: TrelloAction[], validCardIds?: Set<string>): DevLogEntry[] {
  const out: DevLogEntry[] = [];
  for (const a of actions ?? []) {
    const card = a.data.card;
    if (!card || (validCardIds && !validCardIds.has(card.id))) continue;
    const name = cleanName(card.name);
    let text: string, kind: DevLogEntry["kind"];
    if (a.type === "updateCard" && a.data.listAfter) { text = `${name} moved to ${cleanName(a.data.listAfter.name)}`; kind = "move"; }
    else if (a.type === "createCard" || a.type === "copyCard") { text = `${name} added${a.data.list ? ` to ${cleanName(a.data.list.name)}` : ""}`; kind = "create"; }
    else if (a.type === "addAttachmentToCard") { text = `${name} received a new attachment`; kind = "attach"; }
    else if (a.type === "addChecklistToCard") { text = `${name} checklist added`; kind = "checklist"; }
    else if (a.type === "updateCard") { text = `${name} updated`; kind = "update"; }
    else continue;
    out.push({ id: a.id, date: a.date, text, cardId: card.id, kind });
  }
  return out.sort((x, y) => +new Date(y.date) - +new Date(x.date));
}

export function dayLabel(iso: string) {
  const d = new Date(iso); const t = new Date();
  const y = new Date(); y.setDate(t.getDate() - 1);
  if (d.toDateString() === t.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
