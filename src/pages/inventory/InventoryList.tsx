import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mockInventory, mockPets } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
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
import { useToast } from "@/hooks/use-toast";
import { Search, PackageMinus, AlertTriangle } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

export default function InventoryList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [usageItem, setUsageItem] = useState<string | null>(null);
  const [usageQty, setUsageQty] = useState("1");
  const [usageReason, setUsageReason] = useState("treatment");
  const [usageNotes, setUsageNotes] = useState("");
  const [usagePetId, setUsagePetId] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = mockInventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItem = mockInventory.find((i) => i.id === usageItem);

  // Items expiring within 30 days
  const expiringItems = useMemo(() => {
    const today = new Date();
    return mockInventory.filter((item) => {
      if (!item.expiry_date) return false;
      const days = differenceInDays(parseISO(item.expiry_date), today);
      return days >= 0 && days <= 30;
    });
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="Inventory" actionLabel="Add Item" onAction={() => navigate("/inventory/new")} />

      {/* Expiry alerts */}
      {expiringItems.length > 0 && (
        <div className="rounded-md border border-warning/50 bg-warning/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p className="text-sm font-medium text-warning">Expiring Soon ({expiringItems.length} items)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {expiringItems.map((item) => {
              const days = differenceInDays(parseISO(item.expiry_date!), new Date());
              return (
                <Badge key={item.id} variant="outline" className="border-warning/30 text-warning bg-warning/5">
                  {item.name} — {days === 0 ? "expires today" : `${days}d left`}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No inventory items found" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Reorder</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium cursor-pointer hover:underline" onClick={() => navigate(`/inventory/${item.id}/edit`)}>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.reorder_level}</TableCell>
                  <TableCell>{item.expiry_date || "—"}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Record Usage"
                      onClick={() => { setUsageItem(item.id); setUsageQty("1"); setUsageNotes(""); setUsagePetId(""); }}
                    >
                      <PackageMinus className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Use</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Usage dialog with patient linking */}
      <Dialog open={!!usageItem} onOpenChange={() => setUsageItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Usage — {selectedItem?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input type="number" min="1" max={selectedItem?.quantity} value={usageQty} onChange={(e) => setUsageQty(e.target.value)} />
              <p className="text-[11px] text-muted-foreground">Available: {selectedItem?.quantity} units</p>
            </div>
            <div className="space-y-2">
              <Label>Linked Patient</Label>
              <Select value={usagePetId} onValueChange={setUsagePetId}>
                <SelectTrigger><SelectValue placeholder="Select pet (if applicable)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific patient</SelectItem>
                  {mockPets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.owner?.full_name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">Link to a patient for treatment records</p>
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Select value={usageReason} onValueChange={setUsageReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="treatment">Treatment</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={usageNotes} onChange={(e) => setUsageNotes(e.target.value)} placeholder="e.g., Administered during consultation" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const petName = usagePetId && usagePetId !== "none"
                ? mockPets.find(p => p.id === usagePetId)?.name
                : null;
              toast({
                title: `Recorded ${usageQty} unit(s) used`,
                description: petName ? `Linked to ${petName}'s treatment record` : "Usage logged successfully",
              });
              setUsageItem(null);
            }}>
              Record Usage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Item"
        description="Are you sure you want to remove this inventory item?"
        onConfirm={() => { toast({ title: "Item deleted (mock)" }); setDeleteId(null); }}
        destructive
      />
    </div>
  );
}
