"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Helper to prevent SSR hydration mismatches with Recharts
const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
};

// 1. WPM Progress Over Time Area Chart
interface WpmChartProps {
  data: { label: string; wpm: number }[];
}

export const WpmProgressChart: React.FC<WpmChartProps> = ({ data }) => {
  const mounted = useHasMounted();
  if (!mounted) return <div className="h-72 w-full animate-pulse bg-slate-900/40 rounded-xl" />;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="wpmGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4560a" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#d4560a" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#332f28" opacity={0.5} />
          <XAxis dataKey="label" stroke="#6a6454" fontSize={11} tickLine={false} />
          <YAxis stroke="#6a6454" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1c1a16",
              borderColor: "#332f28",
              borderRadius: "8px",
              color: "#f0ece3",
            }}
          />
          <Area
            type="monotone"
            dataKey="wpm"
            stroke="#d4560a"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#wpmGlow)"
            name="Words Per Minute"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Accuracy Trend Over Time Line Chart
interface AccuracyChartProps {
  data: { label: string; accuracy: number }[];
}

export const AccuracyTrendChart: React.FC<AccuracyChartProps> = ({ data }) => {
  const mounted = useHasMounted();
  if (!mounted) return <div className="h-72 w-full animate-pulse bg-slate-900/40 rounded-xl" />;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#332f28" opacity={0.5} />
          <XAxis dataKey="label" stroke="#6a6454" fontSize={11} tickLine={false} />
          <YAxis domain={[50, 100]} stroke="#6a6454" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1c1a16",
              borderColor: "#332f28",
              borderRadius: "8px",
              color: "#f0ece3",
            }}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#6ee7b7"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            name="Accuracy %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Horizontal Group Rankings / Leaderboards
interface LeaderboardChartProps {
  data: { name: string; wpm: number }[];
}

export const LeaderboardBarChart: React.FC<LeaderboardChartProps> = ({ data }) => {
  const mounted = useHasMounted();
  if (!mounted) return <div className="h-72 w-full animate-pulse bg-slate-900/40 rounded-xl" />;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#332f28" opacity={0.3} horizontal={false} />
          <XAxis type="number" stroke="#6a6454" fontSize={11} tickLine={false} />
          <YAxis dataKey="name" type="category" stroke="#6a6454" fontSize={11} width={80} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1c1a16",
              borderColor: "#332f28",
              borderRadius: "8px",
              color: "#f0ece3",
            }}
          />
          <Bar
            dataKey="wpm"
            fill="#e87a3a"
            radius={[0, 4, 4, 0]}
            name="WPM Score"
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
