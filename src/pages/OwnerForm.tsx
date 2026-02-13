import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockOwners } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OwnerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const existing = id ? mockOwners.find((o) => o.id === id) : null;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    full_name: existing?.full_name || "",
    phone: existing?.phone || "",
    email: existing?.email || "",
    address: existing?.address || "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone) {
      toast({ title: "Name and phone are required", variant: "destructive" });
      return;
    }
    toast({ title: isEdit ? "Owner updated" : "Owner created" });
    navigate("/owners");
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle>{isEdit ? "Edit Owner" : "Add New Owner"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} /></div>
              <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
              <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => update("address", e.target.value)} /></div>
            </div>
            <div className="flex gap-3">
              <Button type="submit">{isEdit ? "Update" : "Create"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
