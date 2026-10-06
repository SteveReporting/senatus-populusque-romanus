import { describe, it, expect } from "vitest";
import { courtCitation, lawRecords, matchRank } from "./communityRecords";
import type { TrelloBoard, TrelloCard } from "./trello";
const card: TrelloCard = { id: "one", idList: "law", name: "Criminal Law", desc: "Official court requirements.", closed: false, url: "https://trello.com/c/one" };
const board: TrelloBoard = { id: "board", name: "Rome", lists: [{ id: "law", name: "Government", pos: 1, closed: false }], cards: [card] };
describe("official records", () => {
  it("copies the actual requirement and original source, without invented article numbers", () => {
    expect(courtCitation(card)).toBe("Criminal Law\nOfficial court requirements.\nSource: https://trello.com/c/one");
  });
  it("filters law records by jurisdiction", () => expect(lawRecords(board)[0].jurisdiction).toBe("Public order"));
  it("prefers a matching rank title over a passing description mention", () => {
    const rank = { ...card, id: "rank", name: "Quaestor", desc: "Must be elected." };
    expect(matchRank({ ...board, cards: [{ ...card, desc: "Ask a Quaestor." }, rank] }, "Quaestor")?.id).toBe("rank");
  });
  it("does not match senator inside senatorial", () => expect(matchRank({ ...board, cards: [{ ...card, name: "Senatorial voting" }] }, "Senator")).toBeNull());
});