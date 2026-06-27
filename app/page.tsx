"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "../store/useAuthStore";
import { ArrowRight, BarChart2, Users, Trophy } from "lucide-react";

// Animated typing demo widget
function TypingDemo() {
  const text = "The quick brown fox jumps over the lazy dog today";
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pause" | "reset">("typing");

  useEffect(() => {
    if (phase === "typing") {
      if (typed < text.length) {
        const t = setTimeout(() => setTyped((n) => n + 1), 55 + Math.random() * 40);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("pause"), 1800);
        return () => clearTimeout(t);
      }
    }
    if (phase === "pause") {
      const t = setTimeout(() => setPhase("reset"), 600);
      return () => clearTimeout(t);
    }
    if (phase === "reset") {
      setTyped(0);
      setPhase("typing");
    }
  }, [typed, phase, text.length]);

  const wpm = phase === "typing" && typed > 10 ? Math.round((typed / 5) / 0.04) : 94;
  const accuracy = 98;
  const avgKey = 4.2;

  return (
    <div
      style={{
        background: "#1a1b22",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
        fontFamily: "'GeistMono', 'Fira Mono', 'Courier New', monospace",
        width: "100%",
        maxWidth: 480,
      }}
    >
      {/* Traffic lights */}
      <div style={{ display: "flex", gap: 7, padding: "14px 18px 10px", background: "#141519" }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
      </div>

      {/* Typing text */}
      <div style={{ padding: "22px 24px 18px", minHeight: 110 }}>
        <p style={{ fontSize: 15, lineHeight: 2, letterSpacing: "0.01em", margin: 0, color: "#9aa0b4", wordBreak: "break-word" }}>
          {text.split("").map((char, i) => {
            let color = "#4a5068";
            if (i < typed) color = "#e8e3d8";
            if (i === typed) color = "#fff";
            const isCurrent = i === typed;
            return (
              <span
                key={i}
                style={{
                  color,
                  borderBottom: isCurrent ? "2px solid #d4560a" : "none",
                  animation: isCurrent ? "blink 0.9s step-end infinite" : "none",
                }}
              >
                {char}
              </span>
            );
          })}
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
        </p>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: "1px solid #252730",
        }}
      >
        {[
          { value: phase === "typing" && typed > 15 ? Math.min(wpm, 99) : 94, label: "WPM" },
          { value: accuracy + "%", label: "ACCURACY" },
          { value: avgKey + "s", label: "AVG. KEY" },
        ].map(({ value, label }) => (
          <div
            key={label}
            style={{
              padding: "14px 0",
              textAlign: "center",
              borderRight: "1px solid #252730",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: "#d4560a", fontFamily: "inherit" }}>{value}</div>
            <div style={{ fontSize: 10, color: "#5a6080", letterSpacing: "0.08em", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuthStore();

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "team-leader") return "/leader";
    return "/student";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0ece3",
        color: "#1a1710",
        fontFamily: "'Geist', 'Inter', system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* NAV */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(240,236,227,0.88)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #ddd8cc",
          padding: "0 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
        }}
      >
        {/* Logo */}
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", color: "#1a1710" }}>
          Type{" "}
          <span style={{ color: "#d4560a", fontStyle: "italic" }}>Core</span>
        </span>

        <nav style={{ display: "flex", gap: 36, alignItems: "center" }}>
          <Link href="/features" style={{ fontSize: 14, color: "#4a4436", textDecoration: "none", fontWeight: 500 }}>
            Features
          </Link>
          <Link href="/about" style={{ fontSize: 14, color: "#4a4436", textDecoration: "none", fontWeight: 500 }}>
            Pricing
          </Link>
          <Link href="/about" style={{ fontSize: 14, color: "#4a4436", textDecoration: "none", fontWeight: 500 }}>
            About
          </Link>
        </nav>

        <Link
          href={user ? getDashboardLink() : "/login"}
          style={{
            background: "#1a1710",
            color: "#f0ece3",
            padding: "8px 20px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            letterSpacing: "-0.01em",
          }}
        >
          {user ? "Dashboard" : "Sign In"}
        </Link>
      </header>

      {/* HERO */}
      <main style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px" }}>
        {/* Eyebrow */}
        <div style={{ paddingTop: 72, display: "flex", justifyContent: "flex-start" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#e8dfc8",
              border: "1px solid #d4c9b0",
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.10em",
              color: "#7a5c30",
              textTransform: "uppercase",
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#d4560a", display: "inline-block" }} />
            Centralized Typing Platform
          </span>
        </div>

        {/* Hero grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
            paddingTop: 48,
            paddingBottom: 96,
          }}
        >
          {/* Left */}
          <div>
            <h1
              style={{
                fontSize: "clamp(40px, 5vw, 62px)",
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: "-0.035em",
                margin: "0 0 8px",
                color: "#1a1710",
              }}
            >
              Master typing,
            </h1>
            <h1
              style={{
                fontSize: "clamp(40px, 5vw, 62px)",
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: "-0.035em",
                margin: "0 0 24px",
                color: "#d4560a",
                fontStyle: "italic",
              }}
            >
              together.
            </h1>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                color: "#5a5040",
                maxWidth: 400,
                margin: "0 0 36px",
              }}
            >
              TypeCore brings admins, team leaders, and students into one unified system — track progress, run tests, and build typing excellence across your organization.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                href={user ? getDashboardLink() : "/register?role=student"}
                style={{
                  background: "#d4560a",
                  color: "#fff",
                  padding: "13px 28px",
                  borderRadius: 9,
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Get Started Free
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/features"
                style={{
                  background: "transparent",
                  color: "#1a1710",
                  padding: "13px 24px",
                  borderRadius: 9,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  border: "1.5px solid #c8bfa8",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                View Demo →
              </Link>
            </div>
          </div>

          {/* Right — demo widget */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <TypingDemo />
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div style={{ paddingBottom: 24 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#9a8c70",
              marginBottom: 20,
            }}
          >
            Platform Features
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#1a1710",
              margin: "0 0 48px",
              lineHeight: 1.1,
            }}
          >
            Everything you need
            <br />
            in one place
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              {
                icon: <BarChart2 size={22} color="#d4560a" />,
                title: "Real-time Analytics",
                desc: "Track WPM, accuracy, and improvement trends live across every session and team member.",
              },
              {
                icon: <Users size={22} color="#d4560a" />,
                title: "Team Management",
                desc: "Organize students into teams, assign sessions, and monitor group performance at a glance.",
              },
              {
                icon: <Trophy size={22} color="#d4560a" />,
                title: "Leaderboards",
                desc: "Motivate learners with real-time rankings. Healthy competition drives measurable results.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: "#ebe5d8",
                  border: "1px solid #ddd5c0",
                  borderRadius: 14,
                  padding: "28px 28px 30px",
                  transition: "box-shadow 0.2s",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    background: "#f5efe4",
                    border: "1px solid #ddd5c0",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 18,
                  }}
                >
                  {icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px", color: "#1a1710", letterSpacing: "-0.01em" }}>
                  {title}
                </h3>
                <p style={{ fontSize: 14, color: "#6a5e48", lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* STATS STRIP */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            background: "#1a1710",
            borderRadius: 16,
            margin: "56px 0 72px",
            overflow: "hidden",
          }}
        >
          {[
            { value: "100%", label: "Real-Time Sync" },
            { value: "<15ms", label: "Socket Latency" },
            { value: "Curated", label: "Practice Libraries" },
            { value: "99.8%", label: "Accuracy Target" },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              style={{
                padding: "36px 28px",
                borderRight: i < 3 ? "1px solid #2e2b24" : "none",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: i < 2 ? "#f0ece3" : "#d4560a",
                  letterSpacing: "-0.03em",
                  marginBottom: 6,
                }}
              >
                {value}
              </div>
              <div style={{ fontSize: 11, color: "#6a6454", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid #ddd8cc",
          background: "#ebe5d8",
          padding: "24px 48px",
          textAlign: "center",
          fontSize: 13,
          color: "#9a8c70",
        }}
      >
        © {new Date().getFullYear()} TypeCore. Built with Next.js & Socket.IO. All Rights Reserved.
      </footer>
    </div>
  );
}