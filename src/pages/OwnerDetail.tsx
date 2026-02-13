import { useParams, useNavigate } from "react-router-dom";
import { mockOwners, mockPets, mockAppointments, mockInvoices } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, PawPrint } from "lucide-react";

export default function OwnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const owner = mockOwners.find((o) => o.id === id);

  if (!owner) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/owners")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <p className="text-muted-foreground">Owner not found.</p>
      </div>
    );
  }

  const ownerPets = mockPets.filter((p) => p.owner_id === owner.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/owners")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Owners</Button>
        <Button variant="outline" onClick={() => navigate(`/owners/${owner.id}/edit`)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>{owner.full_name}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><p className="text-xs font-medium text-muted-foreground">Phone</p><p className="text-sm font-medium">{owner.phone}</p></div>
            <div><p className="text-xs font-medium text-muted-foreground">Email</p><p className="text-sm font-medium">{owner.email || "—"}</p></div>
            <div><p className="text-xs font-medium text-muted-foreground">Address</p><p className="text-sm font-medium">{owner.address || "—"}</p></div>
            <div><p className="text-xs font-medium text-muted-foreground">Last Visit</p><p className="text-sm font-medium">{owner.last_visit || "—"}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><PawPrint className="h-4 w-4" /> Pets ({ownerPets.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {ownerPets.length === 0 ? <p className="text-sm text-muted-foreground">No pets registered.</p> : ownerPets.map((pet) => (
            <div key={pet.id} className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/pets/${pet.id}`)}>
              <div><p className="font-medium text-sm">{pet.name}</p><p className="text-xs text-muted-foreground">{pet.species} • {pet.breed || "Unknown breed"}</p></div>
              <Badge variant="outline" className="capitalize">{pet.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
