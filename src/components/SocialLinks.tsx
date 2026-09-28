import { SOCIAL_LINKS } from "@/config/social";
import { cn } from "@/lib/utils";

const RobloxIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M4.2 1.6 1.6 12.4 19.8 22.4 22.4 11.6 4.2 1.6Zm9.7 13.6-4.5-1.2 1.2-4.5 4.5 1.2-1.2 4.5Z" />
  </svg>
);

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3a14.4 14.4 0 0 0-.69 1.392 18.27 18.27 0 0 0-5.736 0A12.6 12.6 0 0 0 9.43 3a19.74 19.74 0 0 0-3.76 1.369C2.292 9.197 1.39 13.9 1.84 18.535a19.9 19.9 0 0 0 5.993 2.985 14.5 14.5 0 0 0 1.282-2.061 12.9 12.9 0 0 1-2.018-.953c.169-.123.334-.252.494-.385a14.18 14.18 0 0 0 12.018 0c.16.133.325.262.494.385-.643.378-1.32.696-2.02.954a14.4 14.4 0 0 0 1.282 2.06 19.85 19.85 0 0 0 6.002-2.984c.527-5.37-.901-10.03-3.05-14.166ZM8.02 15.71c-1.183 0-2.157-1.085-2.157-2.42 0-1.336.953-2.422 2.157-2.422 1.205 0 2.179 1.097 2.158 2.421 0 1.336-.964 2.421-2.158 2.421Zm7.97 0c-1.183 0-2.157-1.085-2.157-2.42 0-1.336.953-2.422 2.157-2.422 1.205 0 2.179 1.097 2.158 2.421 0 1.336-.953 2.421-2.158 2.421Z" />
  </svg>
);

interface Props {
  className?: string;
  size?: "sm" | "md";
  variant?: "icon" | "labeled";
}

export const SocialLinks = ({ className, size = "sm", variant = "icon" }: Props) => {
  const dim = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  if (variant === "labeled") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        <a
          href={SOCIAL_LINKS.roblox}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card text-foreground hover:text-gold hover:border-gold/50 transition text-sm"
        >
          <RobloxIcon className={icon} /> Roblox Group
        </a>
        <a
          href={SOCIAL_LINKS.discord}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card text-foreground hover:text-gold hover:border-gold/50 transition text-sm"
        >
          <DiscordIcon className={icon} /> Discord
        </a>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <a
        href={SOCIAL_LINKS.roblox}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Roblox Group"
        title="SPQR Roblox Group"
        className={cn(
          "inline-flex items-center justify-center border border-border bg-card text-muted-foreground hover:text-gold hover:border-gold/50 transition",
          dim
        )}
      >
        <RobloxIcon className={icon} />
      </a>
      <a
        href={SOCIAL_LINKS.discord}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Discord"
        title="SPQR Discord"
        className={cn(
          "inline-flex items-center justify-center border border-border bg-card text-muted-foreground hover:text-gold hover:border-gold/50 transition",
          dim
        )}
      >
        <DiscordIcon className={icon} />
      </a>
    </div>
  );
};

export default SocialLinks;
