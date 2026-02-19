import { useParams, useNavigate } from "react-router-dom";
import { mockPets, mockAppointments, mockInvoices, mockMedicalRecords, mockVaccinations } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, differenceInMonths } from "date-fns";
import { CalendarDays, Edit, Trash2, Receipt, FileText, Syringe, Plus } from "lucide-react";

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDelete, setShowDelete] = useState(false);
  const pet = mockPets.find((p) => p.id === id);

  if (!pet) return <div className="p-6">Pet not found.</div>;

  const petAppointments = mockAppointments.filter((a) => a.pet_id === pet.id);
  const petInvoices = mockInvoices.filter((i) => i.pet_id === pet.id);
  const petRecords = mockMedicalRecords.filter((r) => r.pet_id === pet.id);
  const petVaccinations = mockVaccinations.filter((v) => v.pet_id === pet.id);

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
        <Button variant="outline" size="sm" onClick={() => navigate(`/pets/${pet.id}/records/new`)}>
          <FileText className="mr-2 h-3 w-3" /> Add Medical Record
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

        {/* Medical History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Medical History</CardTitle>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate(`/pets/${pet.id}/records/new`)}>
                <Plus className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {petRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">No medical records.</p>
            ) : (
              petRecords.sort((a, b) => b.visit_date.localeCompare(a.visit_date)).map((rec) => (
                <div key={rec.id} className="rounded border p-2.5 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{format(parseISO(rec.visit_date), "MMM d, yyyy")}</span>
                    <Badge variant={rec.severity === "mild" ? "secondary" : rec.severity === "moderate" ? "outline" : "destructive"} className="text-[10px]">
                      {rec.severity}
                    </Badge>
                  </div>
                  <p className="font-medium text-xs">{rec.primary_diagnosis}</p>
                  <p className="text-xs text-muted-foreground">{rec.chief_complaint}</p>
                  {rec.prescriptions.length > 0 && (
                    <p className="text-xs"><span className="text-muted-foreground">Rx: </span>{rec.prescriptions.map((rx) => rx.medication).join(", ")}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">{rec.vet?.full_name}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Vaccinations */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Syringe className="h-4 w-4" /> Vaccinations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {petVaccinations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No vaccination records.</p>
            ) : (
              petVaccinations.sort((a, b) => b.date_administered.localeCompare(a.date_administered)).map((vax) => {
                const isOverdue = parseISO(vax.next_due_date) < new Date();
                const isDueSoon = !isOverdue && differenceInMonths(parseISO(vax.next_due_date), new Date()) <= 1;
                return (
                  <div key={vax.id} className="flex items-center justify-between rounded border p-2 text-sm">
                    <div>
                      <span className="font-medium">{vax.vaccine_name}</span>
                      <p className="text-xs text-muted-foreground">Given: {format(parseISO(vax.date_administered), "MMM d, yyyy")}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={isOverdue ? "destructive" : isDueSoon ? "outline" : "secondary"} className="text-[10px]">
                        {isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : "Current"}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Next: {format(parseISO(vax.next_due_date), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                );
              })
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
