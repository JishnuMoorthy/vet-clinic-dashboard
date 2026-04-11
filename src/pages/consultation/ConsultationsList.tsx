import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { getAppointments, getStaff, getMedicalRecords } from "@/lib/api-services";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { WalkInModal } from "@/components/WalkInModal";
import { CancelAppointmentModal } from "@/components/CancelAppointmentModal";
import { RescheduleAppointmentModal } from "@/components/RescheduleAppointmentModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Stethoscope,
  FileText,
  Calendar,
  CalendarPlus,
  Phone,
  UserPlus,
  CalendarX,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types/api";

const VET_COLORS: Record<string, string> = {};

function formatTime12h(time: string | undefined): string {
  if (!time) return "—";
  try {
    const parsed = parse(time, "HH:mm", new Date());
    return format(parsed, "h:mm a");
  } catch {
    return time;
  }
}

// Sort: upcoming scheduled first (asc by time), then in-progress, then completed, then cancelled/no-show
function appointmentSortKey(a: Appointment): [number, string] {
  const priority: Record<string, number> = {
    scheduled: 0,
    completed: 1,
    cancelled: 2,
    "no-show": 2,
  };
  return [priority[a.status] ?? 3, a.time || ""];
}

function speciesEmoji(species?: string): string {
  switch (species) {
    case "Dog":
      return "🐕";
    case "Cat":
      return "🐈";
    case "Bird":
      return "🐦";
    default:
      return "🐾";
  }
}

export default function ConsultationsList() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(["admin"]);
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");

  const { data: staffData } = useQuery({
    queryKey: ["staff"],
    queryFn: () => getStaff(),
  });
  const vets = (staffData?.data || []).filter((u) => u.role === "vet");

  const { data: apptData, refetch: refetchAppts } = useQuery({
    queryKey: ["consultations-today", today],
    queryFn: () => getAppointments({ date_from: today, date_to: today, limit: 100 }),
  });

  const appointmentIds = (apptData?.data || [])
    .filter((a) => a.status === "completed")
    .map((a) => a.id);
  const { data: medRecords } = useQuery({
    queryKey: ["medical-records-today", appointmentIds],
    queryFn: async () => {
      if (appointmentIds.length === 0) return [];
      const records = await getMedicalRecords();
      return records.filter((r: any) => appointmentIds.includes(r.appointment_id));
    },
    enabled: appointmentIds.length > 0,
  });

  const todaysAppointments = useMemo(() => {
    let apts = apptData?.data || [];

    if (!isAdmin && user) {
      apts = apts.filter((a) => a.vet_id === user.id);
    } else if (isAdmin && vetFilter !== "all") {
      apts = apts.filter((a) => a.vet_id === vetFilter);
    }

    return [...apts].sort((a, b) => {
      const [ap, at] = appointmentSortKey(a);
      const [bp, bt] = appointmentSortKey(b);
      if (ap !== bp) return ap - bp;
      return at.localeCompare(bt);
    });
  }, [apptData, isAdmin, user, vetFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <PageHeader
          title="Today's Patients"
          subtitle={`${format(new Date(), "EEEE, MMMM d, yyyy")} — ${todaysAppointments.length} patient${
            todaysAppointments.length !== 1 ? "s" : ""
          }`}
        />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowWalkIn(true)}>
            <UserPlus className="mr-1.5 h-3 w-3" /> Walk-In
          </Button>
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
            const colorIdx = vets.findIndex((v) => v.id === apt.vet_id);
            const colors = [
              "border-l-blue-500",
              "border-l-purple-500",
              "border-l-emerald-500",
              "border-l-amber-500",
            ];
            const borderColor =
              VET_COLORS[apt.vet_id] || colors[colorIdx % colors.length] || "border-l-primary";
            const isScheduled = apt.status === "scheduled";
            const isCompleted = apt.status === "completed";
            const isCancelled = apt.status === "cancelled" || apt.status === "no-show";

            return (
              <Card
                key={apt.id}
                className={cn(
                  "border-l-4 transition-colors",
                  borderColor,
                  isCancelled && "opacity-60"
                )}
              >
                <CardContent className="flex items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Time */}
                    <div className="text-center shrink-0 w-20">
                      <p className="text-base font-bold tabular-nums">
                        {formatTime12h(apt.time)}
                      </p>
                    </div>

                    {/* Pet photo */}
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border bg-muted">
                      {apt.pet?.photo_url ? (
                        <img
                          src={apt.pet.photo_url}
                          alt={apt.pet.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">
                          {speciesEmoji(apt.pet?.species)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{apt.pet?.name}</span>
                        {apt.pet?.species && (
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {apt.pet.species}
                            {apt.pet.breed ? ` · ${apt.pet.breed}` : ""}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {apt.pet?.owner?.full_name || apt.owner?.full_name || "—"}
                        </span>
                        {(apt.pet?.owner?.phone || apt.owner?.phone) && (
                          <a
                            href={`tel:${apt.pet?.owner?.phone || apt.owner?.phone}`}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <Phone className="h-3 w-3" />
                            {apt.pet?.owner?.phone || apt.owner?.phone}
                          </a>
                        )}
                        {isAdmin && apt.vet && (
                          <span className="flex items-center gap-1">
                            <Stethoscope className="h-3 w-3" />
                            {apt.vet.full_name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-0.5">{apt.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4 flex-wrap justify-end">
                    <StatusBadge status={apt.status} />

                    {isCompleted &&
                      (() => {
                        const hasFollowUp = (medRecords || []).some(
                          (r: any) =>
                            r.appointment_id === apt.id && r.follow_up_instructions
                        );
                        return hasFollowUp ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-primary/50 text-primary gap-1"
                          >
                            <CalendarPlus className="h-3 w-3" />
                            Follow-up
                          </Badge>
                        ) : null;
                      })()}

                    {isScheduled && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/consultation/${apt.id}`)}
                        >
                          <Stethoscope className="mr-1.5 h-3 w-3" />
                          Start
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRescheduleTarget(apt)}
                          title="Reschedule"
                        >
                          <CalendarClock className="mr-1.5 h-3 w-3" />
                          Move
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCancelTarget(apt)}
                          title="Cancel"
                          className="text-destructive hover:text-destructive"
                        >
                          <CalendarX className="mr-1.5 h-3 w-3" />
                          Cancel
                        </Button>
                      </>
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

      <WalkInModal
        open={showWalkIn}
        onOpenChange={setShowWalkIn}
        onCreated={() => refetchAppts()}
      />
      <CancelAppointmentModal
        appointment={cancelTarget}
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
      />
      <RescheduleAppointmentModal
        appointment={rescheduleTarget}
        open={!!rescheduleTarget}
        onOpenChange={(o) => !o && setRescheduleTarget(null)}
      />
    </div>
  );
}
