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
  };
}

// Pick the largest reasonable preview URL (~600px) from a previews array.
function pickPreview(previews?: TrelloAttachmentPreview[]): string | null {
  if (!previews || previews.length === 0) return null;
  const sorted = [...previews].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  // prefer something between 400-1200 wide; fall back to largest
  const ideal = sorted.find((p) => p.width >= 400 && p.width <= 1200);
  return (ideal ?? sorted[0]).url;
}

export function getCardImage(card: TrelloCard): string | null {
  // 1. Modern Trello "cover" field with public scaled previews
  const coverPreview = pickPreview(card.cover?.scaled);
  if (coverPreview) return coverPreview;

  if (!card.attachments || card.attachments.length === 0) return null;

  // 2. Resolve the cover attachment, if any
  const cover =
    card.idAttachmentCover &&
    card.attachments.find((a) => a.id === card.idAttachmentCover);

  // 3. Otherwise, first image-looking attachment
  const candidate =
    cover ??
    card.attachments.find(
      (a) =>
        (a.previews && a.previews.length > 0) ||
        a.previewUrl ||
        (a.mimeType?.startsWith("image/") ?? false) ||
        /\.(png|jpe?g|webp|gif|svg)$/i.test(a.url)
    );

  if (!candidate) return null;
  return (
    pickPreview(candidate.previews) ||
    candidate.previewUrl ||
    candidate.url ||
    null
  );
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
