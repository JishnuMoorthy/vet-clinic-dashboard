import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mockPets } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";

export default function PetsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("all");

  const species = useMemo(() => [...new Set(mockPets.map((p) => p.species))], []);

  const filtered = useMemo(() => {
    return mockPets.filter((pet) => {
      const matchSearch =
        pet.name.toLowerCase().includes(search.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(search.toLowerCase()) ||
        pet.owner?.full_name.toLowerCase().includes(search.toLowerCase());
      const matchSpecies = speciesFilter === "all" || pet.species === speciesFilter;
      return matchSearch && matchSpecies;
    });
  }, [search, speciesFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pets</h1>
        <Button onClick={() => navigate("/pets/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Pet
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search pets, breeds, owners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All species" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All species</SelectItem>
            {species.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Species</TableHead>
              <TableHead>Breed</TableHead>
              <TableHead className="hidden md:table-cell">Owner</TableHead>
              <TableHead className="hidden sm:table-cell">Weight</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No pets found.</TableCell></TableRow>
            ) : (
              filtered.map((pet) => (
                <TableRow key={pet.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/pets/${pet.id}`)}>
                  <TableCell className="font-medium">{pet.name}</TableCell>
                  <TableCell>{pet.species}</TableCell>
                  <TableCell>{pet.breed || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">{pet.owner?.full_name || "—"}</TableCell>
                  <TableCell className="hidden sm:table-cell">{pet.weight ? `${pet.weight} kg` : "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{pet.status}</Badge></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
