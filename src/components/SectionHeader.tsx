import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
}

export const SectionHeader = ({ eyebrow, title, subtitle, className, align = "left" }: Props) => (
  <div className={cn("mb-10", align === "center" && "text-center", className)}>
    {eyebrow && (
      <div className={cn(
        "flex items-center gap-3 text-[11px] tracking-[0.4em] uppercase text-gold/80 mb-3",
        align === "center" && "justify-center"
      )}>
        <span className="h-px w-8 bg-gold/60" />
        {eyebrow}
        <span className="h-px w-8 bg-gold/60" />
      </div>
    )}
    <h2 className="font-serif text-4xl md:text-5xl text-foreground leading-tight">
      {title}
    </h2>
    {subtitle && (
      <p className={cn(
        "mt-3 text-muted-foreground max-w-2xl",
        align === "center" && "mx-auto"
      )}>
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionHeader;
