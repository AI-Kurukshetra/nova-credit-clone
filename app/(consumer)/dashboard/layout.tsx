"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Briefcase,
  ChartNoAxesColumn,
  FileText,
  Home,
  Rocket,
  Settings,
} from "lucide-react";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/setup", label: "Profile Setup", icon: Rocket },
  { href: "/dashboard/report", label: "My Credit Report", icon: ChartNoAxesColumn },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/applications", label: "Applications", icon: Briefcase },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function getInitials(firstName?: string, lastName?: string, email?: string): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "CB";
}

export default function ConsumerDashboardLayout({ children }: { children: React.ReactNode }) {
  const [initials, setInitials] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setInitials("PS");
        return;
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const meta = user.user_metadata ?? {};
        setInitials(getInitials(meta.first_name, meta.last_name, user.email));
        if (meta.avatar_url) setAvatarUrl(meta.avatar_url);
      } else {
        setInitials("PS");
      }
    } catch {
      setInitials("PS");
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  // Listen for custom event dispatched by settings page after profile save
  useEffect(() => {
    function handleProfileUpdate() { loadUser(); }
    window.addEventListener("creditbridge:profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("creditbridge:profile-updated", handleProfileUpdate);
  }, [loadUser]);

  return (
    <div className="portal-shell portal-dashboard-host">
      <DashboardShell
        title="Consumer Dashboard"
        userInitials={initials ?? ""}
        avatarUrl={avatarUrl}
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
