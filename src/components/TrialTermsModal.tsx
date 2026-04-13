import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, ExternalLink } from "lucide-react";

const TERMS_KEY = "mia_trial_terms_accepted";

export function useTrialTerms() {
  const accepted = localStorage.getItem(TERMS_KEY) === "true";
  return { accepted, markAccepted: () => localStorage.setItem(TERMS_KEY, "true") };
}

export function TrialTermsModal({
  open,
  onAccept,
}: {
  open: boolean;
  onAccept: () => void;
}) {
  const [checked, setChecked] = useState(false);

  const handleAccept = () => {
    localStorage.setItem(TERMS_KEY, "true");
    onAccept();
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <DialogTitle>Trial Access Agreement</DialogTitle>
          </div>
          <DialogDescription>
            Please review and accept the terms before continuing.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[340px] rounded-md border p-4 text-sm leading-relaxed">
          <div className="space-y-3">
            <p>
              Welcome to <strong>Mia VMS</strong>. This is a trial version provided
              for evaluation purposes only. By proceeding, you agree to the following:
            </p>

            <p>
              <strong>1. Evaluation Only</strong> — This software is under active
              development and is not a production-ready product. It is provided
              for demonstration and evaluation purposes.
            </p>

            <p>
              <strong>2. Intellectual Property</strong> — All rights to the software,
              including source code, design, branding, and architecture, belong
              exclusively to the authors of Mia VMS. You may not copy, distribute,
              reverse-engineer, or create derivative works.
            </p>

            <p>
              <strong>3. Confidentiality</strong> — Features, pricing, and roadmap
              information shared during this trial are confidential and may not be
              disclosed to third parties without written permission.
            </p>

            <p>
              <strong>4. No Sharing</strong> — Screenshots, recordings, or access
              credentials may not be shared without express consent from the author(s).
            </p>

            <p>
              <strong>5. Data Privacy</strong> — Your data is stored securely and
              isolated to your clinic. We may collect anonymised usage data to
              improve the product. We will not sell or share your data.
            </p>

            <p>
              <strong>6. No Warranty</strong> — The software is provided "as is"
              without warranty. The authors are not liable for any damages arising
              from its use.
            </p>
          </div>
        </ScrollArea>

        <div className="flex items-start gap-2">
          <Checkbox
            id="accept-terms"
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
          />
          <label
            htmlFor="accept-terms"
            className="text-sm leading-tight cursor-pointer select-none"
          >
            I have read and agree to the{" "}
            <a
              href="/trial-terms.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline inline-flex items-center gap-0.5"
            >
              Trial Terms & Conditions
              <ExternalLink className="h-3 w-3" />
            </a>
          </label>
        </div>

        <DialogFooter>
          <Button disabled={!checked} onClick={handleAccept} className="w-full sm:w-auto">
            I Accept — Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
