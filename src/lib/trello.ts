// Public Trello board JSON shapes (subset of fields we use).

export interface TrelloAttachmentPreview {
  url: string;
  width: number;
  height: number;
  bytes?: number;
  scaled?: boolean;
}

export interface TrelloAttachment {
  id: string;
  name: string;
  url: string;
  previewUrl?: string;
  previews?: TrelloAttachmentPreview[];
  mimeType?: string;
  isUpload?: boolean;
}

export interface TrelloCardCover {
  idAttachment: string | null;
  scaled?: TrelloAttachmentPreview[];
  color?: string | null;
}

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  idList: string;
  closed: boolean;
  attachments?: TrelloAttachment[];
  idAttachmentCover?: string | null;
  cover?: TrelloCardCover | null;
  url?: string;
  labels?: { id: string; name: string; color: string }[];
  dateLastActivity?: string;
  due?: string | null;
  idMembers?: string[];
  idChecklists?: string[];
}

export interface TrelloChecklist {
  id: string;
  idCard: string;
  name: string;
  pos: number;
  checkItems: { id: string; name: string; state: "complete" | "incomplete"; pos: number }[];
}

export interface TrelloAction {
  id: string;
  type: string;
  date: string;
  data: {
    card?: { id: string; name: string };
    list?: { id: string; name: string };
    listAfter?: { id: string; name: string };
    listBefore?: { id: string; name: string };
    attachment?: { name?: string };
    checklist?: { name?: string };
    old?: Record<string, unknown>;
  };
}

export interface TrelloMember {
  id: string;
  fullName?: string;
  username?: string;
  avatarUrl?: string | null;
}

export interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  pos: number;
}

export interface TrelloBoard {
  id: string;
  name: string;
  desc?: string;
  lists: TrelloList[];
  cards: TrelloCard[];
  checklists?: TrelloChecklist[];
  actions?: TrelloAction[];
  members?: TrelloMember[];
  dateLastActivity?: string;
}

const PUBLIC_JSON = (boardId: string) =>
  `https://trello.com/b/${boardId}.json`;

export async function fetchPublicBoard(boardId: string): Promise<TrelloBoard> {
  if (!boardId || boardId.startsWith("REPLACE_")) {
    throw new Error("Trello board ID not configured");
  }
  const res = await fetch(PUBLIC_JSON(boardId), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Trello fetch failed (${res.status})`);
  }
  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    desc: data.desc,
    lists: (data.lists ?? []).filter((l: TrelloList) => !l.closed),
    cards: (data.cards ?? []).filter((c: TrelloCard) => !c.closed),
    checklists: data.checklists ?? [],
    actions: data.actions ?? [],
    members: data.members ?? [],
    dateLastActivity: data.dateLastActivity,
  };
}

// Normalize external image URLs before handing them to the browser.
function cleanImageUrl(url?: string | null): string | null {
  if (!url) return null;
  const value = url.trim();
  if (!value) return null;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("http://")) return `https://${value.slice(7)}`;
  return value;
}

// Pick the largest sensible public preview from Trello.
function pickPreview(previews?: TrelloAttachmentPreview[]): string | null {
  if (!previews || previews.length === 0) return null;
  const sorted = [...previews].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  const ideal = sorted.find((p) => p.width >= 400 && p.width <= 1600);
  return cleanImageUrl((ideal ?? sorted[0]).url);
}

export function isImageAttachment(attachment: TrelloAttachment): boolean {
  return Boolean(
    (attachment.previews && attachment.previews.length > 0) ||
    attachment.previewUrl ||
    attachment.mimeType?.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|svg)(?:\?|$)/i.test(attachment.url || "")
  );
}

export function getAttachmentImage(attachment: TrelloAttachment): string | null {
  const preview = pickPreview(attachment.previews);
  if (preview) return preview;

  const explicitPreview = cleanImageUrl(attachment.previewUrl);
  if (explicitPreview) return explicitPreview;

  if (isImageAttachment(attachment)) return cleanImageUrl(attachment.url);
  return null;
}

export function getCardImage(card: TrelloCard): string | null {
  const coverPreview = pickPreview(card.cover?.scaled);
  if (coverPreview) return coverPreview;

  if (!card.attachments || card.attachments.length === 0) return null;

  const cover =
    card.idAttachmentCover &&
    card.attachments.find((a) => a.id === card.idAttachmentCover);

  if (cover) {
    const coverImage = getAttachmentImage(cover);
    if (coverImage) return coverImage;
  }

  for (const attachment of card.attachments) {
    const image = getAttachmentImage(attachment);
    if (image) return image;
  }

  return null;
}

// Build a map: listId -> fallback image URL, taken from the first card in that
// list that has its own image (typically the "documentation" card).
export function buildListImageFallbacks(board: TrelloBoard): Map<string, string> {
  const fallbacks = new Map<string, string>();
  // Sort lists by pos so we walk cards in their natural list order.
  const cardsSorted = [...board.cards];
  for (const card of cardsSorted) {
    if (fallbacks.has(card.idList)) continue;
    const img = getCardImage(card);
    if (img) fallbacks.set(card.idList, img);
  }
  return fallbacks;
}

// Same as getCardImage but falls back to the list's representative image.
export function getCardImageWithFallback(
  card: TrelloCard,
  fallbacks: Map<string, string>
): string | null {
  return getCardImage(card) ?? fallbacks.get(card.idList) ?? null;
}

// Extract markdown-style and bare URLs from a description.
export function extractLinks(desc: string): { label: string; url: string }[] {
  if (!desc) return [];
  const out: { label: string; url: string }[] = [];
  const seen = new Set<string>();
  const md = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = md.exec(desc))) {
    if (!seen.has(m[2])) {
      out.push({ label: m[1], url: m[2] });
      seen.add(m[2]);
    }
  }
  const bare = /(^|[\s(])((https?:\/\/)[^\s)]+)/g;
  while ((m = bare.exec(desc))) {
    if (!seen.has(m[2])) {
      out.push({ label: m[2], url: m[2] });
      seen.add(m[2]);
    }
  }
  return out;
}

export function cardsByList(board: TrelloBoard): Map<string, TrelloCard[]> {
  const map = new Map<string, TrelloCard[]>();
  for (const list of board.lists) map.set(list.id, []);
  for (const card of board.cards) {
    const arr = map.get(card.idList);
    if (arr) arr.push(card);
  }
  return map;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
