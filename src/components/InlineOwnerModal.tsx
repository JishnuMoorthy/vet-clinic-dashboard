import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addOwner } from "@/lib/mock-data";
import { logAction } from "@/lib/audit-log";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (ownerId: string) => void;
}

export function InlineOwnerModal({ open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", address: "" });
  const [isSaving, setIsSaving] = useState(false);

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.full_name || !form.phone) {
      toast({ title: "Name and phone are required", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const newId = `owner-${Date.now()}`;
    addOwner({
      id: newId,
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || undefined,
      address: form.address || undefined,
      pets_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    logAction({ actor_id: user?.id || "unknown", action_type: "create", entity_type: "owner", entity_id: newId });
    toast({ title: `${form.full_name} added!` });
    onCreated(newId);
    setForm({ full_name: "", phone: "", email: "", address: "" });
    setIsSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Add Owner</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="e.g., Meera Kapoor" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone *</Label>
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="e.g., +91-9876543210" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="e.g., meera@gmail.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="e.g., 12 MG Road, Bangalore" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Add Owner"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
