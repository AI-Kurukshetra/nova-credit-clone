"use client";

import {
  Briefcase,
  ChartNoAxesColumn,
  FileText,
  Home,
  Settings,
} from "lucide-react";

import { DashboardShell } from "@/components/shared/dashboard-shell";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: Home,
  },
  {
    href: "/dashboard/report",
    label: "My Credit Report",
    icon: ChartNoAxesColumn,
  },
  {
    href: "/dashboard/documents",
    label: "Documents",
    icon: FileText,
  },
  {
    href: "/dashboard/applications",
    label: "Applications",
    icon: Briefcase,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function ConsumerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="portal-shell portal-dashboard-host">
      <div className="portal-ambient portal-ambient-a" aria-hidden />
      <div className="portal-ambient portal-ambient-b" aria-hidden />
      <DashboardShell
        title="Consumer Dashboard"
        userInitials="PS"
        navItems={navItems}
        mobileMode="bottom-nav"
        settingsHref="/dashboard/settings"
        signOutHref="/signin"
      >
        <div className="pb-20 lg:pb-0">{children}</div>
      </DashboardShell>
    </div>
  );
}

