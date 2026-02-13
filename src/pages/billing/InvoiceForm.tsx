import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { mockPets, mockOwners } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export default function InvoiceForm() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [petId, setPetId] = useState("");
  const [discount, setDiscount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unit_price: 0 }]);

  const selectedPet = mockPets.find((p) => p.id === petId);

  const addItem = () => setItems((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: keyof LineItem, value: string | number) =>
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [key]: value } : item)));

  const subtotal = items.reduce((sum, li) => sum + li.quantity * li.unit_price, 0);
  const total = subtotal - (parseFloat(discount) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petId || !dueDate || items.some((li) => !li.description || li.unit_price <= 0)) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    toast({ title: "Invoice created (mock)" });
    navigate("/billing");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="New Invoice" backTo="/billing" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Pet *</Label>
                <Select value={petId} onValueChange={setPetId}>
                  <SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
                  <SelectContent>
                    {mockPets.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.owner?.full_name})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Owner</Label>
                <Input value={selectedPet?.owner?.full_name || "—"} disabled />
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
                    {i === 0 && <Label className="text-xs text-muted-foreground">Description</Label>}
                    <Input value={li.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Service or item" />
                  </div>
                  <div>
                    {i === 0 && <Label className="text-xs text-muted-foreground">Qty</Label>}
                    <Input type="number" min="1" value={li.quantity} onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)} />
                  </div>
                  <div>
                    {i === 0 && <Label className="text-xs text-muted-foreground">Price (₹)</Label>}
                    <Input type="number" min="0" value={li.unit_price} onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)} />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} disabled={items.length === 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-end space-y-1 text-sm">
              <p>Subtotal: ₹{subtotal.toLocaleString()}</p>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Discount (₹):</Label>
                <Input type="number" min="0" className="w-24" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
              <p className="text-lg font-bold">Total: ₹{Math.max(0, total).toLocaleString()}</p>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Create Invoice</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/billing")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
