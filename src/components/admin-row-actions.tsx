"use client";

import type { LucideIcon } from "lucide-react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export type AdminRowAction = {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  disabled?: boolean;
  destructive?: boolean;
};

export function AdminRowActions({
  actions,
  label = "Open row actions",
}: {
  actions: AdminRowAction[];
  label?: string;
}) {
  const visibleActions = actions.filter(Boolean);

  if (!visibleActions.length) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="admin-row-actions__trigger size-8" aria-label={label} data-row-action-ignore>
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 border-0 shadow-lg">
        {visibleActions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.label}
              disabled={action.disabled}
              className={cn(action.destructive && "text-destructive focus:bg-destructive/10 focus:text-destructive")}
              onSelect={action.onSelect}
            >
              {Icon && <Icon />}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
