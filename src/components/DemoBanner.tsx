import { Info, X, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function DemoBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const isLive = user && !user.id.startsWith("mock-");

  // Auto-dismiss live banner after 5 seconds
  useEffect(() => {
    if (isLive) {
      const timer = setTimeout(() => setDismissed(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isLive]);

  if (dismissed || !user) return null;

  if (isLive) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5 flex items-center gap-3 text-sm">
        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
        <p className="text-foreground/80">
          <span className="font-semibold text-green-700">Live Mode</span> — Connected to your clinic database.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="ml-auto rounded p-1 hover:bg-green-500/10 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 flex items-center gap-3 text-sm">
      <Info className="h-4 w-4 text-primary shrink-0" />
      <p className="text-foreground/80">
        <span className="font-semibold text-primary">Demo Mode</span> — You're viewing sample data. Changes won't be saved.
      </p>
    </div>
  );
}
