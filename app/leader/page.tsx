"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "../../components/layouts/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { WpmProgressChart } from "../../components/charts/DashboardCharts";
import { SkeletonCard, SkeletonChart } from "../../components/shared/SkeletonLoader";
import api, { ApiResponse } from "../../lib/axios";
import { Users, FolderGit, Activity, Gauge, TrendingUp, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import Link from "next/link";

export default function LeaderDashboard() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGroups() {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse>("/groups/leader");
        setGroups(response.data.data);
      } catch (err: any) {
        setError(err.friendlyMessage || "Failed to load groups data");
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  const totalGroups = groups.length;
  const totalStudents = groups.reduce((acc, group) => acc + (group.members?.length || 0), 0);
  const activeSessions = groups.filter(g => g.activeSession).length;

  const mockWeeklyWpmData = [
    { label: "Mon", wpm: 40 },
    { label: "Tue", wpm: 42 },
    { label: "Wed", wpm: 46 },
    { label: "Thu", wpm: 45 },
    { label: "Fri", wpm: 50 },
    { label: "Sat", wpm: 55 },
    { label: "Sun", wpm: 54 },
  ];

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Team Leader Overview</h1>
            <p className="text-slate-400 mt-1">Manage your practice groups and monitor student performance.</p>
          </div>
          <Link href="/leader/groups">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Group
            </Button>
          </Link>
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
          ) : (
            <>
              <Card hoverable>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Groups</CardTitle>
                  <FolderGit className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{totalGroups}</div>
                  <p className="text-xs text-slate-500 mt-1">Active practice groups</p>
                </CardContent>
              </Card>

              <Card hoverable>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{totalStudents}</div>
                  <p className="text-xs text-slate-500 mt-1">Across all your groups</p>
                </CardContent>
              </Card>

              <Card hoverable>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Active Sessions</CardTitle>
                  <Activity className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{activeSessions}</div>
                  <p className="text-xs text-slate-500 mt-1">Tests running right now</p>
                </CardContent>
              </Card>

              <Card hoverable>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Avg. Student Speed</CardTitle>
                  <Gauge className="h-4 w-4 text-indigo-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">48 WPM</div>
                  <p className="text-xs text-slate-500 mt-1">Estimated group average</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {loading ? (
            <SkeletonChart />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center">
                  <TrendingUp className="h-4.5 w-4.5 text-indigo-400 mr-2" />
                  Team WPM Progress (Weekly Avg)
                </CardTitle>
                <CardDescription>Aggregate performance of all your students over the past week.</CardDescription>
              </CardHeader>
              <CardContent>
                <WpmProgressChart data={mockWeeklyWpmData} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
