"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../store/useAuthStore";
import api from "../../../lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Keyboard, ShieldCheck, AlertTriangle, Users, Loader2 } from "lucide-react";
import Link from "next/link";

interface JoinPageProps {
  params: Promise<{ groupId: string }>;
}

export default function JoinGroupPage({ params }: JoinPageProps) {
  const router = useRouter();
  const { groupId } = use(params);

  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [joining, setJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>("");
  const [success, setSuccess] = useState(false);

  // Fetch group details first (to display a premium UI)
  useEffect(() => {
    async function fetchGroupDetails() {
      try {
        // We only fetch details if the user is authenticated, otherwise the API will block it
        if (isAuthenticated) {
          const response = await api.get(`/groups/${groupId}`);
          setGroupName(response.data.data?.name || "the practice group");
        }
      } catch (err) {
        // Quietly fail details fetch, it's just for display name
      }
    }
    fetchGroupDetails();
  }, [groupId, isAuthenticated]);

  // Handle joining group if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setJoining(false);
      return;
    }

    if (user?.role === "team-leader" || user?.role === "admin") {
      // Leaders/Admins don't join groups as students. Redirect them to leader sessions.
      router.push(`/leader/sessions?groupId=${groupId}`);
      return;
    }

    async function performJoin() {
      try {
        setJoining(true);
        setError(null);
        await api.post("/groups/join", { groupId });
        
        // Refresh local profile store so the frontend is aware of the group association
        await checkAuth();
        
        setSuccess(true);
        setJoining(false);

        // Redirect after a beautiful brief success window
        setTimeout(() => {
          router.push("/student/group");
        }, 2000);
      } catch (err: any) {
        const message = err.response?.data?.message || err.friendlyMessage || "";
        if (message.includes("Already a member")) {
          // Already in, just refresh and redirect
          await checkAuth();
          setSuccess(true);
          setJoining(false);
          setTimeout(() => {
            router.push("/student/group");
          }, 1500);
        } else {
          setError(message || "Failed to join the group. Please verify the link.");
          setJoining(false);
        }
      }
    }

    performJoin();
  }, [isAuthenticated, user, groupId, router, checkAuth]);

  // Case 1: Checking or Joining
  if (joining) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
        
        <Card className="glass shadow-2xl border-panel-border/50 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10 w-full max-w-md text-center p-8">
          <CardContent className="flex flex-col items-center space-y-6 pt-6">
            <Loader2 className="h-12 w-12 text-brand animate-spin" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Joining Group...</h3>
              <p className="text-sm text-slate-400">
                Adding you to {groupName ? `"${groupName}"` : "the practice session"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Case 2: Joined Successfully
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
        
        <Card className="glass shadow-2xl border-panel-border/50 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10 w-full max-w-md text-center p-8 border-emerald-500/30">
          <CardContent className="flex flex-col items-center space-y-6 pt-6">
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-8 w-8 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Welcome Aboard!</h3>
              <p className="text-sm text-slate-400">
                Successfully joined {groupName ? `"${groupName}"` : "the practice group"}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Redirecting to your practice room...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Case 3: Error Joining
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
        
        <Card className="glass shadow-2xl border-panel-border/50 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10 w-full max-w-md text-center p-8 border-red-500/20">
          <CardContent className="flex flex-col items-center space-y-6 pt-6">
            <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Failed to Join</h3>
              <p className="text-sm text-red-400">{error}</p>
            </div>
            <Button className="w-full" onClick={() => router.push("/student/group")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Case 4: Not Authenticated (Prompt login/register)
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 relative">
        <Card className="glass shadow-2xl border-panel-border/50 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10">
          <CardHeader className="text-center space-y-2 pb-4 pt-8">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shadow-lg shadow-brand/20 mb-2 ring-2 ring-white/10">
              <Users className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-brand-light bg-clip-text text-transparent">
              Practice Group Invitation
            </CardTitle>
            <CardDescription className="text-slate-400">
              You've been invited to join a synchronized live typing group.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-slate-300 text-center pb-4">
              To join this group and start practicing with your team, please sign in or create a student account.
            </p>

            <div className="flex flex-col space-y-3">
              <Link href={`/login?callbackUrl=/join/${groupId}`} passHref legacyBehavior>
                <Button className="w-full h-11 bg-brand hover:bg-brand-light text-white font-bold shadow-lg shadow-brand/20">
                  Sign In to Join
                </Button>
              </Link>
              <Link href={`/register?role=student&callbackUrl=/join/${groupId}`} passHref legacyBehavior>
                <Button variant="outline" className="w-full h-11 border-slate-700 hover:border-slate-600 text-slate-300">
                  Create Student Account
                </Button>
              </Link>
            </div>

            <div className="text-center mt-6">
              <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
                Back to Home Page
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
