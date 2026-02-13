import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { mockOwners } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function OwnerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const existing = isEdit ? mockOwners.find((o) => o.id === id) : null;

  const [form, setForm] = useState({
    full_name: existing?.full_name || "",
    phone: existing?.phone || "",
    email: existing?.email || "",
    address: existing?.address || "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone) {
      toast({ title: "Name and phone are required", variant: "destructive" });
      return;
    }
    toast({ title: isEdit ? `${form.full_name} updated (mock)` : `${form.full_name} created (mock)` });
    navigate("/owners");
  };

  return (
    <div className="space-y-6">
      <PageHeader title={isEdit ? `Edit ${existing?.full_name}` : "New Owner"} backTo="/owners" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit">{isEdit ? "Save Changes" : "Create Owner"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/owners")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
