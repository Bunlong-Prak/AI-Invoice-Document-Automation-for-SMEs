"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Upload",
    href: "/upload",
    icon: UploadCloud,
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
        "flex flex-col border-r border-white/[0.05] bg-black transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 h-20">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-white shrink-0">
          <Sparkles className="w-5 h-5 text-black" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tighter text-white uppercase">InvoiceAI</span>
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
              Automated_v4.2
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded text-xs font-mono uppercase tracking-widest transition-all group",
                  isActive
                    ? "text-white"
                    : "text-zinc-500 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-violet-500 rounded-full" />
                )}
                <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-violet-400" : "text-zinc-600 group-hover:text-zinc-400")} />
                {!collapsed && <span>{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-4 pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-zinc-600 hover:text-white hover:bg-white/[0.03]"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      <div className="h-px bg-white/[0.05] mx-4" />

      {/* User */}
      <div className="p-4 mb-2">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded hover:bg-white/[0.03] transition-colors",
            collapsed ? "justify-center" : ""
          )}
        >
          <Avatar className="w-8 h-8 shrink-0 rounded border border-white/10">
            <AvatarImage src={session?.user?.image || ""} className="rounded" />
            <AvatarFallback className="text-[10px] bg-zinc-800 text-white font-mono rounded">
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white truncate tracking-tight">
                {session?.user?.name || "User"}
              </p>
              <p className="text-[9px] font-mono text-zinc-600 truncate uppercase tracking-tighter">
                {session?.user?.email}
              </p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 text-zinc-600 hover:text-destructive hover:bg-destructive/5"
              onClick={() => signOut()}
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
