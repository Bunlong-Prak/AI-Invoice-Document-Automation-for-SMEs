"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  FileText,
  Upload,
  Key,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  {
    label: "Invoices",
    href: "/dashboard",
    icon: Receipt,
  },
  {
    label: "Upload",
    href: "/upload",
    icon: Upload,
  },
  {
    label: "API Keys",
    href: "/settings/keys",
    icon: Key,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-[#e6e6e2] bg-[#f7f7f5] transition-all duration-200 select-none",
        collapsed ? "w-[64px]" : "w-[240px]"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-[#e6e6e2]">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-900 text-white shrink-0 shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm tracking-tight text-slate-900 truncate">
                InvoiceAI
              </span>
              <span className="text-[11px] text-slate-500 font-normal truncate">
                SME Automation
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {!collapsed && (
          <p className="px-2.5 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Workspace
          </p>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-white text-slate-950 font-medium shadow-xs border border-[#e6e6e2]"
                    : "text-slate-600 hover:text-slate-950 hover:bg-[#ebebe7]"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-slate-900" : "text-slate-500"
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 pb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-slate-500 hover:text-slate-900 hover:bg-[#ebebe7] h-8"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </div>
          )}
        </Button>
      </div>

      {/* User profile */}
      <div className="p-3 border-t border-[#e6e6e2] bg-[#fbfbfa]">
        <div
          className={cn(
            "flex items-center gap-2.5 p-1.5 rounded-md hover:bg-[#ebebe7] transition-colors",
            collapsed ? "justify-center" : ""
          )}
        >
          <Avatar className="w-7 h-7 shrink-0 rounded border border-[#e6e6e2]">
            <AvatarImage src={session?.user?.image || ""} className="rounded" />
            <AvatarFallback className="text-[11px] bg-slate-200 text-slate-800 font-medium rounded">
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate">
                {session?.user?.name || "Account"}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {session?.user?.email}
              </p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
