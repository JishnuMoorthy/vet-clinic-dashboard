import { useParams, useNavigate } from "react-router-dom";
import { mockPets, mockAppointments, mockInvoices, mockMedicalRecords, mockVaccinations } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, differenceInMonths } from "date-fns";
import { CalendarDays, Edit, Trash2, Receipt, FileText, Syringe, Plus, ChevronRight } from "lucide-react";
import type { Vaccination, MedicalRecord } from "@/types/api";

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDelete, setShowDelete] = useState(false);
  const [selectedVax, setSelectedVax] = useState<Vaccination | null>(null);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const pet = mockPets.find((p) => p.id === id);

  if (!pet) return <div className="p-6">Pet not found.</div>;

  const petAppointments = mockAppointments.filter((a) => a.pet_id === pet.id);
  const petInvoices = mockInvoices.filter((i) => i.pet_id === pet.id);
  const petRecords = mockMedicalRecords.filter((r) => r.pet_id === pet.id);
  const petVaccinations = mockVaccinations.filter((v) => v.pet_id === pet.id);

  const handleAppointmentClick = (apt: typeof petAppointments[0]) => {
    if (apt.status === "scheduled") {
      navigate(`/consultation/${apt.id}`);
    } else if (apt.status === "completed") {
      const linkedRecord = petRecords.find((r) => r.appointment_id === apt.id);
      if (linkedRecord) {
        navigate(`/pets/${pet.id}/records/${linkedRecord.id}`);
      } else {
        navigate(`/appointments`);
      }
    } else {
      navigate(`/appointments`);
    }
  };

  const handleRecordClick = (rec: MedicalRecord) => {
    if (expandedRecord === rec.id) {
      navigate(`/pets/${pet.id}/records/${rec.id}`);
    } else {
      setExpandedRecord(rec.id);
    }
  };

  const info = [
    ["Species", pet.species],
    ["Breed", pet.breed || "—"],
    ["Gender", pet.gender || "—"],
    ["Date of Birth", pet.date_of_birth || "—"],
    ["Weight", pet.weight ? `${pet.weight} kg` : "—"],
    ["Microchip ID", pet.microchip_id || "—"],
    [
      "Owner",
      pet.owner?.full_name ? (
        <button
          className="text-primary underline-offset-4 hover:underline cursor-pointer font-medium"
          onClick={() => navigate(`/owners/${pet.owner_id}`)}
        >
          {pet.owner.full_name}
        </button>
      ) : "—",
    ],
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
                <div key={label as string}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Appointments</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate("/appointments")}>
                View All <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {petAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments.</p>
            ) : (
              petAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded border p-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors group"
                  onClick={() => handleAppointmentClick(apt)}
                >
                  <div>
                    <span className="font-medium">{apt.date}</span> at {apt.time} — {apt.reason}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={apt.status} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
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
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate(`/pets/${pet.id}/records/new`)}>
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {petRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">No medical records.</p>
            ) : (
              petRecords.sort((a, b) => b.visit_date.localeCompare(a.visit_date)).map((rec) => {
                const isExpanded = expandedRecord === rec.id;
                return (
                  <div
                    key={rec.id}
                    className="rounded border p-2.5 text-sm space-y-1 cursor-pointer hover:bg-accent/50 transition-colors group"
                    onClick={() => handleRecordClick(rec)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{format(parseISO(rec.visit_date), "MMM d, yyyy")}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={rec.severity === "mild" ? "secondary" : rec.severity === "moderate" ? "outline" : "destructive"} className="text-[10px]">
                          {rec.severity}
                        </Badge>
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </div>
                    </div>
                    <p className="font-medium text-xs">{rec.primary_diagnosis}</p>
                    <p className="text-xs text-muted-foreground">{rec.chief_complaint}</p>
                    {rec.prescriptions.length > 0 && (
                      <p className="text-xs"><span className="text-muted-foreground">Rx: </span>{rec.prescriptions.map((rx) => rx.medication).join(", ")}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">{rec.vet?.full_name}</p>

                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t space-y-2" onClick={(e) => e.stopPropagation()}>
                        {(rec.weight_kg || rec.temperature_f || rec.heart_rate_bpm) && (
                          <div className="flex flex-wrap gap-3 text-xs">
                            {rec.weight_kg && <span><span className="text-muted-foreground">Weight:</span> {rec.weight_kg} kg</span>}
                            {rec.temperature_f && <span><span className="text-muted-foreground">Temp:</span> {rec.temperature_f}°F</span>}
                            {rec.heart_rate_bpm && <span><span className="text-muted-foreground">HR:</span> {rec.heart_rate_bpm} bpm</span>}
                            {rec.respiratory_rate && <span><span className="text-muted-foreground">RR:</span> {rec.respiratory_rate}/min</span>}
                          </div>
                        )}
                        {rec.symptoms && (
                          <p className="text-xs"><span className="text-muted-foreground font-medium">Symptoms: </span>{rec.symptoms}</p>
                        )}
                        {rec.physical_exam_findings && (
                          <p className="text-xs"><span className="text-muted-foreground font-medium">Exam: </span>{rec.physical_exam_findings}</p>
                        )}
                        {rec.follow_up_instructions && (
                          <p className="text-xs"><span className="text-muted-foreground font-medium">Follow-up: </span>{rec.follow_up_instructions}</p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] mt-1"
                          onClick={() => navigate(`/pets/${pet.id}/records/${rec.id}`)}
                        >
                          View Full Record <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
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
                  <div
                    key={vax.id}
                    className="flex items-center justify-between rounded border p-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors group"
                    onClick={() => setSelectedVax(vax)}
                  >
                    <div>
                      <span className="font-medium">{vax.vaccine_name}</span>
                      <p className="text-xs text-muted-foreground">Given: {format(parseISO(vax.date_administered), "MMM d, yyyy")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <Badge variant={isOverdue ? "destructive" : isDueSoon ? "outline" : "secondary"} className="text-[10px]">
                          {isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : "Current"}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Next: {format(parseISO(vax.next_due_date), "MMM d, yyyy")}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vaccination Detail Dialog */}
      <Dialog open={!!selectedVax} onOpenChange={(open) => !open && setSelectedVax(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedVax?.vaccine_name}</DialogTitle>
            <DialogDescription>Vaccination details for {pet.name}</DialogDescription>
          </DialogHeader>
          {selectedVax && (() => {
            const isOverdue = parseISO(selectedVax.next_due_date) < new Date();
            return (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs">Date Administered</p>
                    <p className="font-medium">{format(parseISO(selectedVax.date_administered), "MMMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Next Due Date</p>
                    <p className="font-medium">{format(parseISO(selectedVax.next_due_date), "MMMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Batch Number</p>
                    <p className="font-medium">{selectedVax.batch_number || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Administered By</p>
                    <p className="font-medium">{selectedVax.administered_by?.full_name || "—"}</p>
                  </div>
                </div>
                {isOverdue && (
                  <div className="pt-2 border-t">
                    <Badge variant="destructive" className="mb-2">Overdue</Badge>
                    <p className="text-xs text-muted-foreground mb-2">This vaccination is past due. Schedule a booster appointment.</p>
                    <Button size="sm" onClick={() => { setSelectedVax(null); navigate("/appointments/new"); }}>
                      <CalendarDays className="mr-2 h-3 w-3" /> Schedule Booster
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

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
