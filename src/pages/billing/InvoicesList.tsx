import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInvoices, updateInvoice } from "@/lib/api-services";
import { mockInvoices } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { MultiSelectFilter, type FilterOption } from "@/components/MultiSelectFilter";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter } from "lucide-react";

export default function InvoicesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterPets, setFilterPets] = useState<string[]>([]);
  const [filterOwners, setFilterOwners] = useState<string[]>([]);

  const { data: invoicesRes } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => getInvoices(),
  });

  const invoices = invoicesRes?.data ?? mockInvoices;

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateInvoice(id, { status } as any),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({ title: `Invoice status updated to ${vars.status}` });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const statusOptions: FilterOption[] = [
    { id: "paid", label: "Paid" },
    { id: "pending", label: "Pending" },
    { id: "overdue", label: "Overdue" },
  ];

  const petOptions = useMemo(() => {
    const map = new Map<string, string>();
    invoices.forEach((inv) => { if (inv.pet?.name) map.set(inv.pet_id || inv.pet.id, inv.pet.name); });
    return Array.from(map, ([id, label]) => ({ id, label }));
  }, [invoices]);

  const ownerOptions = useMemo(() => {
    const map = new Map<string, string>();
    invoices.forEach((inv) => { if (inv.owner?.full_name) map.set(inv.owner_id || inv.owner.id, inv.owner.full_name); });
    return Array.from(map, ([id, label]) => ({ id, label }));
  }, [invoices]);

  const hasFilters = filterStatuses.length > 0 || filterPets.length > 0 || filterOwners.length > 0;

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.owner?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.pet?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatuses.length === 0 || filterStatuses.includes(inv.status);
    const matchPet = filterPets.length === 0 || filterPets.includes(inv.pet_id || inv.pet?.id);
    const matchOwner = filterOwners.length === 0 || filterOwners.includes(inv.owner_id || inv.owner?.id);
    return matchSearch && matchStatus && matchPet && matchOwner;
  });

  const clearFilters = () => {
    setFilterStatuses([]);
    setFilterPets([]);
    setFilterOwners([]);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Billing & Invoices" actionLabel="New Invoice" onAction={() => navigate("/billing/new")} />
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <MultiSelectFilter label="Status" options={statusOptions} selected={filterStatuses} onSelectionChange={setFilterStatuses} />
        <MultiSelectFilter label="Pets" options={petOptions} selected={filterPets} onSelectionChange={setFilterPets} />
        <MultiSelectFilter label="Owners" options={ownerOptions} selected={filterOwners} onSelectionChange={setFilterOwners} />
        {hasFilters && (
          <Button size="sm" variant="ghost" onClick={clearFilters}>Clear filters</Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No invoices found" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Pet</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => (
                <TableRow key={inv.id} className="cursor-pointer" onClick={() => navigate(`/billing/${inv.id}`)}>
                  <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>{inv.pet?.name}</TableCell>
                  <TableCell>{inv.owner?.full_name}</TableCell>
                  <TableCell>₹{inv.total.toLocaleString()}</TableCell>
                  <TableCell>{inv.due_date}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={inv.status}
                      onValueChange={(val) => statusMutation.mutate({ id: inv.id, status: val })}
                    >
                      <SelectTrigger className="h-7 w-[110px] text-xs border-0 bg-transparent p-0 focus:ring-0 [&>svg]:ml-1">
                        <StatusBadge status={inv.status} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
