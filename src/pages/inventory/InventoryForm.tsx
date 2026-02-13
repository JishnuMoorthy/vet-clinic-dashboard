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
import { CheckCircle2 } from "lucide-react";

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

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (key: string) => setTouched((prev) => ({ ...prev, [key]: true }));
  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const errors: Record<string, string> = {};
  if (!form.name && touched.name) errors.name = "Please enter the item name";
  if (!form.quantity && touched.quantity) errors.quantity = "Enter current stock count";
  if (!form.reorder_level && touched.reorder_level) errors.reorder_level = "Set minimum stock level for alerts";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.quantity || !form.reorder_level) {
      setTouched({ name: true, quantity: true, reorder_level: true });
      toast({ title: "Please fill the highlighted fields", variant: "destructive" });
      return;
    }
    toast({
      title: isEdit ? `${form.name} updated` : `${form.name} added to inventory`,
      description: isEdit ? "Stock record saved." : "Item is now tracked in your inventory.",
    });
    navigate("/inventory");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? `Edit ${existing?.name}` : "Add Inventory Item"}
        subtitle={isEdit ? "Update stock details" : "Track a new item in your clinic's inventory"}
        backTo="/inventory"
        helpText="Set reorder level to get alerts when stock runs low."
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={errors.name ? "text-destructive" : ""}>Item Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                onBlur={() => markTouched("name")}
                placeholder="e.g., Rabies Vaccine"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className={errors.quantity ? "text-destructive" : ""}>Current Quantity *</Label>
              <Input
                type="number" min="0"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                onBlur={() => markTouched("quantity")}
                placeholder="e.g., 45"
                className={errors.quantity ? "border-destructive" : ""}
              />
              {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className={errors.reorder_level ? "text-destructive" : ""}>Reorder Level *</Label>
              <Input
                type="number" min="0"
                value={form.reorder_level}
                onChange={(e) => update("reorder_level", e.target.value)}
                onBlur={() => markTouched("reorder_level")}
                placeholder="e.g., 20"
                className={errors.reorder_level ? "border-destructive" : ""}
              />
              {errors.reorder_level ? (
                <p className="text-xs text-destructive">{errors.reorder_level}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground">You'll get an alert when stock falls below this</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Unit Price (₹)</Label>
              <Input type="number" min="0" value={form.unit_price} onChange={(e) => update("unit_price", e.target.value)} placeholder="e.g., 800" />
            </div>
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Input value={form.supplier} onChange={(e) => update("supplier", e.target.value)} placeholder="e.g., VetPharma India" />
            </div>
            <div className="space-y-1.5">
              <Label>Expiry Date</Label>
              <Input type="date" value={form.expiry_date} onChange={(e) => update("expiry_date", e.target.value)} />
            </div>
            <div className="flex gap-2 sm:col-span-2 pt-2">
              <Button type="submit">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isEdit ? "Save Changes" : "Add to Inventory"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/inventory")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
