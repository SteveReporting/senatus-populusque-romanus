// Public Trello board JSON shapes (subset of fields we use).

export interface TrelloAttachment {
  id: string;
  name: string;
  url: string;
  previewUrl?: string;
  mimeType?: string;
  isUpload?: boolean;
}

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  idList: string;
  closed: boolean;
  attachments?: TrelloAttachment[];
  idAttachmentCover?: string | null;
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

export function getCardImage(card: TrelloCard): string | null {
  if (!card.attachments || card.attachments.length === 0) return null;
  const cover =
    card.idAttachmentCover &&
    card.attachments.find((a) => a.id === card.idAttachmentCover);
  const candidate =
    cover ??
    card.attachments.find(
      (a) =>
        a.previewUrl ||
        (a.mimeType?.startsWith("image/") ?? false) ||
        /\.(png|jpe?g|webp|gif|svg)$/i.test(a.url)
    );
  return candidate?.previewUrl || candidate?.url || null;
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
