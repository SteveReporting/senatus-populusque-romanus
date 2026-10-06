// Trello board configuration.
// Replace these IDs with the short IDs from your public Trello board URLs.
// e.g. https://trello.com/b/ABC123XY/board-name  =>  boardId = "ABC123XY"
//
// Both boards MUST be set to "Public" in Trello (Show Menu → More → Settings → Visibility)
// for the public JSON endpoint (https://trello.com/b/<id>.json) to work without auth.

export const TRELLO_CONFIG = {
  // Roman Information Management Mainframe (primary)
  informationBoardId: "CJhBZOI4",
  // Imperial Development Board (secondary)
  developmentBoardId: "hSGwyRev",
  // Auto-refresh interval in ms
  refreshIntervalMs: 60_000,
};

export const JUDICIAL_URL = "https://judicial-database.pages.dev/";

// Heuristics for grouping lists across the information board.
// Lowercased substring match against list names.
export const LIST_CATEGORY_HINTS = {
  military: ["legio", "legion", "military", "army", "auxilia", "navy", "praetoria"],
  government: ["senate", "senat", "consul", "imperial", "government", "magistrat", "office", "council"],
  departments: ["depart", "ministry", "organi", "agency", "bureau", "division"],
};
