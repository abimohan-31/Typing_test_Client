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
import { Clock, Trophy, ArrowRight, Activity, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "../../../lib/axios";
import { motion, AnimatePresence } from "framer-motion";

export default function TypingTestArea() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { activeSession, timeLeft, clearSessionState } = useSocketStore();

  const [countdown, setCountdown] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [finalResult, setFinalResult] = useState<{
    wpm: number;
    accuracy: number;
  } | null>(null);

  // If there's no active session, send them back to the waiting room
  useEffect(() => {
    if (!activeSession && !sessionCompleted) {
      router.push("/student/group");
    }
  }, [activeSession, sessionCompleted, router]);

  // Handle Pre-test Countdown
  useEffect(() => {
    if (activeSession && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [activeSession, countdown]);

  const targetText = activeSession?.text || "Waiting for session text...";
  const sessionDurationMinutes = (activeSession?.duration || 60) / 60;
  const elapsedMinutes =
    (activeSession?.duration || 60) - timeLeft > 0
      ? ((activeSession?.duration || 60) - timeLeft) / 60
      : 0.01; // Avoid divide by zero

  // Disable typing during countdown
  const isTestRunning =
    activeSession !== null && timeLeft > 0 && countdown === 0;

  const { typed, cursorIndex, wpm, accuracy, errors } = useTypingEngine(
    targetText,
    isTestRunning,
    elapsedMinutes,
  );

  // Emit progress to the socket server every 1 second
  const lastEmitTimeRef = useRef<number>(0);
  useEffect(() => {
    if (!activeSession || !isTestRunning || !user) return;

    const now = Date.now();
    if (now - lastEmitTimeRef.current > 1000) {
      socket.emit("updateProgress", {
        sessionId: activeSession.sessionId,
        userId: user._id,
        name: (useAuthStore.getState().profile as any)?.name || "Student",
        wpm,
        accuracy,
        errors,
      });
      lastEmitTimeRef.current = now;
    }
  }, [wpm, accuracy, errors, activeSession, user, isTestRunning]);

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
            const result = response.data.data as { wpm: number; accuracy: number };
            setFinalResult(result);

            // Persist for the dedicated result page.
            try {
              sessionStorage.setItem(
                "lastTypingResult",
                JSON.stringify({
                  ...result,
                  sessionId: activeSession.sessionId,
                  completedAt: new Date().toISOString(),
                }),
              );
            } catch {}

            // Broadcast final result to Leader
            const profileName = (useAuthStore.getState().profile as any)?.name;
            socket.emit("submitResult", {
              groupId:
                (useAuthStore.getState().profile as any)?.groupId?._id ||
                (useAuthStore.getState().profile as any)?.groupId,
              userId: user?._id,
              userName: profileName || "Student",
              wpm: result.wpm,
              accuracy: result.accuracy,
            });

            // Move to results page (student portal).
            router.push("/student/result");
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

    return () => {
      isMounted = false;
    };
  }, [
    timeLeft,
    activeSession,
    sessionCompleted,
    typed,
    sessionDurationMinutes,
    user,
    clearSessionState,
  ]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleReturnToDashboard = () => {
    router.push("/student");
  };

  if (!activeSession && !sessionCompleted) return null;

  const renderText = () => {
    const words = targetText.split(" ");
    let charCount = 0;

    return words.map((word, wordIndex) => {
      const isCurrentWord =
        cursorIndex >= charCount && cursorIndex < charCount + word.length + 1;
      const wordChars = word.split("").map((char, charIdx) => {
        const globalIndex = charCount + charIdx;
        let colorClass = "text-slate-600 transition-colors duration-150";

        if (globalIndex < cursorIndex) {
          colorClass =
            typed[globalIndex] === char
              ? "text-typing-correct"
              : "text-typing-incorrect bg-typing-incorrect/10 rounded-sm ring-1 ring-typing-incorrect/30";
        } else if (globalIndex === cursorIndex) {
          colorClass =
            "text-foreground bg-brand/40 border-b-2 border-brand-light animate-pulse px-[1px]";
        }
        return (
          <span key={globalIndex} className={`${colorClass} inline-block`}>
            {char}
          </span>
        );
      });

      const spaceIndex = charCount + word.length;
      const spaceColor =
        spaceIndex < cursorIndex && typed[spaceIndex] !== " "
          ? "bg-typing-incorrect/20"
          : "";
      const element = (
        <span
          key={wordIndex}
          className={`inline-block mr-3 mb-3 text-4xl font-mono px-1.5 py-0.5 rounded-lg transition-all duration-300 ${isCurrentWord ? "bg-brand/10 ring-1 ring-brand/40 shadow-[0_0_15px_rgba(212,86,10,0.1)]" : ""}`}
        >
          {wordChars}
          <span className={spaceColor}>&nbsp;</span>
        </span>
      );
      charCount += word.length + 1;
      return element;
    });
  };

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top HUD */}
        <div className="flex items-center justify-between bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-panel-border/50 shadow-2xl ring-1 ring-white/5">
          <div className="flex items-center space-x-8">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Time Remaining
              </p>
              <div className="text-4xl font-black text-brand-light font-mono flex items-center">
                <Clock className="h-6 w-6 mr-3 opacity-50" />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-8 text-right">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Mistakes
              </p>
              <div className="text-4xl font-black text-red-400 font-mono flex items-center justify-end">
                <AlertCircle className="h-5 w-5 mr-2 opacity-50" />
                {errors}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Live Speed
              </p>
              <div className="text-4xl font-black text-white font-mono flex items-center justify-end">
                {wpm} <span className="text-lg text-slate-500 ml-2">WPM</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Accuracy
              </p>
              <div className="text-4xl font-black text-white font-mono flex items-center justify-end">
                {accuracy}
                <span className="text-lg text-slate-500 ml-1">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Typing Canvas */}
        <Card className="border-brand/20 relative overflow-hidden bg-panel-base min-h-[450px] shadow-2xl rounded-3xl ring-1 ring-white/5">
          <CardContent className="p-10">
            {/* Sync Countdown Overlay */}
            <AnimatePresence>
              {countdown > 0 && activeSession && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center"
                >
                  <motion.span
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    className="text-9xl font-black text-brand"
                  >
                    {countdown}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
            {sessionCompleted ? (
              <div className="absolute inset-0 z-10 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
                <Trophy className="h-20 w-20 text-amber-400 mb-6" />
                <h2 className="text-4xl font-bold text-white mb-2">
                  Test Complete!
                </h2>
                <p className="text-slate-400 mb-8 text-lg">
                  Your results have been sent to your team leader.
                </p>

                {submitting ? (
                  <div className="text-brand-light animate-pulse">
                    Calculating final score...
                  </div>
                ) : finalResult ? (
                  <div className="flex space-x-8 mb-10">
                    <div className="text-center bg-brand/10 p-6 rounded-2xl border border-brand/30 w-40 shadow-lg shadow-brand/10">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                        Final Speed
                      </p>
                      <p className="text-4xl font-black text-brand-light">
                        {finalResult.wpm}
                        <span className="text-lg ml-1 font-bold">WPM</span>
                      </p>
                    </div>
                    <div className="text-center bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/30 w-40 shadow-lg shadow-emerald-500/10">
                      <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">
                        Accuracy
                      </p>
                      <p className="text-4xl font-black text-emerald-400">
                        {finalResult.accuracy}%
                      </p>
                    </div>
                  </div>
                ) : null}

                <Button
                  size="lg"
                  onClick={handleReturnToDashboard}
                  disabled={submitting}
                >
                  Return to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ) : null}

            {/* Subtle background text effect */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none overflow-hidden font-mono text-[10rem] font-black leading-none break-all p-4">
              TYPINGTEST ARENA SYSTEM ACTIVE
            </div>

            <div className="select-none pointer-events-none relative z-0 mt-8 leading-relaxed">
              {renderText()}
            </div>

            {!sessionCompleted && (
              <div className="absolute top-4 left-4">
                <Badge
                  variant="primary"
                  className="animate-pulse flex items-center"
                >
                  <div className="h-2 w-2 rounded-full bg-white mr-2"></div>{" "}
                  Focus Mode Active
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-sm">
          Start typing to begin. The timer is synchronized with your Team
          Leader. Spacebar prevents page scrolling.
        </p>
      </div>
    </DashboardShell>
  );
}
