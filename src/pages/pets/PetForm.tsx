import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { mockPets, mockOwners } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function PetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const existing = isEdit ? mockPets.find((p) => p.id === id) : null;

  const [form, setForm] = useState({
    name: existing?.name || "",
    species: existing?.species || "Dog",
    breed: existing?.breed || "",
    gender: existing?.gender || "",
    date_of_birth: existing?.date_of_birth || "",
    weight: existing?.weight?.toString() || "",
    microchip_id: existing?.microchip_id || "",
    owner_id: existing?.owner_id || "",
    notes: existing?.notes || "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.species || !form.owner_id) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    toast({ title: isEdit ? `${form.name} updated (mock)` : `${form.name} created (mock)` });
    navigate("/pets");
  };

  return (
    <div className="space-y-6">
      <PageHeader title={isEdit ? `Edit ${existing?.name}` : "New Pet"} backTo="/pets" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Species *</Label>
              <Select value={form.species} onValueChange={(v) => update("species", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dog">Dog</SelectItem>
                  <SelectItem value="Cat">Cat</SelectItem>
                  <SelectItem value="Bird">Bird</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Breed</Label>
              <Input value={form.breed} onChange={(e) => update("breed", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.1" value={form.weight} onChange={(e) => update("weight", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Microchip ID</Label>
              <Input value={form.microchip_id} onChange={(e) => update("microchip_id", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Owner *</Label>
              <Select value={form.owner_id} onValueChange={(v) => update("owner_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>
                  {mockOwners.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit">{isEdit ? "Save Changes" : "Create Pet"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/pets")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
