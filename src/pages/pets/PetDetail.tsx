import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPet, deletePet, getAppointments, getInvoices, getMedicalRecords, getVaccinations, createVaccination, deleteVaccination, getPetDocuments, uploadPetFile, createPetDocument, deletePetDocument } from "@/lib/api-services";
import { mockPets, mockAppointments, mockInvoices } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, differenceInMonths, addYears } from "date-fns";
import { CalendarDays, Edit, Trash2, Receipt, FileText, Syringe, Plus, ChevronRight, Upload, Download, File as FileIcon, X } from "lucide-react";
import type { Vaccination, MedicalRecord, PetDocument } from "@/types/api";

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedVax, setSelectedVax] = useState<Vaccination | null>(null);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [showVaxModal, setShowVaxModal] = useState(false);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [deleteVaxId, setDeleteVaxId] = useState<string | null>(null);

  // Vaccination form state
  const [vaxForm, setVaxForm] = useState({
    vaccine_name: "", date_administered: new Date().toISOString().split("T")[0],
    next_due_date: "", batch_number: "", notes: "",
  });

  // Document upload state
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState<PetDocument["category"]>("other");
  const [docNotes, setDocNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: pet } = useQuery({
    queryKey: ["pet", id],
    queryFn: () => getPet(id!),
    enabled: !!id,
    placeholderData: mockPets.find((p) => p.id === id),
  });

  const { data: appointmentsRes } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => getAppointments(),
  });

  const { data: invoicesRes } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => getInvoices(),
  });

  const { data: petRecords = [] } = useQuery({
    queryKey: ["medical-records", pet?.id],
    queryFn: () => getMedicalRecords({ pet_id: pet?.id }),
    enabled: !!pet?.id,
  });

  const { data: petVaccinations = [] } = useQuery({
    queryKey: ["vaccinations", pet?.id],
    queryFn: () => getVaccinations({ pet_id: pet?.id }),
    enabled: !!pet?.id,
  });

  const { data: petDocuments = [] } = useQuery({
    queryKey: ["pet-documents", pet?.id],
    queryFn: () => getPetDocuments(pet!.id),
    enabled: !!pet?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePet(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      toast({ title: `${pet?.name} deleted` });
      navigate("/pets");
    },
  });

  const createVaxMutation = useMutation({
    mutationFn: (data: typeof vaxForm) => createVaccination({
      pet_id: pet!.id,
      vaccine_name: data.vaccine_name,
      date_administered: data.date_administered,
      next_due_date: data.next_due_date || null,
      batch_number: data.batch_number || null,
      administered_by_id: user?.id || null,
      notes: data.notes || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations", pet?.id] });
      toast({ title: "Vaccination recorded" });
      setShowVaxModal(false);
      setVaxForm({ vaccine_name: "", date_administered: new Date().toISOString().split("T")[0], next_due_date: "", batch_number: "", notes: "" });
    },
    onError: (err: any) => toast({ title: err.message || "Failed to save vaccination", variant: "destructive" }),
  });

  const deleteVaxMutation = useMutation({
    mutationFn: (vaxId: string) => deleteVaccination(vaxId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccinations", pet?.id] });
      toast({ title: "Vaccination deleted" });
      setDeleteVaxId(null);
      setSelectedVax(null);
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) => deletePetDocument(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet-documents", pet?.id] });
      toast({ title: "Document deleted" });
      setDeleteDocId(null);
    },
  });

  const handleDocUpload = async () => {
    if (!docFile || !pet) return;
    setIsUploading(true);
    try {
      const fileUrl = await uploadPetFile(docFile, pet.id);
      await createPetDocument({
        pet_id: pet.id,
        file_name: docFile.name,
        file_url: fileUrl,
        file_type: docFile.type,
        file_size_bytes: docFile.size,
        category: docCategory,
        notes: docNotes || undefined,
        uploaded_by_id: user?.id,
      });
      queryClient.invalidateQueries({ queryKey: ["pet-documents", pet.id] });
      toast({ title: "Document uploaded" });
      setShowDocUpload(false);
      setDocFile(null);
      setDocCategory("other");
      setDocNotes("");
    } catch (err: any) {
      toast({ title: err.message || "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  if (!pet) return <div className="p-6">Pet not found.</div>;

  const allAppointments = appointmentsRes?.data ?? mockAppointments;
  const allInvoices = invoicesRes?.data ?? mockInvoices;
  const petAppointments = allAppointments.filter((a) => a.pet_id === pet.id);
  const petInvoices = allInvoices.filter((i) => i.pet_id === pet.id);

  const handleAppointmentClick = (apt: typeof petAppointments[0]) => {
    if (apt.status === "scheduled") navigate(`/consultation/${apt.id}`);
    else if (apt.status === "completed") {
      const linkedRecord = petRecords.find((r) => r.appointment_id === apt.id);
      if (linkedRecord) navigate(`/pets/${pet.id}/records/${linkedRecord.id}`);
      else navigate(`/appointments`);
    } else navigate(`/appointments`);
  };

  const handleRecordClick = (rec: MedicalRecord) => {
    if (expandedRecord === rec.id) navigate(`/pets/${pet.id}/records/${rec.id}`);
    else setExpandedRecord(rec.id);
  };

  const categoryLabels: Record<string, string> = {
    lab_result: "Lab Result", certificate: "Certificate", previous_record: "Previous Record", imaging: "Imaging", other: "Other",
  };

  const info = [
    ["Species", pet.species],
    ["Breed", pet.breed || "—"],
    ["Gender", pet.gender || "—"],
    ["Date of Birth", pet.date_of_birth || "—"],
    ["Weight", pet.weight ? `${pet.weight} kg` : "—"],
    ["Microchip ID", pet.microchip_id || "—"],
    ["Owner", pet.owner?.full_name ? (
      <button className="text-primary underline-offset-4 hover:underline cursor-pointer font-medium" onClick={() => navigate(`/owners/${pet.owner_id}`)}>
        {pet.owner.full_name}
      </button>
    ) : "—"],
    ["Notes", pet.notes || "—"],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {pet.photo_url && <img src={pet.photo_url} alt={pet.name} className="h-16 w-16 rounded-full object-cover border-2 border-primary/20" />}
        <PageHeader title={pet.name} backTo="/pets" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/pets/${pet.id}/edit`)}><Edit className="mr-2 h-3 w-3" /> Edit</Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/appointments/new")}><CalendarDays className="mr-2 h-3 w-3" /> Schedule Appointment</Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/pets/${pet.id}/records/new`)}><FileText className="mr-2 h-3 w-3" /> Add Medical Record</Button>
        <Button variant="outline" size="sm" onClick={() => navigate("/billing/new")}><Receipt className="mr-2 h-3 w-3" /> Create Invoice</Button>
        <Button variant="outline" size="sm" className="text-destructive" onClick={() => setShowDelete(true)}><Trash2 className="mr-2 h-3 w-3" /> Delete</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pet Information */}
        <Card>
          <CardHeader><CardTitle className="text-base">Pet Information</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {info.map(([label, value]) => (
                <div key={label as string}><dt className="text-muted-foreground">{label}</dt><dd className="font-medium">{value}</dd></div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Appointments</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => navigate("/appointments")}>View All <ChevronRight className="ml-1 h-3 w-3" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {petAppointments.length === 0 ? <p className="text-sm text-muted-foreground">No appointments.</p> : (
              petAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between rounded border p-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors group" onClick={() => handleAppointmentClick(apt)}>
                  <div><span className="font-medium">{apt.date}</span> at {apt.time} — {apt.reason}</div>
                  <div className="flex items-center gap-2"><StatusBadge status={apt.status} /><ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" /></div>
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
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate(`/pets/${pet.id}/records/new`)}><Plus className="mr-1 h-3 w-3" /> Add</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {petRecords.length === 0 ? <p className="text-sm text-muted-foreground">No medical records.</p> : (
              petRecords.sort((a, b) => b.visit_date.localeCompare(a.visit_date)).map((rec) => {
                const isExpanded = expandedRecord === rec.id;
                return (
                  <div key={rec.id} className="rounded border p-2.5 text-sm space-y-1 cursor-pointer hover:bg-accent/50 transition-colors group" onClick={() => handleRecordClick(rec)}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{format(parseISO(rec.visit_date), "MMM d, yyyy")}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={rec.severity === "mild" ? "secondary" : rec.severity === "moderate" ? "outline" : "destructive"} className="text-[10px]">{rec.severity}</Badge>
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </div>
                    </div>
                    <p className="font-medium text-xs">{rec.primary_diagnosis}</p>
                    <p className="text-xs text-muted-foreground">{rec.chief_complaint}</p>
                    {rec.prescriptions.length > 0 && <p className="text-xs"><span className="text-muted-foreground">Rx: </span>{rec.prescriptions.map((rx) => rx.medication).join(", ")}</p>}
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
                        {rec.symptoms && <p className="text-xs"><span className="text-muted-foreground font-medium">Symptoms: </span>{rec.symptoms}</p>}
                        {rec.physical_exam_findings && <p className="text-xs"><span className="text-muted-foreground font-medium">Exam: </span>{rec.physical_exam_findings}</p>}
                        {rec.follow_up_instructions && <p className="text-xs"><span className="text-muted-foreground font-medium">Follow-up: </span>{rec.follow_up_instructions}</p>}
                        <Button variant="outline" size="sm" className="h-6 text-[10px] mt-1" onClick={() => navigate(`/pets/${pet.id}/records/${rec.id}`)}>
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Syringe className="h-4 w-4" /> Vaccinations</CardTitle>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowVaxModal(true)}><Plus className="mr-1 h-3 w-3" /> Add</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {petVaccinations.length === 0 ? <p className="text-sm text-muted-foreground">No vaccination records.</p> : (
              petVaccinations.sort((a, b) => b.date_administered.localeCompare(a.date_administered)).map((vax) => {
                const isOverdue = parseISO(vax.next_due_date) < new Date();
                const isDueSoon = !isOverdue && differenceInMonths(parseISO(vax.next_due_date), new Date()) <= 1;
                return (
                  <div key={vax.id} className="flex items-center justify-between rounded border p-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors group" onClick={() => setSelectedVax(vax)}>
                    <div>
                      <span className="font-medium">{vax.vaccine_name}</span>
                      <p className="text-xs text-muted-foreground">Given: {format(parseISO(vax.date_administered), "MMM d, yyyy")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <Badge variant={isOverdue ? "destructive" : isDueSoon ? "outline" : "secondary"} className="text-[10px]">{isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : "Current"}</Badge>
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

        {/* Documents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><FileIcon className="h-4 w-4" /> Documents</CardTitle>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowDocUpload(true)}><Upload className="mr-1 h-3 w-3" /> Upload</Button>
            </div>
          </CardHeader>
          <CardContent>
            {petDocuments.length === 0 ? <p className="text-sm text-muted-foreground">No documents uploaded yet. Upload lab results, certificates, imaging, or other files.</p> : (
              <div className="grid gap-2 sm:grid-cols-2">
                {petDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 rounded border p-3 text-sm group">
                    <FileIcon className="h-8 w-8 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.file_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px]">{categoryLabels[doc.category] || doc.category}</Badge>
                        <span className="text-[10px] text-muted-foreground">{format(parseISO(doc.created_at), "MMM d, yyyy")}</span>
                      </div>
                      {doc.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{doc.notes}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(doc.file_url, "_blank")}><Download className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteDocId(doc.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
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
                  <div><p className="text-muted-foreground text-xs">Date Administered</p><p className="font-medium">{format(parseISO(selectedVax.date_administered), "MMMM d, yyyy")}</p></div>
                  <div><p className="text-muted-foreground text-xs">Next Due Date</p><p className="font-medium">{format(parseISO(selectedVax.next_due_date), "MMMM d, yyyy")}</p></div>
                  <div><p className="text-muted-foreground text-xs">Batch Number</p><p className="font-medium">{selectedVax.batch_number || "—"}</p></div>
                  <div><p className="text-muted-foreground text-xs">Administered By</p><p className="font-medium">{selectedVax.administered_by?.full_name || "—"}</p></div>
                </div>
                {isOverdue && (
                  <div className="pt-2 border-t">
                    <Badge variant="destructive" className="mb-2">Overdue</Badge>
                    <p className="text-xs text-muted-foreground mb-2">This vaccination is past due. Schedule a booster appointment.</p>
                    <Button size="sm" onClick={() => { setSelectedVax(null); navigate("/appointments/new"); }}><CalendarDays className="mr-2 h-3 w-3" /> Schedule Booster</Button>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteVaxId(selectedVax.id)}><Trash2 className="mr-2 h-3 w-3" /> Delete</Button>
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Add Vaccination Modal */}
      <Dialog open={showVaxModal} onOpenChange={setShowVaxModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vaccination</DialogTitle>
            <DialogDescription>Record a vaccination for {pet.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm">Vaccine Name *</Label><Input value={vaxForm.vaccine_name} onChange={(e) => setVaxForm((p) => ({ ...p, vaccine_name: e.target.value }))} placeholder="e.g., Rabies, DHPP, Bordetella" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm">Date Administered</Label><Input type="date" value={vaxForm.date_administered} onChange={(e) => {
                const newDate = e.target.value;
                setVaxForm((p) => ({ ...p, date_administered: newDate, next_due_date: p.next_due_date || format(addYears(parseISO(newDate), 1), "yyyy-MM-dd") }));
              }} className="mt-1" /></div>
              <div><Label className="text-sm">Next Due Date</Label><Input type="date" value={vaxForm.next_due_date} onChange={(e) => setVaxForm((p) => ({ ...p, next_due_date: e.target.value }))} className="mt-1" /></div>
            </div>
            <div><Label className="text-sm">Batch Number</Label><Input value={vaxForm.batch_number} onChange={(e) => setVaxForm((p) => ({ ...p, batch_number: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-sm">Notes</Label><Textarea value={vaxForm.notes} onChange={(e) => setVaxForm((p) => ({ ...p, notes: e.target.value }))} className="mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVaxModal(false)}>Cancel</Button>
            <Button onClick={() => createVaxMutation.mutate(vaxForm)} disabled={!vaxForm.vaccine_name || createVaxMutation.isPending}>
              {createVaxMutation.isPending ? "Saving..." : "Save Vaccination"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Upload Modal */}
      <Dialog open={showDocUpload} onOpenChange={setShowDocUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a file for {pet.name}'s records</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">File *</Label>
              <div className="mt-1">
                {docFile ? (
                  <div className="flex items-center gap-2 rounded border p-2 text-sm">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate flex-1">{docFile.name}</span>
                    <span className="text-xs text-muted-foreground">{(docFile.size / 1024).toFixed(0)} KB</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDocFile(null)}><X className="h-3 w-3" /></Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Choose File
                  </Button>
                )}
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.doc" className="hidden" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div>
              <Label className="text-sm">Category</Label>
              <Select value={docCategory} onValueChange={(v) => setDocCategory(v as PetDocument["category"])}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab_result">Lab Result</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="previous_record">Previous Record</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm">Notes (optional)</Label><Textarea value={docNotes} onChange={(e) => setDocNotes(e.target.value)} className="mt-1" rows={2} placeholder="Brief description of this document..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocUpload(false)}>Cancel</Button>
            <Button onClick={handleDocUpload} disabled={!docFile || isUploading}>{isUploading ? "Uploading..." : "Upload"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={showDelete} onOpenChange={setShowDelete} title="Delete Pet" description={`Are you sure you want to delete ${pet.name}? This action cannot be undone.`} onConfirm={() => deleteMutation.mutate()} destructive />
      <ConfirmDialog open={!!deleteDocId} onOpenChange={(open) => !open && setDeleteDocId(null)} title="Delete Document" description="Are you sure you want to delete this document?" onConfirm={() => deleteDocId && deleteDocMutation.mutate(deleteDocId)} destructive />
      <ConfirmDialog open={!!deleteVaxId} onOpenChange={(open) => !open && setDeleteVaxId(null)} title="Delete Vaccination" description="Are you sure you want to delete this vaccination record?" onConfirm={() => deleteVaxId && deleteVaxMutation.mutate(deleteVaxId)} destructive />
    </div>
  );
}
