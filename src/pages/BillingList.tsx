import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mockInvoices } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function BillingList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return mockInvoices.filter((inv) => {
      const matchSearch =
        inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        inv.pet?.name.toLowerCase().includes(search.toLowerCase()) ||
        inv.owner?.full_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing & Invoices</h1>
        <Button onClick={() => navigate("/billing/new")}><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Pet</TableHead>
              <TableHead className="hidden md:table-cell">Owner</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden sm:table-cell">Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No invoices found.</TableCell></TableRow>
            ) : filtered.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/billing/${inv.id}`)}>
                <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                <TableCell>{inv.pet?.name}</TableCell>
                <TableCell className="hidden md:table-cell">{inv.owner?.full_name}</TableCell>
                <TableCell className="font-medium">₹{inv.total.toLocaleString()}</TableCell>
                <TableCell className="hidden sm:table-cell">{inv.due_date}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[inv.status]}>{inv.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
