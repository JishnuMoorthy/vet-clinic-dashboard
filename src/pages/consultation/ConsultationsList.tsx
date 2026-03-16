import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getAppointments, getStaff } from "@/lib/api-services";
import { supabase, getClinicId } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { WalkInModal } from "@/components/WalkInModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PawPrint,
  User,
  Stethoscope,
  FileText,
  Calendar,
  CalendarPlus,
  Phone,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const VET_COLORS: Record<string, string> = {};

export default function ConsultationsList() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(["admin"]);
  const [vetFilter, setVetFilter] = useState<string>("all");
  const [showWalkIn, setShowWalkIn] = useState(false);

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

  // Fetch medical records for follow-up badges
  const appointmentIds = (apptData?.data || []).filter(a => a.status === "completed").map(a => a.id);
  const { data: medRecords } = useQuery({
    queryKey: ["medical-records-today", appointmentIds],
    queryFn: async () => {
      if (appointmentIds.length === 0) return [];
      const clinicId = getClinicId();
      const { data } = await supabase
        .from("medical_records")
        .select("appointment_id, notes")
        .eq("clinic_id", clinicId)
        .eq("is_deleted", false)
        .in("appointment_id", appointmentIds);
      return data || [];
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

    return apts.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [apptData, isAdmin, user, vetFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <PageHeader
          title="Today's Patients"
          subtitle={`${format(new Date(), "EEEE, MMMM d, yyyy")} — ${todaysAppointments.length} patient${todaysAppointments.length !== 1 ? "s" : ""}`}
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
            const colorIdx = vets.findIndex(v => v.id === apt.vet_id);
            const colors = ["border-l-blue-500", "border-l-purple-500", "border-l-emerald-500", "border-l-amber-500"];
            const borderColor = VET_COLORS[apt.vet_id] || colors[colorIdx % colors.length] || "border-l-primary";
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
                        {apt.pet?.species && (
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {apt.pet.species}{apt.pet.breed ? ` · ${apt.pet.breed}` : ""}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {apt.pet?.owner?.full_name}
                        </span>
                        {apt.pet?.owner?.phone && (
                          <a href={`tel:${apt.pet.owner.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Phone className="h-3 w-3" />
                            {apt.pet.owner.phone}
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

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <StatusBadge status={apt.status} />

                    {isCompleted && (() => {
                      const hasFollowUp = (medRecords || []).some(
                        (r) => r.appointment_id === apt.id && r.notes?.includes("follow")
                      );
                      return hasFollowUp ? (
                        <Badge variant="outline" className="text-[10px] border-primary/50 text-primary gap-1">
                          <CalendarPlus className="h-3 w-3" />
                          Follow-up
                        </Badge>
                      ) : null;
                    })()}
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

      <WalkInModal open={showWalkIn} onOpenChange={setShowWalkIn} onCreated={() => refetchAppts()} />
    </div>
  );
}
