import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export type FilterConfig = {
  id: string;
  /** Shown as the trigger placeholder and, by default, the reset option label. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  /** Override the reset option's label (default "All {label}s"). */
  allLabel?: string;
};

/** Radix Select forbids an empty-string item value; use a sentinel for "no filter". */
const ALL = "__all__";

/**
 * One responsive filter row: an optional search box plus any number of dropdown
 * filters, and an optional trailing action slot. Search leads on its own line on
 * mobile; filters wrap below. Reusable across any dashboard (admin, org, …).
 */
export function FilterBar({
  search,
  onSearch,
  searchPlaceholder,
  filters = [],
  children,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  children?: ReactNode;
}) {
  return (
    <div role="search" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {onSearch && (
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            value={search}
            placeholder={searchPlaceholder ?? "Search..."}
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
      )}

      {filters.map((filter) => (
        <Select
          key={filter.id}
          value={filter.value || ALL}
          onValueChange={(value) => filter.onChange(value === ALL ? "" : value)}
        >
          <SelectTrigger className="h-9 w-full sm:w-auto sm:min-w-36">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{filter.allLabel ?? `All ${filter.label.toLowerCase()}`}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {children && <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{children}</div>}
    </div>
  );
}
