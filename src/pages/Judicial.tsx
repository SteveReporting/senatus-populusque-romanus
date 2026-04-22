import { useState } from "react";
import { ExternalLink, Scale, AlertTriangle } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { JUDICIAL_URL } from "@/config/trello";

const Judicial = () => {
  const [failed, setFailed] = useState(false);

  return (
    <div className="container py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <SectionHeader
          className="mb-0"
          eyebrow="Curia Iustitiae"
          title="Judicial System"
          subtitle="Court records, criminal cases, and legal proceedings of the Roman state."
        />
        <a
          href={JUDICIAL_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-gradient-gold text-primary-foreground font-medium tracking-wide shadow-gold hover:shadow-imperial transition-all"
        >
          Open in New Tab <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="imperial-panel rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-1">
          <div className="flex items-center gap-3">
            <Scale className="h-4 w-4 text-gold" />
            <span className="text-xs tracking-widest uppercase text-muted-foreground">
              Embedded Judicial Archive
            </span>
          </div>
          <span className="text-[10px] tracking-widest uppercase text-gold-soft">External · Read-only</span>
        </div>

        {!failed ? (
          <div className="relative bg-background" style={{ height: "75vh" }}>
            <iframe
              title="Judicial Database"
              src={JUDICIAL_URL}
              className="absolute inset-0 w-full h-full"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              onError={() => setFailed(true)}
              onLoad={(e) => {
                // Many sites block embedding via X-Frame-Options/CSP. Detect blank load.
                try {
                  const iframe = e.currentTarget as HTMLIFrameElement;
                  // Cross-origin will throw — that's expected and fine.
                  void iframe.contentWindow?.location.href;
                } catch {
                  /* cross-origin, embed presumably loaded */
                }
              }}
            />
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-surface-2 text-gold mb-4">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-2xl">Embedding blocked by judicial host</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              The judicial database does not allow iframe embedding. Open it in a new tab to access
              court records.
            </p>
            <a
              href={JUDICIAL_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-md bg-gradient-gold text-primary-foreground font-medium tracking-wide"
            >
              Open Judicial Database <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground text-center">
        The judicial archive is an external authority. Records and rulings are maintained outside the mainframe.
      </p>
    </div>
  );
};

export default Judicial;
