"use client";

import React, { useEffect, useState, Suspense } from "react";
import { DashboardShell } from "../../../components/layouts/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import api, { ApiResponse } from "../../../lib/axios";
import { Play, Square, Clock, Users, Trophy } from "lucide-react";
import { useSocketStore } from "../../../store/useSocketStore";
import { socket } from "../../../sockets/client";
import { generatePracticeText } from "../../../lib/utils";
import { useSearchParams } from "next/navigation";

function LeaderSessionContent() {
  const searchParams = useSearchParams();
  const initialGroupId = searchParams.get("groupId");
  
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(initialGroupId || "");
  const [duration, setDuration] = useState<number>(1); // Default 1 minute
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const { activeSession, timeLeft, participantsProgress, clearSessionState } = useSocketStore();

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
  }, [selectedGroupId]);

  // Join the socket room for the selected group so the leader can hear progress updates
  useEffect(() => {
    if (selectedGroupId && socket.connected) {
      socket.emit("joinGroup", { groupId: selectedGroupId });
      // The leader should also join the group as a "session" room just in case 
      // students emit progress using groupId as sessionId
      socket.emit("joinSession", selectedGroupId);
    }
  }, [selectedGroupId]);

  const handleStartSession = async () => {
    if (!selectedGroupId) return;
    
    try {
      setStarting(true);
      setError(null);
      
      const text = generatePracticeText(duration);
      
      // 1. Create session in DB
      const response = await api.post<ApiResponse>("/sessions/start", {
        groupId: selectedGroupId,
        text,
        duration,
      });

      // 2. Also start session via group endpoint to set group active flag
      await api.post(`/groups/${selectedGroupId}/start-session`, { duration });
      
      const sessionDbId = response.data.data._id;

      // Leader joins the specific DB session ID room to receive live student progress
      socket.emit("joinSession", sessionDbId);

      // 3. Emit socket event so students receive it
      // Backend expects duration in minutes (since it multiplies by 60 for seconds)
      socket.emit("sessionStarted", {
        groupId: selectedGroupId,
        text,
        duration,
      });

      useSocketStore.getState().startActiveSession(text, duration * 60, sessionDbId);

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
      clearSessionState();
    } catch (err: any) {
      setError(err.friendlyMessage || "Failed to stop session");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const sortedParticipants = Object.entries(participantsProgress).sort((a, b) => b[1].wpm - a[1].wpm);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Live Session Monitor</h1>
        <p className="text-slate-400 mt-1">Start a typing test and watch your students' live performance.</p>
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
            <CardHeader>
              <CardTitle>Session Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Target Group</label>
                <select 
                  className="w-full bg-[#090a0f] border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  disabled={activeSession !== null}
                >
                  <option value="" disabled>Select a group</option>
                  {groups.map(g => (
                    <option key={g._id} value={g._id}>{g.name} ({g.members?.length || 0} students)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Test Duration</label>
                <div className="flex space-x-2">
                  {[1, 3, 5].map(min => (
                    <button
                      key={min}
                      onClick={() => setDuration(min)}
                      disabled={activeSession !== null}
                      className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                        duration === min 
                          ? "bg-indigo-600 text-white" 
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                      }`}
                    >
                      {min} Min
                    </button>
                  ))}
                </div>
              </div>

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
            <Card className="border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <Clock className="h-8 w-8 text-indigo-400 mb-2" />
                <div className="text-4xl font-black text-white tracking-widest font-mono">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-indigo-300 mt-2">Live Timer Syncing...</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Leaderboard */}
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Trophy className="h-5 w-5 text-amber-400 mr-2" /> Live Leaderboard
                </CardTitle>
                <CardDescription>Real-time WPM and accuracy metrics of connected students.</CardDescription>
              </div>
              {activeSession ? (
                <Badge variant="success" className="animate-pulse">Live Recording</Badge>
              ) : (
                <Badge variant="secondary">Idle / Waiting</Badge>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {sortedParticipants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <Users className="h-12 w-12 mb-4 opacity-50" />
                  <p>No active typists yet.</p>
                  <p className="text-sm">When a session starts, students will appear here in real-time.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {sortedParticipants.map(([userId, stats], index) => (
                    <div key={userId} className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          index === 0 ? "bg-amber-500/20 text-amber-500" :
                          index === 1 ? "bg-slate-300/20 text-slate-300" :
                          index === 2 ? "bg-amber-700/20 text-amber-600" :
                          "bg-slate-800 text-slate-400"
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{stats.name}</p>
                          <p className="text-xs text-slate-400">Live Progress</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-right">
                        <div>
                          <p className="text-2xl font-bold text-indigo-400">{stats.wpm}</p>
                          <p className="text-xs text-slate-500 uppercase font-semibold">WPM</p>
                        </div>
                        <div>
                          <p className={`text-xl font-bold ${stats.accuracy > 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {stats.accuracy}%
                          </p>
                          <p className="text-xs text-slate-500 uppercase font-semibold">Accuracy</p>
                        </div>
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
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading session dashboard...</div>}>
        <LeaderSessionContent />
      </Suspense>
    </DashboardShell>
  );
}
