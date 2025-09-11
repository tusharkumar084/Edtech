import { Timestamp } from "firebase-admin/firestore";
import { TimestampedDocument } from "./index";

export interface Session extends TimestampedDocument {
  roomId: string;
  startedAt: Timestamp;
  endedAt?: Timestamp;
  duration: number; // in minutes
  participants: string[]; // Clerk user IDs
  analytics: SessionAnalytics;
}

export interface SessionAnalytics {
  joinEvents: Timestamp[];
  leaveEvents: Timestamp[];
  timerEvents: TimerEvent[];
  peakParticipants: number;
  averageParticipants: number;
}

export interface TimerEvent {
  action: "start" | "pause" | "resume" | "stop" | "reset";
  timestamp: Timestamp;
  triggeredBy: string; // Clerk user ID
}

export interface CreateSessionData {
  roomId: string;
  participants: string[];
  startedAt?: Timestamp;
}

export interface SessionMetrics {
  totalSessions: number;
  totalDuration: number; // in minutes
  averageDuration: number;
  averageParticipants: number;
  mostActiveHours: number[];
}
