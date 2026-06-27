"use client";

import React, { useEffect, useState, Suspense } from "react";
import { DashboardShell } from "../../../components/layouts/DashboardShell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import api, { ApiResponse } from "../../../lib/axios";
import {
  Play,
  Square,
  Clock,
  Users,
  Trophy,
  Trash2,
  Share2,
  Plus,
  FileDown,
  UserMinus,
} from "lucide-react";
import { useSocketStore } from "../../../store/useSocketStore";
import { socket } from "../../../sockets/client";
import { generatePracticeText } from "../../../lib/utils";
import { useSearchParams } from "next/navigation";

function LeaderSessionContent() {
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get("groupId");

  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    initialGroupId || "",
  );
  const [duration, setDuration] = useState<number>(1); // Default 1 minute
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);

  const { activeSession, timeLeft, participantsProgress, clearSessionState } =
    useSocketStore();

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await api.get<ApiResponse>("/groups/leader");
        setGroups(response.data.data);
        if (!selectedGroupId && response.data.data.length > 0) {
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

  useEffect(() => {
    if (!selectedGroupId) return;

    const joinGroupRoom = () => {
      if (socket.connected) {
        socket.emit("joinGroup", { groupId: selectedGroupId });
      }
    };

    joinGroupRoom();
    socket.on("connect", joinGroupRoom);
    return () => {
      socket.off("connect", joinGroupRoom);
    };
  }, [selectedGroupId]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const response = await api.post<ApiResponse>("/groups", {
        name: newGroupName,
      });
      setGroups([...groups, response.data.data]);
      setSelectedGroupId(response.data.data._id);
      setNewGroupName("");
      setIsCreatingGroup(false);
    } catch (err: any) {
      setError("Failed to create group");
    }
  };

  const handleStartSession = async () => {
    if (!selectedGroupId) return;

    try {
      setStarting(true);
      setError(null);

      const practiceData = generatePracticeText(duration);

      // 1. Create session in DB
      const response = await api.post<ApiResponse>("/sessions/start", {
        groupId: selectedGroupId,
        text: practiceData.text,
        duration,
      });

      // 2. Also start session via group endpoint to set group active flag
      await api.post(`/groups/${selectedGroupId}/start-session`, { duration });

      const sessionDbId = response.data.data._id;

      socket.emit("joinGroup", { groupId: selectedGroupId });
      socket.emit("joinSession", sessionDbId);

      socket.emit("sessionStarted", {
        groupId: selectedGroupId,
        text: practiceData.text,
        duration,
        sessionId: sessionDbId,
      });

      useSocketStore
        .getState()
        .startActiveSession(practiceData.text, duration * 60, sessionDbId);
    } catch (err: any) {
      setError(err.friendlyMessage || "Failed to start session");
    } finally {
      setStarting(false);
    }
  };

  const handleStopSession = async () => {
    if (!selectedGroupId) return;
    try {
      await api.post(`/groups/${selectedGroupId}/stop-session`);
      socket.emit("sessionStopped", { groupId: selectedGroupId });
      clearSessionState();
    } catch (err: any) {
      setError(err.friendlyMessage || "Failed to stop session");
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroupId || !window.confirm("Delete this group permanently?"))
      return;
    try {
      await api.delete(`/groups/${selectedGroupId}`);
      setGroups(groups.filter((g) => g._id !== selectedGroupId));
      setSelectedGroupId(groups.length > 1 ? groups[0]._id : "");
    } catch (err: any) {
      setError("Failed to delete group");
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!window.confirm("Remove this student from the group?")) return;
    try {
      await api.post(`/groups/${selectedGroupId}/remove-member`, { studentId });
    } catch (err: any) {
      setError("Failed to remove student");
    }
  };

  const exportResults = () => {
    const headers = ["Rank", "Name", "WPM", "Accuracy", "Mistakes"];
    const rows = sortedParticipants.map(([userId, stats], index) => [
      index + 1,
      stats.name,
      stats.wpm,
      stats.accuracy,
      stats.errors || 0,
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `keyloop_results_${selectedGroupId}.csv`);
    link.click();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const sortedParticipants = Object.entries(participantsProgress).sort(
    (a, b) => b[1].wpm - a[1].wpm,
  );
  const avgWPM = sortedParticipants.length
    ? Math.round(
        sortedParticipants.reduce((acc, curr) => acc + curr[1].wpm, 0) /
          sortedParticipants.length,
      )
    : 0;
  const inviteLink = selectedGroupId
    ? `${window.location.origin}/join/${selectedGroupId}`
    : "";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Live Session Monitor
        </h1>
        <p className="text-slate-400 mt-1">
          Start a typing test and watch your students' live performance.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Group Config</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                onClick={handleDeleteGroup}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="pb-4 border-b border-panel-border mb-4">
                  {!isCreatingGroup ? (
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-slate-700 hover:border-brand hover:text-brand-light"
                      onClick={() => setIsCreatingGroup(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Create New Group
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <input
                        autoFocus
                        className="w-full bg-background border border-panel-border rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand"
                        placeholder="Enter group name..."
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={handleCreateGroup}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                          onClick={() => setIsCreatingGroup(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Target Group
                </label>
                <select
                  className="w-full bg-background border border-panel-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  disabled={activeSession !== null}
                >
                  <option value="" disabled>
                    Select a group
                  </option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} ({g.members?.length || 0} students)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Test Duration
                </label>
                <div className="flex space-x-2">
                  {[1, 3, 5].map((min) => (
                    <button
                      key={min}
                      onClick={() => setDuration(min)}
                      disabled={activeSession !== null}
                      className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                        duration === min
                          ? "bg-brand text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                      }`}
                    >
                      {min} Min
                    </button>
                  ))}
                </div>
              </div>

              {selectedGroupId && (
                <div className="p-3 rounded-lg bg-brand/5 border border-brand/20 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-brand-light">
                    Invite Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      readOnly
                      value={inviteLink}
                      className="bg-transparent text-xs text-slate-300 w-full focus:outline-none"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(inviteLink)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Share2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {!activeSession ? (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white mt-4"
                  onClick={handleStartSession}
                  isLoading={starting}
                  disabled={!selectedGroupId}
                >
                  <Play className="mr-2 h-4 w-4" /> Start Live Session
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="w-full mt-4"
                  onClick={handleStopSession}
                >
                  <Square className="mr-2 h-4 w-4" /> Stop Session
                </Button>
              )}
            </CardContent>
          </Card>

          {activeSession && (
            <Card className="border-brand/50 shadow-[0_0_15px_rgba(212,86,10,0.2)]">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <Clock className="h-8 w-8 text-brand-light mb-2" />
                <div className="text-4xl font-black text-white tracking-widest font-mono">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-brand-light mt-2">
                  Live Timer Syncing...
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Leaderboard */}
        <div className="lg:col-span-2">
          {/* Stats Overview Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card className="p-4 flex items-center justify-between">
              <span className="text-slate-400 text-sm">Avg WPM</span>
              <span className="text-2xl font-black text-white">{avgWPM}</span>
            </Card>
            <Card className="p-4 flex items-center justify-between">
              <span className="text-slate-400 text-sm">Active Typists</span>
              <span className="text-2xl font-black text-brand-light">
                {sortedParticipants.length}
              </span>
            </Card>
          </div>

          <Card className="h-full min-h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-panel-border">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Trophy className="h-5 w-5 text-amber-400 mr-2" /> Live
                  Leaderboard
                </CardTitle>
                <CardDescription>
                  Real-time WPM and accuracy metrics of connected students.
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {sortedParticipants.length > 0 && (
                  <Button variant="outline" size="sm" onClick={exportResults}>
                    <FileDown className="h-4 w-4 mr-2" /> Export CSV
                  </Button>
                )}
                {activeSession ? (
                  <Badge variant="success" className="animate-pulse">
                    Live Recording
                  </Badge>
                ) : (
                  <Badge variant="secondary">Idle / Waiting</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {sortedParticipants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <Users className="h-12 w-12 mb-4 opacity-50" />
                  <p>No active typists yet.</p>
                  <p className="text-sm">
                    When a session starts, students will appear here in
                    real-time.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-panel-border">
                  {sortedParticipants.map(([userId, stats], index) => (
                    <div
                      key={userId}
                      className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            index === 0
                              ? "bg-amber-500/20 text-amber-500"
                              : index === 1
                                ? "bg-slate-300/20 text-slate-300"
                                : index === 2
                                  ? "bg-amber-700/20 text-amber-600"
                                  : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {index === 0
                            ? "🥇"
                            : index === 1
                              ? "🥈"
                              : index === 2
                                ? "🥉"
                                : index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{stats.name}</p>
                          <p className="text-xs text-slate-400">
                            Live Progress • {stats.errors || 0} mistakes
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-right">
                        <div>
                          <p className="text-2xl font-bold text-brand-light">
                            {stats.wpm}
                          </p>
                          <p className="text-xs text-slate-500 uppercase font-semibold">
                            WPM
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-xl font-bold ${stats.accuracy > 95 ? "text-emerald-400" : "text-amber-400"}`}
                          >
                            {stats.accuracy}%
                          </p>
                          <p className="text-xs text-slate-500 uppercase font-semibold">
                            Accuracy
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-red-400"
                          onClick={() => handleRemoveStudent(userId)}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LeaderSessions() {
  return (
    <DashboardShell>
      <Suspense
        fallback={
          <div className="p-8 text-center text-slate-400">
            Loading session dashboard...
          </div>
        }
      >
        <LeaderSessionContent />
      </Suspense>
    </DashboardShell>
  );
}
