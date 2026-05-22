import { create } from "zustand";

interface TypingState {
  text: string;
  typedText: string;
  duration: number; // in seconds
  timeSpent: number; // in seconds
  isTyping: boolean;
  isCompleted: boolean;
  soundEnabled: boolean;
  focusMode: boolean;
  wpm: number;
  accuracy: number;
  mistakes: number;
  
  setSessionText: (text: string, duration: number) => void;
  setTypedText: (typed: string) => void;
  incrementTimeSpent: () => void;
  toggleSound: () => void;
  toggleFocus: () => void;
  completeSession: () => void;
  resetTyping: () => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  text: "",
  typedText: "",
  duration: 60,
  timeSpent: 0,
  isTyping: false,
  isCompleted: false,
  soundEnabled: true,
  focusMode: false,
  wpm: 0,
  accuracy: 0,
  mistakes: 0,

  setSessionText: (text, duration) => set({
    text,
    duration,
    typedText: "",
    timeSpent: 0,
    isTyping: false,
    isCompleted: false,
    wpm: 0,
    accuracy: 0,
    mistakes: 0,
  }),

  setTypedText: (typed) => set((state) => {
    if (state.isCompleted) return {};

    const isFirstChar = !state.isTyping && typed.length > 0;
    
    // Calculate mistakes
    let mistakes = 0;
    const minLen = Math.min(state.text.length, typed.length);
    for (let i = 0; i < minLen; i++) {
      if (state.text[i] !== typed[i]) {
        mistakes++;
      }
    }

    // Calculate accuracy
    let accuracy = 100;
    if (typed.length > 0) {
      let correctChars = 0;
      for (let i = 0; i < typed.length; i++) {
        if (state.text[i] === typed[i]) {
          correctChars++;
        }
      }
      accuracy = Math.round((correctChars / typed.length) * 100);
    }

    // Calculate WPM
    // Standard WPM formula: (total correct typed characters / 5) / timeTakenMinutes
    let wpm = 0;
    const elapsedMinutes = state.timeSpent > 0 ? state.timeSpent / 60 : 1 / 60; // fallback to 1 second
    const typedWords = typed.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    if (typed.length > 0) {
      wpm = Math.round(typedWords / elapsedMinutes);
    }

    // Check if finished
    const isCompleted = typed.length >= state.text.length;

    return {
      typedText: typed,
      isTyping: isFirstChar ? true : state.isTyping,
      mistakes,
      accuracy,
      wpm,
      isCompleted,
    };
  }),

  incrementTimeSpent: () => set((state) => {
    if (!state.isTyping || state.isCompleted) return {};
    const newTime = state.timeSpent + 1;
    
    // Recalculate WPM upon time tick
    const elapsedMinutes = newTime / 60;
    const typedWords = state.typedText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const wpm = state.typedText.length > 0 ? Math.round(typedWords / elapsedMinutes) : 0;

    return {
      timeSpent: newTime,
      wpm,
    };
  }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleFocus: () => set((state) => ({ focusMode: !state.focusMode })),
  
  completeSession: () => set({ isCompleted: true, isTyping: false }),
  
  resetTyping: () => set((state) => ({
    typedText: "",
    timeSpent: 0,
    isTyping: false,
    isCompleted: false,
    wpm: 0,
    accuracy: 0,
    mistakes: 0,
  })),
}));
