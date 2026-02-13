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
import { mockAppointments, mockUsers } from "@/lib/mock-data";
import type { Appointment } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import React from "react";
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
} from "lucide-react";

type CalendarViewMode = "day" | "week" | "month";

const VET_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  "mock-vet-001": {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-l-blue-500",
    text: "text-blue-800 dark:text-blue-200",
    dot: "bg-blue-500",
  },
  "mock-vet-002": {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-l-purple-500",
    text: "text-purple-800 dark:text-purple-200",
    dot: "bg-purple-500",
  },
};

const DEFAULT_COLOR = {
  bg: "bg-primary/10",
  border: "border-l-primary",
  text: "text-primary",
  dot: "bg-primary",
};

function getVetColor(vetId: string) {
  return VET_COLORS[vetId] || DEFAULT_COLOR;
}

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
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([...mockAppointments]);
  const [showList, setShowList] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const timeGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timeGridRef.current && (viewMode === "week" || viewMode === "day")) {
      const now = new Date();
      const scrollTo = (now.getHours() - START_HOUR - 1) * HOUR_HEIGHT;
      timeGridRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, [viewMode]);

  const reschedule = useCallback(
    (aptId: string, newDate: string, newTime: string) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === aptId ? { ...a, date: newDate, time: newTime } : a))
      );
      const apt = appointments.find((a) => a.id === aptId);
      toast({
        title: "Appointment rescheduled",
        description: `${apt?.pet?.name || "Appointment"} moved to ${format(parseISO(newDate), "MMM d")} at ${newTime}`,
      });
    },
    [appointments, toast]
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

  const vets = mockUsers.filter((u) => u.role === "vet");

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

        <Button size="sm" onClick={() => navigate("/appointments/new")}>
          <Plus className="mr-1 h-3 w-3" /> New
        </Button>
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
                navigate("/appointments/new");
              }}
              onReschedule={reschedule}
              dragOverSlot={dragOverSlot}
              setDragOverSlot={setDragOverSlot}
            />
          )}
          {viewMode === "day" && (
            <DayGrid
              ref={timeGridRef}
              currentDate={currentDate}
              appointments={getAptsForDay(currentDate)}
              onSelectAppointment={setSelectedAppointment}
              onTimeClick={() => navigate("/appointments/new")}
              onReschedule={reschedule}
              dragOverSlot={dragOverSlot}
              setDragOverSlot={setDragOverSlot}
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
                setAppointments((prev) =>
                  prev.map((a) => (a.id === selectedAppointment.id ? { ...a, status: "completed" } : a))
                );
                toast({ title: `${selectedAppointment.pet?.name} appointment completed` });
                setSelectedAppointment(null);
              }}
              onCancel={() => {
                setAppointments((prev) =>
                  prev.map((a) => (a.id === selectedAppointment.id ? { ...a, status: "cancelled" } : a))
                );
                toast({ title: "Appointment cancelled" });
                setSelectedAppointment(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
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
}: {
  currentDate: Date;
  getAptsForDay: (d: Date) => Appointment[];
  onSelectAppointment: (a: Appointment) => void;
  onDateClick: (d: Date) => void;
  onReschedule: (aptId: string, newDate: string, newTime: string) => void;
  dragOverSlot: string | null;
  setDragOverSlot: (s: string | null) => void;
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
                      !inMonth && "text-muted-foreground/50"
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
                            "relative w-full rounded px-1 py-0.5 text-[10px] leading-tight truncate text-left border-l-2",
                            color.bg,
                            color.border,
                            color.text,
                            apt.status === "cancelled" && "opacity-50 line-through"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAppointment(apt);
                          }}
                        >
                          <span className="truncate">{apt.time} {apt.pet?.name}</span>
                        </DraggableAppointment>
                      );
                    })}
                    {apts.length > 3 && (
                      <p className="text-[10px] text-muted-foreground text-center">
                        +{apts.length - 3} more
                      </p>
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
  }
>(({ currentDate, getAptsForDay, onSelectAppointment, onTimeClick, onReschedule, dragOverSlot, setDragOverSlot }, ref) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleSlotDrop = (e: DragEvent<HTMLDivElement>, day: Date, hour: number, half: boolean) => {
    e.preventDefault();
    setDragOverSlot(null);
    const aptId = e.dataTransfer.getData("text/plain");
    if (!aptId) return;
    const minutes = half ? 30 : 0;
    const newTime = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    onReschedule(aptId, format(day, "yyyy-MM-dd"), newTime);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid border-b" style={{ gridTemplateColumns: "60px repeat(7, 1fr)" }}>
        <div className="border-r" />
        {days.map((d) => (
          <div
            key={d.toISOString()}
            className={cn(
              "px-2 py-2 text-center border-r last:border-r-0",
              isToday(d) && "bg-primary/5"
            )}
          >
            <p className="text-xs text-muted-foreground">{format(d, "EEE")}</p>
            <p
              className={cn(
                "text-sm font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full mx-auto",
                isToday(d) && "bg-primary text-primary-foreground"
              )}
            >
              {format(d, "d")}
            </p>
          </div>
        ))}
      </div>

      <div ref={ref} className="flex-1 overflow-y-auto relative">
        <div
          className="grid relative"
          style={{
            gridTemplateColumns: "60px repeat(7, 1fr)",
            height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px`,
          }}
        >
          <div className="border-r relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 text-[10px] text-muted-foreground -translate-y-1/2"
                style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
              >
                {format(setHours(new Date(), hour), "ha")}
              </div>
            ))}
          </div>

          {days.map((d) => {
            const apts = getAptsForDay(d);
            const dateKey = format(d, "yyyy-MM-dd");
            return (
              <div key={d.toISOString()} className="relative border-r last:border-r-0">
                {/* Drop zones — top half and bottom half of each hour */}
                {HOURS.map((hour) => {
                  const slotKeyTop = `week-${dateKey}-${hour}-0`;
                  const slotKeyBot = `week-${dateKey}-${hour}-30`;
                  return (
                    <React.Fragment key={hour}>
                      <div
                        className={cn(
                          "absolute w-full border-t border-border/50 cursor-pointer hover:bg-muted/20 transition-colors",
                          dragOverSlot === slotKeyTop && "bg-primary/10"
                        )}
                        style={{
                          top: `${(hour - START_HOUR) * HOUR_HEIGHT}px`,
                          height: `${HOUR_HEIGHT / 2}px`,
                        }}
                        onClick={() => onTimeClick(setHours(d, hour))}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          setDragOverSlot(slotKeyTop);
                        }}
                        onDragLeave={() => setDragOverSlot(null)}
                        onDrop={(e) => handleSlotDrop(e as any, d, hour, false)}
                      />
                      <div
                        className={cn(
                          "absolute w-full border-t border-border/20 cursor-pointer hover:bg-muted/20 transition-colors",
                          dragOverSlot === slotKeyBot && "bg-primary/10"
                        )}
                        style={{
                          top: `${(hour - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px`,
                          height: `${HOUR_HEIGHT / 2}px`,
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          setDragOverSlot(slotKeyBot);
                        }}
                        onDragLeave={() => setDragOverSlot(null)}
                        onDrop={(e) => handleSlotDrop(e as any, d, hour, true)}
                      />
                    </React.Fragment>
                  );
                })}

                {/* Appointments */}
                {apts.map((apt) => {
                  const { start } = parseAppointmentTime(apt);
                  const topMinutes = differenceInMinutes(start, setHours(setMinutes(startOfDay(d), 0), START_HOUR));
                  const top = (topMinutes / 60) * HOUR_HEIGHT;
                  const height = (30 / 60) * HOUR_HEIGHT;
                  const color = getVetColor(apt.vet_id);
                  if (top < 0 || top > (END_HOUR - START_HOUR) * HOUR_HEIGHT) return null;
                  return (
                    <DraggableAppointment
                      key={apt.id}
                      apt={apt}
                      className={cn(
                        "absolute left-0.5 right-0.5 rounded border-l-3 px-1.5 py-0.5 text-[11px] leading-tight overflow-hidden hover:shadow-md transition-shadow z-10",
                        color.bg,
                        color.border,
                        color.text,
                        apt.status === "cancelled" && "opacity-40 line-through"
                      )}
                      style={{ top: `${top}px`, height: `${height}px`, borderLeftWidth: "3px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAppointment(apt);
                      }}
                    >
                      <p className="font-medium truncate">{apt.pet?.name}</p>
                      <p className="truncate opacity-75">{apt.reason}</p>
                    </DraggableAppointment>
                  );
                })}
                {isToday(d) && <CurrentTimeIndicator />}
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
  }
>(({ currentDate, appointments, onSelectAppointment, onTimeClick, onReschedule, dragOverSlot, setDragOverSlot }, ref) => {
  const dateKey = format(currentDate, "yyyy-MM-dd");

  const handleSlotDrop = (e: DragEvent<HTMLDivElement>, hour: number, half: boolean) => {
    e.preventDefault();
    setDragOverSlot(null);
    const aptId = e.dataTransfer.getData("text/plain");
    if (!aptId) return;
    const minutes = half ? 30 : 0;
    const newTime = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    onReschedule(aptId, dateKey, newTime);
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={ref} className="flex-1 overflow-y-auto relative">
        <div
          className="grid relative"
          style={{
            gridTemplateColumns: "60px 1fr",
            height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px`,
          }}
        >
          <div className="border-r relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-2 text-[10px] text-muted-foreground -translate-y-1/2"
                style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
              >
                {format(setHours(new Date(), hour), "ha")}
              </div>
            ))}
          </div>

          <div className="relative">
            {HOURS.map((hour) => {
              const slotKeyTop = `day-${dateKey}-${hour}-0`;
              const slotKeyBot = `day-${dateKey}-${hour}-30`;
              return (
                <React.Fragment key={hour}>
                  <div
                    className={cn(
                      "absolute w-full border-t border-border/50 cursor-pointer hover:bg-muted/20 transition-colors",
                      dragOverSlot === slotKeyTop && "bg-primary/10"
                    )}
                    style={{
                      top: `${(hour - START_HOUR) * HOUR_HEIGHT}px`,
                      height: `${HOUR_HEIGHT / 2}px`,
                    }}
                    onClick={onTimeClick}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setDragOverSlot(slotKeyTop);
                    }}
                    onDragLeave={() => setDragOverSlot(null)}
                    onDrop={(e) => handleSlotDrop(e as any, hour, false)}
                  />
                  <div
                    className={cn(
                      "absolute w-full border-t border-border/20 cursor-pointer hover:bg-muted/20 transition-colors",
                      dragOverSlot === slotKeyBot && "bg-primary/10"
                    )}
                    style={{
                      top: `${(hour - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px`,
                      height: `${HOUR_HEIGHT / 2}px`,
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setDragOverSlot(slotKeyBot);
                    }}
                    onDragLeave={() => setDragOverSlot(null)}
                    onDrop={(e) => handleSlotDrop(e as any, hour, true)}
                  />
                </React.Fragment>
              );
            })}

            {appointments.map((apt) => {
              const { start } = parseAppointmentTime(apt);
              const topMinutes = differenceInMinutes(start, setHours(setMinutes(startOfDay(currentDate), 0), START_HOUR));
              const top = (topMinutes / 60) * HOUR_HEIGHT;
              const height = (30 / 60) * HOUR_HEIGHT;
              const color = getVetColor(apt.vet_id);
              if (top < 0 || top > (END_HOUR - START_HOUR) * HOUR_HEIGHT) return null;
              return (
                <DraggableAppointment
                  key={apt.id}
                  apt={apt}
                  className={cn(
                    "absolute rounded border-l-3 px-2 py-1 text-xs leading-tight overflow-hidden hover:shadow-md transition-shadow z-10",
                    color.bg,
                    color.border,
                    color.text,
                    apt.status === "cancelled" && "opacity-40 line-through"
                  )}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: "4px",
                    right: "4px",
                    borderLeftWidth: "3px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAppointment(apt);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{apt.time}</p>
                    <p className="font-medium">{apt.pet?.name}</p>
                    <p className="opacity-75 truncate">— {apt.reason}</p>
                  </div>
                  <p className="opacity-60 truncate">{apt.vet?.full_name}</p>
                </DraggableAppointment>
              );
            })}
            {isToday(currentDate) && <CurrentTimeIndicator />}
          </div>
        </div>
      </div>
    </div>
  );
});
DayGrid.displayName = "DayGrid";

