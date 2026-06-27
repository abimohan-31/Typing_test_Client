"use client";

import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useSocketStore } from "../../store/useSocketStore";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  LogOut, 
  Menu, 
  X, 
  Keyboard, 
  LayoutDashboard, 
  Users, 
  FolderGit, 
  PlaySquare, 
  TrendingUp,
  HelpCircle,
  Wifi,
  WifiOff
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const { user, profile, logout } = useAuthStore();
  const { isConnected } = useSocketStore();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  // Compile Navigation Links by role
  const getNavLinks = () => {
    switch (user.role) {
      case "admin":
        return [
          { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
          { href: "/admin/users", label: "Manage Users", icon: <Users className="h-4 w-4" /> },
          { href: "/admin/groups", label: "Manage Groups", icon: <FolderGit className="h-4 w-4" /> },
        ];
      case "team-leader":
        return [
          { href: "/leader", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
          { href: "/leader/groups", label: "Manage Teams", icon: <Users className="h-4 w-4" /> },
          { href: "/leader/sessions", label: "Start Session", icon: <PlaySquare className="h-4 w-4" /> },
        ];
      case "student":
        return [
          { href: "/student", label: "Personal Stats", icon: <TrendingUp className="h-4 w-4" /> },
          { href: "/student/group", label: "Group Session", icon: <FolderGit className="h-4 w-4" /> },
          { href: "/student/test", label: "Solo Practice", icon: <Keyboard className="h-4 w-4" /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();
  const displayName = (profile as any)?.name || user.email.split("@")[0];

  const formatRole = (role: string) => {
    if (role === "team-leader") return "Team Leader";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-panel-border m-4 rounded-2xl relative z-10">
        <div className="flex items-center space-x-2 px-6 py-5 border-b border-panel-border/80">
          <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/35">
            <Keyboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-md font-bold bg-gradient-to-r from-white via-brand-light/50 to-brand-light bg-clip-text text-transparent">
              KeySpeed Sync
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">Typing Hub</p>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand/10 text-white border-l-2 border-brand shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile */}
        <div className="p-4 border-t border-panel-border/80 bg-slate-950/20 rounded-b-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-brand-light font-bold border border-slate-700 uppercase">
              {displayName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <Badge variant={user.role === "admin" ? "admin" : user.role === "team-leader" ? "leader" : "student"} className="mt-0.5 text-[10px] px-1.5">
                {formatRole(user.role)}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-panel-border bg-background/40 backdrop-blur-md relative z-10">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="hidden md:flex items-center space-x-2 text-xs font-semibold text-slate-400">
              <span className="uppercase tracking-wider">Status:</span>
              {isConnected ? (
                <span className="flex items-center text-emerald-400">
                  <Wifi className="h-3.5 w-3.5 mr-1" /> Live Connected
                </span>
              ) : (
                <span className="flex items-center text-slate-500 animate-pulse">
                  <WifiOff className="h-3.5 w-3.5 mr-1" /> Reconnecting...
                </span>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-4">
            <div className="md:hidden flex items-center">
              <Badge variant={user.role === "admin" ? "admin" : user.role === "team-leader" ? "leader" : "student"}>
                {formatRole(user.role)}
              </Badge>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-brand-light font-bold uppercase">
              {displayName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Inner Container */}
        <main className="flex-1 overflow-y-auto px-6 py-8 relative z-0">
          <div className="max-w-6xl mx-auto fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex flex-col w-72 max-w-xs glass h-full border-r border-panel-border p-6 z-10 transition-all">
            <div className="flex items-center justify-between pb-6 border-b border-panel-border">
              <div className="flex items-center space-x-2">
                <Keyboard className="h-6 w-6 text-brand" />
                <span className="text-md font-bold text-white">KeySpeed Sync</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-brand/10 text-white border-l-2 border-brand shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-panel-border">
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full justify-start text-red-400 hover:bg-red-950/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
