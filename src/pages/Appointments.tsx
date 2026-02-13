import { useState, useMemo } from "react";
import { mockAppointments, mockPets, mockStaffList } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Appointment } from "@/types/api";

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  "no-show": "bg-muted text-muted-foreground border-border",
};

export default function Appointments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const vets = mockStaffList.filter((s) => s.role === "vet");

  const filtered = useMemo(() => {
    return mockAppointments.filter((a) => {
      const matchSearch =
        a.pet?.name.toLowerCase().includes(search.toLowerCase()) ||
        a.vet?.full_name.toLowerCase().includes(search.toLowerCase()) ||
        a.reason.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Appointment scheduled (demo)" });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Schedule</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Schedule Appointment</DialogTitle></DialogHeader>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Pet</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select pet" /></SelectTrigger>
                    <SelectContent>{mockPets.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.species})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Veterinarian</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select vet" /></SelectTrigger>
                    <SelectContent>{vets.map((v) => <SelectItem key={v.id} value={v.id}>{v.full_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>Time</Label><Input type="time" step="1800" /></div>
              </div>
              <div className="space-y-2"><Label>Reason</Label><Input placeholder="Reason for visit" /></div>
              <div className="space-y-2"><Label>Notes</Label><Textarea rows={2} placeholder="Additional notes..." /></div>
              <div className="flex gap-3">
                <Button type="submit">Schedule</Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search appointments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Pet</TableHead>
              <TableHead className="hidden md:table-cell">Vet</TableHead>
              <TableHead className="hidden sm:table-cell">Reason</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No appointments found.</TableCell></TableRow>
            ) : filtered.map((appt) => (
              <TableRow key={appt.id}>
                <TableCell className="font-medium">{appt.date}</TableCell>
                <TableCell className="font-mono">{appt.time}</TableCell>
                <TableCell>{appt.pet?.name}</TableCell>
                <TableCell className="hidden md:table-cell">{appt.vet?.full_name}</TableCell>
                <TableCell className="hidden sm:table-cell max-w-[200px] truncate">{appt.reason}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[appt.status]}>{appt.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
