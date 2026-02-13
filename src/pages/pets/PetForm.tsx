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
import { CheckCircle2 } from "lucide-react";

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

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (key: string) => setTouched((prev) => ({ ...prev, [key]: true }));
  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const errors: Record<string, string> = {};
  if (!form.name && touched.name) errors.name = "Please enter the pet's name";
  if (!form.owner_id && touched.owner_id) errors.owner_id = "Please select who owns this pet";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.species || !form.owner_id) {
      setTouched({ name: true, owner_id: true });
      toast({ title: "Please fill the highlighted fields", variant: "destructive" });
      return;
    }
    toast({
      title: isEdit ? `${form.name} updated successfully` : `${form.name} registered!`,
      description: isEdit ? "Pet record has been saved." : "The pet has been added to your clinic.",
    });
    navigate("/pets");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? `Edit ${existing?.name}` : "Register New Pet"}
        subtitle={isEdit ? "Update the pet's information below" : "Fill in the details to add a new pet to your clinic"}
        backTo="/pets"
        helpText="Required fields are marked with *. You can always edit this later."
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={errors.name ? "text-destructive" : ""}>Pet Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                onBlur={() => markTouched("name")}
                placeholder="e.g., Bruno"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Species *</Label>
              <Select value={form.species} onValueChange={(v) => update("species", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dog">🐕 Dog</SelectItem>
                  <SelectItem value="Cat">🐈 Cat</SelectItem>
                  <SelectItem value="Bird">🐦 Bird</SelectItem>
                  <SelectItem value="Other">🐾 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Breed</Label>
              <Input value={form.breed} onChange={(e) => update("breed", e.target.value)} placeholder="e.g., Golden Retriever" />
              <p className="text-[11px] text-muted-foreground">Leave blank if unknown</p>
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date of Birth</Label>
              <Input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
              <p className="text-[11px] text-muted-foreground">Approximate is fine</p>
            </div>
            <div className="space-y-1.5">
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.1" value={form.weight} onChange={(e) => update("weight", e.target.value)} placeholder="e.g., 12.5" />
            </div>
            <div className="space-y-1.5">
              <Label>Microchip ID</Label>
              <Input value={form.microchip_id} onChange={(e) => update("microchip_id", e.target.value)} placeholder="e.g., MC-001234" />
            </div>
            <div className="space-y-1.5">
              <Label className={errors.owner_id ? "text-destructive" : ""}>Owner *</Label>
              <Select value={form.owner_id} onValueChange={(v) => { update("owner_id", v); markTouched("owner_id"); }}>
                <SelectTrigger className={errors.owner_id ? "border-destructive" : ""}><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>
                  {mockOwners.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.owner_id && <p className="text-xs text-destructive">{errors.owner_id}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Any allergies, temperament, or special needs..." />
            </div>
            <div className="flex gap-2 sm:col-span-2 pt-2">
              <Button type="submit">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isEdit ? "Save Changes" : "Register Pet"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/pets")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
