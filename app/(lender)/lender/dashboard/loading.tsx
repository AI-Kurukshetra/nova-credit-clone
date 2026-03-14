import { LoadingCard } from "@/components/shared/loading-card";

export default function LenderDashboardLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <LoadingCard />
      <LoadingCard />
      <LoadingCard />
      <LoadingCard />
    </div>
  );
}
