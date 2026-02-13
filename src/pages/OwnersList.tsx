import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mockOwners } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";

export default function OwnersList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return mockOwners.filter((o) =>
      o.full_name.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search)
    );
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pet Owners</h1>
        <Button onClick={() => navigate("/owners/new")}><Plus className="mr-2 h-4 w-4" /> Add Owner</Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search owners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Pets</TableHead>
              <TableHead className="hidden lg:table-cell">Last Visit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No owners found.</TableCell></TableRow>
            ) : filtered.map((owner) => (
              <TableRow key={owner.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/owners/${owner.id}`)}>
                <TableCell className="font-medium">{owner.full_name}</TableCell>
                <TableCell>{owner.phone}</TableCell>
                <TableCell className="hidden sm:table-cell">{owner.email || "—"}</TableCell>
                <TableCell className="hidden md:table-cell">{owner.pets_count ?? 0}</TableCell>
                <TableCell className="hidden lg:table-cell">{owner.last_visit || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
