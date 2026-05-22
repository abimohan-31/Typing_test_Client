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
      
      // Auto join group room if student is in a group
      const groupId = (profile as any)?.groupId?._id || (profile as any)?.groupId;
      if (groupId && user?.role === "student") {
        socket.emit("joinGroup", { groupId });
      }
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onSessionStarted(data: { text: string; duration: number; sessionId?: string }) {
      // In backend, duration is sent as duration in minutes. In group start session, duration in seconds.
      // In sessionSocket.js: const timerInterval = setInterval(() => { timeLeft -= 1; io.to(groupId).emit("timerSync", { timeLeft }); ... })
      // and let timeLeft = duration * 60;
      // That means sessionStarted duration in socket payload is minutes.
      // Let's multiply duration * 60 to convert it to seconds!
      const durationSeconds = data.duration * 60;
      
      // Update Socket Store
      startActiveSession(data.text, durationSeconds, data.sessionId);
      
      // Update local typing engine
      setSessionText(data.text, durationSeconds);

      // Instantly navigate student to the synchronized test interface
      if (user?.role === "student") {
        router.push("/student/test");
      }
    }

    function onTimerSync(data: { timeLeft: number }) {
      setTimeLeft(data.timeLeft);
    }

    function onSessionUpdate(data: { userId: string; wpm: number; accuracy: number }) {
      updateParticipantProgress(data.userId, data.wpm, data.accuracy);
    }

    function onNewResult(data: any) {
      addLiveResult({
        groupId: data.groupId,
        userId: data.userId,
        userName: data.userName || "Student",
        wpm: data.wpm,
        accuracy: data.accuracy,
      });
    }

    function onSessionEnded() {
      completeSession();
    }

    // Connect socket if not connected
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
    router,
  ]);

  return <>{children}</>;
}
