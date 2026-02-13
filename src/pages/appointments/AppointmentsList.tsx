import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockAppointments } from "@/lib/mock-data";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Search, CheckCircle, XCircle } from "lucide-react";

export default function AppointmentsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelId, setCancelId] = useState<string | null>(null);

  const filtered = mockAppointments.filter((a) => {
    const matchSearch =
      a.pet?.name.toLowerCase().includes(search.toLowerCase()) ||
      a.vet?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.reason.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Appointments" actionLabel="Schedule" onAction={() => navigate("/appointments/new")} />
      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No-show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No appointments found" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Pet</TableHead>
                <TableHead>Vet</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>{apt.date}</TableCell>
                  <TableCell>{apt.time}</TableCell>
                  <TableCell className="font-medium">{apt.pet?.name}</TableCell>
                  <TableCell>{apt.vet?.full_name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{apt.reason}</TableCell>
                  <TableCell><StatusBadge status={apt.status} /></TableCell>
                  <TableCell className="text-right">
                    {apt.status === "scheduled" && (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Mark Complete" onClick={() => toast({ title: `${apt.pet?.name} appointment completed (mock)` })}>
                          <CheckCircle className="h-4 w-4 text-success" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Cancel" onClick={() => setCancelId(apt.id)}>
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={() => setCancelId(null)}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment?"
        onConfirm={() => { toast({ title: "Appointment cancelled (mock)" }); setCancelId(null); }}
        destructive
      />
    </div>
  );
}
