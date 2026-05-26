"use client";

import React from "react";
import { DashboardShell } from "../../components/layouts/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { WpmProgressChart } from "../../components/charts/DashboardCharts";
import { useAuthStore } from "../../store/useAuthStore";
import { Gauge, Target, Trophy, History } from "lucide-react";

export default function StudentDashboard() {
  const { profile } = useAuthStore();
  const studentName = profile?.name || "Student";
  const groupName = (profile as any)?.groupId?.name || "Not Assigned";

  // Using Mock Data since a history API endpoint does not exist yet for Students
  const mockWeeklyWpmData = [
    { label: "Test 1", wpm: 45 },
    { label: "Test 2", wpm: 48 },
    { label: "Test 3", wpm: 42 },
    { label: "Test 4", wpm: 55 },
    { label: "Test 5", wpm: 58 },
    { label: "Test 6", wpm: 61 },
    { label: "Test 7", wpm: 63 },
  ];

  const recentHistory = [
    { id: "1", date: "Today", wpm: 63, accuracy: 98, duration: "1 Min" },
    { id: "2", date: "Yesterday", wpm: 61, accuracy: 95, duration: "3 Min" },
    { id: "3", date: "2 Days Ago", wpm: 58, accuracy: 97, duration: "1 Min" },
    { id: "4", date: "3 Days Ago", wpm: 55, accuracy: 92, duration: "5 Min" },
  ];

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome, {studentName}</h1>
          <p className="text-slate-400 mt-1">
            Current Group: <span className="font-semibold text-indigo-400">{groupName}</span>
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card hoverable className="bg-gradient-to-br from-indigo-500/10 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-indigo-300">Highest WPM</CardTitle>
              <Trophy className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">63 <span className="text-sm text-slate-500 font-normal">WPM</span></div>
              <p className="text-xs text-slate-500 mt-1">Personal best</p>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Avg Speed</CardTitle>
              <Gauge className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">53 <span className="text-sm text-slate-500 font-normal">WPM</span></div>
              <p className="text-xs text-slate-500 mt-1">Across all tests</p>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Avg Accuracy</CardTitle>
              <Target className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">96%</div>
              <p className="text-xs text-slate-500 mt-1">Excellent precision</p>
            </CardContent>
          </Card>

          <Card hoverable>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Tests Completed</CardTitle>
              <History className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">24</div>
              <p className="text-xs text-slate-500 mt-1">Total sessions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center">
                  <Gauge className="h-4.5 w-4.5 text-indigo-400 mr-2" />
                  Your Speed Progression
                </CardTitle>
                <CardDescription>Watch your words-per-minute grow over time.</CardDescription>
              </CardHeader>
              <CardContent>
                <WpmProgressChart data={mockWeeklyWpmData} />
              </CardContent>
            </Card>
          </div>

          {/* Recent History */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-md flex items-center">
                  <History className="h-4.5 w-4.5 text-slate-400 mr-2" />
                  Recent Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800">
                  {recentHistory.map((test) => (
                    <div key={test.id} className="flex justify-between items-center p-4 hover:bg-slate-800/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-slate-300">{test.date}</p>
                        <p className="text-xs text-slate-500">{test.duration} Test</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-indigo-400">{test.wpm} WPM</p>
                        <p className="text-xs text-slate-500">{test.accuracy}% Acc</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
