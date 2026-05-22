"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "../../components/layouts/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { WpmProgressChart, LeaderboardBarChart } from "../../components/charts/DashboardCharts";
import { SkeletonCard, SkeletonChart } from "../../components/shared/SkeletonLoader";
import api, { ApiResponse } from "../../lib/axios";
import { Users, FolderGit, Activity, Gauge, TrendingUp } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  studentsCount: number;
  leadersCount: number;
  totalGroups: number;
  activeSessions: number;
  totalSessions: number;
  averageWpm: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse>("/admin/analytics");
        setStats(response.data.data);
      } catch (err: any) {
        setError(err.friendlyMessage || "Failed to load admin analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const roleDistributionData = stats
    ? [
        { name: "Students", wpm: stats.studentsCount },
        { name: "Team Leaders", wpm: stats.leadersCount },
        { name: "Total Users", wpm: stats.totalUsers },
      ]
    : [];

  const mockWeeklyWpmData = [
    { label: "Mon", wpm: 45 },
    { label: "Tue", wpm: 48 },
    { label: "Wed", wpm: 52 },
    { label: "Thu", wpm: 55 },
    { label: "Fri", wpm: 58 },
    { label: "Sat", wpm: 60 },
    { label: "Sun", wpm: 63 },
  ];

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Analytics</h1>
          <p className="text-slate-400 mt-1">Global platform metrics, user distributions, and server updates.</p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : stats ? (
            <>
              <Card hoverable>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.studentsCount} Students &middot; {stats.leadersCount} Leaders
                  </p>
                </CardContent>
              </Card>

              <Card hoverable>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Teams</CardTitle>
                  <FolderGit className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalGroups}</div>
                  <p className="text-xs text-slate-500 mt-1">Active practice groups</p>
                </CardContent>
              </Card>

              <Card hoverable>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Active Contests</CardTitle>
                  <Activity className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.activeSessions}</div>
                  <p className="text-xs text-slate-500 mt-1">Sessions running live right now</p>
                </CardContent>
              </Card>

              <Card hoverable>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Global Average Speed</CardTitle>
                  <Gauge className="h-4 w-4 text-indigo-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.averageWpm} WPM</div>
                  <p className="text-xs text-slate-500 mt-1">Calculated across all completed tests</p>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            Array(2).fill(0).map((_, i) => <SkeletonChart key={i} />)
          ) : stats ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-md flex items-center">
                    <TrendingUp className="h-4.5 w-4.5 text-indigo-400 mr-2" />
                    WPM Speed Progression (Weekly Avg)
                  </CardTitle>
                  <CardDescription>Average performance ratings of typing contestants.</CardDescription>
                </CardHeader>
                <CardContent>
                  <WpmProgressChart data={mockWeeklyWpmData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-md flex items-center">
                    <Users className="h-4.5 w-4.5 text-violet-400 mr-2" />
                    User Roles Breakdown
                  </CardTitle>
                  <CardDescription>Roster allocations in standard database tables.</CardDescription>
                </CardHeader>
                <CardContent>
                  <LeaderboardBarChart data={roleDistributionData} />
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </DashboardShell>
  );
}
