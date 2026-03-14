import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}

export function EmptyState({ title, description, icon: Icon, children }: EmptyStateProps): React.JSX.Element {
  return (
    <Card className="portal-empty-shell border-none shadow-none">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50">
          <Icon className="size-6 text-indigo-500" />
        </div>
        <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
        {children && <div className="mt-5">{children}</div>}
        <div className="portal-pill-note mt-5">
          Use the primary actions on this page to move the workflow forward.
        </div>
      </CardContent>
    </Card>
  );
}
