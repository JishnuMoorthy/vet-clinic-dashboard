import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Receipt, PawPrint, Users, AlertTriangle, Clock } from "lucide-react";
import { mockDashboardData } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";

function getStockStatus(item: { quantity: number; low_stock_threshold: number }) {
  if (item.quantity === 0) return "out";
  if (item.quantity <= item.low_stock_threshold) return "low";
  return "ok";
}

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  paid: "bg-green-100 text-green-700 border-green-200",
  issued: "bg-yellow-100 text-yellow-700 border-yellow-200",
  draft: "bg-muted text-muted-foreground border-border",
  low: "bg-yellow-100 text-yellow-700 border-yellow-200",
  out: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const data = mockDashboardData;

  const stats = [
    { title: "Today's Appointments", value: data.todays_appointments, icon: CalendarDays, onClick: () => navigate("/appointments") },
    { title: "Pending Invoices", value: data.pending_invoices, icon: Receipt, onClick: () => navigate("/billing") },
    { title: "Total Pets", value: data.total_pets, icon: PawPrint, onClick: () => navigate("/pets") },
    { title: "Total Owners", value: data.total_owners, icon: Users, onClick: () => navigate("/owners") },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="cursor-pointer transition-shadow hover:shadow-md" onClick={stat.onClick}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" /> Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcoming_appointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments today.</p>
            ) : (
              data.upcoming_appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate("/appointments")}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{appt.pet?.name}</p>
                    <p className="text-xs text-muted-foreground">{appt.reason} • {appt.vet?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground">{appt.start_time}</span>
                    <Badge variant="outline" className={statusColors[appt.status]}>{appt.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4" /> Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recent_invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => navigate("/billing")}
              >
                <div className="min-w-0">
                  <p className="font-medium">{inv.invoice_number}</p>
                  <p className="text-xs text-muted-foreground">{inv.pet?.name} • {inv.owner?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">₹{inv.total_amount.toLocaleString()}</span>
                  <Badge variant="outline" className={statusColors[inv.status]}>{inv.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {data.low_stock_items.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-yellow-700">
              <AlertTriangle className="h-4 w-4" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.low_stock_items.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-yellow-200 bg-background p-3">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <Badge variant="outline" className={statusColors[stockStatus]}>
                      {stockStatus === "out" ? "Out of stock" : `${item.quantity} left`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
