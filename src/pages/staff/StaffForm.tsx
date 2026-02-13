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
import { CheckCircle2 } from "lucide-react";

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

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (key: string) => setTouched((prev) => ({ ...prev, [key]: true }));
  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const errors: Record<string, string> = {};
  if (!form.full_name && touched.full_name) errors.full_name = "Please enter the team member's name";
  if (!form.email && touched.email) errors.email = "Email is needed for login access";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email) {
      setTouched({ full_name: true, email: true });
      toast({ title: "Please fill the highlighted fields", variant: "destructive" });
      return;
    }
    toast({
      title: isEdit ? `${form.full_name} updated` : `${form.full_name} added!`,
      description: isEdit ? "Staff record saved." : "Team member can now log in with their email.",
    });
    navigate("/staff");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? `Edit ${existing?.full_name}` : "Add Team Member"}
        subtitle={isEdit ? "Update staff details and role" : "Onboard a new member to your clinic team"}
        backTo="/staff"
        helpText="Choose 'Vet' role to allow appointment assignments. Add specialties for vets."
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
                placeholder="e.g., Dr. Rajesh Sharma"
                className={errors.full_name ? "border-destructive" : ""}
              />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className={errors.email ? "text-destructive" : ""}>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                onBlur={() => markTouched("email")}
                placeholder="e.g., rajesh@pawscare.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground">Used for login credentials</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="e.g., +91-9000000002" />
            </div>
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Select value={form.role} onValueChange={(v) => update("role", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">👑 Admin — Full access</SelectItem>
                  <SelectItem value="vet">🩺 Vet — Clinical access</SelectItem>
                  <SelectItem value="staff">📋 Staff — Basic access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.role === "vet" && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Specialties</Label>
                <Input value={form.specialties} onChange={(e) => update("specialties", e.target.value)} placeholder="e.g., Surgery, Dermatology" />
                <p className="text-[11px] text-muted-foreground">Separate multiple specialties with commas</p>
              </div>
            )}
            <div className="flex gap-2 sm:col-span-2 pt-2">
              <Button type="submit">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isEdit ? "Save Changes" : "Add Team Member"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/staff")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
