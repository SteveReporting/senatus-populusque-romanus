import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

const QUOTES: { text: string; source: string }[] = [
  {
    text: "The Emperor's power is absolute and permanent — neither the Senate, the Council, nor the Imperial Command may remove it.",
    source: "Imperial Law · Emperor's Power",
  },
  {
    text: "Citizens are to be treated equally as humans, and equal in rights.",
    source: "Proclamation · Article I",
  },
  {
    text: "The goal of the Senate is the conservation of the State and of the Citizens of Rome — liberty, property, safety, and resistance against oppression from the barbarians.",
    source: "Proclamation · Article II",
  },
  {
    text: "The principle of any authority resides in the Nation and its Imperial Administration. No man may exercise authority not granted by the State.",
    source: "Proclamation · Article III",
  },
  {
    text: "All Imperial Law is the expression of the General Will of the people.",
    source: "Proclamation · Article VI",
  },
  {
    text: "No man may be accused, arrested, or detained but in the cases determined and set in stone by the Law and State.",
    source: "Proclamation · Article VII",
  },
  {
    text: "Any man is presumed innocent until he is declared culpable.",
    source: "Proclamation · Article IX",
  },
  {
    text: "The free communication of thoughts and of opinions is one of the most precious rights of the Citizen and Subject.",
    source: "Proclamation · Article XI",
  },
  {
    text: "The State is divided into three separate powers — the Executive, the Legislature, and the Judiciary — and recognizes the Constitution of Rome as its most solemn document.",
    source: "Proclamation · Article XIII",
  },
  {
    text: "When on tags and uniform, the Legionary is identified as ON DUTY and bound in service to Rome.",
    source: "Ordinatio Militum · Section III",
  },
  {
    text: "Each Legio shall always wear their uniforms — Galea, Armor, and Shield — whenever they stand on duty.",
    source: "Ordinatio Militum · Section II",
  },
  {
    text: "The intelligence service may overstep any power or jurisdiction — including the Praetorian Guard, Imperial Command, and the Judicial Court.",
    source: "Imperial Law · Imperial Intelligence",
  },
  {
    text: "If there are any discrepancies in the constitution, the Imperators have the final say.",
    source: "Imperial Law · Discrepancies",
  },
  {
    text: "Senatus Populusque Romanus — the Senate and the People of Rome.",
    source: "Motto of the Empire",
  },
];

const ROTATION_MS = 6500;

const RotatingQuotes = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      const t = setTimeout(() => {
        setIndex((i) => (i + 1) % QUOTES.length);
        setVisible(true);
      }, 700);
      return () => clearTimeout(t);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, []);

  const current = QUOTES[index];

  return (
    <section className="container py-20">
      <div className="relative imperial-panel rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-40 pointer-events-none" />
        <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
        <div className="relative px-6 py-16 md:px-16 md:py-24 text-center">
          <div className="flex items-center justify-center gap-3 text-[11px] tracking-[0.4em] uppercase text-gold/80 mb-8">
            <span className="h-px w-10 bg-gold/60" />
            <Quote className="h-4 w-4" />
            Vox Imperii
            <span className="h-px w-10 bg-gold/60" />
          </div>

          <div
            className="min-h-[180px] md:min-h-[160px] flex flex-col items-center justify-center transition-all duration-700 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
            }}
            aria-live="polite"
          >
            <blockquote className="font-serif text-2xl md:text-4xl leading-snug text-foreground max-w-3xl">
              <span className="text-gold/70 font-display">“</span>
              {current.text}
              <span className="text-gold/70 font-display">”</span>
            </blockquote>
            <div className="mt-6 text-[11px] uppercase tracking-[0.35em] text-gold-soft">
              {current.source}
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2">
            {QUOTES.map((_, i) => (
              <button
                key={i}
                aria-label={`Show quote ${i + 1}`}
                onClick={() => {
                  if (i === index) return;
                  setVisible(false);
                  setTimeout(() => {
                    setIndex(i);
                    setVisible(true);
                  }, 350);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-8 bg-gold" : "w-1.5 bg-gold/30 hover:bg-gold/60"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="meander h-1" />
      </div>
    </section>
  );
};

export default RotatingQuotes;
