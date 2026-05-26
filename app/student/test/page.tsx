"use client";

import React, { useEffect, useState, useRef } from "react";
import { DashboardShell } from "../../../components/layouts/DashboardShell";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { useSocketStore } from "../../../store/useSocketStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { useTypingEngine } from "../../../hooks/useTypingEngine";
import { socket } from "../../../sockets/client";
import { Clock, Trophy, Target, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "../../../lib/axios";

export default function TypingTestArea() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeSession, timeLeft, clearSessionState } = useSocketStore();
  
  const [submitting, setSubmitting] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [finalResult, setFinalResult] = useState<{wpm: number, accuracy: number} | null>(null);

  // If there's no active session, send them back to the waiting room
  useEffect(() => {
    if (!activeSession && !sessionCompleted) {
      router.push("/student/group");
    }
  }, [activeSession, sessionCompleted, router]);

  const targetText = activeSession?.text || "Waiting for session text...";
  const sessionDurationMinutes = (activeSession?.duration || 60) / 60;
  const elapsedMinutes = (activeSession?.duration || 60) - timeLeft > 0 
    ? ((activeSession?.duration || 60) - timeLeft) / 60 
    : 0.01; // Avoid divide by zero

  const { typed, cursorIndex, wpm, accuracy } = useTypingEngine(
    targetText,
    activeSession !== null && timeLeft > 0,
    elapsedMinutes
  );

  // Emit progress to the socket server every 1 second
  const lastEmitTimeRef = useRef<number>(0);
  useEffect(() => {
    const now = Date.now();
    if (activeSession && now - lastEmitTimeRef.current > 1000) {
      socket.emit("updateProgress", {
        sessionId: activeSession.sessionId,
        userId: user?._id,
        wpm,
        accuracy,
      });
      lastEmitTimeRef.current = now;
    }
  }, [wpm, accuracy, activeSession, user]);

  // Handle Session End
  useEffect(() => {
    let isMounted = true;
    
    if (activeSession && timeLeft <= 0 && !sessionCompleted) {
      setSessionCompleted(true);
      
      const submitResults = async () => {
        try {
          setSubmitting(true);
          const response = await api.post("/sessions/submit", {
            sessionId: activeSession.sessionId,
            typedText: typed,
            timeTakenMinutes: sessionDurationMinutes,
          });
          
          if (isMounted) {
            setFinalResult(response.data.data);
            
            // Broadcast final result to Leader
            const profileName = (useAuthStore.getState().profile as any)?.name;
            socket.emit("submitResult", {
              groupId: (useAuthStore.getState().profile as any)?.groupId?._id,
              userId: user?._id,
              name: profileName || "Student",
              wpm: response.data.data.wpm,
              accuracy: response.data.data.accuracy
            });
          }
        } catch (error) {
          console.error("Failed to submit results", error);
        } finally {
          if (isMounted) setSubmitting(false);
          clearSessionState();
        }
      };
      
      submitResults();
    }
    
    return () => { isMounted = false; };
  }, [timeLeft, activeSession, sessionCompleted, typed, sessionDurationMinutes, user, clearSessionState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleReturnToDashboard = () => {
    router.push("/student");
  };

  if (!activeSession && !sessionCompleted) return null;

  // Render character by character
  const renderText = () => {
    return targetText.split("").map((char, index) => {
      let colorClass = "text-slate-500";
      
      if (index < cursorIndex) {
        colorClass = typed[index] === char ? "text-emerald-400" : "text-red-500 bg-red-500/20 rounded-sm";
      } else if (index === cursorIndex) {
        colorClass = "text-white bg-indigo-500/30 border-b-2 border-indigo-500 animate-pulse";
      }

      return (
        <span key={index} className={`text-3xl font-mono leading-relaxed tracking-wide ${colorClass}`}>
          {char}
        </span>
      );
    });
  };

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top HUD */}
        <div className="flex items-center justify-between bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center space-x-8">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Time Remaining</p>
              <div className="text-4xl font-black text-indigo-400 font-mono flex items-center">
                <Clock className="h-6 w-6 mr-3 opacity-50" />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-12 text-right">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Live Speed</p>
              <div className="text-4xl font-black text-white font-mono flex items-center justify-end">
                {wpm} <span className="text-lg text-slate-500 ml-2">WPM</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Accuracy</p>
              <div className="text-4xl font-black text-white font-mono flex items-center justify-end">
                {accuracy}<span className="text-lg text-slate-500 ml-1">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Typing Canvas */}
        <Card className="border-indigo-500/20 relative overflow-hidden bg-[#090a0f]">
          <CardContent className="p-10 min-h-[400px]">
            {sessionCompleted ? (
              <div className="absolute inset-0 z-10 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
                <Trophy className="h-20 w-20 text-amber-400 mb-6" />
                <h2 className="text-4xl font-bold text-white mb-2">Test Complete!</h2>
                <p className="text-slate-400 mb-8 text-lg">Your results have been sent to your team leader.</p>
                
                {submitting ? (
                  <div className="text-indigo-400 animate-pulse">Calculating final score...</div>
                ) : finalResult ? (
                  <div className="flex space-x-8 mb-10">
                    <div className="text-center bg-slate-800/50 p-6 rounded-2xl border border-slate-700 w-40">
                      <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Final Speed</p>
                      <p className="text-4xl font-black text-indigo-400">{finalResult.wpm}</p>
                    </div>
                    <div className="text-center bg-slate-800/50 p-6 rounded-2xl border border-slate-700 w-40">
                      <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Accuracy</p>
                      <p className="text-4xl font-black text-emerald-400">{finalResult.accuracy}%</p>
                    </div>
                  </div>
                ) : null}

                <Button size="lg" onClick={handleReturnToDashboard} disabled={submitting}>
                  Return to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ) : null}

            <div className="select-none pointer-events-none relative z-0 mt-8">
              {renderText()}
            </div>
            
            {!sessionCompleted && (
              <div className="absolute top-4 left-4">
                <Badge variant="primary" className="animate-pulse flex items-center">
                  <div className="h-2 w-2 rounded-full bg-white mr-2"></div> Focus Mode Active
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
        
        <p className="text-center text-slate-500 text-sm">
          Start typing to begin. The timer is synchronized with your Team Leader. Spacebar prevents page scrolling.
        </p>
      </div>
    </DashboardShell>
  );
}
