import { useState } from "react";
import { mockServices, addService, updateService, deleteService } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Search, Pencil, Trash2 } from "lucide-react";
import type { ServiceCategory } from "@/types/api";

const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: "consultation", label: "Consultation" },
  { value: "procedure", label: "Procedure" },
  { value: "diagnostic", label: "Diagnostic" },
  { value: "vaccination", label: "Vaccination" },
  { value: "grooming", label: "Grooming" },
  { value: "surgery", label: "Surgery" },
  { value: "medication", label: "Medication" },
  { value: "other", label: "Other" },
];

interface FormState {
  name: string;
  category: ServiceCategory;
  price: string;
  description: string;
  is_active: boolean;
}

const emptyForm: FormState = { name: "", category: "consultation", price: "", description: "", is_active: true };

export default function ServicesCatalog() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, forceRender] = useState(0);

  const filtered = mockServices.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const svc = mockServices.find((s) => s.id === id);
    if (!svc) return;
    setEditId(id);
    setForm({ name: svc.name, category: svc.category, price: svc.price.toString(), description: svc.description || "", is_active: svc.is_active });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price || parseFloat(form.price) <= 0) {
      toast({ title: "Name and a valid price are required", variant: "destructive" });
      return;
    }
    const now = new Date().toISOString();
    if (editId) {
      updateService(editId, { name: form.name, category: form.category, price: parseFloat(form.price), description: form.description || undefined, is_active: form.is_active });
      toast({ title: "Service updated" });
    } else {
      addService({
        id: `svc-${Date.now()}`,
        name: form.name,
        category: form.category,
        price: parseFloat(form.price),
        description: form.description || undefined,
        is_active: form.is_active,
        created_at: now,
        updated_at: now,
      });
      toast({ title: "Service added" });
    }
    setDialogOpen(false);
    forceRender((n) => n + 1);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteService(deleteId);
    toast({ title: "Service deleted" });
    setDeleteId(null);
    forceRender((n) => n + 1);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Services Catalog" subtitle="Manage clinic services and pricing" actionLabel="Add Service" onAction={openAdd} />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No services found" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((svc) => (
                <TableRow key={svc.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{svc.name}</p>
                      {svc.description && <p className="text-xs text-muted-foreground">{svc.description}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">{svc.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">₹{svc.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={svc.is_active ? "default" : "outline"}>
                      {svc.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(svc.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(svc.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., General Consultation" />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ServiceCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Price (₹) *</Label>
              <Input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editId ? "Save Changes" : "Add Service"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Service"
        description="Are you sure you want to delete this service? This cannot be undone."
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
