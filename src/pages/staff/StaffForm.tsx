import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { mockUsers } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function StaffForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const existing = isEdit ? mockUsers.find((u) => u.id === id) : null;

  const [form, setForm] = useState({
    full_name: existing?.full_name || "",
    email: existing?.email || "",
    phone: existing?.phone || "",
    role: existing?.role || "staff",
    specialties: existing?.specialties?.join(", ") || "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    toast({ title: isEdit ? `${form.full_name} updated (mock)` : `${form.full_name} added (mock)` });
    navigate("/staff");
  };

  return (
    <div className="space-y-6">
      <PageHeader title={isEdit ? `Edit ${existing?.full_name}` : "Add Staff"} backTo="/staff" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={form.role} onValueChange={(v) => update("role", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="vet">Vet</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Specialties (comma-separated, for vets)</Label>
              <Input value={form.specialties} onChange={(e) => update("specialties", e.target.value)} placeholder="e.g., Surgery, Dermatology" />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit">{isEdit ? "Save Changes" : "Add Staff"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/staff")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
