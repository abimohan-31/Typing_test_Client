"use client";

import React from "react";
import Link from "next/link";
import { Keyboard, ArrowLeft, Users, Trophy, Code } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#090a0f] text-slate-100 p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-6 border-b border-slate-900 mb-12">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Keyboard className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold text-md tracking-tight text-white">KeySpeed Sync</span>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">About KeySpeed Sync</h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            KeySpeed Sync was designed as a modern typing pedagogy tool to enhance keyboard mechanics, speed, and group synchronization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center space-x-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle className="text-md">Team Synergy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 leading-relaxed">
                By enabling classroom and group synchronizations, teachers and team leaders can monitor performance gaps and encourage friendly competition via live charts and score trackers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-x-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                <Trophy className="h-5 w-5" />
              </div>
              <CardTitle className="text-md">Gamified Pedagogy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 leading-relaxed">
                Typing isn't just about repetition; it's about pacing. Real-time synchronized countdowns and multiplayer progress trackers turn standard lessons into multiplayer races.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="glass p-8 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <Code className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Platform Architecture</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Engineered on Node.js and Express in the backend, and Next.js and Tailwind CSS in the frontend. Utilizing native binary WebSocket protocols via Socket.IO to enable minimal connection latencies under load. All calculations (such as WPM and accuracy percentages) are mathematically synchronized with the backend.
          </p>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto w-full border-t border-slate-950 py-6 mt-16 text-center text-xs text-slate-600">
        <p>&copy; KeySpeed Sync. Pedagogy & Engineering Integration.</p>
      </footer>
    </div>
  );
}
