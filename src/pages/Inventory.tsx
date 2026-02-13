import { useState, useMemo } from "react";
import { mockInventory } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  ok: "bg-green-100 text-green-700 border-green-200",
  low: "bg-yellow-100 text-yellow-700 border-yellow-200",
  out: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    return mockInventory.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Item</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); toast({ title: "Item added (demo)" }); setOpen(false); }} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Name</Label><Input /></div>
                <div className="space-y-2"><Label>Category</Label><Input /></div>
                <div className="space-y-2"><Label>Quantity</Label><Input type="number" /></div>
                <div className="space-y-2"><Label>Reorder Level</Label><Input type="number" /></div>
                <div className="space-y-2"><Label>Unit Price</Label><Input type="number" /></div>
                <div className="space-y-2"><Label>Supplier</Label><Input /></div>
                <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" /></div>
              </div>
              <div className="flex gap-3"><Button type="submit">Add Item</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ok">In Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Reorder</TableHead>
              <TableHead className="hidden md:table-cell text-right">Price</TableHead>
              <TableHead className="hidden lg:table-cell">Supplier</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No items found.</TableCell></TableRow>
            ) : filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="hidden sm:table-cell text-right">{item.reorder_level}</TableCell>
                <TableCell className="hidden md:table-cell text-right">{item.unit_price ? `₹${item.unit_price}` : "—"}</TableCell>
                <TableCell className="hidden lg:table-cell">{item.supplier || "—"}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[item.status]}>{item.status === "ok" ? "In Stock" : item.status === "low" ? "Low" : "Out"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
