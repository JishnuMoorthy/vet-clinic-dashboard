import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Receipt, PawPrint, Users } from "lucide-react";

const stats = [
  { title: "Today's Appointments", value: "—", icon: CalendarDays },
  { title: "Pending Invoices", value: "—", icon: Receipt },
  { title: "Total Pets", value: "—", icon: PawPrint },
  { title: "Total Owners", value: "—", icon: Users },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-muted-foreground">
        Dashboard data will be populated in Phase 2 via the API.
      </p>
    </div>
  );
}
