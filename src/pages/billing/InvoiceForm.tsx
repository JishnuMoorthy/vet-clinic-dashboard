import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { mockPets, mockOwners, mockAppointments } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

import { Plus, Trash2, CheckCircle2 } from "lucide-react";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Pre-fill from completed appointment
  const prefillPetId = searchParams.get("pet_id") || "";
  const prefillReason = searchParams.get("reason") || "";

  const [petId, setPetId] = useState(prefillPetId);
  const [discount, setDiscount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { description: prefillReason ? `${prefillReason} — Consultation` : "", quantity: 1, unit_price: prefillReason ? 500 : 0 },
  ]);
  const [submitted, setSubmitted] = useState(false);

  const selectedPet = mockPets.find((p) => p.id === petId);

  const isDirty = !!petId || !!dueDate || items.some((li) => li.description !== "" || li.unit_price > 0);
  useUnsavedChanges(isDirty && !submitted);

  const addItem = () => setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: keyof LineItem, value: string | number) =>
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)));

  const subtotal = items.reduce((sum, li) => sum + li.quantity * li.unit_price, 0);
  const total = subtotal - (parseFloat(discount) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!petId || !dueDate || items.some((li) => !li.description || li.unit_price <= 0)) {
      toast({ title: "Please fill the highlighted fields", variant: "destructive" });
      return;
    }
    toast({
      title: "Invoice created!",
      description: `₹${Math.max(0, total).toLocaleString()} billed to ${selectedPet?.owner?.full_name}`,
    });
    navigate("/billing");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Invoice"
        subtitle={prefillReason ? `Billing for: ${prefillReason}` : "Create a bill for services rendered"}
        backTo="/billing"
        helpText="Select a pet first — the owner fills in automatically. Add line items for each service."
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
                    <Input
                      value={li.description}
                      onChange={(e) => updateItem(i, "description", e.target.value)}
                      placeholder="e.g., Consultation fee"
                      className={submitted && !li.description ? "border-destructive" : ""}
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
              <Button type="submit">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/billing")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
    </div>
  );
}
