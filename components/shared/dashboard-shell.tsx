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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  children: React.ReactNode;
  mobileMode?: "bottom-nav" | "drawer";
  settingsHref?: string;
  signOutHref?: string;
}

function SidebarNav({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-slate-200 hover:bg-slate-800 hover:text-white",
            )}
          >
            <Icon />
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
  children,
  mobileMode = "drawer",
  settingsHref = "/dashboard/settings",
  signOutHref = "/signin",
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
          <div className="border-b border-sidebar-border px-5 py-4">
            <Logo href="/" className="text-sidebar-foreground" />
          </div>
          <div className="flex-1 p-4">
            <SidebarNav navItems={navItems} />
          </div>
          <div className="border-t border-sidebar-border p-4">
            <Link
              href={signOutHref}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              <LogOut />
              Sign Out
            </Link>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <Menu />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 bg-slate-950 text-slate-100">
                    <SheetHeader>
                      <SheetTitle className="text-left text-slate-100">Menu</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <SidebarNav navItems={navItems} />
                    </div>
                  </SheetContent>
                </Sheet>
                <div>
                  <p className="text-sm text-muted-foreground">CreditBridge Portal</p>
                  <h1 className="text-lg font-semibold">{title}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" className="h-10 rounded-full px-1">
                      <Avatar className="size-8">
                        <AvatarFallback>{userInitials}</AvatarFallback>
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
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white lg:hidden">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={`mobile-${item.href}`}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-md px-1 py-1 text-[11px]",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
