import { Timestamp } from "firebase-admin/firestore";
import { BaseDocument } from "./index";

export interface StudyRoom extends BaseDocument {
  name: string;
  description?: string;
  subject?: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  visibility: RoomVisibility;
  status: RoomStatus;
  maxParticipants: number;
  currentParticipants: number;
  participants: Record<string, RoomParticipant>;
  timer: RoomTimer;
  settings: RoomSettings;
  stats: RoomStats;
  endedAt?: Timestamp;
}

export type RoomVisibility = "public" | "private";
export type RoomStatus = "waiting" | "active" | "paused" | "completed" | "ended";
export type TimerPhase = "focus" | "shortBreak" | "longBreak";
export type ParticipantRole = "host" | "participant";

export interface RoomParticipant {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: ParticipantRole;
  joinedAt: Timestamp;
  isActive: boolean;
  studyTime: number; // in seconds
}

export interface RoomTimer {
  focusTime: number; // in seconds
  shortBreakTime: number; // in seconds
  longBreakTime: number; // in seconds
  currentSession: number;
  totalSessions: number;
  currentPhase: TimerPhase;
  timeRemaining: number; // in seconds
  isRunning: boolean;
  startedAt: Timestamp | null;
  pausedAt: Timestamp | null;
}

export interface RoomSettings {
  autoStartBreaks: boolean;
  allowLateJoin: boolean;
  showParticipantProgress: boolean;
  muteChat: boolean;
}

export interface RoomStats {
  totalFocusTime: number; // in seconds
  totalBreakTime: number; // in seconds
  sessionsCompleted: number;
  participantCount: number;
}

export interface RoomResources {
  links: string[];
  files: string[]; // Storage file references
}

// Request/Response Types
export interface CreateRoomData {
  name: string;
  description?: string;
  subject?: string;
  visibility: RoomVisibility;
  maxParticipants?: number;
  focusTime?: number; // in minutes
  shortBreakTime?: number; // in minutes
  longBreakTime?: number; // in minutes
}

export interface UpdateRoomData {
  name?: string;
  description?: string;
  visibility?: RoomVisibility;
  maxParticipants?: number;
  status?: RoomStatus;
}

export interface JoinRoomData {
  roomId: string;
}

export interface TimerUpdateData {
  action: "start" | "pause" | "resume" | "stop" | "reset" | "nextPhase";
  roomId: string;
}

export interface TimerState {
  phase: TimerPhase;
  timeRemaining: number;
  isRunning: boolean;
  session: number;
  totalSessions: number;
}
