import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getServices, createService, updateService, deleteService } from "@/lib/api-services";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { MultiSelectFilter, type FilterOption } from "@/components/MultiSelectFilter";
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
import { Search, Pencil, Trash2, Filter } from "lucide-react";
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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["services"] });

  const createMut = useMutation({
    mutationFn: (data: any) => createService(data),
    onSuccess: () => { toast({ title: "Service added" }); invalidate(); setDialogOpen(false); },
    onError: (err: any) => toast({ title: "Failed to add service", description: err?.message, variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateService(id, data),
    onSuccess: () => { toast({ title: "Service updated" }); invalidate(); setDialogOpen(false); },
    onError: (err: any) => toast({ title: "Failed to update service", description: err?.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => { toast({ title: "Service deleted" }); invalidate(); setDeleteId(null); },
    onError: (err: any) => toast({ title: "Failed to delete service", description: err?.message, variant: "destructive" }),
  });

  const categoryOptions: FilterOption[] = CATEGORIES.map((c) => ({ id: c.value, label: c.label }));
  const statusOptions: FilterOption[] = [
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
  ];

  const hasFilters = filterCategories.length > 0 || filterStatuses.length > 0;

  const filtered = services.filter((s: any) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.category || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategories.length === 0 || filterCategories.includes(s.category);
    const matchStatus =
      filterStatuses.length === 0 ||
      (filterStatuses.includes("active") && s.is_active) ||
      (filterStatuses.includes("inactive") && !s.is_active);
    return matchSearch && matchCategory && matchStatus;
  });

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const svc = services.find((s: any) => s.id === id);
    if (!svc) return;
    setEditId(id);
    setForm({ name: svc.name, category: (svc.category || "other") as ServiceCategory, price: svc.price.toString(), description: svc.description || "", is_active: svc.is_active });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price || parseFloat(form.price) <= 0) {
      toast({ title: "Name and a valid price are required", variant: "destructive" });
      return;
    }
    const payload = { name: form.name, category: form.category, price: parseFloat(form.price), description: form.description || undefined, is_active: form.is_active };
    if (editId) {
      updateMut.mutate({ id: editId, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const clearFilters = () => {
    setFilterCategories([]);
    setFilterStatuses([]);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Services Catalog" subtitle="Manage clinic services and pricing" actionLabel="Add Service" onAction={openAdd} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <MultiSelectFilter label="Categories" options={categoryOptions} selected={filterCategories} onSelectionChange={setFilterCategories} width="w-[170px]" />
        <MultiSelectFilter label="Status" options={statusOptions} selected={filterStatuses} onSelectionChange={setFilterStatuses} />
        {hasFilters && (
          <Button size="sm" variant="ghost" onClick={clearFilters}>Clear filters</Button>
        )}
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
              {filtered.map((svc: any) => (
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
                  <TableCell className="text-right font-medium">₹{Number(svc.price).toLocaleString()}</TableCell>
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
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {editId ? "Save Changes" : "Add Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Service"
        description="Are you sure you want to delete this service? This cannot be undone."
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
        destructive
      />
    </div>
  );
}
