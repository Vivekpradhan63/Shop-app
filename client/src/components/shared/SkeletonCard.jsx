import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SkeletonCard() {
  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <Skeleton className="h-48 w-full rounded-none" />
      <CardContent className="flex flex-col gap-2 p-4 flex-1">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-1" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="mt-auto flex items-center justify-between">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
