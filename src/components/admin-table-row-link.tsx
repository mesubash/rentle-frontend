"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TableRow } from "./ui/table";

export function AdminTableRowLink({
  href,
  children,
  className,
  label,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  label: string;
}) {
  const router = useRouter();

  const open = () => router.push(href);
  const ignoreInteractiveTarget = (target: EventTarget | null) =>
    target instanceof HTMLElement && Boolean(target.closest("a,button,input,textarea,select,[role='menuitem'],[data-row-action-ignore]"));

  const handleClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (ignoreInteractiveTarget(event.target)) return;
    open();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (ignoreInteractiveTarget(event.target)) return;
    event.preventDefault();
    open();
  };

  return (
    <TableRow
      role="link"
      tabIndex={0}
      aria-label={label}
      className={cn(
        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 [&_td:first-child]:font-medium",
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </TableRow>
  );
}
