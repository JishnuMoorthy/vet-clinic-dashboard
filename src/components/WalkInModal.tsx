import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  createOwner,
  createPet,
  createAppointment,
  getStaff,
  getPets,
} from "@/lib/api-services";
import { logAction } from "@/lib/audit-log";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

type Mode = "existing" | "new";

export function WalkInModal({ open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [mode, setMode] = useState<Mode>("existing");
  const [petSearch, setPetSearch] = useState("");
  const [selectedPetId, setSelectedPetId] = useState("");

  // Fields for "new" mode
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("Dog");

  const [vetId, setVetId] = useState("");
  const [reason, setReason] = useState("Walk-in");
  const [isSaving, setIsSaving] = useState(false);

  const { data: staffData } = useQuery({
    queryKey: ["staff"],
    queryFn: () => getStaff(),
    enabled: open,
  });
  const vets = (staffData?.data || []).filter((u) => u.role === "vet");

  const { data: petsData } = useQuery({
    queryKey: ["pets-for-walkin"],
    queryFn: () => getPets({ limit: 200 }),
    enabled: open,
  });

  const filteredPets = useMemo(() => {
    const all = petsData?.data || [];
    if (!petSearch) return all.slice(0, 50);
    const q = petSearch.toLowerCase();
    return all
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.owner?.full_name?.toLowerCase().includes(q) ||
          p.species?.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [petsData, petSearch]);

  const reset = () => {
    setMode("existing");
    setPetSearch("");
    setSelectedPetId("");
    setOwnerName("");
    setPhone("");
    setPetName("");
    setSpecies("Dog");
    setVetId("");
    setReason("Walk-in");
  };

  const nowDateTime = () => {
    const now = new Date();
    return {
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate()
      ).padStart(2, "0")}`,
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    };
  };

  const handleSave = async () => {
    if (!vetId) {
      toast({ title: "Please select a doctor", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const { date, time } = nowDateTime();
      let petId = "";
      let ownerId = "";
      let displayPetName = "";
      let displayOwnerName = "";

      if (mode === "existing") {
        if (!selectedPetId) {
          toast({ title: "Please select an existing pet", variant: "destructive" });
          setIsSaving(false);
          return;
        }
        const pet = (petsData?.data || []).find((p) => p.id === selectedPetId);
        if (!pet) throw new Error("Selected pet not found");
        petId = pet.id;
        ownerId = pet.owner_id;
        displayPetName = pet.name;
        displayOwnerName = pet.owner?.full_name || "—";
      } else {
        if (!ownerName || !phone || !petName) {
          toast({
            title: "Please fill Owner Name, Phone, and Pet Name",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
        // Partial owner / pet — will show up as "incomplete" in the lists
        const newOwner = await createOwner({ full_name: ownerName, phone });
        const newPet = await createPet({
          name: petName,
          species,
          owner_id: newOwner.id,
        });
        petId = newPet.id;
        ownerId = newOwner.id;
        displayPetName = newPet.name;
        displayOwnerName = newOwner.full_name;
      }

      const newApt = await createAppointment({
        pet_id: petId,
        owner_id: ownerId,
        vet_id: vetId,
        date,
        time,
        reason: reason || "Walk-in",
        status: "scheduled",
      });

      logAction({
        actor_id: user?.id || "unknown",
        action_type: "walk_in_create",
        entity_type: "appointment",
        entity_id: newApt.id,
        metadata: { mode, petId, ownerId },
      });

      toast({
        title: `Walk-in registered: ${displayPetName}`,
        description: `Owner: ${displayOwnerName}`,
      });
      reset();
      onOpenChange(false);
      onCreated?.();
    } catch (err: any) {
      toast({
        title: "Walk-in registration failed",
        description: err?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Walk-In Registration</DialogTitle>
          <DialogDescription>
            Pick an existing pet or register a new walk-in. Incomplete walk-in records
            will be flagged for an admin to complete later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={mode === "existing" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("existing")}
              type="button"
            >
              <Search className="mr-1.5 h-3.5 w-3.5" />
              Existing Pet
            </Button>
            <Button
              variant={mode === "new" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("new")}
              type="button"
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              New Walk-In
            </Button>
          </div>

          {mode === "existing" ? (
            <>
              <div className="space-y-1.5">
                <Label>Search Pet or Owner</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={petSearch}
                    onChange={(e) => setPetSearch(e.target.value)}
                    placeholder="Type pet name, owner name, or phone…"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto rounded border">
                {filteredPets.length === 0 ? (
                  <p className="p-3 text-xs text-muted-foreground text-center">
                    No matches. Switch to "New Walk-In" to register a new pet.
                  </p>
                ) : (
                  filteredPets.map((pet) => (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => setSelectedPetId(pet.id)}
                      className={`flex w-full items-center gap-2 border-b px-3 py-2 text-left text-sm transition-colors last:border-b-0 hover:bg-muted/50 ${
                        selectedPetId === pet.id ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                        {pet.photo_url ? (
                          <img
                            src={pet.photo_url}
                            alt={pet.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs">
                            {pet.species === "Dog"
                              ? "🐕"
                              : pet.species === "Cat"
                              ? "🐈"
                              : "🐾"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{pet.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {pet.species}
                          {pet.breed ? ` · ${pet.breed}` : ""} ·{" "}
                          {pet.owner?.full_name || "Unknown owner"}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Owner Name *</Label>
                <Input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g., Meera Kapoor"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., +91-9876543210"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Pet Name *</Label>
                <Input
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="e.g., Bruno"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Species</Label>
                <Select value={species} onValueChange={setSpecies}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">🐕 Dog</SelectItem>
                    <SelectItem value="Cat">🐈 Cat</SelectItem>
                    <SelectItem value="Bird">🐦 Bird</SelectItem>
                    <SelectItem value="Other">🐾 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="-mt-2 text-[11px] text-muted-foreground">
                Extra details (email, address, breed, DOB…) can be completed from the
                Owners/Pets pages later — the new records will show a "Complete Info"
                badge.
              </p>
            </>
          )}

          <div className="space-y-1.5">
            <Label>Doctor *</Label>
            <Select value={vetId} onValueChange={setVetId}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {vets.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Walk-in checkup"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Registering…" : "Register Walk-In"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
