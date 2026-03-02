import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { mockPets, mockInvoices, mockServices, mockInventory } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { logAction } from "@/lib/audit-log";
import { useAuth } from "@/contexts/AuthContext";

import { Plus, Trash2, CheckCircle2, Search } from "lucide-react";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

const DRAFT_KEY = "draft_invoice";

// Searchable service picker for a single line item
function ServicePicker({
  value,
  onChange,
  onSelect,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (name: string, price: number) => void;
  hasError: boolean;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const medications = useMemo(
    () => mockInventory.filter((i) => i.category === "Medications" && i.unit_price),
    []
  );

  const activeServices = useMemo(() => mockServices.filter((s) => s.is_active), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search services / medications..."
            className={`pl-8 ${hasError ? "border-destructive" : ""}`}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Command>
          <CommandInput placeholder="Search..." value={value} onValueChange={onChange} />
          <CommandList>
            <CommandEmpty>No results — type a custom description</CommandEmpty>
            <CommandGroup heading="Services">
              {activeServices
                .filter((s) => s.name.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 8)
                .map((s) => (
                  <CommandItem
                    key={s.id}
                    value={s.name}
                    onSelect={() => {
                      onSelect(s.name, s.price);
                      setOpen(false);
                    }}
                  >
                    <div className="flex w-full justify-between">
                      <span>{s.name}</span>
                      <span className="text-muted-foreground">₹{s.price.toLocaleString()}</span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandGroup heading="Medications (Inventory)">
              {medications
                .filter((m) => m.name.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 6)
                .map((m) => (
                  <CommandItem
                    key={m.id}
                    value={m.name}
                    onSelect={() => {
                      onSelect(m.name, m.unit_price!);
                      setOpen(false);
                    }}
                  >
                    <div className="flex w-full justify-between">
                      <span>{m.name}</span>
                      <span className="text-muted-foreground">₹{m.unit_price!.toLocaleString()}</span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const prefillPetId = searchParams.get("pet_id") || "";
  const prefillReason = searchParams.get("reason") || "";
  const cloneFrom = searchParams.get("clone_from") || "";

  const cloneSource = cloneFrom ? mockInvoices.find((i) => i.id === cloneFrom) : null;

  const [petId, setPetId] = useState(cloneSource?.pet_id || prefillPetId);
  const [discount, setDiscount] = useState(cloneSource?.discount?.toString() || "");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<LineItem[]>(() => {
    if (cloneSource) {
      return cloneSource.line_items.map((li) => ({ description: li.description, quantity: li.quantity, unit_price: li.unit_price }));
    }
    return [{ description: prefillReason ? `${prefillReason} — Consultation` : "", quantity: 1, unit_price: prefillReason ? 500 : 0 }];
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedPet = mockPets.find((p) => p.id === petId);

  const isDirty = !!petId || !!dueDate || items.some((li) => li.description !== "" || li.unit_price > 0);
  useUnsavedChanges(isDirty && !submitted);

  // Autosave draft
  const isRestored = useRef(false);
  useEffect(() => {
    if (isRestored.current || cloneFrom) return;
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.petId) setPetId(draft.petId);
        if (draft.discount) setDiscount(draft.discount);
        if (draft.dueDate) setDueDate(draft.dueDate);
        if (draft.items) setItems(draft.items);
        toast({ title: "Draft restored" });
      } catch { /* ignore */ }
    }
    isRestored.current = true;
  }, [cloneFrom, toast]);

  useEffect(() => {
    if (cloneFrom) return;
    const t = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ petId, discount, dueDate, items }));
    }, 1000);
    return () => clearTimeout(t);
  }, [petId, discount, dueDate, items, cloneFrom]);

  if (cloneSource) {
    logAction({ actor_id: user?.id || "unknown", action_type: "repeat_invoice", entity_type: "invoice", entity_id: cloneSource.id });
  }

  const addItem = () => setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: keyof LineItem, value: string | number) =>
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)));

  const handleServiceSelect = (index: number, name: string, price: number) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, description: name, unit_price: price } : item))
    );
  };

  const subtotal = items.reduce((sum, li) => sum + li.quantity * li.unit_price, 0);
  const total = subtotal - (parseFloat(discount) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!petId || !dueDate || items.some((li) => !li.description || li.unit_price <= 0)) {
      toast({ title: "Please fill the highlighted fields", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    localStorage.removeItem(DRAFT_KEY);
    toast({
      title: "Invoice created!",
      description: `₹${Math.max(0, total).toLocaleString()} billed to ${selectedPet?.owner?.full_name}`,
    });
    setIsSaving(false);
    navigate("/billing");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={cloneSource ? "Repeat Invoice" : "New Invoice"}
        subtitle={cloneSource ? `Cloned from ${cloneSource.invoice_number}` : prefillReason ? `Billing for: ${prefillReason}` : "Create a bill for services rendered"}
        backTo="/billing"
        helpText="Select a pet first — the owner fills in automatically. Search for services or medications to auto-fill prices."
      />
      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className={submitted && !petId ? "text-destructive" : ""}>Pet *</Label>
                <Select value={petId} onValueChange={setPetId}>
                  <SelectTrigger className={submitted && !petId ? "border-destructive" : ""}><SelectValue placeholder="Select pet" /></SelectTrigger>
                  <SelectContent>
                    {mockPets.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.owner?.full_name})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {submitted && !petId && <p className="text-xs text-destructive">Please select a pet</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Owner</Label>
                <Input value={selectedPet?.owner?.full_name || "—"} disabled />
                <p className="text-[11px] text-muted-foreground">Auto-filled from pet</p>
              </div>
              <div className="space-y-1.5">
                <Label className={submitted && !dueDate ? "text-destructive" : ""}>Due Date *</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={submitted && !dueDate ? "border-destructive" : ""}
                />
                {submitted && !dueDate && <p className="text-xs text-destructive">Please set a due date</p>}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-3 w-3" /> Add Item
                </Button>
              </div>
              {items.map((li, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_100px_40px] gap-2 items-end">
                  <div>
                    {i === 0 && <Label className="text-xs text-muted-foreground">Service / Item</Label>}
                    <ServicePicker
                      value={li.description}
                      onChange={(v) => updateItem(i, "description", v)}
                      onSelect={(name, price) => handleServiceSelect(i, name, price)}
                      hasError={submitted && !li.description}
                    />
                  </div>
                  <div>
                    {i === 0 && <Label className="text-xs text-muted-foreground">Qty</Label>}
                    <Input type="number" min="1" value={li.quantity} onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)} />
                  </div>
                  <div>
                    {i === 0 && <Label className="text-xs text-muted-foreground">Price (₹)</Label>}
                    <Input
                      type="number"
                      min="0"
                      value={li.unit_price || ""}
                      onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className={submitted && li.unit_price <= 0 ? "border-destructive" : ""}
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} disabled={items.length === 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-end space-y-1 text-sm border-t pt-4">
              <p>Subtotal: <span className="font-medium">₹{subtotal.toLocaleString()}</span></p>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Discount (₹):</Label>
                <Input type="number" min="0" className="w-24" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
              </div>
              <p className="text-lg font-bold text-primary">Total: ₹{Math.max(0, total).toLocaleString()}</p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isSaving ? "Creating..." : "Create Invoice"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/billing")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
