import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPet, createPet, updatePet, getOwners, uploadPetFile } from "@/lib/api-services";
import { mockPets, mockOwners } from "@/lib/mock-data";
import { InlineOwnerModal } from "@/components/InlineOwnerModal";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, CalendarIcon, UserPlus, Search, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function PetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: existing } = useQuery({
    queryKey: ["pet", id],
    queryFn: () => getPet(id!),
    enabled: isEdit,
    placeholderData: isEdit ? mockPets.find((p) => p.id === id) : undefined,
  });

  const { data: ownersRes } = useQuery({
    queryKey: ["owners"],
    queryFn: () => getOwners(),
  });

  const owners = ownersRes?.data ?? mockOwners;

  const [form, setForm] = useState({
    name: "",
    species: "Dog",
    breed: "",
    gender: "",
    date_of_birth: "",
    weight: "",
    microchip_id: "",
    owner_id: "",
    notes: "",
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || "",
        species: existing.species || "Dog",
        breed: existing.breed || "",
        gender: existing.gender || "",
        date_of_birth: existing.date_of_birth || "",
        weight: existing.weight?.toString() || "",
        microchip_id: existing.microchip_id || "",
        owner_id: existing.owner_id || "",
        notes: existing.notes || "",
      });
      if (existing.date_of_birth) {
        setDobDate(new Date(existing.date_of_birth));
        setDobMonth(new Date(existing.date_of_birth));
      }
      setPhotoPreview(existing.photo_url);
    }
  }, [existing]);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [dobDate, setDobDate] = useState<Date | undefined>(undefined);
  const [dobMonth, setDobMonth] = useState<Date>(new Date());
  const [showConfirm, setShowConfirm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);

  const markTouched = (key: string) => setTouched((prev) => ({ ...prev, [key]: true }));
  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const errors: Record<string, string> = {};
  if (!form.name && touched.name) errors.name = "Please enter the pet's name";
  if (!form.owner_id && touched.owner_id) errors.owner_id = "Please select who owns this pet";

  const filteredOwners = ownerSearch
    ? owners.filter((o) => o.full_name.toLowerCase().includes(ownerSearch.toLowerCase()) || o.phone.includes(ownerSearch))
    : owners;

  const mutation = useMutation({
    mutationFn: (data: typeof form) => {
      const payload = {
        ...data,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        photo_url: photoPreview,
      };
      return isEdit ? updatePet(id!, payload) : createPet(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ["pet", id] });
      toast({
        title: isEdit ? `${form.name} updated successfully` : `${form.name} registered!`,
        description: isEdit ? "Pet record has been saved." : "The pet has been added to your clinic.",
      });
      navigate("/pets");
    },
    onError: (err: any) => {
      toast({ title: err.message || "Failed to save pet", variant: "destructive" });
    },
  });

  const doSubmit = () => mutation.mutate(form);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.species || !form.owner_id) {
      setTouched({ name: true, owner_id: true });
      toast({ title: "Please fill the highlighted fields", variant: "destructive" });
      return;
    }
    if (isEdit) {
      setShowConfirm(true);
    } else {
      doSubmit();
    }
  };
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2004 }, (_, i) => currentYear - i);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? `Edit ${existing?.name}` : "Register New Pet"}
        subtitle={isEdit ? "Update the pet's information below" : "Fill in the details to add a new pet to your clinic"}
        backTo="/pets"
        helpText="Required fields are marked with *. You can always edit this later."
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            {/* Photo Upload */}
            <div className="sm:col-span-2 flex items-center gap-4">
              <label className="relative cursor-pointer group">
                <div className="h-20 w-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/30 group-hover:border-primary/50 transition-colors">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Pet photo" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-6 w-6 text-muted-foreground/50" />
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
              <div className="text-sm">
                <p className="font-medium">Pet Photo</p>
                <p className="text-xs text-muted-foreground">Click to upload (optional)</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className={errors.name ? "text-destructive" : ""}>Pet Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                onBlur={() => markTouched("name")}
                placeholder="e.g., Bruno"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Species *</Label>
              <Select value={form.species} onValueChange={(v) => update("species", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dog">🐕 Dog</SelectItem>
                  <SelectItem value="Cat">🐈 Cat</SelectItem>
                  <SelectItem value="Bird">🐦 Bird</SelectItem>
                  <SelectItem value="Other">🐾 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Breed</Label>
              <Input value={form.breed} onChange={(e) => update("breed", e.target.value)} placeholder="e.g., Golden Retriever" />
              <p className="text-[11px] text-muted-foreground">Leave blank if unknown</p>
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* DOB with year/month dropdowns */}
            <div className="space-y-1.5">
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dobDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dobDate ? format(dobDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" style={{ minHeight: "370px" }}>
                  <div className="flex gap-2 p-3 pb-0">
                    <Select
                      value={String(dobMonth.getFullYear())}
                      onValueChange={(v) => {
                        const d = new Date(dobMonth);
                        d.setFullYear(parseInt(v));
                        setDobMonth(d);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs w-[80px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select
                      value={String(dobMonth.getMonth())}
                      onValueChange={(v) => {
                        const d = new Date(dobMonth);
                        d.setMonth(parseInt(v));
                        setDobMonth(d);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs w-[80px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {months.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Calendar
                    mode="single"
                    selected={dobDate}
                    onSelect={(d) => {
                      setDobDate(d);
                      if (d) {
                        update("date_of_birth", format(d, "yyyy-MM-dd"));
                        setDobMonth(d);
                      }
                    }}
                    month={dobMonth}
                    onMonthChange={setDobMonth}
                    disabled={(date) => date > new Date()}
                    className="p-3 pointer-events-auto"
                    fixedWeeks
                  />
                </PopoverContent>
              </Popover>
              <p className="text-[11px] text-muted-foreground">Approximate is fine</p>
            </div>
            <div className="space-y-1.5">
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.1" value={form.weight} onChange={(e) => update("weight", e.target.value)} placeholder="e.g., 12.5" />
            </div>
            <div className="space-y-1.5">
              <Label>Microchip ID</Label>
              <Input value={form.microchip_id} onChange={(e) => update("microchip_id", e.target.value)} placeholder="e.g., MC-001234" />
            </div>
            {/* Searchable Owner Select */}
            <div className="space-y-1.5">
              <Label className={errors.owner_id ? "text-destructive" : ""}>Owner *</Label>
              <Select value={form.owner_id} onValueChange={(v) => { if (v === "__new__") { setShowOwnerModal(true); return; } update("owner_id", v); markTouched("owner_id"); }}>
                <SelectTrigger className={errors.owner_id ? "border-destructive" : ""}><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>
                  <div className="px-2 pb-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search owners..." value={ownerSearch} onChange={(e) => setOwnerSearch(e.target.value)} className="h-8 pl-7 text-sm" onClick={(e) => e.stopPropagation()} />
                    </div>
                  </div>
                  {filteredOwners.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.full_name} · {o.phone}</SelectItem>
                  ))}
                  <button
                    type="button"
                    className="flex items-center gap-2 w-full px-2 py-2 text-sm text-primary hover:bg-muted/50 border-t mt-1"
                    onClick={(e) => { e.stopPropagation(); setShowOwnerModal(true); }}
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Add New Owner
                  </button>
                </SelectContent>
              </Select>
              {errors.owner_id && <p className="text-xs text-destructive">{errors.owner_id}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Any allergies, temperament, or special needs..." />
            </div>
            <div className="flex gap-2 sm:col-span-2 pt-2">
              <Button type="submit" disabled={mutation.isPending}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Register Pet"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/pets")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <InlineOwnerModal
        open={showOwnerModal}
        onOpenChange={setShowOwnerModal}
        onCreated={(ownerId) => {
          update("owner_id", ownerId);
          markTouched("owner_id");
        }}
      />

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Confirm Changes"
        description={`Are you sure you want to save changes to ${form.name}?`}
        onConfirm={doSubmit}
      />
    </div>
  );
}
