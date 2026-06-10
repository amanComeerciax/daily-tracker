"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV_ITEMS } from "@/utils/constants";
import {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Calendar,
  PiggyBank,
  BarChart3,
  Download,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Calendar,
  PiggyBank,
  BarChart3,
  Download,
};

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="FinanceFlow Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="font-bold text-lg">
              Finance<span className="gradient-text">Flow</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform border-r border-border bg-sidebar transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="FinanceFlow Logo"
              className="h-12 w-12 object-contain transition-transform group-hover:scale-105 duration-200"
            />
            <span className="text-2xl font-extrabold tracking-tight">
              Finance<span className="gradient-text">Flow</span>
            </span>
          </Link>
        </div>

        {/* Quick Add */}
        <div className="px-4 py-4">
          <Link href="/dashboard">
            <Button className="w-full gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Quick Add
            </Button>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1">
          {DASHBOARD_NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-4 hidden lg:flex items-center justify-between">
          <ThemeToggle />
          <UserButton />
        </div>
      </aside>
    </>
  );
}
