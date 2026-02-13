import { useState } from "react";
import { mockStaffList } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 border-purple-200",
  vet: "bg-primary/10 text-primary border-primary/20",
  staff: "bg-muted text-muted-foreground border-border",
};

export default function Staff() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Staff</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); toast({ title: "Staff added (demo)" }); setOpen(false); }} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Full Name</Label><Input /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input /></div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent><SelectItem value="vet">Veterinarian</SelectItem><SelectItem value="staff">Staff</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Specialties (comma-separated)</Label><Input placeholder="Surgery, Dermatology" /></div>
              <div className="flex gap-3"><Button type="submit">Add</Button><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Specialties</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockStaffList.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-medium">{staff.full_name}</TableCell>
                <TableCell><Badge variant="outline" className={roleColors[staff.role]}>{staff.role}</Badge></TableCell>
                <TableCell className="hidden sm:table-cell">{staff.email}</TableCell>
                <TableCell className="hidden md:table-cell">{staff.phone || "—"}</TableCell>
                <TableCell className="hidden lg:table-cell">{staff.specialties?.join(", ") || "—"}</TableCell>
                <TableCell><Badge variant="outline" className={staff.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-muted text-muted-foreground"}>
                  {staff.is_active ? "Active" : "Inactive"}
                </Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
