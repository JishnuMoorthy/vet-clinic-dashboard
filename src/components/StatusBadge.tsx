import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, AlertTriangle, Ban, CircleDot, PackageX } from "lucide-react";

const statusConfig: Record<string, { style: string; icon: React.ElementType }> = {
  active: { style: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  scheduled: { style: "bg-primary/15 text-primary border-primary/30", icon: Clock },
  completed: { style: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  cancelled: { style: "bg-muted text-muted-foreground border-border", icon: Ban },
  "no-show": { style: "bg-destructive/15 text-destructive border-destructive/30", icon: XCircle },
  paid: { style: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  pending: { style: "bg-warning/15 text-warning border-warning/30", icon: Clock },
  overdue: { style: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertTriangle },
  ok: { style: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  low: { style: "bg-warning/15 text-warning border-warning/30", icon: AlertTriangle },
  out: { style: "bg-destructive/15 text-destructive border-destructive/30", icon: PackageX },
};

const defaultConfig = { style: "", icon: CircleDot };

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || defaultConfig;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("capitalize gap-1", config.style)}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}
