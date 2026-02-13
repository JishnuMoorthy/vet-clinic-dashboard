import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { mockOwners } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";

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

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (key: string) => setTouched((prev) => ({ ...prev, [key]: true }));
  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const errors: Record<string, string> = {};
  if (!form.full_name && touched.full_name) errors.full_name = "Please enter the owner's full name";
  if (!form.phone && touched.phone) errors.phone = "A phone number is needed to contact the owner";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone) {
      setTouched({ full_name: true, phone: true });
      toast({ title: "Please fill the highlighted fields", variant: "destructive" });
      return;
    }
    toast({
      title: isEdit ? `${form.full_name} updated` : `${form.full_name} registered!`,
      description: isEdit ? "Owner record saved." : "Pet parent has been added.",
    });
    navigate("/owners");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? `Edit ${existing?.full_name}` : "Register New Owner"}
        subtitle={isEdit ? "Update the owner's contact details" : "Add a new pet parent to your clinic records"}
        backTo="/owners"
        helpText="You can link pets to this owner after creating their record."
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={errors.full_name ? "text-destructive" : ""}>Full Name *</Label>
              <Input
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                onBlur={() => markTouched("full_name")}
                placeholder="e.g., Meera Kapoor"
                className={errors.full_name ? "border-destructive" : ""}
              />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className={errors.phone ? "text-destructive" : ""}>Phone *</Label>
              <Input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                onBlur={() => markTouched("phone")}
                placeholder="e.g., +91-9876543210"
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="e.g., meera@gmail.com" />
              <p className="text-[11px] text-muted-foreground">For sending invoices & reminders</p>
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="e.g., 12 MG Road, Bangalore" />
            </div>
            <div className="flex gap-2 sm:col-span-2 pt-2">
              <Button type="submit">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isEdit ? "Save Changes" : "Register Owner"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/owners")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
