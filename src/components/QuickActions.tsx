import { useNavigate } from "react-router-dom";
import { PawPrint, CalendarPlus, UserPlus, Receipt, Package, UserCog } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const actions = [
  { label: "Add Pet", description: "Register a new pet", icon: PawPrint, to: "/pets/new", color: "bg-primary/10 text-primary hover:bg-primary/20", adminOnly: false },
  { label: "New Appointment", description: "Schedule a visit", icon: CalendarPlus, to: "/appointments/new", color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20", adminOnly: false },
  { label: "Add Owner", description: "Register pet parent", icon: UserPlus, to: "/owners/new", color: "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20", adminOnly: false },
  { label: "Create Invoice", description: "Bill a client", icon: Receipt, to: "/billing/new", color: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20", adminOnly: true },
  { label: "Add Inventory", description: "Stock new item", icon: Package, to: "/inventory/new", color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20", adminOnly: true },
  { label: "Add Staff", description: "Onboard team member", icon: UserCog, to: "/staff/new", color: "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20", adminOnly: true },
];

export function QuickActions() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isAdmin = hasRole(["admin"]);

  const visibleActions = actions.filter((a) => !a.adminOnly || isAdmin);

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h2>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {visibleActions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.to)}
            className={`flex flex-col items-center gap-2 rounded-xl border border-transparent p-4 transition-all duration-200 ${action.color} hover:border-border hover:shadow-sm active:scale-95`}
          >
            <action.icon className="h-7 w-7" />
            <div className="text-center">
              <p className="text-sm font-semibold leading-tight">{action.label}</p>
              <p className="text-[11px] opacity-70 mt-0.5">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
