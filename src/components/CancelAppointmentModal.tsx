import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAppointment } from "@/lib/api-services";
import { useToast } from "@/hooks/use-toast";
import type { Appointment } from "@/types/api";

const REASONS = [
  { value: "no_show", label: "No Show", status: "no-show" as const },
  { value: "owner_cancelled", label: "Owner Cancelled", status: "cancelled" as const },
  { value: "doctor_cancelled", label: "Doctor Cancelled", status: "cancelled" as const },
  { value: "other", label: "Other", status: "cancelled" as const },
];

interface Props {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelAppointmentModal({ appointment, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [reasonKey, setReasonKey] = useState<string>("");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!appointment) throw new Error("No appointment selected");
      const reason = REASONS.find((r) => r.value === reasonKey);
      if (!reason) throw new Error("Please select a cancellation reason");
      const noteLine = `Cancelled: ${reason.label}${notes ? ` — ${notes}` : ""}`;
      const mergedNotes = appointment.notes
        ? `${appointment.notes}\n${noteLine}`
        : noteLine;
      return updateAppointment(appointment.id, {
        status: reason.status,
        notes: mergedNotes,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consultations-today"] });
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Appointment cancelled" });
      setReasonKey("");
      setNotes("");
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({
        title: "Could not cancel appointment",
        description: err?.message || "Unknown error",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            {appointment?.pet?.name
              ? `${appointment.pet.name} — ${appointment.time}`
              : "Select a reason to continue."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label>Reason *</Label>
            <Select value={reasonKey} onValueChange={setReasonKey}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional context…"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back
          </Button>
          <Button
            variant="destructive"
            disabled={!reasonKey || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Cancelling…" : "Confirm Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