// ============= Current Time Indicator =============

function CurrentTimeIndicator() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const minutes = differenceInMinutes(now, setHours(setMinutes(startOfDay(now), 0), START_HOUR));
  const top = (minutes / 60) * HOUR_HEIGHT;

  if (top < 0 || top > (END_HOUR - START_HOUR) * HOUR_HEIGHT) return null;

  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${top}px` }}>
      <div className="flex items-center">
        <div className="h-3 w-3 rounded-full bg-destructive -ml-1.5 shrink-0" />
        <div className="h-[2px] w-full bg-destructive" />
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
}: {
  apt: Appointment;
  onClose: () => void;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const color = getVetColor(apt.vet_id);
  const navigate = useNavigate();

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <span className={cn("h-3 w-3 rounded-full shrink-0", color.dot)} />
          <DialogTitle className="text-base">{apt.reason}</DialogTitle>
        </div>
      </DialogHeader>

      <div className="space-y-4 mt-2">
        <div className="grid grid-cols-[20px_1fr] gap-x-3 gap-y-3 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">{format(parseISO(apt.date), "EEEE, MMMM d, yyyy")}</p>
            <p className="text-muted-foreground">{apt.time} – 30 min</p>
          </div>

          <PawPrint className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">{apt.pet?.name}</p>
            <p className="text-muted-foreground">
              {apt.pet?.species} · {apt.pet?.breed} · Owner: {apt.pet?.owner?.full_name}
            </p>
          </div>

          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
          <p className="font-medium">{apt.vet?.full_name}</p>
        </div>

        {apt.notes && (
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <p className="text-muted-foreground text-xs mb-1">Notes</p>
            <p>{apt.notes}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <StatusBadge status={apt.status} />
        </div>

        {apt.status === "scheduled" && (
          <div className="flex flex-wrap gap-2 border-t pt-3">
            <Button size="sm" variant="outline" onClick={onComplete}>
              <CheckCircle className="mr-1.5 h-3 w-3 text-green-500" /> Complete
            </Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={onCancel}>
              <XCircle className="mr-1.5 h-3 w-3" /> Cancel
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onClose();
                navigate(`/pets/${apt.pet_id}`);
              }}
            >
              <PawPrint className="mr-1.5 h-3 w-3" /> View Pet
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
