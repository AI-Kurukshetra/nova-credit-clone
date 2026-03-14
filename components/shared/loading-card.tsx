import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCard(): React.JSX.Element {
  return (
    <Card className="portal-loading-shell border-none">
      <CardHeader className="flex flex-col gap-2">
        <Skeleton className="h-5 w-2/5 bg-white/10" />
        <Skeleton className="h-4 w-3/5 bg-cyan-100/10" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full bg-white/10" />
        <Skeleton className="h-4 w-11/12 bg-white/10" />
        <Skeleton className="h-4 w-10/12 bg-white/10" />
      </CardContent>
    </Card>
  );
}
