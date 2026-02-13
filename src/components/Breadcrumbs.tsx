import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  pets: "Pets",
  owners: "Pet Owners",
  appointments: "Appointments",
  billing: "Billing",
  inventory: "Inventory",
  staff: "Staff",
  settings: "Settings",
  new: "Add New",
  edit: "Edit",
  list: "List View",
};

function humanize(segment: string): string {
  return routeLabels[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const path = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    // If segment looks like an ID (uuid or mock id), show "Details"
    const label = /^[a-f0-9-]{8,}$/.test(seg) || seg.startsWith("mock-") || seg.startsWith("pet-") || seg.startsWith("owner-") || seg.startsWith("inv-") || seg.startsWith("item-") || seg.startsWith("apt-")
      ? "Details"
      : humanize(seg);

    return { path, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
