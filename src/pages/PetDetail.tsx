import { useParams, useNavigate } from "react-router-dom";
import { mockPets, mockAppointments, mockInvoices } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, Receipt, Edit } from "lucide-react";

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pet = mockPets.find((p) => p.id === id);

  if (!pet) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/pets")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <p className="text-muted-foreground">Pet not found.</p>
      </div>
    );
  }

  const petAppointments = mockAppointments.filter((a) => a.pet_id === pet.id);
  const petInvoices = mockInvoices.filter((i) => i.pet_id === pet.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/pets")}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Pets</Button>
        <Button variant="outline" onClick={() => navigate(`/pets/${pet.id}/edit`)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{pet.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Species" value={pet.species} />
            <InfoItem label="Breed" value={pet.breed} />
            <InfoItem label="Gender" value={pet.gender} />
            <InfoItem label="Date of Birth" value={pet.date_of_birth} />
            <InfoItem label="Weight" value={pet.weight ? `${pet.weight} kg` : undefined} />
            <InfoItem label="Microchip ID" value={pet.microchip_id} />
            <InfoItem label="Owner" value={pet.owner?.full_name} />
            <InfoItem label="Status" value={pet.status} />
          </div>
          {pet.notes && <p className="mt-4 text-sm text-muted-foreground border-t pt-4">{pet.notes}</p>}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="h-4 w-4" /> Appointments</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {petAppointments.length === 0 ? <p className="text-sm text-muted-foreground">No appointments.</p> : petAppointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="text-sm font-medium">{a.reason}</p><p className="text-xs text-muted-foreground">{a.date} {a.time} • {a.vet?.full_name}</p></div>
                <Badge variant="outline" className="capitalize">{a.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Receipt className="h-4 w-4" /> Invoices</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {petInvoices.length === 0 ? <p className="text-sm text-muted-foreground">No invoices.</p> : petInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="text-sm font-medium">{inv.invoice_number}</p><p className="text-xs text-muted-foreground">Due: {inv.due_date}</p></div>
                <div className="flex items-center gap-2"><span className="font-medium text-sm">₹{inv.total.toLocaleString()}</span><Badge variant="outline" className="capitalize">{inv.status}</Badge></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
