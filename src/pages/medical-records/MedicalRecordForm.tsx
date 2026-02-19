import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { mockPets, mockMedicalRecords } from "@/lib/mock-data";
import type { Prescription, MedicalRecord } from "@/types/api";
import { PageHeader } from "@/components/PageHeader";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Save, Plus, Trash2, Activity, Stethoscope, Weight, Thermometer, Heart, Wind } from "lucide-react";

export default function MedicalRecordForm() {
  const { petId, recordId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const pet = mockPets.find((p) => p.id === petId);
  const existing = recordId ? mockMedicalRecords.find((r) => r.id === recordId) : null;

  const [isDirty, setIsDirty] = useState(false);
  const [vitals, setVitals] = useState({
    weight_kg: existing?.weight_kg?.toString() || pet?.weight?.toString() || "",
    temperature_f: existing?.temperature_f?.toString() || "",
    heart_rate_bpm: existing?.heart_rate_bpm?.toString() || "",
    respiratory_rate: existing?.respiratory_rate?.toString() || "",
    body_condition_score: existing?.body_condition_score?.toString() || "",
  });
  const [soap, setSoap] = useState({
    chief_complaint: existing?.chief_complaint || "",
    symptoms: existing?.symptoms || "",
    duration_onset: existing?.duration_onset || "",
    appetite_behavior: existing?.appetite_behavior || "",
    prior_treatments: existing?.prior_treatments || "",
    physical_exam_findings: existing?.physical_exam_findings || "",
    diagnostic_results: existing?.diagnostic_results || "",
    primary_diagnosis: existing?.primary_diagnosis || "",
    differential_diagnoses: existing?.differential_diagnoses || "",
    severity: (existing?.severity || "mild") as MedicalRecord["severity"],
    procedures_performed: existing?.procedures_performed || "",
    follow_up_instructions: existing?.follow_up_instructions || "",
    next_appointment_recommendation: existing?.next_appointment_recommendation || "",
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(existing?.prescriptions || []);

  useUnsavedChanges(isDirty);

  if (!pet) return <div className="p-6">Pet not found.</div>;

  const updateVitals = (key: string, value: string) => { setVitals((prev) => ({ ...prev, [key]: value })); setIsDirty(true); };
  const updateSoap = (key: string, value: string) => { setSoap((prev) => ({ ...prev, [key]: value })); setIsDirty(true); };
  const addPrescription = () => { setPrescriptions((prev) => [...prev, { medication: "", dosage: "", frequency: "", duration: "" }]); setIsDirty(true); };
  const updatePrescription = (i: number, field: keyof Prescription, value: string) => { setPrescriptions((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p))); setIsDirty(true); };
  const removePrescription = (i: number) => { setPrescriptions((prev) => prev.filter((_, idx) => idx !== i)); setIsDirty(true); };

  const handleSave = () => {
    if (!soap.primary_diagnosis || !soap.chief_complaint) {
      toast({ title: "Missing required fields", description: "Chief complaint and primary diagnosis are required.", variant: "destructive" });
      return;
    }
    toast({ title: existing ? "Record updated" : "Record created", description: `Medical record for ${pet.name} has been saved.` });
    setIsDirty(false);
    navigate(`/pets/${petId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={`${existing ? "Edit" : "New"} Medical Record — ${pet.name}`} backTo={`/pets/${petId}`} />
        <Button onClick={handleSave} className="shrink-0"><Save className="mr-2 h-4 w-4" /> Save Record</Button>
      </div>

      <div><Label className="text-xs font-medium">Chief Complaint *</Label><Input value={soap.chief_complaint} onChange={(e) => updateSoap("chief_complaint", e.target.value)} placeholder="Reason for visit…" className="mt-1" /></div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Vitals</CardTitle></CardHeader>
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

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Stethoscope className="h-4 w-4" /> SOAP Note</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2"><Badge variant="outline" className="text-xs">S</Badge> Subjective</h4>
            <div><Label className="text-xs">Symptoms</Label><Textarea value={soap.symptoms} onChange={(e) => updateSoap("symptoms", e.target.value)} placeholder="What the owner observed…" className="mt-1" rows={2} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label className="text-xs">Duration / Onset</Label><Input value={soap.duration_onset} onChange={(e) => updateSoap("duration_onset", e.target.value)} className="mt-1" /></div>
              <div><Label className="text-xs">Appetite & Behavior</Label><Input value={soap.appetite_behavior} onChange={(e) => updateSoap("appetite_behavior", e.target.value)} className="mt-1" /></div>
            </div>
            <div><Label className="text-xs">Prior Treatments</Label><Input value={soap.prior_treatments} onChange={(e) => updateSoap("prior_treatments", e.target.value)} className="mt-1" /></div>
          </div>
          <Separator />
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2"><Badge variant="outline" className="text-xs">O</Badge> Objective</h4>
            <div><Label className="text-xs">Physical Exam Findings</Label><Textarea value={soap.physical_exam_findings} onChange={(e) => updateSoap("physical_exam_findings", e.target.value)} className="mt-1" rows={3} /></div>
            <div><Label className="text-xs">Diagnostic Results</Label><Textarea value={soap.diagnostic_results} onChange={(e) => updateSoap("diagnostic_results", e.target.value)} className="mt-1" rows={2} /></div>
          </div>
          <Separator />
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
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2"><Badge variant="outline" className="text-xs">P</Badge> Plan</h4>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">Prescriptions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPrescription} className="h-7 text-xs"><Plus className="mr-1 h-3 w-3" /> Add Rx</Button>
              </div>
              {prescriptions.length === 0 && <p className="text-xs text-muted-foreground">No prescriptions added.</p>}
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
  );
}
