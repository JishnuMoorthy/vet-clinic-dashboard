import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { format, parseISO, differenceInYears, differenceInMonths } from "date-fns";
import { mockAppointments, mockMedicalRecords, mockVaccinations, mockPets } from "@/lib/mock-data";
import type { MedicalRecord, Prescription } from "@/types/api";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Heart,
  Thermometer,
  Wind,
  Weight,
  Activity,
  Save,
  Phone,
  Clock,
  Syringe,
  Plus,
  Trash2,
  Stethoscope,
} from "lucide-react";

function petAge(dob?: string): string {
  if (!dob) return "Unknown age";
  const birth = parseISO(dob);
  const years = differenceInYears(new Date(), birth);
  if (years >= 1) return `${years} yr${years > 1 ? "s" : ""}`;
  const months = differenceInMonths(new Date(), birth);
  return `${months} mo`;
}

export default function ConsultationView() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [isDirty, setIsDirty] = useState(false);
  const [vitals, setVitals] = useState({
    weight_kg: "",
    temperature_f: "",
    heart_rate_bpm: "",
    respiratory_rate: "",
    body_condition_score: "",
  });
  const [soap, setSoap] = useState({
    symptoms: "",
    duration_onset: "",
    appetite_behavior: "",
    prior_treatments: "",
    physical_exam_findings: "",
    diagnostic_results: "",
    primary_diagnosis: "",
    differential_diagnoses: "",
    severity: "mild" as MedicalRecord["severity"],
    procedures_performed: "",
    follow_up_instructions: "",
    next_appointment_recommendation: "",
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useUnsavedChanges(isDirty);

  const appointment = mockAppointments.find((a) => a.id === appointmentId);
  const pet = appointment?.pet || mockPets.find((p) => p.id === appointment?.pet_id);

  if (!appointment || !pet) {
    return <div className="p-6">Appointment not found.</div>;
  }

  const petRecords = mockMedicalRecords.filter((r) => r.pet_id === pet.id);
  const petVaccinations = mockVaccinations.filter((v) => v.pet_id === pet.id);
  const overdueVaccinations = petVaccinations.filter(
    (v) => parseISO(v.next_due_date) < new Date()
  );

  const updateVitals = (key: string, value: string) => {
    setVitals((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };
  const updateSoap = (key: string, value: string) => {
    setSoap((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const addPrescription = () => {
    setPrescriptions((prev) => [...prev, { medication: "", dosage: "", frequency: "", duration: "" }]);
    setIsDirty(true);
  };
  const updatePrescription = (index: number, field: keyof Prescription, value: string) => {
    setPrescriptions((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
    setIsDirty(true);
  };
  const removePrescription = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleSave = () => {
    toast({ title: "Consultation saved", description: `${pet.name}'s record has been saved and appointment marked as completed.` });
    setIsDirty(false);
    navigate("/appointments");
  };

  return (
    <div className="space-y-4">
      {/* Patient Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={`Consultation — ${pet.name}`} backTo="/appointments" />
        <Button onClick={handleSave} className="shrink-0">
          <Save className="mr-2 h-4 w-4" /> Complete & Save
        </Button>
      </div>

      {/* Patient ID Band */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div><span className="text-muted-foreground">Patient:</span> <span className="font-semibold">{pet.name}</span></div>
            <div><span className="text-muted-foreground">Species:</span> {pet.species} · {pet.breed || "Mixed"}</div>
            <div><span className="text-muted-foreground">Age:</span> {petAge(pet.date_of_birth)}</div>
            <div><span className="text-muted-foreground">Weight:</span> {pet.weight ? `${pet.weight} kg` : "—"}</div>
            <div><span className="text-muted-foreground">Gender:</span> {pet.gender || "—"}</div>
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Owner:</span> <span className="font-medium">{pet.owner?.full_name}</span> — {pet.owner?.phone}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {overdueVaccinations.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive shrink-0" />
          <div>
            <span className="font-medium text-destructive">Overdue Vaccinations: </span>
            {overdueVaccinations.map((v) => v.vaccine_name).join(", ")}
          </div>
        </div>
      )}

      {/* Appointment Reason */}
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Reason:</span>
        <span className="font-medium">{appointment.reason}</span>
        <StatusBadge status={appointment.status} />
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column — SOAP Entry */}
        <div className="lg:col-span-3 space-y-4">
          {/* Vitals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div><Label className="text-xs flex items-center gap-1"><Weight className="h-3 w-3" /> Weight (kg)</Label><Input type="number" step="0.1" value={vitals.weight_kg} onChange={(e) => updateVitals("weight_kg", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs flex items-center gap-1"><Thermometer className="h-3 w-3" /> Temp (°F)</Label><Input type="number" step="0.1" value={vitals.temperature_f} onChange={(e) => updateVitals("temperature_f", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs flex items-center gap-1"><Heart className="h-3 w-3" /> HR (bpm)</Label><Input type="number" value={vitals.heart_rate_bpm} onChange={(e) => updateVitals("heart_rate_bpm", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs flex items-center gap-1"><Wind className="h-3 w-3" /> RR (/min)</Label><Input type="number" value={vitals.respiratory_rate} onChange={(e) => updateVitals("respiratory_rate", e.target.value)} className="mt-1" /></div>
                <div><Label className="text-xs">BCS (1-9)</Label><Input type="number" min="1" max="9" value={vitals.body_condition_score} onChange={(e) => updateVitals("body_condition_score", e.target.value)} className="mt-1" /></div>
              </div>
            </CardContent>
          </Card>

          {/* SOAP Note */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Stethoscope className="h-4 w-4" /> SOAP Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* S */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2"><Badge variant="outline" className="text-xs">S</Badge> Subjective (Owner-reported)</h4>
                <div><Label className="text-xs">Symptoms</Label><Textarea value={soap.symptoms} onChange={(e) => updateSoap("symptoms", e.target.value)} placeholder="What the owner observed…" className="mt-1" rows={2} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label className="text-xs">Duration / Onset</Label><Input value={soap.duration_onset} onChange={(e) => updateSoap("duration_onset", e.target.value)} placeholder="e.g. 3 days" className="mt-1" /></div>
                  <div><Label className="text-xs">Appetite & Behavior</Label><Input value={soap.appetite_behavior} onChange={(e) => updateSoap("appetite_behavior", e.target.value)} className="mt-1" /></div>
                </div>
                <div><Label className="text-xs">Prior Treatments</Label><Input value={soap.prior_treatments} onChange={(e) => updateSoap("prior_treatments", e.target.value)} className="mt-1" /></div>
              </div>

              <Separator />

              {/* O */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2"><Badge variant="outline" className="text-xs">O</Badge> Objective (Vet-measured)</h4>
                <div><Label className="text-xs">Physical Exam Findings</Label><Textarea value={soap.physical_exam_findings} onChange={(e) => updateSoap("physical_exam_findings", e.target.value)} className="mt-1" rows={3} /></div>
                <div><Label className="text-xs">Diagnostic Results</Label><Textarea value={soap.diagnostic_results} onChange={(e) => updateSoap("diagnostic_results", e.target.value)} className="mt-1" rows={2} /></div>
              </div>

              <Separator />

              {/* A */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2"><Badge variant="outline" className="text-xs">A</Badge> Assessment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><Label className="text-xs">Primary Diagnosis *</Label><Input value={soap.primary_diagnosis} onChange={(e) => updateSoap("primary_diagnosis", e.target.value)} className="mt-1" /></div>
                  <div>
                    <Label className="text-xs">Severity</Label>
                    <Select value={soap.severity} onValueChange={(v) => updateSoap("severity", v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label className="text-xs">Differential Diagnoses</Label><Input value={soap.differential_diagnoses} onChange={(e) => updateSoap("differential_diagnoses", e.target.value)} className="mt-1" /></div>
              </div>

              <Separator />

              {/* P */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2"><Badge variant="outline" className="text-xs">P</Badge> Plan</h4>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-medium">Prescriptions</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addPrescription} className="h-7 text-xs"><Plus className="mr-1 h-3 w-3" /> Add Rx</Button>
                  </div>
                  {prescriptions.length === 0 && <p className="text-xs text-muted-foreground">No prescriptions added yet.</p>}
                  <div className="space-y-2">
                    {prescriptions.map((rx, i) => (
                      <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-end">
                        <div><Label className="text-[10px]">Medication</Label><Input value={rx.medication} onChange={(e) => updatePrescription(i, "medication", e.target.value)} className="h-8 text-xs" /></div>
                        <div><Label className="text-[10px]">Dosage</Label><Input value={rx.dosage} onChange={(e) => updatePrescription(i, "dosage", e.target.value)} className="h-8 text-xs w-20" /></div>
                        <div><Label className="text-[10px]">Frequency</Label><Input value={rx.frequency} onChange={(e) => updatePrescription(i, "frequency", e.target.value)} className="h-8 text-xs w-24" /></div>
                        <div><Label className="text-[10px]">Duration</Label><Input value={rx.duration} onChange={(e) => updatePrescription(i, "duration", e.target.value)} className="h-8 text-xs w-20" /></div>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removePrescription(i)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div><Label className="text-xs">Procedures Performed</Label><Textarea value={soap.procedures_performed} onChange={(e) => updateSoap("procedures_performed", e.target.value)} className="mt-1" rows={2} /></div>
                <div><Label className="text-xs">Follow-up Instructions</Label><Textarea value={soap.follow_up_instructions} onChange={(e) => updateSoap("follow_up_instructions", e.target.value)} className="mt-1" rows={2} /></div>
                <div><Label className="text-xs">Next Appointment</Label><Input value={soap.next_appointment_recommendation} onChange={(e) => updateSoap("next_appointment_recommendation", e.target.value)} className="mt-1" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — History */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="history">
            <TabsList className="w-full">
              <TabsTrigger value="history" className="flex-1 text-xs">Medical History</TabsTrigger>
              <TabsTrigger value="vaccinations" className="flex-1 text-xs">Vaccinations</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-3 space-y-3">
              {petRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3">No previous records.</p>
              ) : (
                petRecords.sort((a, b) => b.visit_date.localeCompare(a.visit_date)).map((rec) => (
                  <Card key={rec.id} className="text-sm">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{format(parseISO(rec.visit_date), "MMM d, yyyy")}</span>
                        <Badge variant={rec.severity === "mild" ? "secondary" : rec.severity === "moderate" ? "outline" : "destructive"} className="text-[10px]">{rec.severity}</Badge>
                      </div>
                      <p className="font-medium text-xs">{rec.primary_diagnosis}</p>
                      <p className="text-xs text-muted-foreground">{rec.chief_complaint}</p>
                      {rec.prescriptions.length > 0 && (
                        <div className="text-xs"><span className="text-muted-foreground">Rx: </span>{rec.prescriptions.map((rx) => rx.medication).join(", ")}</div>
                      )}
                      <p className="text-[10px] text-muted-foreground">{rec.vet?.full_name}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="vaccinations" className="mt-3 space-y-2">
              {petVaccinations.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3">No vaccination records.</p>
              ) : (
                petVaccinations.sort((a, b) => b.date_administered.localeCompare(a.date_administered)).map((vax) => {
                  const isOverdue = parseISO(vax.next_due_date) < new Date();
                  const isDueSoon = !isOverdue && differenceInMonths(parseISO(vax.next_due_date), new Date()) <= 1;
                  return (
                    <div key={vax.id} className="flex items-center justify-between rounded border p-2.5 text-sm">
                      <div>
                        <div className="flex items-center gap-2"><Syringe className="h-3 w-3 text-muted-foreground" /><span className="font-medium">{vax.vaccine_name}</span></div>
                        <p className="text-xs text-muted-foreground mt-0.5">Given: {format(parseISO(vax.date_administered), "MMM d, yyyy")}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={isOverdue ? "destructive" : isDueSoon ? "outline" : "secondary"} className="text-[10px]">{isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : "Current"}</Badge>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Next: {format(parseISO(vax.next_due_date), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
