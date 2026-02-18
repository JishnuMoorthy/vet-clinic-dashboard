import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  IndianRupee,
  UserCheck,
  PackageX,
  Clock,
  PawPrint,
  Activity,
  AlertTriangle,
  Users,
  Stethoscope,
} from "lucide-react";
import { mockAppointments, mockInvoices, mockInventory, mockPets, mockOwners, mockUsers } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";

// ─── Derived KPIs ───────────────────────────────────────────────

function useClinicMetrics() {
  return useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    // ── Appointment KPIs ──
    const totalApts = mockAppointments.length;
    const completed = mockAppointments.filter((a) => a.status === "completed").length;
    const cancelled = mockAppointments.filter((a) => a.status === "cancelled").length;
    const noShows = mockAppointments.filter((a) => a.status === "no-show").length;
    const scheduled = mockAppointments.filter((a) => a.status === "scheduled").length;
    const todaysApts = mockAppointments.filter((a) => a.date === today).length;
    const completionRate = totalApts > 0 ? Math.round((completed / totalApts) * 100) : 0;
    const cancellationRate = totalApts > 0 ? Math.round(((cancelled + noShows) / totalApts) * 100) : 0;

    // ── Revenue KPIs ──
    const totalRevenue = mockInvoices.reduce((s, i) => s + i.total, 0);
    const paidRevenue = mockInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
    const pendingRevenue = mockInvoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.total, 0);
    const overdueRevenue = mockInvoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total, 0);
    const collectionRate = totalRevenue > 0 ? Math.round((paidRevenue / totalRevenue) * 100) : 0;
    const avgTransaction = mockInvoices.length > 0 ? Math.round(totalRevenue / mockInvoices.length) : 0;

    // ── Patient KPIs ──
    const speciesBreakdown = mockPets.reduce<Record<string, number>>((acc, p) => {
      acc[p.species] = (acc[p.species] || 0) + 1;
      return acc;
    }, {});
    const speciesData = Object.entries(speciesBreakdown).map(([name, value]) => ({ name, value }));

    // ── Inventory KPIs ──
    const totalItems = mockInventory.length;
    const lowStock = mockInventory.filter((i) => i.status === "low").length;
    const outOfStock = mockInventory.filter((i) => i.status === "out").length;
    const inventoryHealth = totalItems > 0 ? Math.round(((totalItems - lowStock - outOfStock) / totalItems) * 100) : 0;

    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoon = mockInventory.filter((i) => {
      if (!i.expiry_date) return false;
      const exp = new Date(i.expiry_date);
      return exp <= thirtyDays && exp >= now;
    });

    // ── Staff Productivity ──
    const vets = mockUsers.filter((u) => u.role === "vet" && u.is_active);
    const vetProductivity = vets.map((vet) => {
      const vetApts = mockAppointments.filter((a) => a.vet_id === vet.id);
      const vetCompleted = vetApts.filter((a) => a.status === "completed").length;
      return {
        name: vet.full_name.replace("Dr. ", ""),
        total: vetApts.length,
        completed: vetCompleted,
      };
    });

    // ── Appointment Status Distribution ──
    const aptStatusData = [
      { name: "Completed", value: completed, fill: "hsl(152, 60%, 40%)" },
      { name: "Scheduled", value: scheduled, fill: "hsl(21, 100%, 56%)" },
      { name: "Cancelled", value: cancelled, fill: "hsl(0, 0%, 60%)" },
      { name: "No-show", value: noShows, fill: "hsl(0, 72%, 51%)" },
    ].filter((d) => d.value > 0);

    // ── Revenue by Invoice Status ──
    const revenueStatusData = [
      { name: "Collected", value: paidRevenue, fill: "hsl(152, 60%, 40%)" },
      { name: "Pending", value: pendingRevenue, fill: "hsl(38, 92%, 50%)" },
      { name: "Overdue", value: overdueRevenue, fill: "hsl(0, 72%, 51%)" },
    ].filter((d) => d.value > 0);

    // ── Revenue per service category (from line items) ──
    const serviceRevenue: Record<string, number> = {};
    mockInvoices.forEach((inv) => {
      inv.line_items.forEach((li) => {
        const cat = li.description.toLowerCase().includes("consult")
          ? "Consultation"
          : li.description.toLowerCase().includes("vaccin")
          ? "Vaccination"
          : li.description.toLowerCase().includes("groom")
          ? "Grooming"
          : li.description.toLowerCase().includes("x-ray")
          ? "Diagnostics"
          : "Treatment";
        serviceRevenue[cat] = (serviceRevenue[cat] || 0) + li.total;
      });
    });
    const serviceRevenueData = Object.entries(serviceRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      todaysApts,
      totalApts,
      completed,
      scheduled,
      completionRate,
      cancellationRate,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      overdueRevenue,
      collectionRate,
      avgTransaction,
      speciesData,
      totalPets: mockPets.length,
      totalOwners: mockOwners.length,
      lowStock,
      outOfStock,
      inventoryHealth,
      expiringSoon,
      vetProductivity,
      aptStatusData,
      revenueStatusData,
      serviceRevenueData,
    };
  }, []);
}

// ─── Chart Configs ──────────────────────────────────────────────

const aptStatusConfig: ChartConfig = {
  Completed: { label: "Completed", color: "hsl(152, 60%, 40%)" },
  Scheduled: { label: "Scheduled", color: "hsl(21, 100%, 56%)" },
  Cancelled: { label: "Cancelled", color: "hsl(0, 0%, 60%)" },
  "No-show": { label: "No-show", color: "hsl(0, 72%, 51%)" },
};

const revenueConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "hsl(21, 100%, 56%)" },
};

const vetConfig: ChartConfig = {
  total: { label: "Total", color: "hsl(21, 100%, 56%)" },
  completed: { label: "Completed", color: "hsl(152, 60%, 40%)" },
};

// ─── Small Metric Card ──────────────────────────────────────────

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  onClick,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
}) {
  return (
    <Card
      className={`${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground/60" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {trend === "up" && <TrendingUp className="h-4 w-4 text-success mb-1" />}
          {trend === "down" && <TrendingDown className="h-4 w-4 text-destructive mb-1" />}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────

export default function ClinicDashboard() {
  const m = useClinicMetrics();
  const navigate = useNavigate();

  const PIE_COLORS = ["hsl(152, 60%, 40%)", "hsl(21, 100%, 56%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinic Operations"
        subtitle="Performance metrics and KPIs for clinic management"
        helpText="This dashboard aggregates data from appointments, billing, inventory, and staff to give you a full picture of clinic health."
      />

      {/* ── Row 1: Top-level KPIs ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Appointments"
          value={m.todaysApts}
          subtitle={`${m.scheduled} upcoming total`}
          icon={CalendarCheck}
          onClick={() => navigate("/appointments")}
        />
        <MetricCard
          title="Collection Rate"
          value={`${m.collectionRate}%`}
          subtitle={`₹${m.paidRevenue.toLocaleString()} collected`}
          icon={IndianRupee}
          trend={m.collectionRate >= 70 ? "up" : "down"}
          onClick={() => navigate("/billing")}
        />
        <MetricCard
          title="Completion Rate"
          value={`${m.completionRate}%`}
          subtitle={`${m.completed} of ${m.totalApts} appointments`}
          icon={UserCheck}
          trend={m.completionRate >= 70 ? "up" : "down"}
        />
        <MetricCard
          title="Inventory Health"
          value={`${m.inventoryHealth}%`}
          subtitle={`${m.lowStock} low · ${m.outOfStock} out of stock`}
          icon={PackageX}
          trend={m.inventoryHealth >= 70 ? "up" : "down"}
          onClick={() => navigate("/inventory")}
        />
      </div>

      {/* ── Row 2: Charts ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appointment Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" /> Appointment Outcomes
            </CardTitle>
            <CardDescription>Distribution of all appointment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={aptStatusConfig} className="h-[250px]">
              <PieChart>
                <Pie
                  data={m.aptStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {m.aptStatusData.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-2 flex-wrap">
              {m.aptStatusData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.fill }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Service Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4" /> Revenue by Service
            </CardTitle>
            <CardDescription>Breakdown of earnings per service category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[250px]">
              <BarChart data={m.serviceRevenueData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => `₹${Number(value).toLocaleString()}`}
                />
                <Bar dataKey="revenue" fill="hsl(21, 100%, 56%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Revenue Breakdown + Vet Productivity ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Status Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4" /> Revenue Collection
            </CardTitle>
            <CardDescription>
              Total ₹{m.totalRevenue.toLocaleString()} · Avg transaction ₹{m.avgTransaction.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Collection progress */}
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Collected</span>
                  <span className="font-medium">₹{m.paidRevenue.toLocaleString()}</span>
                </div>
                <Progress value={m.collectionRate} className="h-2.5" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Collected</p>
                  <p className="text-lg font-bold text-success">₹{m.paidRevenue.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold text-warning">₹{m.pendingRevenue.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Overdue</p>
                  <p className="text-lg font-bold text-destructive">₹{m.overdueRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vet Productivity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="h-4 w-4" /> Vet Productivity
            </CardTitle>
            <CardDescription>Appointments handled per veterinarian</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={vetConfig} className="h-[220px]">
              <BarChart data={m.vetProductivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="hsl(21, 100%, 56%)" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-muted-foreground">Total assigned</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                <span className="text-muted-foreground">Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 4: Species + Quick Stats ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Species breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PawPrint className="h-4 w-4" /> Patient Demographics
            </CardTitle>
            <CardDescription>{m.totalPets} patients · {m.totalOwners} owners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {m.speciesData.map((s, i) => {
                const pct = Math.round((s.value / m.totalPets) * 100);
                return (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{s.name}</span>
                      <span className="text-muted-foreground">{s.value} ({pct}%)</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Cancellation & No-show rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Operational Rates
            </CardTitle>
            <CardDescription>Key appointment performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Appointment Completion</span>
                  <span className="font-medium text-success">{m.completionRate}%</span>
                </div>
                <Progress value={m.completionRate} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cancellation + No-show</span>
                  <span className="font-medium text-destructive">{m.cancellationRate}%</span>
                </div>
                <Progress value={m.cancellationRate} className="h-2" />
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground mb-1">💡 Industry Benchmark</p>
                <p className="text-xs">Vet clinics aim for &lt;15% cancellation rate and &gt;80% completion. Your rates help identify scheduling or follow-up gaps.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Stock Alerts
            </CardTitle>
            <CardDescription>{m.lowStock + m.outOfStock} items need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockInventory
                .filter((i) => i.status !== "ok")
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate("/inventory")}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity} / reorder: {item.reorder_level}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              {m.expiringSoon.length > 0 && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-2.5 mt-2">
                  <p className="text-xs font-medium text-warning mb-1">⏰ Expiring within 30 days</p>
                  {m.expiringSoon.map((item) => (
                    <p key={item.id} className="text-xs text-muted-foreground">
                      {item.name} — {item.expiry_date}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
