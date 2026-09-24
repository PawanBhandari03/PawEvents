import { AlertCircle, Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const LoadingState: React.FC<{
  label?: string;
  className?: string;
}> = ({ label = "Loading", className }) => (
  <div
    className={cn(
      "flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground",
      className,
    )}
    role="status"
  >
    <Loader2 className="size-5 animate-spin" />
    <span className="text-sm">{label}…</span>
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}> = ({ title = "Something went wrong", message, action, className }) => (
  <div
    className={cn(
      "flex gap-3 rounded-xl border border-destructive/30 bg-danger-soft p-4 text-sm",
      className,
    )}
    role="alert"
  >
    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
    <div className="space-y-1">
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-muted-foreground">{message}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  </div>
);

export const EmptyState: React.FC<{
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}> = ({ icon, title, description, action, className }) => (
  <div
    className={cn(
      "flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center",
      className,
    )}
  >
    <div className="mb-4 grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground [&_svg]:size-5">
      {icon}
    </div>
    <h3 className="text-base font-semibold">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const PageHeader: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}> = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-brand">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-4xl leading-none sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-xl text-muted-foreground">{description}</p>
      )}
    </div>
    {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
  </div>
);
