import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockInventory } from "@/lib/mock-data";
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
import { useToast } from "@/hooks/use-toast";
import { Search, Minus } from "lucide-react";

export default function InventoryList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [usageItem, setUsageItem] = useState<string | null>(null);
  const [usageQty, setUsageQty] = useState("1");
  const [usageReason, setUsageReason] = useState("treatment");
  const [usageNotes, setUsageNotes] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = mockInventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItem = mockInventory.find((i) => i.id === usageItem);

  return (
    <div className="space-y-4">
      <PageHeader title="Inventory" actionLabel="Add Item" onAction={() => navigate("/inventory/new")} />
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
                    <Button variant="ghost" size="icon" title="Record Usage" onClick={() => { setUsageItem(item.id); setUsageQty("1"); setUsageNotes(""); }}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!usageItem} onOpenChange={() => setUsageItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Usage — {selectedItem?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" min="1" max={selectedItem?.quantity} value={usageQty} onChange={(e) => setUsageQty(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
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
              <Textarea value={usageNotes} onChange={(e) => setUsageNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { toast({ title: `Recorded ${usageQty} unit(s) used (mock)` }); setUsageItem(null); }}>
              Record
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
