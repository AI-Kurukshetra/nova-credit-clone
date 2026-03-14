"use client";

import {
  KeyRound,
  LayoutGrid,
  Search,
  Settings,
  Webhook,
  Briefcase,
} from "lucide-react";

import { DashboardShell } from "@/components/shared/dashboard-shell";

const navItems = [
  {
    href: "/lender/dashboard",
    label: "Overview",
    icon: LayoutGrid,
  },
  {
    href: "/lender/dashboard/applications",
    label: "Applications",
    icon: Briefcase,
  },
  {
    href: "/lender/dashboard/search",
    label: "Search Consumers",
    icon: Search,
  },
  {
    href: "/lender/dashboard/api-keys",
    label: "API Keys",
    icon: KeyRound,
  },
  {
    href: "/lender/dashboard/webhooks",
    label: "Webhooks",
    icon: Webhook,
  },
  {
    href: "/lender/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function LenderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="portal-shell portal-dashboard-host">
      <DashboardShell
        title="Lender Dashboard"
        userInitials="CF"
        navItems={navItems}
        mobileMode="drawer"
        settingsHref="/lender/dashboard/settings"
        signOutHref="/signin"
      >
        {children}
      </DashboardShell>
    </div>
  );
}

