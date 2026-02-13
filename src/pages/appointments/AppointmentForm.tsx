import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { mockPets, mockUsers, mockAppointments } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import { CheckCircle2, AlertTriangle, Search } from "lucide-react";

const vets = mockUsers.filter((u) => u.role === "vet");

const morningSlots = Array.from({ length: 6 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});
const afternoonSlots = Array.from({ length: 8 }, (_, i) => {
  const hour = Math.floor(i / 2) + 12;
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});
const eveningSlots = Array.from({ length: 4 }, (_, i) => {
  const hour = Math.floor(i / 2) + 16;
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});

export default function AppointmentForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Pre-fill from calendar click-to-create
  const prefillDate = searchParams.get("date") || "";
  const prefillTime = searchParams.get("time") || "";

  const [form, setForm] = useState({
    pet_id: "",
    vet_id: "",
    date: prefillDate,
    time: prefillTime,
    reason: "",
    notes: "",
  });

  const [petSearch, setPetSearch] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const markTouched = (key: string) => setTouched((prev) => ({ ...prev, [key]: true }));
  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const isDirty = Object.values(form).some((v) => v !== "" && v !== prefillDate && v !== prefillTime);
  const blocker = useUnsavedChanges(isDirty && !submitted);

  const requiredFields = ["pet_id", "vet_id", "date", "time", "reason"] as const;
  const fieldLabels: Record<string, string> = {
    pet_id: "Please select a pet",
    vet_id: "Please choose a vet",
    date: "Please pick a date",
    time: "Please select a time slot",
    reason: "Please describe the reason for the visit",
  };

  const errors: Record<string, string> = {};
  requiredFields.forEach((f) => {
    if (!form[f] && touched[f]) errors[f] = fieldLabels[f];
  });

  // Conflict detection: warn if vet already booked at this date+time
  const conflictWarning = useMemo(() => {
    if (!form.vet_id || !form.date || !form.time) return null;
    const conflict = mockAppointments.find(
      (a) =>
        a.vet_id === form.vet_id &&
        a.date === form.date &&
        a.time === form.time &&
        a.status === "scheduled"
    );
    if (conflict) {
      const vetName = vets.find((v) => v.id === form.vet_id)?.full_name || "This vet";
      return `⚠ ${vetName} already has "${conflict.pet?.name} — ${conflict.reason}" at ${form.time} on this date.`;
    }
    return null;
  }, [form.vet_id, form.date, form.time]);

  // Filtered pets for searchable dropdown
  const filteredPets = petSearch
    ? mockPets.filter(
        (p) =>
          p.name.toLowerCase().includes(petSearch.toLowerCase()) ||
          p.owner?.full_name.toLowerCase().includes(petSearch.toLowerCase())
      )
    : mockPets;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = requiredFields.filter((f) => !form[f]);
    if (missing.length > 0) {
      const t: Record<string, boolean> = {};
      missing.forEach((f) => (t[f] = true));
      setTouched((prev) => ({ ...prev, ...t }));
      toast({ title: "Please fill the highlighted fields", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({
      title: "Appointment scheduled!",
      description: "The visit has been added to the calendar.",
    });
    navigate("/appointments");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule Appointment"
        subtitle="Book a visit for a pet. Pick a vet, date, and time slot."
        backTo="/appointments"
        helpText="Time slots are in 30-minute intervals between 9 AM and 6 PM. Conflicts are detected automatically."
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            {/* Pet selector with search */}
            <div className="space-y-1.5">
              <Label className={errors.pet_id ? "text-destructive" : ""}>Pet *</Label>
              <Select value={form.pet_id} onValueChange={(v) => { update("pet_id", v); markTouched("pet_id"); }}>
                <SelectTrigger className={errors.pet_id ? "border-destructive" : ""}><SelectValue placeholder="Search & select pet" /></SelectTrigger>
                <SelectContent>
                  <div className="px-2 pb-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Type pet or owner name..."
                        value={petSearch}
                        onChange={(e) => setPetSearch(e.target.value)}
                        className="h-8 pl-7 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  {filteredPets.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No pets found</p>
                  ) : (
                    filteredPets.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.owner?.full_name})</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.pet_id && <p className="text-xs text-destructive">{errors.pet_id}</p>}
            </div>

            {/* Vet */}
            <div className="space-y-1.5">
              <Label className={errors.vet_id ? "text-destructive" : ""}>Vet *</Label>
              <Select value={form.vet_id} onValueChange={(v) => { update("vet_id", v); markTouched("vet_id"); }}>
                <SelectTrigger className={errors.vet_id ? "border-destructive" : ""}><SelectValue placeholder="Select vet" /></SelectTrigger>
                <SelectContent>
                  {vets.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.full_name}
                      {v.specialties?.length ? ` · ${v.specialties.join(", ")}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vet_id && <p className="text-xs text-destructive">{errors.vet_id}</p>}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className={errors.date ? "text-destructive" : ""}>Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                onBlur={() => markTouched("date")}
                className={errors.date ? "border-destructive" : ""}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>

            {/* Time with grouped slots */}
            <div className="space-y-1.5">
              <Label className={errors.time ? "text-destructive" : ""}>Time *</Label>
              <Select value={form.time} onValueChange={(v) => { update("time", v); markTouched("time"); }}>
                <SelectTrigger className={errors.time ? "border-destructive" : ""}><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>🌅 Morning (9 AM – 12 PM)</SelectLabel>
                    {morningSlots.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>☀️ Afternoon (12 PM – 4 PM)</SelectLabel>
                    {afternoonSlots.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>🌇 Evening (4 PM – 6 PM)</SelectLabel>
                    {eveningSlots.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
            </div>

            {/* Conflict warning */}
            {conflictWarning && (
              <div className="sm:col-span-2 flex items-start gap-2 rounded-md border border-warning/50 bg-warning/10 p-3 text-sm text-warning">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{conflictWarning}</p>
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-2">
              <Label className={errors.reason ? "text-destructive" : ""}>Reason for Visit *</Label>
              <Input
                value={form.reason}
                onChange={(e) => update("reason", e.target.value)}
                onBlur={() => markTouched("reason")}
                placeholder="e.g., Annual vaccination, limping, dental checkup"
                className={errors.reason ? "border-destructive" : ""}
              />
              {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Any special instructions for the vet..." />
              <p className="text-[11px] text-muted-foreground">Optional — visible to the assigned vet</p>
            </div>
            <div className="flex gap-2 sm:col-span-2 pt-2">
              <Button type="submit">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/appointments")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <UnsavedChangesDialog blocker={blocker} />
    </div>
  );
}
