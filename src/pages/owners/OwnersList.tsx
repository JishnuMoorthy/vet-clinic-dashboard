import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockOwners } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

export default function OwnersList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = mockOwners.filter(
    (o) =>
      o.full_name.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search) ||
      o.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Pet Owners" actionLabel="Add Owner" onAction={() => navigate("/owners/new")} />
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search owners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      {filtered.length === 0 ? (
        <EmptyState message="No owners found" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Pets</TableHead>
                <TableHead>Last Visit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((owner) => (
                <TableRow key={owner.id} className="cursor-pointer" onClick={() => navigate(`/owners/${owner.id}`)}>
                  <TableCell className="font-medium">{owner.full_name}</TableCell>
                  <TableCell>{owner.phone}</TableCell>
                  <TableCell>{owner.email || "—"}</TableCell>
                  <TableCell>{owner.pets_count}</TableCell>
                  <TableCell>{owner.last_visit || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
