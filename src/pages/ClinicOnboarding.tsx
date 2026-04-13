import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Loader2,
  CheckCircle2,
  Copy,
  Plus,
  User,
  Mail,
  Phone,
  Lock,
} from "lucide-react";

interface OnboardingResponse {
  message: string;
  clinic: { id: string; name: string };
  admin: { id: string; email: string; name: string };
}

export default function ClinicOnboarding() {
  const { toast } = useToast();

  const [form, setForm] = useState({
    clinic_name: "",
    clinic_phone: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
    include_demo_data: true,
  });

  const [result, setResult] = useState<{
    response: OnboardingResponse;
    password: string;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      api.post<OnboardingResponse>("/admin/onboard-clinic", data),
    onSuccess: (data) => {
      setResult({ response: data, password: form.admin_password });
      toast({ title: "Clinic onboarded!", description: data.message });
    },
    onError: (err: any) => {
      toast({
        title: "Onboarding failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clinic_name || !form.admin_name || !form.admin_email || !form.admin_password) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (form.admin_password.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    mutation.mutate(form);
  };

  const handleCopyCredentials = () => {
    if (!result) return;
    const text = [
      `Mia VMS — Trial Access`,
      ``,
      `Login URL: ${window.location.origin}`,
      `Email: ${result.response.admin.email}`,
      `Password: ${result.password}`,
      ``,
      `Clinic: ${result.response.clinic.name}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Credentials copied to clipboard!" });
  };

  const handleCreateAnother = () => {
    setResult(null);
    setForm({
      clinic_name: "",
      clinic_phone: "",
      admin_name: "",
      admin_email: "",
      admin_password: "",
      include_demo_data: true,
    });
  };

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Success state
  if (result) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Clinic Onboarded</h1>
            <p className="text-sm text-muted-foreground">{result.response.message}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Login Credentials</CardTitle>
            <CardDescription>Share these with the clinic admin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm font-mono">
              <div>
                <span className="text-muted-foreground">URL: </span>
                <span>{window.location.origin}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span>{result.response.admin.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Password: </span>
                <span>{result.password}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Clinic: </span>
                <span>{result.response.clinic.name}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCopyCredentials} className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Copy Credentials
              </Button>
              <Button variant="outline" onClick={handleCreateAnother}>
                <Plus className="mr-2 h-4 w-4" />
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form state
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Onboard New Clinic</h1>
          <p className="text-sm text-muted-foreground">
            Create a trial clinic with admin access
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Clinic Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Clinic Details
              </h3>
              <div className="space-y-2">
                <Label htmlFor="clinic_name">
                  <Building2 className="inline h-3.5 w-3.5 mr-1" />
                  Clinic Name *
                </Label>
                <Input
                  id="clinic_name"
                  placeholder="Paws & Care Veterinary"
                  value={form.clinic_name}
                  onChange={(e) => update("clinic_name", e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic_phone">
                  <Phone className="inline h-3.5 w-3.5 mr-1" />
                  Clinic Phone
                </Label>
                <Input
                  id="clinic_phone"
                  placeholder="+91-9876543210"
                  value={form.clinic_phone}
                  onChange={(e) => update("clinic_phone", e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <div className="border-t" />

            {/* Admin User */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Admin Account
              </h3>
              <div className="space-y-2">
                <Label htmlFor="admin_name">
                  <User className="inline h-3.5 w-3.5 mr-1" />
                  Admin Name *
                </Label>
                <Input
                  id="admin_name"
                  placeholder="Dr. Priya Sharma"
                  value={form.admin_name}
                  onChange={(e) => update("admin_name", e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_email">
                  <Mail className="inline h-3.5 w-3.5 mr-1" />
                  Admin Email *
                </Label>
                <Input
                  id="admin_email"
                  type="email"
                  placeholder="priya@pawscare.in"
                  value={form.admin_email}
                  onChange={(e) => update("admin_email", e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_password">
                  <Lock className="inline h-3.5 w-3.5 mr-1" />
                  Password * <span className="text-xs text-muted-foreground">(min 8 characters)</span>
                </Label>
                <Input
                  id="admin_password"
                  type="password"
                  placeholder="••••••••"
                  value={form.admin_password}
                  onChange={(e) => update("admin_password", e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <div className="border-t" />

            {/* Demo Data Toggle */}
            <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div className="space-y-1">
                <Label htmlFor="demo-data" className="text-sm font-medium cursor-pointer">
                  Include sample data
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pre-load sample pets, owners, appointments & invoices so the
                  clinic can see what the system looks like with real data.
                </p>
              </div>
              <Switch
                id="demo-data"
                checked={form.include_demo_data}
                onCheckedChange={(v) => update("include_demo_data", v)}
                disabled={mutation.isPending}
              />
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Clinic...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Create Clinic
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
