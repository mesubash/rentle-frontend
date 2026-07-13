import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl! font-bold tracking-tight sm:text-3xl!">{title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AdminToolbar({
  value,
  onChange,
  placeholder,
  children,
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
}) {
  return (
    <div role="toolbar" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {onChange ? (
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            value={value}
            placeholder={placeholder ?? "Filter records..."}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      ) : <span />}
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function AdminTableShell({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-md border bg-card shadow-sm">{children}</div>;
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-md border border-dashed bg-card px-6 py-14 text-center">
      {Icon && <Icon className="mx-auto mb-3 size-9 text-muted-foreground" />}
      <h2 className="text-lg! font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </section>
  );
}

export function AdminCount({ children }: { children: ReactNode }) {
  return <Badge variant="secondary" className="h-7 rounded-md px-2.5 font-medium">{children}</Badge>;
}

export function AdminStatus({ value }: { value: string }) {
  const normalized = value.toUpperCase();
  const positive = ["ACTIVE", "VERIFIED", "APPROVED", "COMPLETED", "CONFIRMED"].includes(normalized);
  const dangerous = ["SUSPENDED", "REMOVED", "REJECTED", "CANCELLED"].includes(normalized);
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-medium",
        positive && "border-emerald-200 bg-emerald-50 text-emerald-700",
        dangerous && "border-red-200 bg-red-50 text-red-700",
        !positive && !dangerous && "border-amber-200 bg-amber-50 text-amber-700",
      )}
    >
      {humanize(value)}
    </Badge>
  );
}

export function humanize(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
