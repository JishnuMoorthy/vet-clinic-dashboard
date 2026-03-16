import { useState, useMemo, useRef, useEffect, useCallback, DragEvent } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
  subMonths,
  subWeeks,
  subDays,
  addHours,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  differenceInMinutes,
  startOfDay,
  setHours,
  setMinutes,
} from "date-fns";
import { mockMedicalRecords } from "@/lib/mock-data";
import { WalkInModal } from "@/components/WalkInModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAppointments, getStaff, getOwners, getPets, updateAppointment } from "@/lib/api-services";
import type { Appointment } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutList,
  Clock,
  User,
  PawPrint,
  CheckCircle,
  XCircle,
  GripVertical,
  Stethoscope,
  CalendarPlus,
  AlertCircle,
  Pencil,
  Filter,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";

function getFollowUpForAppointment(aptId: string) {
  return mockMedicalRecords.find(
    (r) => r.appointment_id === aptId && r.follow_up && r.follow_up.status !== "not_needed"
  );
}

const URGENCY_LABELS: Record<string, string> = {
  "1_week": "Within 1 week",
  "2_weeks": "Within 2 weeks",
  "1_month": "Within 1 month",
  "3_months": "Within 3 months",
};

type CalendarViewMode = "day" | "week" | "month";

const COLOR_PALETTE = [
  { bg: "bg-blue-100 dark:bg-blue-900/30", border: "border-l-blue-500", text: "text-blue-800 dark:text-blue-200", dot: "bg-blue-500" },
  { bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-l-purple-500", text: "text-purple-800 dark:text-purple-200", dot: "bg-purple-500" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", border: "border-l-emerald-500", text: "text-emerald-800 dark:text-emerald-200", dot: "bg-emerald-500" },
  { bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-l-amber-500", text: "text-amber-800 dark:text-amber-200", dot: "bg-amber-500" },
  { bg: "bg-rose-100 dark:bg-rose-900/30", border: "border-l-rose-500", text: "text-rose-800 dark:text-rose-200", dot: "bg-rose-500" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/30", border: "border-l-cyan-500", text: "text-cyan-800 dark:text-cyan-200", dot: "bg-cyan-500" },
];

const DEFAULT_COLOR = {
  bg: "bg-primary/10",
  border: "border-l-primary",
  text: "text-primary",
  dot: "bg-primary",
};

const HOUR_HEIGHT = 60;
const START_HOUR = 7;
const END_HOUR = 20;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);

function parseAppointmentTime(apt: Appointment): { start: Date; end: Date } {
  const [h, m] = apt.time.split(":").map(Number);
  const date = parseISO(apt.date);
  const start = setMinutes(setHours(date, h), m);
  const end = addHours(start, 0.5);
  return { start, end };
}

// ============= Drag helpers =============

function handleDragStart(e: DragEvent, aptId: string) {
  e.dataTransfer.setData("text/plain", aptId);
  e.dataTransfer.effectAllowed = "move";
  if (e.currentTarget instanceof HTMLElement) {
    e.currentTarget.style.opacity = "0.5";
  }
}

function handleDragEnd(e: DragEvent) {
  if (e.currentTarget instanceof HTMLElement) {
    e.currentTarget.style.opacity = "1";
  }
}

export default function AppointmentsCalendar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showList, setShowList] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const timeGridRef = useRef<HTMLDivElement>(null);

  // Filters (empty array = all selected)
  const [filterVets, setFilterVets] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterPets, setFilterPets] = useState<string[]>([]);
  const [filterOwners, setFilterOwners] = useState<string[]>([]);

  const { data: apptData } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => getAppointments(),
  });
  const allAppointments = apptData?.data || [];

  const { data: staffData } = useQuery({
    queryKey: ["staff"],
    queryFn: () => getStaff(),
  });
  const vets = (staffData?.data || []).filter((u) => u.role === "vet");

  // Build vet color map dynamically
  const vetColorMap = useMemo(() => {
    const map: Record<string, typeof DEFAULT_COLOR> = {};
    vets.forEach((v, i) => {
      map[v.id] = COLOR_PALETTE[i % COLOR_PALETTE.length];
    });
    return map;
  }, [vets]);

  function getVetColor(vetId: string) {
    return vetColorMap[vetId] || DEFAULT_COLOR;
  }

  // Unique pets and owners from appointments for filter dropdowns
  const petOptions = useMemo(() => {
    const map = new Map<string, string>();
    allAppointments.forEach((a) => { if (a.pet?.name) map.set(a.pet_id, a.pet.name); });
    return Array.from(map, ([id, label]) => ({ id, label }));
  }, [allAppointments]);

  const ownerOptions = useMemo(() => {
    const map = new Map<string, string>();
    allAppointments.forEach((a) => {
      const owner = (a as any).pet_owners || a.pet?.owner;
      if (owner) map.set(owner.id || a.pet?.owner_id, owner.full_name || owner.name);
    });
    return Array.from(map, ([id, label]) => ({ id, label }));
  }, [allAppointments]);

  const vetOptions = useMemo(() => vets.map((v) => ({ id: v.id, label: v.full_name })), [vets]);

  const statusOptions = [
    { id: "scheduled", label: "Scheduled" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
    { id: "no-show", label: "No Show" },
  ];

  // Apply filters (empty array = show all)
  const appointments = useMemo(() => {
    return allAppointments.filter((a) => {
      if (filterVets.length > 0 && !filterVets.includes(a.vet_id)) return false;
      if (filterStatuses.length > 0 && !filterStatuses.includes(a.status)) return false;
      if (filterPets.length > 0 && !filterPets.includes(a.pet_id)) return false;
      if (filterOwners.length > 0) {
        const owner = (a as any).pet_owners || a.pet?.owner;
        const ownerId = owner?.id || a.pet?.owner_id;
        if (!filterOwners.includes(ownerId)) return false;
      }
      return true;
    });
  }, [allAppointments, filterVets, filterStatuses, filterPets, filterOwners]);

  const hasFilters = filterVets.length > 0 || filterStatuses.length > 0 || filterPets.length > 0 || filterOwners.length > 0;

  useEffect(() => {
    if (timeGridRef.current && (viewMode === "week" || viewMode === "day")) {
      const now = new Date();
      const scrollTo = (now.getHours() - START_HOUR - 1) * HOUR_HEIGHT;
      timeGridRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, [viewMode]);

  const reschedule = useCallback(
    async (aptId: string, newDate: string, newTime: string) => {
      const apt = appointments.find((a) => a.id === aptId);
      try {
        await updateAppointment(aptId, { date: newDate, time: newTime });
        queryClient.invalidateQueries({ queryKey: ["appointments"] });
        toast({
          title: "Appointment rescheduled",
          description: `${apt?.pet?.name || "Appointment"} moved to ${format(parseISO(newDate), "MMM d")} at ${newTime}`,
        });
      } catch (err) {
        console.warn("[AppointmentsCalendar] Failed to reschedule appointment", err);
        toast({ title: "Failed to reschedule appointment", variant: "destructive" });
      }
    },
    [appointments, toast, queryClient]
  );

  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };
  const goNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const headerLabel = useMemo(() => {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy");
    if (viewMode === "day") return format(currentDate, "EEEE, MMMM d, yyyy");
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${format(weekStart, "MMMM d")} – ${format(weekEnd, "d, yyyy")}`;
    }
    return `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;
  }, [currentDate, viewMode]);

  const getAptsForDay = (day: Date) =>
    appointments.filter((a) => isSameDay(parseISO(a.date), day));

  const clearFilters = () => {
    setFilterVet("all");
    setFilterStatus("all");
    setFilterPet("all");
    setFilterOwner("all");
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b bg-background px-1 py-2">
        <Button size="sm" variant="outline" onClick={goToday}>
          Today
        </Button>
        <div className="flex items-center gap-0.5">
          <Button size="icon" variant="ghost" onClick={goPrev} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={goNext} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-base font-semibold min-w-[180px]">{headerLabel}</h2>
        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-3 mr-2">
          {vets.map((v) => {
            const color = getVetColor(v.id);
            return (
              <div key={v.id} className="flex items-center gap-1.5 text-xs">
                <span className={cn("h-2.5 w-2.5 rounded-full", color.dot)} />
                <span className="text-muted-foreground">{v.full_name}</span>
              </div>
            );
          })}
        </div>

        <div className="flex rounded-md border bg-muted/50 p-0.5">
          {(["day", "week", "month"] as CalendarViewMode[]).map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={viewMode === mode ? "default" : "ghost"}
              className="h-7 px-3 text-xs capitalize"
              onClick={() => setViewMode(mode)}
            >
              {mode}
            </Button>
          ))}
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          title="List view"
          onClick={() => setShowList(!showList)}
        >
          <LayoutList className="h-4 w-4" />
        </Button>

        <Button size="sm" variant="outline" onClick={() => setShowWalkIn(true)}>
          <Plus className="mr-1 h-3 w-3" /> Walk-In
        </Button>
        <Button size="sm" onClick={() => navigate("/appointments/new")}>
          <Plus className="mr-1 h-3 w-3" /> New
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 px-2 py-1.5">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />

        {/* Vet filter - searchable */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 w-[160px] justify-between text-xs font-normal">
              {filterVet === "all" ? "All Vets" : vets.find((v) => v.id === filterVet)?.full_name || "All Vets"}
              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search vets..." className="h-8 text-xs" />
              <CommandList>
                <CommandEmpty className="py-2 text-xs">No vet found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem value="all-vets" onSelect={() => setFilterVet("all")} className="text-xs">
                    <Check className={cn("mr-2 h-3 w-3", filterVet === "all" ? "opacity-100" : "opacity-0")} />
                    All Vets
                  </CommandItem>
                  {vets.map((v) => (
                    <CommandItem key={v.id} value={v.full_name} onSelect={() => setFilterVet(v.id)} className="text-xs">
                      <Check className={cn("mr-2 h-3 w-3", filterVet === v.id ? "opacity-100" : "opacity-0")} />
                      {v.full_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Status filter - simple select (few items, no search needed) */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-7 w-[130px] text-xs">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No Show</SelectItem>
          </SelectContent>
        </Select>

        {/* Pet filter - searchable */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 w-[160px] justify-between text-xs font-normal">
              {filterPet === "all" ? "All Pets" : uniquePets.find((p) => p.id === filterPet)?.name || "All Pets"}
              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search pets..." className="h-8 text-xs" />
              <CommandList>
                <CommandEmpty className="py-2 text-xs">No pet found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem value="all-pets" onSelect={() => setFilterPet("all")} className="text-xs">
                    <Check className={cn("mr-2 h-3 w-3", filterPet === "all" ? "opacity-100" : "opacity-0")} />
                    All Pets
                  </CommandItem>
                  {uniquePets.map((p) => (
                    <CommandItem key={p.id} value={p.name} onSelect={() => setFilterPet(p.id)} className="text-xs">
                      <Check className={cn("mr-2 h-3 w-3", filterPet === p.id ? "opacity-100" : "opacity-0")} />
                      {p.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Owner filter - searchable */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 w-[160px] justify-between text-xs font-normal">
              {filterOwner === "all" ? "All Owners" : uniqueOwners.find((o) => o.id === filterOwner)?.name || "All Owners"}
              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search owners..." className="h-8 text-xs" />
              <CommandList>
                <CommandEmpty className="py-2 text-xs">No owner found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem value="all-owners" onSelect={() => setFilterOwner("all")} className="text-xs">
                    <Check className={cn("mr-2 h-3 w-3", filterOwner === "all" ? "opacity-100" : "opacity-0")} />
                    All Owners
                  </CommandItem>
                  {uniqueOwners.map((o) => (
                    <CommandItem key={o.id} value={o.name} onSelect={() => setFilterOwner(o.id)} className="text-xs">
                      <Check className={cn("mr-2 h-3 w-3", filterOwner === o.id ? "opacity-100" : "opacity-0")} />
                      {o.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {hasFilters && (
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mini calendar sidebar */}
        <div className="hidden lg:flex flex-col border-r w-[260px] shrink-0">
          <div className="p-2">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(d) => d && setCurrentDate(d)}
              className="p-1 pointer-events-auto"
              modifiers={{
                hasAppointment: appointments.map((a) => parseISO(a.date)),
              }}
              modifiersClassNames={{
                hasAppointment: "font-bold text-primary",
              }}
            />
          </div>
          <div className="flex-1 overflow-y-auto border-t p-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Upcoming
            </h3>
            <div className="space-y-2">
              {appointments
                .filter((a) => a.status === "scheduled")
                .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                .slice(0, 8)
                .map((apt) => {
                  const color = getVetColor(apt.vet_id);
                  return (
                    <button
                      key={apt.id}
                      className={cn(
                        "w-full rounded border-l-2 p-2 text-left text-xs hover:bg-muted/50 transition-colors",
                        color.border,
                        color.bg
                      )}
                      onClick={() => setSelectedAppointment(apt)}
                    >
                      <p className={cn("font-medium truncate", color.text)}>
                        {apt.pet?.name} — {apt.reason}
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        {format(parseISO(apt.date), "EEE, MMM d")} · {apt.time}
                      </p>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Calendar body */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "month" && (
            <MonthGrid
              currentDate={currentDate}
              getAptsForDay={getAptsForDay}
              onSelectAppointment={setSelectedAppointment}
              onDateClick={(d) => {
                setCurrentDate(d);
                setViewMode("day");
              }}
              onReschedule={reschedule}
              dragOverSlot={dragOverSlot}
              setDragOverSlot={setDragOverSlot}
              getVetColor={getVetColor}
            />
          )}
          {viewMode === "week" && (
            <WeekGrid
              ref={timeGridRef}
              currentDate={currentDate}
              getAptsForDay={getAptsForDay}
              onSelectAppointment={setSelectedAppointment}
              onTimeClick={(d) => {
                setCurrentDate(d);
                const dateStr = format(d, "yyyy-MM-dd");
                const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                navigate(`/appointments/new?date=${dateStr}&time=${timeStr}`);
              }}
              onReschedule={reschedule}
              dragOverSlot={dragOverSlot}
              setDragOverSlot={setDragOverSlot}
              getVetColor={getVetColor}
            />
          )}
          {viewMode === "day" && (
            <DayGrid
              ref={timeGridRef}
              currentDate={currentDate}
              appointments={getAptsForDay(currentDate)}
              onSelectAppointment={setSelectedAppointment}
              onTimeClick={() => {
                const dateStr = format(currentDate, "yyyy-MM-dd");
                navigate(`/appointments/new?date=${dateStr}`);
              }}
              onReschedule={reschedule}
              dragOverSlot={dragOverSlot}
              setDragOverSlot={setDragOverSlot}
              getVetColor={getVetColor}
            />
          )}
        </div>
      </div>

      {/* Appointment detail dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-md">
          {selectedAppointment && (
            <AppointmentDetail
              apt={selectedAppointment}
              onClose={() => setSelectedAppointment(null)}
              onComplete={() => {
                updateAppointment(selectedAppointment.id, { status: "completed" })
                  .then(() => queryClient.invalidateQueries({ queryKey: ["appointments"] }))
                  .catch((err) => console.warn("[AppointmentsCalendar] Failed to complete appointment", err));
                toast({ title: `${selectedAppointment.pet?.name} appointment completed` });
                setSelectedAppointment(null);
              }}
              onCancel={() => {
                updateAppointment(selectedAppointment.id, { status: "cancelled" })
                  .then(() => queryClient.invalidateQueries({ queryKey: ["appointments"] }))
                  .catch((err) => console.warn("[AppointmentsCalendar] Failed to cancel appointment", err));
                toast({ title: "Appointment cancelled" });
                setSelectedAppointment(null);
              }}
              getVetColor={getVetColor}
            />
          )}
        </DialogContent>
      </Dialog>
      <WalkInModal open={showWalkIn} onOpenChange={setShowWalkIn} onCreated={() => queryClient.invalidateQueries({ queryKey: ["appointments"] })} />
    </div>
  );
}

// ============= Draggable Appointment Block =============

function DraggableAppointment({
  apt,
  className,
  style,
  onClick,
  children,
}: {
  apt: Appointment;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      draggable={apt.status === "scheduled"}
      onDragStart={(e) => handleDragStart(e, apt.id)}
      onDragEnd={handleDragEnd}
      className={cn(className, apt.status === "scheduled" && "cursor-grab active:cursor-grabbing")}
      style={style}
      onClick={onClick}
    >
      {apt.status === "scheduled" && (
        <GripVertical className="absolute top-0.5 right-0.5 h-3 w-3 opacity-30" />
      )}
      {children}
    </div>
  );
}

// ============= Month Grid =============

function MonthGrid({
  currentDate,
  getAptsForDay,
  onSelectAppointment,
  onDateClick,
  onReschedule,
  dragOverSlot,
  setDragOverSlot,
  getVetColor,
}: {
  currentDate: Date;
  getAptsForDay: (d: Date) => Appointment[];
  onSelectAppointment: (a: Appointment) => void;
  onDateClick: (d: Date) => void;
  onReschedule: (aptId: string, newDate: string, newTime: string) => void;
  dragOverSlot: string | null;
  setDragOverSlot: (s: string | null) => void;
  getVetColor: (vetId: string) => { bg: string; border: string; text: string; dot: string };
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weeks: Date[][] = [];
  let day = calStart;
  while (day <= calEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const dayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 border-b">
        {dayHeaders.map((d) => (
          <div key={d} className="px-2 py-1.5 text-xs font-medium text-muted-foreground text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="flex-1 grid" style={{ gridTemplateRows: `repeat(${weeks.length}, 1fr)` }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((d) => {
              const apts = getAptsForDay(d);
              const inMonth = isSameMonth(d, currentDate);
              const todayCheck = isToday(d);
              const dateKey = format(d, "yyyy-MM-dd");
              const isOver = dragOverSlot === `month-${dateKey}`;
              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    "border-r last:border-r-0 p-1 min-h-[80px] cursor-pointer hover:bg-muted/30 transition-colors overflow-hidden",
                    !inMonth && "bg-muted/20",
                    isOver && "bg-primary/10 ring-2 ring-primary/30 ring-inset"
                  )}
                  onClick={() => onDateClick(d)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setDragOverSlot(`month-${dateKey}`);
                  }}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverSlot(null);
                    const aptId = e.dataTransfer.getData("text/plain");
                    if (aptId) onReschedule(aptId, dateKey, "09:00");
                  }}
                >
                  <div
                    className={cn(
                      "text-xs font-medium mb-0.5 w-6 h-6 flex items-center justify-center rounded-full mx-auto",
                      todayCheck && "bg-primary text-primary-foreground",
                      !inMonth && "text-muted-foreground"
                    )}
                  >
                    {format(d, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {apts.slice(0, 3).map((apt) => {
                      const color = getVetColor(apt.vet_id);
                      return (
                        <DraggableAppointment
                          key={apt.id}
                          apt={apt}
                          className={cn(
                            "relative rounded px-1 py-0.5 text-[10px] truncate border-l-2",
                            color.bg,
                            color.border,
                            color.text
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAppointment(apt);
                          }}
                        >
                          <span className="font-medium">{apt.time.slice(0, 5)}</span>{" "}
                          {apt.pet?.name}
                        </DraggableAppointment>
                      );
                    })}
                    {apts.length > 3 && (
                      <div className="text-[10px] text-muted-foreground pl-1">
                        +{apts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= Week Grid =============

const WeekGrid = React.forwardRef<
  HTMLDivElement,
  {
    currentDate: Date;
    getAptsForDay: (d: Date) => Appointment[];
    onSelectAppointment: (a: Appointment) => void;
    onTimeClick: (d: Date) => void;
    onReschedule: (aptId: string, newDate: string, newTime: string) => void;
    dragOverSlot: string | null;
    setDragOverSlot: (s: string | null) => void;
    getVetColor: (vetId: string) => { bg: string; border: string; text: string; dot: string };
  }
>(({ currentDate, getAptsForDay, onSelectAppointment, onTimeClick, onReschedule, dragOverSlot, setDragOverSlot, getVetColor }, ref) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid border-b" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
        <div className="border-r" />
        {days.map((d) => (
          <div
            key={d.toISOString()}
            className={cn(
              "px-2 py-1.5 text-center border-r last:border-r-0",
              isToday(d) && "bg-primary/5"
            )}
          >
            <div className="text-xs text-muted-foreground">{format(d, "EEE")}</div>
            <div
              className={cn(
                "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mx-auto",
                isToday(d) && "bg-primary text-primary-foreground"
              )}
            >
              {format(d, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div ref={ref} className="flex-1 overflow-y-auto relative">
        <CurrentTimeLine />
        <div className="grid" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
          {/* Time labels */}
          <div className="border-r">
            {HOURS.map((h) => (
              <div key={h} className="h-[60px] pr-2 text-right">
                <span className="text-[10px] text-muted-foreground relative -top-2">
                  {format(setHours(new Date(), h), "h a")}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d) => {
            const dayApts = getAptsForDay(d);
            const dateKey = format(d, "yyyy-MM-dd");
            return (
              <div key={d.toISOString()} className="relative border-r last:border-r-0">
                {HOURS.map((h) => {
                  const slotKey = `week-${dateKey}-${h}`;
                  const isOver = dragOverSlot === slotKey;
                  return (
                    <div
                      key={h}
                      className={cn(
                        "h-[60px] border-b hover:bg-muted/20 cursor-pointer transition-colors",
                        isOver && "bg-primary/10"
                      )}
                      onClick={() => onTimeClick(setHours(d, h))}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        setDragOverSlot(slotKey);
                      }}
                      onDragLeave={() => setDragOverSlot(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverSlot(null);
                        const aptId = e.dataTransfer.getData("text/plain");
                        if (aptId) onReschedule(aptId, dateKey, `${String(h).padStart(2, "0")}:00`);
                      }}
                    >
                      {/* half-hour line */}
                      <div className="border-b border-dashed border-muted h-[30px]" />
                    </div>
                  );
                })}
                {/* Appointment blocks */}
                {dayApts.map((apt) => {
                  const { start, end } = parseAppointmentTime(apt);
                  const top = (start.getHours() - START_HOUR) * HOUR_HEIGHT + (start.getMinutes() / 60) * HOUR_HEIGHT;
                  const height = Math.max((differenceInMinutes(end, start) / 60) * HOUR_HEIGHT, 25);
                  const color = getVetColor(apt.vet_id);
                  return (
                    <DraggableAppointment
                      key={apt.id}
                      apt={apt}
                      className={cn(
                        "absolute left-1 right-1 rounded border-l-2 px-1.5 py-0.5 text-[11px] overflow-hidden z-10",
                        color.bg,
                        color.border,
                        color.text
                      )}
                      style={{ top, height }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAppointment(apt);
                      }}
                    >
                      <p className="font-medium truncate">{apt.pet?.name}</p>
                      <p className="truncate opacity-70">{apt.time.slice(0, 5)} · {apt.reason}</p>
                    </DraggableAppointment>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
WeekGrid.displayName = "WeekGrid";

// ============= Day Grid =============

const DayGrid = React.forwardRef<
  HTMLDivElement,
  {
    currentDate: Date;
    appointments: Appointment[];
    onSelectAppointment: (a: Appointment) => void;
    onTimeClick: () => void;
    onReschedule: (aptId: string, newDate: string, newTime: string) => void;
    dragOverSlot: string | null;
    setDragOverSlot: (s: string | null) => void;
    getVetColor: (vetId: string) => { bg: string; border: string; text: string; dot: string };
  }
>(({ currentDate, appointments: dayApts, onSelectAppointment, onTimeClick, onReschedule, dragOverSlot, setDragOverSlot, getVetColor }, ref) => {
  const dateKey = format(currentDate, "yyyy-MM-dd");
  return (
    <div className="flex flex-col h-full">
      <div ref={ref} className="flex-1 overflow-y-auto relative">
        <CurrentTimeLine />
        <div className="grid" style={{ gridTemplateColumns: "60px 1fr" }}>
          <div className="border-r">
            {HOURS.map((h) => (
              <div key={h} className="h-[60px] pr-2 text-right">
                <span className="text-[10px] text-muted-foreground relative -top-2">
                  {format(setHours(new Date(), h), "h a")}
                </span>
              </div>
            ))}
          </div>
          <div className="relative">
            {HOURS.map((h) => {
              const slotKey = `day-${dateKey}-${h}`;
              const isOver = dragOverSlot === slotKey;
              return (
                <div
                  key={h}
                  className={cn(
                    "h-[60px] border-b hover:bg-muted/20 cursor-pointer transition-colors",
                    isOver && "bg-primary/10"
                  )}
                  onClick={onTimeClick}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setDragOverSlot(slotKey);
                  }}
                  onDragLeave={() => setDragOverSlot(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverSlot(null);
                    const aptId = e.dataTransfer.getData("text/plain");
                    if (aptId) onReschedule(aptId, dateKey, `${String(h).padStart(2, "0")}:00`);
                  }}
                >
                  <div className="border-b border-dashed border-muted h-[30px]" />
                </div>
              );
            })}
            {dayApts.map((apt) => {
              const { start, end } = parseAppointmentTime(apt);
              const top = (start.getHours() - START_HOUR) * HOUR_HEIGHT + (start.getMinutes() / 60) * HOUR_HEIGHT;
              const height = Math.max((differenceInMinutes(end, start) / 60) * HOUR_HEIGHT, 25);
              const color = getVetColor(apt.vet_id);
              return (
                <DraggableAppointment
                  key={apt.id}
                  apt={apt}
                  className={cn(
                    "absolute left-2 right-2 rounded border-l-2 px-2 py-1 text-xs overflow-hidden z-10",
                    color.bg,
                    color.border,
                    color.text
                  )}
                  style={{ top, height }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAppointment(apt);
                  }}
                >
                  <p className="font-medium">{apt.pet?.name} — {apt.vet?.full_name}</p>
                  <p className="opacity-70">{apt.time.slice(0, 5)} · {apt.reason}</p>
                </DraggableAppointment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
DayGrid.displayName = "DayGrid";

// ============= Current Time Line =============

function CurrentTimeLine() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);
  const top = (now.getHours() - START_HOUR) * HOUR_HEIGHT + (now.getMinutes() / 60) * HOUR_HEIGHT;
  if (top < 0 || top > (END_HOUR - START_HOUR) * HOUR_HEIGHT) return null;
  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top }}>
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-destructive ml-[56px]" />
        <div className="flex-1 border-t border-destructive" />
      </div>
    </div>
  );
}

// ============= Appointment Detail =============

function AppointmentDetail({
  apt,
  onClose,
  onComplete,
  onCancel,
  getVetColor,
}: {
  apt: Appointment;
  onClose: () => void;
  onComplete: () => void;
  onCancel: () => void;
  getVetColor: (vetId: string) => { bg: string; border: string; text: string; dot: string };
}) {
  const navigate = useNavigate();
  const color = getVetColor(apt.vet_id);
  const followUp = getFollowUpForAppointment(apt.id);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <PawPrint className="h-5 w-5" />
          {apt.pet?.name || "Appointment"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-2">
        <div className={cn("rounded-md p-3 border-l-4", color.bg, color.border)}>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm">{apt.reason}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(parseISO(apt.date), "EEEE, MMMM d, yyyy")} at {apt.time}
              </p>
            </div>
            <StatusBadge status={apt.status} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <PawPrint className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Pet</p>
              <p className="font-medium">{apt.pet?.name}</p>
              <p className="text-xs text-muted-foreground">
                {apt.pet?.species} · {apt.pet?.breed || "Mixed"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Veterinarian</p>
              <p className="font-medium">{apt.vet?.full_name || "Unassigned"}</p>
            </div>
          </div>
        </div>
        {apt.notes && (
          <div className="text-sm">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="bg-muted/50 rounded p-2 text-xs">{apt.notes}</p>
          </div>
        )}
        {followUp && (
          <div className="rounded border border-warning/30 bg-warning/5 p-2 text-xs">
            <p className="font-medium text-warning flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Follow-up {followUp.follow_up?.urgency ? URGENCY_LABELS[followUp.follow_up.urgency] : "recommended"}
            </p>
            {followUp.follow_up?.reason && <p className="mt-1 text-muted-foreground">{followUp.follow_up.reason}</p>}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          {apt.status === "scheduled" && (
            <>
              <Button
                className="flex-1"
                onClick={() => navigate(`/consultation/${apt.id}`)}
              >
                <Stethoscope className="mr-1 h-3 w-3" /> Start Consultation
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigate(`/appointments/${apt.id}/edit`)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setShowCancelConfirm(true)}>
                <XCircle className="mr-1 h-3 w-3" /> Cancel
              </Button>
            </>
          )}
          {apt.status === "completed" && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/pets/${apt.pet_id}`)}
            >
              <PawPrint className="mr-1 h-3 w-3" /> View Pet Record
            </Button>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Cancel Appointment"
        description={`Are you sure you want to cancel ${apt.pet?.name}'s appointment?`}
        onConfirm={onCancel}
        destructive
      />
    </>
  );
}
