import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockPets, mockOwners } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const existingPet = id ? mockPets.find((p) => p.id === id) : null;
  const isEdit = !!existingPet;

  const [form, setForm] = useState({
    name: existingPet?.name || "",
    species: existingPet?.species || "",
    breed: existingPet?.breed || "",
    gender: existingPet?.gender || "",
    date_of_birth: existingPet?.date_of_birth || "",
    weight: existingPet?.weight?.toString() || "",
    microchip_id: existingPet?.microchip_id || "",
    owner_id: existingPet?.owner_id || "",
    notes: existingPet?.notes || "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.species) {
      toast({ title: "Name and species are required", variant: "destructive" });
      return;
    }
    toast({ title: isEdit ? "Pet updated successfully" : "Pet created successfully" });
    navigate("/pets");
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>{isEdit ? "Edit Pet" : "Add New Pet"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => update("name", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Species *</Label>
                <Select value={form.species} onValueChange={(v) => update("species", v)}>
                  <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                  <SelectContent>
                    {["Dog", "Cat", "Bird", "Fish", "Rabbit", "Other"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Breed</Label><Input value={form.breed} onChange={(e) => update("breed", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} /></div>
              <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" step="0.1" value={form.weight} onChange={(e) => update("weight", e.target.value)} /></div>
              <div className="space-y-2"><Label>Microchip ID</Label><Input value={form.microchip_id} onChange={(e) => update("microchip_id", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Owner</Label>
                <Select value={form.owner_id} onValueChange={(v) => update("owner_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                  <SelectContent>{mockOwners.map((o) => <SelectItem key={o.id} value={o.id}>{o.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} /></div>
            <div className="flex gap-3">
              <Button type="submit">{isEdit ? "Update Pet" : "Create Pet"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
