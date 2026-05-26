import { useState, useEffect, useCallback, useRef } from "react";

interface TypingEngineState {
  typed: string;
  cursorIndex: number;
  errors: number;
  accuracy: number;
  wpm: number;
  totalKeystrokes: number;
}

// A simple Web Audio API synthesizer for typewriter sounds
class TypewriterSound {
  private ctx: AudioContext | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playKeystroke() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(800 + Math.random() * 200, this.ctx.currentTime); // Slight randomization
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playError() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}

export function useTypingEngine(targetText: string, isActive: boolean, elapsedMinutes: number) {
  const [state, setState] = useState<TypingEngineState>({
    typed: "",
    cursorIndex: 0,
    errors: 0,
    accuracy: 100,
    wpm: 0,
    totalKeystrokes: 0,
  });

  const soundEngineRef = useRef<TypewriterSound | null>(null);

  useEffect(() => {
    soundEngineRef.current = new TypewriterSound();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive) return;

      // Prevent default scrolling for Space
      if (e.key === " ") {
        e.preventDefault();
      }

      // Handle Backspace
      if (e.key === "Backspace") {
        setState((prev) => {
          if (prev.typed.length === 0) return prev;
          
          // We don't reduce errors on backspace for a strict test, but we do update cursor
          const newTyped = prev.typed.slice(0, -1);
          return {
            ...prev,
            typed: newTyped,
            cursorIndex: newTyped.length,
          };
        });
        soundEngineRef.current?.playKeystroke();
        return;
      }

      // Ignore non-character keys (Shift, Ctrl, Alt, Meta, etc)
      if (e.key.length > 1) return;

      // Process Character
      setState((prev) => {
        // Stop accepting input if they reached the end
        if (prev.typed.length >= targetText.length) return prev;

        const expectedChar = targetText[prev.cursorIndex];
        const typedChar = e.key;
        
        const isError = expectedChar !== typedChar;
        const newErrors = prev.errors + (isError ? 1 : 0);
        const newTyped = prev.typed + typedChar;
        const newTotalKeystrokes = prev.totalKeystrokes + 1;

        if (isError) {
          soundEngineRef.current?.playError();
        } else {
          soundEngineRef.current?.playKeystroke();
        }

        // Calculate Accuracy
        const correctChars = newTotalKeystrokes - newErrors;
        const newAccuracy = Math.max(0, Math.round((correctChars / newTotalKeystrokes) * 100));

        // Calculate WPM
        // WPM = (Total characters typed / 5) / elapsed time in minutes
        let newWpm = prev.wpm;
        if (elapsedMinutes > 0) {
          // Standard typing test formula: 1 word = 5 characters
          const grossWpm = (newTyped.length / 5) / elapsedMinutes;
          // Net WPM = Gross WPM - (Errors / elapsedMinutes)
          // We'll stick to a simpler standard gross WPM for positive reinforcement in practice mode
          newWpm = Math.max(0, Math.round(grossWpm));
        }

        return {
          typed: newTyped,
          cursorIndex: newTyped.length,
          errors: newErrors,
          accuracy: newAccuracy,
          wpm: newWpm,
          totalKeystrokes: newTotalKeystrokes,
        };
      });
    },
    [isActive, targetText, elapsedMinutes]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return state;
}
