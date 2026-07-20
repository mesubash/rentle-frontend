import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function VerificationDetailSkeleton() {
  return (
    <div className="admin-scope verification-detail-skeleton space-y-4" aria-busy="true" aria-label="Loading verification submission">
      <Skeleton className="h-5 w-28" />
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b">
          <div className="verification-detail-skeleton__heading space-y-2">
            <Skeleton className="verification-detail-skeleton__eyebrow" />
            <Skeleton className="verification-detail-skeleton__title" />
          </div>
          <Skeleton className="verification-detail-skeleton__status" />
        </CardHeader>
        <CardContent className="space-y-7 pt-6">
          <section className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <div className="verification-detail-skeleton__documents">
              <Skeleton className="verification-detail-skeleton__document" />
              <Skeleton className="verification-detail-skeleton__document" />
            </div>
          </section>
          <section className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className="grid overflow-hidden rounded-md border sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div className="space-y-2 border-b p-3 sm:odd:border-r" key={index}>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </section>
          <div className="verification-detail-skeleton__actions flex justify-end gap-2 border-t pt-5">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
