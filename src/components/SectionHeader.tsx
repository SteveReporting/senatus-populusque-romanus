import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: "left" | "center";
  action?: { to: string; label: string };
  size?: "page" | "section";
}

export const SectionHeader = ({ eyebrow, title, subtitle, className, align = "left", action, size = "page" }: Props) => (
  <div
    className={cn(
      "mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between animate-fade-up",
      align === "center" && "text-center md:flex-col md:items-center",
      className
    )}
  >
    <div className={cn(align === "center" && "mx-auto")}>
      {eyebrow && (
        <div className={cn("eyebrow mb-3 flex items-center gap-3", align === "center" && "justify-center")}>
          <span className="h-px w-6 bg-crimson" />
          {eyebrow}
        </div>
      )}
      <h2
        className={cn(
          "font-display font-semibold leading-[1.05] text-foreground",
          size === "page" ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-3 max-w-2xl text-sm md:text-base text-muted-foreground", align === "center" && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </div>
    {action && (
      <Link
        to={action.to}
        className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-gold hover:text-gold-soft transition-colors"
      >
        {action.label}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    )}
  </div>
);

export default SectionHeader;
