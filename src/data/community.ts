// Community content: announcements, events and featured items.
// Edit this file to publish new posts — every page and the homepage read from here.
// Shapes are intentionally plain so they can later be moved to a database/admin panel.
//
// NOTE: the entries below are STARTER EXAMPLES. Replace them with real community posts.

export type AnnouncementCategory = "Imperial" | "Senate" | "Military" | "Development" | "Community";
export type Importance = "normal" | "important" | "critical";

export interface Announcement {
  id: string;
  title: string;
  description: string;
  content?: string;
  category: AnnouncementCategory;
  importance: Importance;
  author: string;
  organisation?: string;
  date: string; // ISO
  image?: string;
  pinned?: boolean;
}

export type EventType =
  | "Training" | "Patrol" | "Ceremony" | "Senate Session" | "Military Operation"
  | "Community Event" | "Tournament" | "Campaign" | "Recruitment" | "Government Meeting";

export interface RomanEvent {
  id: string;
  title: string;
  description: string;
  host: string;
  type: EventType;
  date: string; // ISO date-time (UTC)
  durationMins?: number;
  location: string;
  image?: string;
  status?: "scheduled" | "cancelled";
}

export interface FeaturedItem {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  image?: string;
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "hub-launch",
    title: "The new Roman Community Hub is live",
    description:
      "Events, announcements, development progress and every Roman resource now live in one place. Check back daily for what is happening in Rome.",
    content:
      "The SPQR website is now the central hub of the community. The Information Mainframe and the Imperial Development Board remain connected and refresh automatically.\n\nEvents and announcements will be posted here by Roman leadership.",
    category: "Imperial",
    importance: "critical",
    author: "SJC",
    organisation: "Imperial Office",
    date: "2026-10-03T15:00:00Z",
    pinned: true,
  },
  {
    id: "dev-combat",
    title: "Combat & Inventory systems in active development",
    description: "Core gameplay systems are being built. Follow progress live on the Development tracker.",
    category: "Development",
    importance: "important",
    author: "Development Team",
    date: "2026-10-01T18:00:00Z",
  },
  {
    id: "recruitment",
    title: "Legions are recruiting",
    description: "Join the Roblox group and Discord, then speak to a legion officer to enlist.",
    category: "Military",
    importance: "normal",
    author: "Military Command",
    date: "2026-09-28T19:00:00Z",
  },
];

export const EVENTS: RomanEvent[] = [
  {
    id: "uc-training",
    title: "Urbanae Cohortes Training",
    description: "Weekly drill session for the city cohorts. Formations, patrol procedure and arrest protocol.",
    host: "Urbanae Cohortes",
    type: "Training",
    date: "2026-10-10T19:00:00Z",
    durationMins: 60,
    location: "Campus Martius",
  },
  {
    id: "senate-session",
    title: "Senate Session",
    description: "Open session of the Senate. Citizens may attend and observe proceedings.",
    host: "Senate of Rome",
    type: "Senate Session",
    date: "2026-10-12T18:00:00Z",
    durationMins: 90,
    location: "Curia Julia",
  },
  {
    id: "legion-recruitment",
    title: "Legion Recruitment Day",
    description: "Meet the legions and enlist. Officers will run tryouts throughout the session.",
    host: "Military Command",
    type: "Recruitment",
    date: "2026-10-17T17:00:00Z",
    durationMins: 120,
    location: "Forum Romanum",
  },
];

export const FEATURED: FeaturedItem | null = {
  id: "dev-tracker",
  eyebrow: "Featured",
  title: "Follow the building of Rome",
  description: "See every system being planned, built and tested — straight from the Imperial Development Board.",
  href: "/development",
  cta: "Open development tracker",
};

// ---------- helpers ----------
export const sortAnnouncements = (a: Announcement[]) =>
  [...a].sort((x, y) => Number(!!y.pinned) - Number(!!x.pinned) || +new Date(y.date) - +new Date(x.date));

export const upcomingEvents = (now = Date.now()) =>
  EVENTS.filter((e) => +new Date(e.date) + (e.durationMins ?? 60) * 60_000 >= now).sort(
    (a, b) => +new Date(a.date) - +new Date(b.date)
  );

export const pastEvents = (now = Date.now()) =>
  EVENTS.filter((e) => +new Date(e.date) + (e.durationMins ?? 60) * 60_000 < now).sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );

export function eventIsLive(e: RomanEvent, now = Date.now()) {
  const s = +new Date(e.date);
  return now >= s && now <= s + (e.durationMins ?? 60) * 60_000;
}

export function formatEventDate(iso: string) {
  const d = new Date(iso);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
    day: d.toLocaleDateString(undefined, { day: "2-digit" }),
    month: d.toLocaleDateString(undefined, { month: "short" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    full: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }),
  };
}

export function timeAgo(iso: string, now = Date.now()) {
  const diff = Math.round((now - +new Date(iso)) / 1000);
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60],
  ];
  for (const [u, s] of units) if (abs >= s) return rtf.format(-Math.round(diff / s), u);
  return "just now";
}
