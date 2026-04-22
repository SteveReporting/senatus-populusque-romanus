import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  message?: string;
  hint?: string;
  onRetry?: () => void;
}

export const TrelloEmptyState = ({
  message = "Trello data unavailable",
  hint = "Check that the board is set to Public and that the board ID is configured in src/config/trello.ts.",
  onRetry,
}: Props) => (
  <div className="imperial-panel rounded-md p-10 text-center">
    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-surface-2 text-gold mb-4">
      <AlertTriangle className="h-5 w-5" />
    </div>
    <h3 className="font-serif text-2xl text-foreground">{message}</h3>
    <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{hint}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gold/50 text-gold hover:bg-gold/10 text-sm transition"
      >
        <RefreshCw className="h-4 w-4" /> Retry
      </button>
    )}
  </div>
);

export default TrelloEmptyState;
