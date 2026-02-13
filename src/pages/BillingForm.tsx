import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockPets, mockOwners } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export default function BillingForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [petId, setPetId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [discount, setDiscount] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unit_price: 0 }]);

  const addItem = () => setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    (updated[i] as any)[field] = value;
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const total = subtotal - (parseFloat(discount) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petId || items.some((i) => !i.description)) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    toast({ title: "Invoice created (demo)" });
    navigate("/billing");
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      <Card className="max-w-3xl">
        <CardHeader><CardTitle>Create Invoice</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Pet *</Label>
                <Select value={petId} onValueChange={setPetId}>
                  <SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
                  <SelectContent>{mockPets.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — {p.owner?.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
            </div>

            <div className="space-y-3">
              <Label>Line Items</Label>
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1"><Input placeholder="Description" value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} /></div>
                  <div className="w-20"><Input type="number" min={1} placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 0)} /></div>
                  <div className="w-28"><Input type="number" min={0} placeholder="Price" value={item.unit_price || ""} onChange={(e) => updateItem(i, "unit_price", parseFloat(e.target.value) || 0)} /></div>
                  <div className="w-24 text-right font-medium text-sm pt-2">₹{(item.quantity * item.unit_price).toLocaleString()}</div>
                  {items.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="mr-2 h-3 w-3" /> Add Item</Button>
            </div>

            <Separator />
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-sm gap-2">
                  <span>Discount</span>
                  <Input type="number" className="w-28 text-right" placeholder="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                </div>
                <Separator />
                <div className="flex justify-between font-bold"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit">Create Invoice</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
