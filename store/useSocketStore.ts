import { create } from "zustand";
import { TypingSession, SocketLiveUpdate, SocketNewResultPayload } from "../types";

interface SocketState {
  isConnected: boolean;
  activeSession: {
    sessionId?: string;
    text: string;
    duration: number; // in seconds
  } | null;
  timeLeft: number; // in seconds
  participantsProgress: Record<string, { wpm: number; accuracy: number; name?: string }>;
  liveResults: Array<SocketNewResultPayload>;

  setConnected: (connected: boolean) => void;
  startActiveSession: (text: string, duration: number, sessionId?: string) => void;
  setTimeLeft: (timeLeft: number) => void;
  updateParticipantProgress: (userId: string, wpm: number, accuracy: number, name?: string) => void;
  addLiveResult: (result: SocketNewResultPayload) => void;
  clearSessionState: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  activeSession: null,
  timeLeft: 0,
  participantsProgress: {},
  liveResults: [],

  setConnected: (isConnected) => set({ isConnected }),
  
  startActiveSession: (text, duration, sessionId) => set({
    activeSession: { text, duration, sessionId },
    timeLeft: duration,
    participantsProgress: {},
    liveResults: [],
  }),

  setTimeLeft: (timeLeft) => set({ timeLeft }),

  updateParticipantProgress: (userId, wpm, accuracy, name) => set((state) => ({
    participantsProgress: {
      ...state.participantsProgress,
      [userId]: { wpm, accuracy, name: name || state.participantsProgress[userId]?.name || "Student" },
    },
  })),

  addLiveResult: (result) => set((state) => {
    // Prevent duplicate entries
    const exists = state.liveResults.some(r => r.userId === result.userId);
    if (exists) {
      return {
        liveResults: state.liveResults.map(r => r.userId === result.userId ? result : r)
      };
    }
    return {
      liveResults: [...state.liveResults, result].sort((a, b) => b.wpm - a.wpm),
    };
  }),

  clearSessionState: () => set({
    activeSession: null,
    timeLeft: 0,
    participantsProgress: {},
    liveResults: [],
  }),
}));
