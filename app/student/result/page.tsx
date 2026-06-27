"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "../../../components/layouts/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Trophy, Gauge, Target, ArrowRight } from "lucide-react";

type LastTypingResult = {
  wpm: number;
  accuracy: number;
  sessionId?: string;
  completedAt?: string;
};

export default function StudentResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<LastTypingResult | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lastTypingResult");
      if (!raw) return;
      setResult(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const completedAtLabel = useMemo(() => {
    if (!result?.completedAt) return null;
    const d = new Date(result.completedAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString();
  }, [result?.completedAt]);

  const handleBackToDashboard = () => router.push("/student");
  const handleTryAgain = () => router.push("/student/group");

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Trophy className="h-8 w-8 text-amber-400" />
              Exam Result
            </h1>
            <p className="text-slate-400 mt-1">
              {completedAtLabel ? `Completed: ${completedAtLabel}` : "Here are your final metrics."}
            </p>
          </div>
          <Button variant="outline" onClick={handleBackToDashboard}>
            Back to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {!result ? (
          <Card className="border-panel-border/60 bg-slate-900/30">
            <CardHeader>
              <CardTitle className="text-slate-200">No result found</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-400 space-y-4">
              <p>
                It looks like you refreshed the page or haven’t completed a test yet.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleTryAgain}>Go to Waiting Room</Button>
                <Button variant="outline" onClick={handleBackToDashboard}>
                  Student Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-brand" />
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-brand-light" /> Speed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-white">
                  {result.wpm} <span className="text-lg text-slate-500">WPM</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500" />
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-400" /> Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black text-white">{result.accuracy}%</div>
              </CardContent>
            </Card>

            <div className="md:col-span-2 flex gap-3">
              <Button onClick={handleTryAgain}>Join Another Session</Button>
              <Button variant="outline" onClick={handleBackToDashboard}>
                Student Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

