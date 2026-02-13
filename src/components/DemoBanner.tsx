import { Info, X } from "lucide-react";
import { useState } from "react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 flex items-center gap-3 text-sm">
      <Info className="h-4 w-4 text-primary shrink-0" />
      <p className="text-foreground/80">
        <span className="font-semibold text-primary">Demo Mode</span> — You're viewing sample data. Changes won't be saved. Connect a backend to go live.
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="ml-auto rounded p-1 hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
