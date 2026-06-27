"use client";

import React, { useEffect } from "react";
import { socket } from "../sockets/client";
import { useSocketStore } from "../store/useSocketStore";
import { useTypingStore } from "../store/useTypingStore";
import { useAuthStore } from "../store/useAuthStore";
import { useRouter } from "next/navigation";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = useAuthStore();
  const {
    setConnected,
    startActiveSession,
    setTimeLeft,
    updateParticipantProgress,
    addLiveResult,
    clearSessionState,
  } = useSocketStore();

  const { completeSession, setSessionText } = useTypingStore();
  const router = useRouter();

  useEffect(() => {
    // Only bind if authenticated
    if (!user) return;

    function onConnect() {
      setConnected(true);

      const groupId =
        (profile as any)?.groupId?._id || (profile as any)?.groupId;
      if (groupId) {
        socket.emit("joinGroup", { groupId: groupId.toString() });
      }
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onSessionStarted(data: { text: string; duration: number; sessionId?: string }) {
      const durationSeconds = data.duration * 60;
      startActiveSession(data.text, durationSeconds, data.sessionId);
      setSessionText(data.text, durationSeconds);

      if (data.sessionId) {
        socket.emit("joinSession", data.sessionId);
      }

      if (user?.role === "student") {
        router.push("/student/test");
      }
    }

    function onTimerSync(data: { timeLeft: number }) {
      setTimeLeft(data.timeLeft);
    }

    function onSessionUpdate(data: {
      userId: string;
      wpm: number;
      accuracy: number;
      name?: string;
      errors?: number;
    }) {
      updateParticipantProgress(
        data.userId,
        data.wpm,
        data.accuracy,
        data.name,
        data.errors,
      );
    }

    function onNewResult(data: any) {
      addLiveResult({
        groupId: data.groupId,
        userId: data.userId,
        userName: data.userName || data.name || "Student",
        wpm: data.wpm,
        accuracy: data.accuracy,
      });
    }

    function onSessionEnded() {
      completeSession();
      // Students must stay on the test page long enough to submit and view results.
      // Leader/admin dashboards can clear immediately.
      if (user?.role !== "student") {
        clearSessionState();
      }
    }
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("sessionStarted", onSessionStarted);
    socket.on("timerSync", onTimerSync);
    socket.on("sessionUpdate", onSessionUpdate);
    socket.on("newResult", onNewResult);
    socket.on("sessionEnded", onSessionEnded);

    // Initial sync
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("sessionStarted", onSessionStarted);
      socket.off("timerSync", onTimerSync);
      socket.off("sessionUpdate", onSessionUpdate);
      socket.off("newResult", onNewResult);
      socket.off("sessionEnded", onSessionEnded);
    };
  }, [
    user,
    profile,
    setConnected,
    startActiveSession,
    setTimeLeft,
    updateParticipantProgress,
    addLiveResult,
    completeSession,
    setSessionText,
    clearSessionState,
    router,
  ]);

  return <>{children}</>;
}
