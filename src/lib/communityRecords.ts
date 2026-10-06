import type { TrelloBoard, TrelloCard } from "@/lib/trello";

export const CAREER_PATHS = [
  { name: "Civic & political", ranks: ["Plebeian", "Citizen", "Quaestor", "Aedile", "Praetor", "Senator", "Consul"] },
  { name: "Military command", ranks: ["Tiro", "Legionary", "Optio", "Centurion", "Primus Pilus", "Tribunus Militum", "Legatus"] },
];
const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const aliases: Record<string, string[]> = { Legionary: ["legionary", "legionaries", "miles"], Legatus: ["legatus", "legate"], Centurion: ["centurion", "centurio"], Citizen: ["citizen", "citizens"] };
export function matchRank(board: TrelloBoard, rank: string) {
  const words = aliases[rank] ?? [normalize(rank)];
  const hasRank = (text: string) => words.some((word) => (` ${normalize(text)} `).includes(` ${word} `));
  const exact = board.cards.find((card) => !card.closed && words.includes(normalize(card.name)));
  const title = board.cards.find((card) => !card.closed && hasRank(card.name));
  const description = board.cards.find((card) => !card.closed && hasRank(card.desc));
  return exact ?? title ?? description ?? null;
}
export const JURISDICTIONS = ["Civil law", "Public order", "Military discipline", "Senate procedure", "Judicial procedure"] as const;
export function jurisdictionFor(card: TrelloCard, listName: string) {
  const text = `${card.name} ${listName}`.toLowerCase();
  if (/military|discipline|martial|desertion/.test(text)) return "Military discipline";
  if (/senate|election|magistrat|constitution|law creation/.test(text)) return "Senate procedure";
  if (/court|trial|judicial|justice/.test(text)) return "Judicial procedure";
  if (/criminal|crime|punishment|treason|public order/.test(text)) return "Public order";
  return "Civil law";
}
export function lawRecords(board: TrelloBoard) {
  const names = new Map(board.lists.map((list) => [list.id, list.name]));
  return board.cards.filter((card) => !card.closed && /\b(law|laws|lex|legal|court|trial|constitution|criminal|punishments?|judicial|justice|senate|elections?)\b/i.test(`${card.name} ${names.get(card.idList) ?? ""}`))
    .map((card) => ({ card, jurisdiction: jurisdictionFor(card, names.get(card.idList) ?? ""), branch: names.get(card.idList) ?? "Archive" }));
}
export function courtCitation(card: TrelloCard) {
  return `${card.name}\n${card.desc.trim()}\nSource: ${card.url ?? `https://trello.com/c/${card.id}`}`;
}