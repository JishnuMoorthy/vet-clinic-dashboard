import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HelpTooltip } from "@/components/HelpTooltip";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  actionLabel?: string;
  onAction?: () => void;
  helpText?: string;
}

export function PageHeader({ title, subtitle, backTo, actionLabel, onAction, helpText }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {backTo && (
          <Button variant="ghost" size="icon" onClick={() => navigate(backTo)} className="mt-0.5" aria-label="Go back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            {helpText && <HelpTooltip text={helpText} />}
          </div>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> {actionLabel}
        </Button>
      )}
    </div>
  );
}
