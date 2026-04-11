import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquarePlus, ThumbsUp, ThumbsDown, Minus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type Sentiment = "positive" | "neutral" | "negative" | null;

const SENTIMENTS = [
  { value: "positive" as const, icon: ThumbsUp, label: "Good" },
  { value: "neutral" as const, icon: Minus, label: "Neutral" },
  { value: "negative" as const, icon: ThumbsDown, label: "Bad" },
];

export function FeedbackWidget() {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [sentiment, setSentiment] = useState<Sentiment>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  const canSubmit = sentiment !== null || message.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setStatus("submitting");
    try {
      await api.post("/feedback", {
        page_path: location.pathname,
        rating: sentiment,
        message: message.trim() || null,
      });
    } catch {
      // best-effort — don't block the user on failure
    }
    setStatus("done");
    setTimeout(() => {
      setOpen(false);
      setSentiment(null);
      setMessage("");
      setStatus("idle");
    }, 1500);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSentiment(null);
      setMessage("");
      setStatus("idle");
    }
    setOpen(next);
  }

  if (!user) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            aria-label="Share feedback"
            className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-lg hover:bg-primary/90 transition-colors"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Feedback
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          className="w-72 p-4 shadow-xl"
          sideOffset={8}
        >
          {status === "done" ? (
            <div className="flex flex-col items-center gap-2 py-3 text-center">
              <span className="text-2xl">🙏</span>
              <p className="font-medium text-sm">Thanks for the feedback!</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Quick feedback</p>
                <button
                  onClick={() => handleOpenChange(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sentiment row */}
              <div className="flex gap-2 mb-3">
                {SENTIMENTS.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setSentiment(sentiment === value ? null : value)}
                    aria-label={label}
                    className={`flex-1 flex flex-col items-center gap-1 rounded-lg border py-2 text-xs transition-colors ${
                      sentiment === value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              <Textarea
                placeholder="Tell us what you think… (optional)"
                className="resize-none text-sm min-h-[72px] mb-3"
                maxLength={300}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <Button
                className="w-full"
                size="sm"
                disabled={!canSubmit || status === "submitting"}
                onClick={handleSubmit}
              >
                {status === "submitting" ? "Sending…" : "Submit"}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Page: {location.pathname}
              </p>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
