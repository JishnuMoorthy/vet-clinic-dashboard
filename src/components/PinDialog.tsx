import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, AlertCircle } from "lucide-react";

const CORRECT_PIN = "8787";

export function PinDialog({
  open,
  onSuccess,
  onCancel,
}: {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleComplete = useCallback(
    (value: string) => {
      if (value === CORRECT_PIN) {
        setError(null);
        setPin("");
        sessionStorage.setItem("super_admin", "true");
        onSuccess();
      } else {
        setError("Incorrect PIN. Try again.");
        setPin("");
      }
    },
    [onSuccess],
  );

  const handleCancel = () => {
    setPin("");
    setError(null);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>Admin Access</DialogTitle>
          <DialogDescription>Enter the 4-digit PIN to continue</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={(value) => {
              setPin(value);
              setError(null);
            }}
            onComplete={handleComplete}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>

          {error && (
            <div className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
