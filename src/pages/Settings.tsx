import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";

export default function Settings() {
  const { user } = useAuth();

  if (!user) return null;

  const info = [
    ["Full Name", user.full_name],
    ["Email", user.email],
    ["Phone", user.phone || "—"],
    ["Role", user.role],
    ["Account Status", user.is_active ? "Active" : "Inactive"],
    ["Member Since", new Date(user.created_at).toLocaleDateString()],
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            {info.map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">
                  {label === "Role" ? <Badge variant="outline" className="capitalize">{value}</Badge> : value}
                </dd>
              </div>
            ))}
          </dl>
          {user.specialties && user.specialties.length > 0 && (
            <div className="mt-4">
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
