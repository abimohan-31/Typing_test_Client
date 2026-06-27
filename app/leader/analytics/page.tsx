"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "../../../components/layouts/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { WpmProgressChart, AccuracyTrendChart, LeaderboardBarChart } from "../../../components/charts/DashboardCharts";
import api, { ApiResponse } from "../../../lib/axios";
import { 
  Users, 
  TrendingUp, 
  Trophy, 
  Activity, 
  Target, 
  AlertCircle, 
  Trash2, 
  UserMinus, 
  History, 
  Calendar,
  X,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ChevronRight
} from "lucide-react";

export default function LeaderAnalytics() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selected student for detailed drill-down modal
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Fetch all leader groups on mount
  useEffect(() => {
    async function fetchGroups() {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse>("/groups/leader");
        setGroups(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedGroupId(response.data.data[0]._id);
        }
      } catch (err: any) {
        setError(err.friendlyMessage || "Failed to load groups");
      } finally {
        setLoading(false);
      }
    }
    fetchGroups();
  }, []);

  // Fetch analytics when selected group changes
  const fetchAnalytics = async (groupId: string) => {
    if (!groupId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<ApiResponse>(`/groups/${groupId}/analytics`);
      setAnalytics(response.data.data);
    } catch (err: any) {
      setError(err.friendlyMessage || "Failed to load group analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedGroupId) {
      fetchAnalytics(selectedGroupId);
    } else {
      setAnalytics(null);
    }
  }, [selectedGroupId]);

  // Remove member from group
  const handleRemoveStudent = async (studentUserId: string, name: string) => {
    if (!selectedGroupId) return;
    if (!window.confirm(`Are you sure you want to remove ${name} from the group?`)) return;

    try {
      setError(null);
      await api.post(`/groups/${selectedGroupId}/remove-member`, { studentId: studentUserId });
      
      // Update local state in real-time
      if (analytics) {
        const updatedStudents = analytics.students.filter((s: any) => s.userId !== studentUserId);
        
        // Re-calculate statistics locally for instant UI update
        const totalStudents = updatedStudents.length;
        const activeStudents = updatedStudents.filter((s: any) => s.totalSessions > 0).length;
        
        const allWpms = updatedStudents.filter((s: any) => s.totalSessions > 0).map((s: any) => s.avgWpm);
        const groupAvgWpm = allWpms.length > 0 ? Math.round(allWpms.reduce((a: number, b: number) => a + b, 0) / allWpms.length) : 0;

        const allAccuracies = updatedStudents.filter((s: any) => s.totalSessions > 0).map((s: any) => s.avgAccuracy);
        const groupAvgAccuracy = allAccuracies.length > 0 ? Math.round(allAccuracies.reduce((a: number, b: number) => a + b, 0) / allAccuracies.length) : 0;

        let topTypist = null;
        let mostAccurate = null;
        let needsAttention = null;

        if (activeStudents > 0) {
          topTypist = updatedStudents.reduce((prev: any, current: any) => (prev.avgWpm > current.avgWpm) ? prev : current);
          mostAccurate = updatedStudents.reduce((prev: any, current: any) => (prev.avgAccuracy > current.avgAccuracy) ? prev : current);
          
          const activeStudentsOnly = updatedStudents.filter((s: any) => s.totalSessions > 0);
          needsAttention = activeStudentsOnly.reduce((prev: any, current: any) => {
            const prevScore = prev.avgWpm * 1.5 + prev.avgAccuracy;
            const currentScore = current.avgWpm * 1.5 + current.avgAccuracy;
            return (prevScore < currentScore) ? prev : current;
          }, activeStudentsOnly[0]);
        }

        setAnalytics({
          ...analytics,
          stats: {
            totalStudents,
            activeStudents,
            groupAvgWpm,
            groupAvgAccuracy,
            highlights: {
              topTypist: topTypist ? { name: topTypist.name, avgWpm: topTypist.avgWpm } : null,
              mostAccurate: mostAccurate ? { name: mostAccurate.name, avgAccuracy: mostAccurate.avgAccuracy } : null,
              needsAttention: needsAttention ? { name: needsAttention.name, avgWpm: needsAttention.avgWpm, avgAccuracy: needsAttention.avgAccuracy } : null,
            }
          },
          students: updatedStudents
        });

        // Close drilldown if the student was removed
        if (selectedStudent && selectedStudent.userId === studentUserId) {
          setSelectedStudent(null);
        }
      }
    } catch (err: any) {
      setError(err.friendlyMessage || "Failed to remove student from group");
    }
  };

  const getSkillBadgeColor = (level: string) => {
    switch (level) {
      case "Master":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Advanced":
        return "bg-brand/10 text-brand-light border-brand/20";
      case "Intermediate":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const formattedChartData = analytics?.students
    ?.filter((s: any) => s.totalSessions > 0)
    ?.map((s: any) => ({
      name: s.name,
      wpm: s.avgWpm
    }))
    ?.sort((a: any, b: any) => b.wpm - a.wpm) || [];

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-brand" />
              Group Analytics
            </h1>
            <p className="text-slate-400 mt-1">
              Analyze typing metrics, view rosters, and track student improvement over time.
            </p>
          </div>

          {/* Group Selector Dropdown */}
          <div className="flex items-center space-x-3 bg-slate-900/60 p-1.5 border border-panel-border rounded-xl max-w-xs w-full md:w-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 pl-3">Group:</span>
            <select
              className="bg-transparent text-sm text-white focus:outline-none pr-8 py-1.5 font-bold cursor-pointer w-full md:w-auto"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="" disabled className="bg-background text-slate-500">Select a group</option>
              {groups.map((g) => (
                <option key={g._id} value={g._id} className="bg-background text-white">
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Empty State */}
        {groups.length === 0 && !loading && (
          <div className="text-center py-16 border border-dashed border-panel-border rounded-2xl bg-slate-900/10">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No Groups Found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Please create a group first from the "Manage Teams" section to start tracking analytics.
            </p>
            <Button href="/leader/groups" className="mt-6">
              Create a Group
            </Button>
          </div>
        )}

        {/* Dashboard Grid */}
        {analytics && !loading && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card hoverable className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-brand" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Group Size</CardTitle>
                  <Users className="h-4 w-4 text-brand-light" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-white">{analytics.stats.totalStudents}</div>
                  <p className="text-xs text-slate-400 mt-1">Students enrolled in group</p>
                </CardContent>
              </Card>

              <Card hoverable className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Typists</CardTitle>
                  <Activity className="h-4 w-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-white">{analytics.stats.activeStudents}</div>
                  <p className="text-xs text-slate-400 mt-1">Have completed at least one test</p>
                </CardContent>
              </Card>

              <Card hoverable className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-purple-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Group Avg Speed</CardTitle>
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-white">{analytics.stats.groupAvgWpm} WPM</div>
                  <p className="text-xs text-slate-400 mt-1">Average speed of group</p>
                </CardContent>
              </Card>

              <Card hoverable className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Group Accuracy</CardTitle>
                  <Target className="h-4 w-4 text-amber-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-white">{analytics.stats.groupAvgAccuracy}%</div>
                  <p className="text-xs text-slate-400 mt-1">Average accuracy rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Highlights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 border-panel-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Trophy className="h-4.5 w-4.5 text-amber-400" /> Top Performer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.stats.highlights.topTypist ? (
                    <div>
                      <p className="text-xl font-bold text-white truncate">{analytics.stats.highlights.topTypist.name}</p>
                      <div className="flex items-baseline space-x-1.5 mt-1">
                        <span className="text-3xl font-black text-amber-400">{analytics.stats.highlights.topTypist.avgWpm}</span>
                        <span className="text-xs text-slate-500 font-semibold uppercase">WPM Avg</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No activity recorded yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 border-panel-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Target className="h-4.5 w-4.5 text-emerald-400" /> Most Accurate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.stats.highlights.mostAccurate ? (
                    <div>
                      <p className="text-xl font-bold text-white truncate">{analytics.stats.highlights.mostAccurate.name}</p>
                      <div className="flex items-baseline space-x-1.5 mt-1">
                        <span className="text-3xl font-black text-emerald-400">{analytics.stats.highlights.mostAccurate.avgAccuracy}%</span>
                        <span className="text-xs text-slate-500 font-semibold uppercase">Accuracy Avg</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No activity recorded yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-900/60 to-slate-950/80 border-panel-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <AlertCircle className="h-4.5 w-4.5 text-rose-400" /> Needs Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.stats.highlights.needsAttention ? (
                    <div>
                      <p className="text-xl font-bold text-white truncate">{analytics.stats.highlights.needsAttention.name}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div>
                          <span className="text-lg font-bold text-rose-400">{analytics.stats.highlights.needsAttention.avgWpm}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block -mt-1">Avg WPM</span>
                        </div>
                        <div className="border-l border-panel-border h-8" />
                        <div>
                          <span className="text-lg font-bold text-rose-400">{analytics.stats.highlights.needsAttention.avgAccuracy}%</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block -mt-1">Accuracy</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">Everyone is doing great!</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Performance Roster and Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Leaderboard Chart */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-md flex items-center">
                      <Trophy className="h-4 w-4 text-brand-light mr-2" />
                      Leaderboard Ranking
                    </CardTitle>
                    <CardDescription>Ranked by average typing speed (WPM)</CardDescription>
                  </CardHeader>
                  <CardContent className="h-72">
                    {formattedChartData.length > 0 ? (
                      <LeaderboardBarChart data={formattedChartData} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500 italic text-sm">
                        No student performance history to map yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Roster & Comparison List */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-md flex items-center">
                      <Users className="h-4 w-4 text-brand-light mr-2" />
                      Student Roster & Comparison
                    </CardTitle>
                    <CardDescription>View skill profiles, average speeds, and improvement metrics.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    {analytics.students.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 italic text-sm">
                        No students have joined this group yet. Share the invite link to add students!
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12 text-center">Rank</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Skill Level</TableHead>
                            <TableHead className="text-center">Tests</TableHead>
                            <TableHead className="text-right">Avg WPM</TableHead>
                            <TableHead className="text-right">Accuracy</TableHead>
                            <TableHead className="text-center">Trend</TableHead>
                            <TableHead className="text-right pr-6">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analytics.students
                            .sort((a: any, b: any) => b.avgWpm - a.avgWpm)
                            .map((student: any, index: number) => {
                              const rank = student.totalSessions > 0 ? index + 1 : "-";
                              return (
                                <TableRow 
                                  key={student.studentId}
                                  className="group hover:bg-slate-800/20 transition-colors cursor-pointer"
                                  onClick={() => setSelectedStudent(student)}
                                >
                                  <TableCell className="text-center font-bold text-slate-500">
                                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                                  </TableCell>
                                  <TableCell>
                                    <p className="font-semibold text-white group-hover:text-brand-light transition-colors">
                                      {student.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-mono truncate max-w-[120px] sm:max-w-none">
                                      {student.email}
                                    </p>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0.5 px-2 ${getSkillBadgeColor(student.skillLevel)}`}>
                                      {student.skillLevel}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center text-slate-300 font-bold">
                                    {student.totalSessions}
                                  </TableCell>
                                  <TableCell className="text-right font-black text-white">
                                    {student.avgWpm > 0 ? `${student.avgWpm} WPM` : "-"}
                                  </TableCell>
                                  <TableCell className="text-right font-bold text-slate-300">
                                    {student.avgAccuracy > 0 ? `${student.avgAccuracy}%` : "-"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {student.improvement > 0 ? (
                                      <span className="inline-flex items-center text-emerald-400 text-xs font-bold">
                                        <TrendingUp className="h-3 w-3 mr-0.5" /> +{student.improvement}
                                      </span>
                                    ) : student.improvement < 0 ? (
                                      <span className="inline-flex items-center text-rose-400 text-xs font-bold">
                                        <TrendingDown className="h-3 w-3 mr-0.5" /> {student.improvement}
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 font-bold">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right space-x-1.5 pr-6" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-400 hover:text-brand-light p-2"
                                      onClick={() => setSelectedStudent(student)}
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-600 hover:text-red-400 p-2"
                                      onClick={() => handleRemoveStudent(student.userId, student.name)}
                                    >
                                      <UserMinus className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        )}
      </div>

      {/* Drill-down Roster Detailed Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl glass border border-panel-border rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-panel-border bg-background/80">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>{selectedStudent.name}'s Profile</span>
                  <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0.5 px-2 ${getSkillBadgeColor(selectedStudent.skillLevel)}`}>
                    {selectedStudent.skillLevel}
                  </Badge>
                </h2>
                <p className="text-slate-400 text-xs font-mono mt-0.5">{selectedStudent.email}</p>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-900 border border-panel-border hover:border-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Overall Summary Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/40 border border-panel-border rounded-xl p-4 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Max WPM</p>
                  <p className="text-2xl font-black text-brand-light mt-1">{selectedStudent.maxWpm || "-"}</p>
                </div>
                <div className="bg-slate-900/40 border border-panel-border rounded-xl p-4 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Average WPM</p>
                  <p className="text-2xl font-black text-brand-light mt-1">{selectedStudent.avgWpm || "-"}</p>
                </div>
                <div className="bg-slate-900/40 border border-panel-border rounded-xl p-4 text-center">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Avg Accuracy</p>
                  <p className="text-2xl font-black text-brand-light mt-1">{selectedStudent.avgAccuracy > 0 ? `${selectedStudent.avgAccuracy}%` : "-"}</p>
                </div>
              </div>

              {/* Chart + History Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* WPM Progress Chart */}
                <div className="bg-slate-900/20 border border-panel-border rounded-xl p-4">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center">
                    <TrendingUp className="h-4 w-4 text-brand-light mr-2" />
                    WPM Performance Trend
                  </h3>
                  <div className="h-64">
                    {selectedStudent.history.length > 0 ? (
                      <WpmProgressChart 
                        data={selectedStudent.history.map((h: any, idx: number) => ({
                          label: `Test ${idx + 1}`,
                          wpm: h.wpm
                        }))} 
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500 italic text-sm">
                        No performance history to graph.
                      </div>
                    )}
                  </div>
                </div>

                {/* Accuracy Progress Chart */}
                <div className="bg-slate-900/20 border border-panel-border rounded-xl p-4">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center">
                    <Target className="h-4 w-4 text-emerald-400 mr-2" />
                    Accuracy Trend
                  </h3>
                  <div className="h-64">
                    {selectedStudent.history.length > 0 ? (
                      <AccuracyTrendChart 
                        data={selectedStudent.history.map((h: any, idx: number) => ({
                          label: `Test ${idx + 1}`,
                          accuracy: h.accuracy
                        }))} 
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500 italic text-sm">
                        No performance history to graph.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Roster Individual Detailed Practice History */}
              <div className="border border-panel-border rounded-xl overflow-hidden bg-slate-900/20">
                <div className="px-4 py-3 border-b border-panel-border bg-background/40 flex items-center">
                  <History className="h-4 w-4 text-slate-400 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Detailed Practice History</span>
                </div>
                {selectedStudent.history.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 italic text-sm">
                    This student hasn't submitted any live typing test results yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Number</TableHead>
                        <TableHead>Date / Time</TableHead>
                        <TableHead className="text-right">Speed (WPM)</TableHead>
                        <TableHead className="text-right">Accuracy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedStudent.history
                        .slice()
                        .reverse()
                        .map((entry: any, index: number, arr: any[]) => (
                          <TableRow key={entry.sessionId}>
                            <TableCell className="font-semibold text-slate-400">
                              Test #{arr.length - index}
                            </TableCell>
                            <TableCell className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Calendar className="h-3 w-3 text-slate-600" />
                              {new Date(entry.startedAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-black text-white">
                              {entry.wpm} WPM
                            </TableCell>
                            <TableCell className="text-right font-bold text-slate-300">
                              {entry.accuracy}%
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-panel-border bg-background/80">
              <Button
                variant="destructive"
                onClick={() => handleRemoveStudent(selectedStudent.userId, selectedStudent.name)}
              >
                <UserMinus className="h-4 w-4 mr-2" /> Remove Student from Group
              </Button>
              <Button onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
