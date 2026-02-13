import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Receipt, PawPrint, Users, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { mockDashboardData } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { QuickActions } from "@/components/QuickActions";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const stats = [
  { title: "Today's Appointments", value: mockDashboardData.todays_appointments, icon: CalendarDays, color: "text-primary", to: "/appointments" },
  { title: "Pending Invoices", value: mockDashboardData.pending_invoices, icon: Receipt, color: "text-warning", to: "/billing" },
  { title: "Total Pets", value: mockDashboardData.total_pets, icon: PawPrint, color: "text-success", to: "/pets" },
  { title: "Total Owners", value: mockDashboardData.total_owners, icon: Users, color: "text-accent-foreground", to: "/owners" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">{greeting}, {user?.full_name?.split(" ")[0]} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening at your clinic today.</p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={() => navigate(stat.to)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <p className="text-2xl font-bold">{stat.value}</p>
              <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" /> Upcoming Appointments
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/appointments")} className="text-xs text-muted-foreground">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockDashboardData.upcoming_appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments</p>
            ) : (
              mockDashboardData.upcoming_appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate("/appointments")}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{apt.pet?.name} — {apt.reason}</p>
                    <p className="text-xs text-muted-foreground">{apt.vet?.full_name} · {apt.date} at {apt.time}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4" /> Recent Invoices
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/billing")} className="text-xs text-muted-foreground">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockDashboardData.recent_invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/billing/${inv.id}`)}
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm">{inv.invoice_number} — {inv.owner?.full_name}</p>
                  <p className="text-xs text-muted-foreground">₹{inv.total.toLocaleString()} · Due {inv.due_date}</p>
                </div>
                <StatusBadge status={inv.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {mockDashboardData.low_stock_items.length > 0 && (
        <Card className="border-warning/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base text-warning">
              <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")} className="text-xs text-muted-foreground">
              Manage inventory <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockDashboardData.low_stock_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category} · Qty: {item.quantity} (reorder at {item.reorder_level})</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
