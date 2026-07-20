"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi, type AdminCategory } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { P } from "@/lib/iam/permission-keys";
import { useCan } from "./can";
import { AdminCount, AdminEmptyState, AdminPageHeader, AdminTableShell } from "./admin-ui";
import { useToast } from "./toast-provider";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

function messageOf(caught: unknown, fallback: string) {
  return caught instanceof ApiError ? caught.message : fallback;
}

export function AdminCategoriesView() {
  const canManage = useCan(P.LISTING_CATEGORY_MANAGE);
  const { showToast } = useToast();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState("");

  useEffect(() => {
    let active = true;
    adminApi.categories()
      .then((rows) => { if (active) setCategories(rows); })
      .catch((caught) => { if (active) setError(messageOf(caught, "Categories could not be loaded.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function toggle(category: AdminCategory) {
    setActing(category.id);
    try {
      const updated = await adminApi.setCategoryStatus(category.id, !category.active);
      setCategories((current) => current.map((c) => (c.id === updated.id ? updated : c)));
      showToast(
        updated.active ? `${updated.name} is now live.` : `${updated.name} is hidden from the marketplace.`,
        { tone: "success" },
      );
    } catch (caught) {
      showToast(messageOf(caught, "Could not update the category."), { tone: "error" });
    } finally {
      setActing("");
    }
  }

  return (
    <div className="admin-scope space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Launch a category to make it visible and bookable, or pause it to hide it from the marketplace. Existing bookings in a paused category still run to completion."
      />
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <AdminTableShell>
        <div className="flex items-center justify-between px-4 py-3">
          <AdminCount>{categories.length} categories</AdminCount>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Listings</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead className="text-right">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={canManage ? 5 : 4}><Skeleton className="h-6 w-full" /></TableCell>
                </TableRow>
              ))}
            {!loading && categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={canManage ? 5 : 4}>
                  <AdminEmptyState title="No categories" description="Seed the category catalog to begin." />
                </TableCell>
              </TableRow>
            )}
            {!loading && categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.listingType}</TableCell>
                <TableCell>{category.listingCount}</TableCell>
                <TableCell>
                  <Badge variant={category.active ? "default" : "secondary"}>
                    {category.active ? "Live" : "Hidden"}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/categories/${category.id}/templates`}>Edit fields</Link>
                      </Button>
                      <Button
                        variant={category.active ? "outline" : "default"}
                        size="sm"
                        disabled={acting === category.id}
                        onClick={() => toggle(category)}
                      >
                        {acting === category.id ? "Saving…" : category.active ? "Pause" : "Launch"}
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableShell>
    </div>
  );
}
