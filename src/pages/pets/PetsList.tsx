import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockPets } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

export default function PetsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = mockPets.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.breed?.toLowerCase().includes(search.toLowerCase()) ||
      p.species.toLowerCase().includes(search.toLowerCase()) ||
      p.owner?.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pets"
        subtitle={`${mockPets.length} pets registered at your clinic`}
        actionLabel="Add Pet"
        onAction={() => navigate("/pets/new")}
        helpText="Click any row to view the pet's full profile and medical history."
      />
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name, breed, or owner..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      {filtered.length === 0 ? (
        <EmptyState message="No pets found matching your search" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((pet) => (
                <TableRow key={pet.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/pets/${pet.id}`)}>
                  <TableCell className="font-medium">{pet.name}</TableCell>
                  <TableCell>{pet.species}</TableCell>
                  <TableCell>{pet.breed || "—"}</TableCell>
                  <TableCell>{pet.owner?.full_name || "—"}</TableCell>
                  <TableCell><StatusBadge status={pet.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
