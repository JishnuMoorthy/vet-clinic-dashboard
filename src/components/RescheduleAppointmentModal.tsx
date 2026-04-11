import { useEffect, useState } from "react";
import { format } from "date-fns";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAppointment } from "@/lib/api-services";
import { useToast } from "@/hooks/use-toast";
import type { Appointment } from "@/types/api";

interface Props {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RescheduleAppointmentModal({ appointment, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (appointment && open) {
      setDate(appointment.date || format(new Date(), "yyyy-MM-dd"));
      setTime(appointment.time || "09:00");
    }
  }, [appointment, open]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!appointment) throw new Error("No appointment selected");
      if (!date || !time) throw new Error("Please pick a new date and time");
      return updateAppointment(appointment.id, { date, time });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consultations-today"] });
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Appointment rescheduled" });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast({
        title: "Could not reschedule",
        description: err?.message || "Unknown error",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Move Appointment</DialogTitle>
          <DialogDescription>
            {appointment?.pet?.name
              ? `Pick a new date and time for ${appointment.pet.name}.`
              : "Pick a new date and time."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label>New Date *</Label>
            <Input
              type="date"
              value={date}
              min={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>New Time *</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!date || !time || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Saving…" : "Save New Time"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
