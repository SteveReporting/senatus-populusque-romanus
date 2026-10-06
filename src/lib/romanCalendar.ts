const MONTHS = ["Ian.", "Feb.", "Mar.", "Apr.", "Mai.", "Iun.", "Iul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

export function toRoman(n: number) {
  const pairs: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of pairs) while (n >= v) { out += s; n -= v; }
  return out;
}

/** Roman date with inclusive counting (Julian-style month structure applied to the current calendar). */
export function romanDate(d: Date) {
  const day = d.getDate();
  const month = d.getMonth();
  const long = [2, 4, 6, 9].includes(month);
  const nones = long ? 7 : 5;
  const ides = long ? 15 : 13;
  if (day === 1) return `Kal. ${MONTHS[month]}`;
  if (day === nones) return `Non. ${MONTHS[month]}`;
  if (day === ides) return `Id. ${MONTHS[month]}`;
  let count: number, marker: string, m = month;
  if (day < nones) { count = nones - day + 1; marker = "Non."; }
  else if (day < ides) { count = ides - day + 1; marker = "Id."; }
  else {
    const daysInMonth = new Date(d.getFullYear(), month + 1, 0).getDate();
    count = daysInMonth - day + 2; marker = "Kal."; m = (month + 1) % 12;
  }
  return count === 2 ? `prid. ${marker} ${MONTHS[m]}` : `a.d. ${toRoman(count)} ${marker} ${MONTHS[m]}`;
}

/** AUC year (ab urbe condita, 753 BC founding). */
export const aucYear = (d: Date) => d.getFullYear() + 753;

export type Festival = { month: number; day: number; endDay?: number; name: string; note: string };

/** Fixed-date festivals attested in the Roman calendar (month 1-12). */
export const FESTIVALS: Festival[] = [
  { month: 1, day: 1, name: "Kalendae Ianuariae", note: "New consuls take office; vows for the state." },
  { month: 1, day: 9, name: "Agonalia", note: "Sacrifice to Janus." },
  { month: 1, day: 11, name: "Carmentalia", note: "Festival of Carmenta." },
  { month: 2, day: 13, endDay: 21, name: "Parentalia", note: "Days honouring ancestors." },
  { month: 2, day: 15, name: "Lupercalia", note: "Purification rite at the Lupercal." },
  { month: 2, day: 17, name: "Quirinalia", note: "Festival of Quirinus." },
  { month: 2, day: 23, name: "Terminalia", note: "Festival of boundaries, for Terminus." },
  { month: 3, day: 1, name: "Feriae Martis", note: "Old new year; festival of Mars." },
  { month: 3, day: 15, name: "Feast of Anna Perenna", note: "Ides of March." },
  { month: 3, day: 17, name: "Liberalia", note: "Festival of Liber Pater." },
  { month: 3, day: 19, endDay: 23, name: "Quinquatrus", note: "Festival of Minerva." },
  { month: 4, day: 4, endDay: 10, name: "Ludi Megalenses", note: "Games for Magna Mater." },
  { month: 4, day: 19, name: "Cerealia", note: "Festival of Ceres." },
  { month: 4, day: 21, name: "Parilia", note: "Birthday of Rome." },
  { month: 4, day: 28, endDay: 30, name: "Floralia", note: "Games of Flora." },
  { month: 5, day: 9, endDay: 13, name: "Lemuria", note: "Rites to appease restless spirits." },
  { month: 6, day: 9, name: "Vestalia", note: "Festival of Vesta." },
  { month: 7, day: 6, endDay: 13, name: "Ludi Apollinares", note: "Games of Apollo." },
  { month: 7, day: 23, name: "Neptunalia", note: "Festival of Neptune." },
  { month: 8, day: 17, name: "Portunalia", note: "Festival of Portunus." },
  { month: 8, day: 19, name: "Vinalia Rustica", note: "Wine harvest festival." },
  { month: 8, day: 23, name: "Volcanalia", note: "Festival of Vulcan." },
  { month: 9, day: 5, endDay: 19, name: "Ludi Romani", note: "The Roman Games for Jupiter." },
  { month: 10, day: 11, name: "Meditrinalia", note: "Tasting of the new wine." },
  { month: 10, day: 13, name: "Fontinalia", note: "Festival of springs." },
  { month: 10, day: 15, name: "October Horse", note: "Sacrifice to Mars on the Campus Martius." },
  { month: 10, day: 19, name: "Armilustrium", note: "Purification of the army's arms." },
  { month: 11, day: 4, endDay: 17, name: "Ludi Plebeii", note: "The Plebeian Games." },
  { month: 12, day: 17, endDay: 23, name: "Saturnalia", note: "Festival of Saturn." },
];

export function festivalsOn(d: Date) {
  const m = d.getMonth() + 1, day = d.getDate();
  return FESTIVALS.filter((f) => f.month === m && day >= f.day && day <= (f.endDay ?? f.day));
}

export function nextFestival(d: Date) {
  const key = (d.getMonth() + 1) * 100 + d.getDate();
  return FESTIVALS.find((f) => f.month * 100 + f.day > key) ?? FESTIVALS[0];
}

export const festivalDate = (f: Festival) =>
  `${f.day}${f.endDay ? "–" + f.endDay : ""} ${new Date(2000, f.month - 1, 1).toLocaleString("en", { month: "short" })}`;
