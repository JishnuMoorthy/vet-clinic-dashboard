import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><p className="text-xs font-medium text-muted-foreground">Full Name</p><p className="font-medium">{user?.full_name}</p></div>
            <div><p className="text-xs font-medium text-muted-foreground">Email</p><p className="font-medium">{user?.email}</p></div>
            <div><p className="text-xs font-medium text-muted-foreground">Role</p><Badge variant="outline" className="capitalize mt-1">{user?.role}</Badge></div>
            <div><p className="text-xs font-medium text-muted-foreground">Phone</p><p className="font-medium">{user?.phone || "—"}</p></div>
          </div>
          {user?.specialties && user.specialties.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {user.specialties.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>About</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Mia VMS v1.0 — Veterinary Management System</p>
          <p className="text-xs text-muted-foreground mt-1">Running in demo mode with mock data.</p>
        </CardContent>
      </Card>
    </div>
  );
}
