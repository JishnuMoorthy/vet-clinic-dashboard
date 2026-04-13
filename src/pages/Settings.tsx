import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { updateStaff } from "@/lib/api-services";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, X, Loader2 } from "lucide-react";

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
  });

  if (!user) return null;

  async function handleSave() {
    setSaving(true);
    try {
      await updateStaff(user!.id, {
        full_name: form.full_name,
        phone: form.phone,
      });
      // Update local auth state so header reflects the change
      if (refreshUser) await refreshUser();
      toast({ title: "Profile updated" });
      setEditing(false);
    } catch (err: any) {
      toast({
        title: "Failed to update",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm({ full_name: user!.full_name, phone: user!.phone || "" });
    setEditing(false);
  }

  const readOnlyInfo = [
    ["Email", user.email],
    ["Role", user.role],
    ["Account Status", user.is_active ? "Active" : "Inactive"],
    ["Member Since", new Date(user.created_at).toLocaleDateString()],
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />

      <Card className="max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Your Profile</CardTitle>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving || !form.full_name.trim()}>
                {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Editable fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-sm text-muted-foreground">Full Name</Label>
              {editing ? (
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  disabled={saving}
                />
              ) : (
                <p className="text-sm font-medium">{user.full_name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm text-muted-foreground">Phone</Label>
              {editing ? (
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91-XXXXX-XXXXX"
                  disabled={saving}
                />
              ) : (
                <p className="text-sm font-medium">{user.phone || "—"}</p>
              )}
            </div>
          </div>

          {/* Read-only fields */}
          <div className="border-t pt-4 space-y-3">
            {readOnlyInfo.map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">
                  {label === "Role" ? (
                    <Badge variant="outline" className="capitalize">{value}</Badge>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </div>

          {/* Specialties */}
          {user.specialties && user.specialties.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">Specialties</p>
              <div className="flex flex-wrap gap-1">
                {user.specialties.map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
