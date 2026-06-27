"use client";

import React, { useEffect, useState } from "react";
import { DashboardShell } from "../../../components/layouts/DashboardShell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import api from "../../../lib/axios";
import { Users, LogIn, Loader2, ShieldCheck, UserCheck } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useSocketStore } from "../../../store/useSocketStore";
import { socket } from "../../../sockets/client";
import { useRouter } from "next/navigation";

export default function StudentGroup() {
  const router = useRouter();
  const { profile, checkAuth } = useAuthStore();
  const { activeSession, isConnected, participantsProgress } = useSocketStore();

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

  useEffect(() => {
    if (!groupId || !isConnected) return;
    socket.emit("joinGroup", { groupId: groupId.toString() });
  }, [groupId, isConnected]);

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = groupIdInput.trim();
    if (!input) return;

    let targetGroupId = input;
    // If the student pasted a full invite URL, extract the group ID from it
    if (input.includes("/join/")) {
      const parts = input.split("/join/");
      const lastPart = parts[parts.length - 1];
      targetGroupId = lastPart.split(/[?#]/)[0].trim();
    } else if (input.startsWith("http://") || input.startsWith("https://")) {
      try {
        const url = new URL(input);
        const parts = url.pathname.split("/").filter(Boolean);
        targetGroupId = parts[parts.length - 1] || input;
      } catch (err) {
        // Fallback to original input if URL parsing fails
      }
    }

    try {
      setJoining(true);
      setError(null);
      await api.post("/groups/join", { groupId: targetGroupId });
      // Refresh profile to get the new group
      await checkAuth();
      setGroupIdInput("");
    } catch (err: any) {
      setError(
        err.friendlyMessage ||
          "Failed to join group. Check the ID and try again.",
      );
    } finally {
      setJoining(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Practice Group
          </h1>
          <p className="text-slate-400 mt-2">
            Join a team to participate in live typing contests.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {groupId ? (
          <Card className="border-brand/30 shadow-[0_0_30px_rgba(212,86,10,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-brand-dark to-brand"></div>
            <CardHeader className="text-center pb-2 pt-8">
              <ShieldCheck className="h-12 w-12 text-brand-light mx-auto mb-4" />
              <CardTitle className="text-2xl text-white">
                You are in a Group!
              </CardTitle>
              <CardDescription className="text-base">
                Your current practice team is{" "}
                <span className="font-bold text-brand-light">
                  {groupName || "Assigned"}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-8 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-panel-border w-full text-center space-y-6">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div
                    className={`w-3 h-3 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}
                  ></div>
                  <span className="text-slate-300 font-medium">
                    {isConnected ? "Connected to Live Server" : "Connecting..."}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    Waiting for Team Leader...
                  </h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Synchronized test starting soon. Do not refresh this page.
                  </p>
                </div>

                {/* Participants Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                  {Object.values(participantsProgress).map((p: any) => (
                    <div
                      key={p.userId || Math.random()}
                      className="flex items-center space-x-2 bg-slate-800/40 p-2 rounded-lg border border-slate-700/50"
                    >
                      <UserCheck className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-medium text-slate-300 truncate">
                        {p.name}
                      </span>
                    </div>
                  ))}
                  {Object.keys(participantsProgress).length === 0 && (
                    <div className="col-span-full py-4 text-xs text-slate-500 italic">
                      Waiting for teammates to join...
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-center">
                  <Loader2 className="h-8 w-8 text-brand animate-spin" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="text-center">
              <Users className="h-10 w-10 text-slate-500 mx-auto mb-2" />
              <CardTitle className="text-xl">Join a Team</CardTitle>
              <CardDescription>
                Enter the Group ID provided by your Team Leader
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleJoinGroup}
                className="space-y-6 max-w-md mx-auto"
              >
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
                  className="w-full h-12 text-lg bg-brand hover:bg-brand-light"
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
