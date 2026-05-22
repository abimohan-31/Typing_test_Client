"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "../store/useAuthStore";
import { Keyboard, ArrowRight, Activity, Zap, Shield, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";

export default function LandingPage() {
  const { user } = useAuthStore();

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "team-leader") return "/leader";
    return "/student";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090a0f] text-slate-100 overflow-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <header className="glass fixed top-0 w-full z-50 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Keyboard className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-400 bg-clip-text text-transparent">
            KeyLoop
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <Link href={getDashboardLink()}>
              <Button size="sm" className="shadow-lg shadow-indigo-500/20">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="shadow-lg shadow-indigo-500/20">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-16 px-6 max-w-6xl mx-auto flex flex-col items-center justify-center text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Real-Time Multiplayer Practice</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent max-w-4xl leading-tight">
          Accelerate Your Typing. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
            In Perfect Sync.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          The ultimate school and team-oriented typing platform. Challenge your peers in real-time synchronized keyboard tests, track live analytics, and watch your speed soar.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
          {user ? (
            <Link href={getDashboardLink()} className="w-full">
              <Button size="lg" className="w-full shadow-lg shadow-indigo-500/20">
                Enter App Shell
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register?role=student" className="w-full">
                <Button size="lg" className="w-full shadow-lg shadow-indigo-500/20">
                  Join as Student
                </Button>
              </Link>
              <Link href="/register?role=team-leader" className="w-full">
                <Button variant="secondary" size="lg" className="w-full">
                  Create a Team
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
          <div className="glass p-6 rounded-xl border border-slate-800/80 text-left glass-hover">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Progress Streaming</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Watch teammates type live. Monitor real-time WPM, accuracy progression, and character completions seamlessly via WebSockets.
            </p>
          </div>

          <div className="glass p-6 rounded-xl border border-slate-800/80 text-left glass-hover">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Typing Engine Excellence</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Experience typing like never before. Featuring caret-tracking, character highlighted feedback, error tracking, and custom key clicks.
            </p>
          </div>

          <div className="glass p-6 rounded-xl border border-slate-800/80 text-left glass-hover">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4 border border-violet-500/20">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Advanced Admin & RBAC</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Role-based dashboards for Admins, Team Leaders, and Students. Seamlessly create groups, send invites, and track team analytics.
            </p>
          </div>
        </div>

        {/* Global Statistics Banner */}
        <div className="w-full glass border border-slate-850 p-8 rounded-2xl mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-3xl font-extrabold text-white">100%</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Real-Time Sync</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-white">&lt; 15ms</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Socket Latency</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-indigo-400">Curated</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Practice Libraries</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-emerald-400">99.8%</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Accuracy Target</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#07080c] py-8 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} KeySpeed Sync. Built with Next.js 15, Socket.IO & Tailwind CSS. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
