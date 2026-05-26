"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "../../../components/layouts/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import api, { ApiResponse } from "../../../lib/axios";
import { Users, LogIn, Loader2, PlayCircle, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useSocketStore } from "../../../store/useSocketStore";
import { useRouter } from "next/navigation";

export default function StudentGroup() {
  const router = useRouter();
  const { profile, checkAuth } = useAuthStore();
  const { activeSession, isConnected } = useSocketStore();
  
  const [groupIdInput, setGroupIdInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const groupId = (profile as any)?.groupId?._id || (profile as any)?.groupId;
  const groupName = (profile as any)?.groupId?.name || null;

  // Redirect to test if session starts
  useEffect(() => {
    if (activeSession) {
      router.push("/student/test");
    }
  }, [activeSession, router]);

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupIdInput.trim()) return;

    try {
      setJoining(true);
      setError(null);
      await api.post("/groups/join", { groupId: groupIdInput.trim() });
      // Refresh profile to get the new group
      await checkAuth();
      setGroupIdInput("");
    } catch (err: any) {
      setError(err.friendlyMessage || "Failed to join group. Check the ID and try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Practice Group</h1>
          <p className="text-slate-400 mt-2">Join a team to participate in live typing contests.</p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {groupId ? (
          <Card className="border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
            <CardHeader className="text-center pb-2 pt-8">
              <ShieldCheck className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
              <CardTitle className="text-2xl text-white">You are in a Group!</CardTitle>
              <CardDescription className="text-base">
                Your current practice team is <span className="font-bold text-indigo-300">{groupName || "Assigned"}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-8 space-y-6">
              
              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 w-full text-center space-y-4">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></div>
                  <span className="text-slate-300 font-medium">{isConnected ? "Connected to Live Server" : "Connecting..."}</span>
                </div>
                
                <h3 className="text-xl font-medium text-white">Waiting for Team Leader...</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Stay on this page. When your team leader starts a live session, you will automatically be redirected to the typing test.
                </p>
                
                <div className="pt-4 flex justify-center">
                  <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              </div>

            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="text-center">
              <Users className="h-10 w-10 text-slate-500 mx-auto mb-2" />
              <CardTitle className="text-xl">Join a Team</CardTitle>
              <CardDescription>Enter the Group ID provided by your Team Leader</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinGroup} className="space-y-6 max-w-md mx-auto">
                <div>
                  <Input
                    placeholder="Paste Group ID here..."
                    value={groupIdInput}
                    onChange={(e) => setGroupIdInput(e.target.value)}
                    required
                    className="text-center text-lg py-6"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-500" 
                  isLoading={joining}
                  disabled={!groupIdInput.trim()}
                >
                  <LogIn className="mr-2 h-5 w-5" /> Join Group
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
