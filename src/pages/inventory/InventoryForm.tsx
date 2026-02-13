import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { mockInventory } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const categories = ["Vaccines", "Medications", "Consumables", "Equipment"];

export default function InventoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const existing = isEdit ? mockInventory.find((i) => i.id === id) : null;

  const [form, setForm] = useState({
    name: existing?.name || "",
    category: existing?.category || "Medications",
    quantity: existing?.quantity?.toString() || "",
    reorder_level: existing?.reorder_level?.toString() || "",
    unit_price: existing?.unit_price?.toString() || "",
    supplier: existing?.supplier || "",
    expiry_date: existing?.expiry_date || "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.quantity || !form.reorder_level) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    toast({ title: isEdit ? `${form.name} updated (mock)` : `${form.name} added (mock)` });
    navigate("/inventory");
  };

  return (
    <div className="space-y-6">
      <PageHeader title={isEdit ? `Edit ${existing?.name}` : "Add Inventory Item"} backTo="/inventory" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input type="number" min="0" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Reorder Level *</Label>
              <Input type="number" min="0" value={form.reorder_level} onChange={(e) => update("reorder_level", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Unit Price (₹)</Label>
              <Input type="number" min="0" value={form.unit_price} onChange={(e) => update("unit_price", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input value={form.supplier} onChange={(e) => update("supplier", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiry_date} onChange={(e) => update("expiry_date", e.target.value)} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit">{isEdit ? "Save Changes" : "Add Item"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/inventory")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
