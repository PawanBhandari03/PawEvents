import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "brand";

const TONES: Record<Tone, string> = {
  neutral: "bg-secondary text-muted-foreground",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-destructive",
  brand: "bg-brand-soft text-brand",
};

const STATUS_TONE: Record<string, Tone> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  CANCELLED: "danger",
  COMPLETED: "brand",
  PURCHASED: "success",
  VALID: "success",
  INVALID: "danger",
  EXPIRED: "warning",
};

const StatusBadge: React.FC<{
  status: string;
  label?: string;
  className?: string;
}> = ({ status, label, className }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
      TONES[STATUS_TONE[status] ?? "neutral"],
      className,
    )}
  >
    <span className="size-1.5 rounded-full bg-current" />
    {label ?? status.charAt(0) + status.slice(1).toLowerCase()}
  </span>
);

export default StatusBadge;
