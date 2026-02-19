import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isToday } from "date-fns";
import { mockAppointments, mockUsers } from "@/lib/mock-data";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  PawPrint,
  User,
  Stethoscope,
  FileText,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const VET_COLORS: Record<string, string> = {
  "mock-vet-001": "border-l-blue-500",
  "mock-vet-002": "border-l-purple-500",
};

export default function ConsultationsList() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(["admin"]);
  const [vetFilter, setVetFilter] = useState<string>("all");

  const vets = mockUsers.filter((u) => u.role === "vet");

  const todaysAppointments = useMemo(() => {
    let apts = mockAppointments.filter((a) => isToday(parseISO(a.date)));

    // Vets see only their own; admins can filter
    if (!isAdmin && user) {
      apts = apts.filter((a) => a.vet_id === user.id);
    } else if (isAdmin && vetFilter !== "all") {
      apts = apts.filter((a) => a.vet_id === vetFilter);
    }

    return apts.sort((a, b) => a.time.localeCompare(b.time));
  }, [isAdmin, user, vetFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Today's Consultations"
          subtitle={`${format(new Date(), "EEEE, MMMM d, yyyy")} — ${todaysAppointments.length} patient${todaysAppointments.length !== 1 ? "s" : ""}`}
        />
        {isAdmin && (
          <Select value={vetFilter} onValueChange={setVetFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by vet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Veterinarians</SelectItem>
              {vets.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {todaysAppointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium">No consultations today</h3>
            <p className="text-sm text-muted-foreground mt-1">
              There are no appointments scheduled for today.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {todaysAppointments.map((apt) => {
            const borderColor = VET_COLORS[apt.vet_id] || "border-l-primary";
            const isScheduled = apt.status === "scheduled";
            const isCompleted = apt.status === "completed";

            return (
              <Card
                key={apt.id}
                className={cn(
                  "border-l-4 transition-colors",
                  borderColor,
                  apt.status === "cancelled" && "opacity-50"
                )}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="text-center shrink-0 w-14">
                      <p className="text-lg font-bold">{apt.time}</p>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <PawPrint className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">
                          {apt.pet?.name}
                        </span>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {apt.pet?.species} · {apt.pet?.breed}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {apt.pet?.owner?.full_name}
                        </span>
                        {isAdmin && (
                          <span className="flex items-center gap-1">
                            <Stethoscope className="h-3 w-3" />
                            {apt.vet?.full_name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-0.5">{apt.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <StatusBadge status={apt.status} />

                    {isScheduled && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/consultation/${apt.id}`)}
                      >
                        <Stethoscope className="mr-1.5 h-3 w-3" />
                        Start Consultation
                      </Button>
                    )}

                    {isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/pets/${apt.pet_id}`)}
                      >
                        <FileText className="mr-1.5 h-3 w-3" />
                        View Record
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
