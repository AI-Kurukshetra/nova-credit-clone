"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Bell,
  LogOut,
  Menu,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardShellProps {
  title: string;
  navItems: NavItem[];
  userInitials: string;
  avatarUrl?: string | null;
  children: React.ReactNode;
  mobileMode?: "bottom-nav" | "drawer";
  settingsHref?: string;
  signOutHref?: string;
}

function SidebarNav({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-indigo-50 text-indigo-700 shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Icon className="size-[18px]" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  title,
  navItems,
  userInitials,
  avatarUrl,
  children,
  mobileMode = "drawer",
  settingsHref = "/dashboard/settings",
  signOutHref = "/signin",
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="border-b border-slate-200 px-5 py-4">
            <Logo href="/" />
          </div>
          <div className="flex-1 p-4">
            <SidebarNav navItems={navItems} />
          </div>
          <div className="border-t border-slate-200 p-4">
            <Link
              href={signOutHref}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="size-[18px]" />
              Sign Out
            </Link>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="border-slate-200 lg:hidden">
                      <Menu />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[calc(100vw-3rem)] sm:w-72 border-slate-200 bg-white text-slate-900">
                    <SheetHeader>
                      <SheetTitle className="text-left text-slate-900">Menu</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <SidebarNav navItems={navItems} />
                    </div>
                  </SheetContent>
                </Sheet>
                <div>
                  <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">CreditBridge Portal</p>
                  <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" aria-label="Notifications" className="text-slate-500 hover:text-slate-700">
                  <Bell className="size-[18px]" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" className="h-10 rounded-full px-1">
                      <Avatar className="size-8 border border-indigo-200 bg-indigo-50">
                        {avatarUrl ? <AvatarImage src={avatarUrl} alt="Profile" /> : null}
                        <AvatarFallback className="bg-indigo-50 text-sm font-semibold text-indigo-700">{userInitials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(settingsHref)}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(signOutHref)}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      {mobileMode === "bottom-nav" && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={`mobile-${item.href}`}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md px-1 py-1 text-[11px] transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                  )}
                >
                  <Icon className="size-[18px]" />
                  <span className="truncate text-[9px] sm:text-[11px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
