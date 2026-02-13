import { useParams, useNavigate } from "react-router-dom";
import { mockPets, mockAppointments, mockInvoices } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Edit, Trash2, Receipt } from "lucide-react";

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDelete, setShowDelete] = useState(false);
  const pet = mockPets.find((p) => p.id === id);

  if (!pet) return <div className="p-6">Pet not found.</div>;

  const petAppointments = mockAppointments.filter((a) => a.pet_id === pet.id);
  const petInvoices = mockInvoices.filter((i) => i.pet_id === pet.id);

  const info = [
    ["Species", pet.species],
    ["Breed", pet.breed || "—"],
    ["Gender", pet.gender || "—"],
    ["Date of Birth", pet.date_of_birth || "—"],
    ["Weight", pet.weight ? `${pet.weight} kg` : "—"],
    ["Microchip ID", pet.microchip_id || "—"],
    ["Owner", pet.owner?.full_name || "—"],
    ["Notes", pet.notes || "—"],
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={pet.name} backTo="/pets" />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/pets/${pet.id}/edit`)}>
          <Edit className="mr-2 h-3 w-3" /> Edit
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/appointments/new")}>
          <CalendarDays className="mr-2 h-3 w-3" /> Schedule Appointment
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/billing/new")}>
          <Receipt className="mr-2 h-3 w-3" /> Create Invoice
        </Button>
        <Button variant="outline" size="sm" className="text-destructive" onClick={() => setShowDelete(true)}>
          <Trash2 className="mr-2 h-3 w-3" /> Delete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Pet Information</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {info.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Appointments</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {petAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments.</p>
            ) : (
              petAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between rounded border p-2 text-sm">
                  <div>
                    <span className="font-medium">{apt.date}</span> at {apt.time} — {apt.reason}
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete Pet"
        description={`Are you sure you want to delete ${pet.name}? This action cannot be undone.`}
        onConfirm={() => {
          toast({ title: `${pet.name} deleted (mock)` });
          navigate("/pets");
        }}
        destructive
      />
    </div>
  );
}
