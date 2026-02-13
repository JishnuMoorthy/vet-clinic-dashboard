import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { mockPets, mockUsers } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const vets = mockUsers.filter((u) => u.role === "vet");
const timeSlots = Array.from({ length: 18 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${min}`;
});

export default function AppointmentForm() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    pet_id: "",
    vet_id: "",
    date: "",
    time: "",
    reason: "",
    notes: "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pet_id || !form.vet_id || !form.date || !form.time || !form.reason) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    toast({ title: "Appointment scheduled (mock)" });
    navigate("/appointments");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Schedule Appointment" backTo="/appointments" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Pet *</Label>
              <Select value={form.pet_id} onValueChange={(v) => update("pet_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
                <SelectContent>
                  {mockPets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.owner?.full_name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vet *</Label>
              <Select value={form.vet_id} onValueChange={(v) => update("vet_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select vet" /></SelectTrigger>
                <SelectContent>
                  {vets.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Time *</Label>
              <Select value={form.time} onValueChange={(v) => update("time", v)}>
                <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Reason *</Label>
              <Input value={form.reason} onChange={(e) => update("reason", e.target.value)} placeholder="e.g., Annual vaccination" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit">Schedule Appointment</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/appointments")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
