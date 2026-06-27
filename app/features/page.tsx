"use client";

import React from "react";
import Link from "next/link";
import { Keyboard, ArrowLeft, Zap, Monitor, Activity, AudioLines } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function FeaturesPage() {
  const features = [
    {
      title: "Real-Time WebSocket Sync",
      desc: "Instant timer countdown distribution, player joins, and typing speed progress updates with sub-15ms socket latency.",
      icon: <Zap className="h-5 w-5 text-brand-light" />,
    },
    {
      title: "Caret & Keystroke Tracking",
      desc: "Pixel-perfect typing interface with inline correct/incorrect character feedback, typing caret animation, and responsive bounding.",
      icon: <Keyboard className="h-5 w-5 text-emerald-400" />,
    },
    {
      title: "Role-Based Access Dashboards",
      desc: "Specialized control panels for Admins (user banning, statistics), Team Leaders (group sessions, invites), and Students (Solo & Multi practice, history logs).",
      icon: <Monitor className="h-5 w-5 text-amber-400" />,
    },
    {
      title: "Synthetic Mechanical Audio",
      desc: "Native synthesizer engine built directly using the browser's Web Audio API to reproduce mechanical click feedback without media files.",
      icon: <AudioLines className="h-5 w-5 text-violet-400" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-slate-100 p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-6 border-b border-slate-900 mb-12">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center">
            <Keyboard className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold text-md tracking-tight text-white">KeyLoop Sync</span>
        </Link>
        <Button href="/" variant="ghost" size="sm" className="text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Platform Features</h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Explore the premium engineering modules built to deliver a state-of-the-art keyboard training environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {features.map((feat, idx) => (
            <Card key={idx} hoverable>
              <CardHeader className="flex flex-row items-center space-x-4">
                <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center border border-panel-border">
                  {feat.icon}
                </div>
                <CardTitle className="text-md">{feat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto w-full border-t border-slate-950 py-6 mt-16 text-center text-xs text-slate-600">
        <p>&copy; KeyLoop Sync. Feature modules showcase.</p>
      </footer>
    </div>
  );
}
