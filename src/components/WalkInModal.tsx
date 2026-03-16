import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createOwner, createPet, createAppointment, getStaff } from "@/lib/api-services";
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
  const [form, setForm] = useState({ ownerName: "", phone: "", petName: "", species: "Dog", vet_id: "", reason: "Walk-in" });
  const [isSaving, setIsSaving] = useState(false);

  const { data: staffData } = useQuery({
    queryKey: ["staff"],
    queryFn: () => getStaff(),
  });
  const vets = (staffData?.data || []).filter((u) => u.role === "vet");

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.ownerName || !form.phone || !form.petName || !form.vet_id) {
      toast({ title: "Please fill Owner Name, Phone, Pet Name, and Doctor", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      const newOwner = await createOwner({
        full_name: form.ownerName,
        phone: form.phone,
      });

      const newPet = await createPet({
        name: form.petName,
        species: form.species,
        owner_id: newOwner.id,
      });

      const newApt = await createAppointment({
        pet_id: newPet.id,
        vet_id: form.vet_id,
        date: today,
        time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        reason: form.reason || "Walk-in",
        status: "scheduled",
      });

      logAction({ actor_id: user?.id || "unknown", action_type: "walk_in_create", entity_type: "appointment", entity_id: newApt.id, metadata: { ownerId: newOwner.id, petId: newPet.id } });
      toast({ title: `Walk-in registered: ${form.petName}`, description: `Owner: ${form.ownerName}` });
      setForm({ ownerName: "", phone: "", petName: "", species: "Dog", vet_id: "", reason: "Walk-in" });
      onOpenChange(false);
      onCreated?.();
    } catch (err: any) {
      toast({ title: "Walk-in registration failed", description: err?.message || "Unknown error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
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
          <div className="space-y-1.5">
            <Label>Doctor *</Label>
            <Select value={form.vet_id} onValueChange={(v) => update("vet_id", v)}>
              <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
              <SelectContent>
                {vets.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Input value={form.reason} onChange={(e) => update("reason", e.target.value)} placeholder="e.g., Walk-in checkup" />
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
