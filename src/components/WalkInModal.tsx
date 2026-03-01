import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addOwner, addPet, addAppointment, mockUsers } from "@/lib/mock-data";
import { logAction } from "@/lib/audit-log";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function WalkInModal({ open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState({ ownerName: "", phone: "", petName: "", species: "Dog" });
  const [isSaving, setIsSaving] = useState(false);

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.ownerName || !form.phone || !form.petName) {
      toast({ title: "Please fill Owner Name, Phone, and Pet Name", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const ownerId = `owner-${Date.now()}`;
    const petId = `pet-${Date.now()}`;
    const aptId = `apt-${Date.now()}`;

    const newOwner = {
      id: ownerId,
      full_name: form.ownerName,
      phone: form.phone,
      pets_count: 1,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
    addOwner(newOwner);

    const newPet = {
      id: petId,
      name: form.petName,
      species: form.species,
      status: "active",
      owner_id: ownerId,
      owner: newOwner,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
    addPet(newPet);

    const vet = mockUsers.find((u) => u.role === "vet") || mockUsers[1];
    const newApt = {
      id: aptId,
      pet_id: petId,
      pet: newPet as any,
      vet_id: vet.id,
      vet,
      date: today,
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      reason: "Walk-in",
      status: "scheduled" as const,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
    addAppointment(newApt);

    logAction({ actor_id: user?.id || "unknown", action_type: "walk_in_create", entity_type: "appointment", entity_id: aptId, metadata: { ownerId, petId } });
    toast({ title: `Walk-in registered: ${form.petName}`, description: `Owner: ${form.ownerName}` });
    setForm({ ownerName: "", phone: "", petName: "", species: "Dog" });
    setIsSaving(false);
    onOpenChange(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Walk-In Registration</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label>Owner Name *</Label>
            <Input value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} placeholder="e.g., Meera Kapoor" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone *</Label>
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="e.g., +91-9876543210" />
          </div>
          <div className="space-y-1.5">
            <Label>Pet Name *</Label>
            <Input value={form.petName} onChange={(e) => update("petName", e.target.value)} placeholder="e.g., Bruno" />
          </div>
          <div className="space-y-1.5">
            <Label>Species</Label>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Registering..." : "Register Walk-In"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
