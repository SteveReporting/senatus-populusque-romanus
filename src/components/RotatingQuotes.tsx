import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <section className="container py-16 md:py-24">
      <div className="relative border-y-4 border-crimson bg-card overflow-hidden">
        <div className="relative grid gap-8 px-6 py-12 md:grid-cols-[190px_1fr] md:px-12 md:py-16">
          <div className="border-b border-border pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-8">
          <div className="flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase text-gold mb-4">
            <span className="h-px w-10 bg-gold/60" />
            <Quote className="h-4 w-4" />
            Vox Imperii
          </div>
          <p className="font-serif text-3xl leading-none">From the laws of Rome</p>
          </div>

          <div
            className="min-h-[190px] flex flex-col items-start justify-center transition-all duration-700 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
            }}
            aria-live="polite"
          >
            <blockquote className="font-serif text-3xl md:text-5xl leading-tight text-foreground max-w-4xl">
              <span className="text-gold/70 font-display">“</span>
              {current.text}
              <span className="text-gold/70 font-display">”</span>
            </blockquote>
            <div className="mt-6 text-[11px] uppercase tracking-[0.35em] text-gold-soft">
              {current.source}
            </div>
          </div>

           <div className="mt-8 flex items-center gap-1">
            {QUOTES.map((_, i) => (
               <Button
                key={i}
                 variant="ghost"
                aria-label={`Show quote ${i + 1}`}
                onClick={() => {
                  if (i === index) return;
                  setVisible(false);
                  setTimeout(() => {
                    setIndex(i);
                    setVisible(true);
                  }, 350);
                }}
                 className={`h-5 min-w-0 p-0 transition-all duration-300 ${
                   i === index ? "w-8 bg-crimson hover:bg-crimson" : "w-2 bg-gold/25 hover:bg-gold/60"
                }`}
               />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RotatingQuotes;
