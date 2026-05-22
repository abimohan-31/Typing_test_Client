export type UserRole = "student" | "team-leader" | "admin";

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  _id: string;
  userId: string;
  name: string;
  groupId: string | Group | null;
  pictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamLeaderProfile {
  _id: string;
  userId: string;
  name: string;
  pictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  leaderId: string | { _id: string; email: string; name?: string };
  members: string[] | { _id: string; email: string; name: string; role: string }[];
  activeSession: boolean;
  sessionStartTime?: string | null;
  sessionDuration?: number | null; // in seconds
  createdAt: string;
  updatedAt: string;
}

export interface SessionResult {
  userId: string | { _id: string; email: string };
  wpm: number;
  accuracy: number;
  submittedAt: string;
}

export interface TypingSession {
  _id: string;
  groupId: string;
  text: string;
  duration: number; // in minutes
  startedAt: string;
  status: "pending" | "active" | "completed";
  results: SessionResult[];
  createdAt: string;
  updatedAt: string;
}

// WebSocket Payloads
export interface SocketJoinGroupPayload {
  groupId: string;
}

export interface SocketUpdateProgressPayload {
  sessionId: string;
  wpm: number;
  accuracy: number;
  userId: string;
}

export interface SocketSessionStartedPayload {
  groupId: string;
  text: string;
  duration: number; // in seconds
}

export interface SocketTimerSyncPayload {
  timeLeft: number; // in seconds
}

export interface SocketNewResultPayload {
  groupId: string;
  userId: string;
  userName: string;
  wpm: number;
  accuracy: number;
}

export interface SocketLiveUpdate {
  userId: string;
  userName?: string;
  wpm: number;
  accuracy: number;
  timestamp: number;
}
