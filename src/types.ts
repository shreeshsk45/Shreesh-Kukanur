export type SubjectType = 'theory' | 'lab';

export type BatchType = 'All' | 'C1' | 'C2' | 'C3';

export type SafetyTier = 'safe' | 'warning' | 'danger'; // Green >=80%, Amber 75-79.9%, Red <75%

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: SubjectType;
  targetThreshold: number; // e.g. 0.75 for 75%
  attended: number;
  held: number;
  color: string;
  room?: string;
  faculty?: string;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: number; // 1 = Monday, 2 = Tuesday, ... 6 = Saturday
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  subjectId: string;
  type: SubjectType;
  room: string;
  batch: BatchType;
}

export interface HolidayItem {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: 'holiday' | 'exam' | 'break';
}

export interface AcademicCalendar {
  semesterStartDate: string; // YYYY-MM-DD (e.g. 2026-08-01)
  targetEndDate: string; // YYYY-MM-DD (e.g. 2026-09-26)
  currentDate: string; // YYYY-MM-DD (e.g. 2026-08-27)
  holidays: HolidayItem[];
}

export interface GraceCredit {
  id: string;
  subjectId: string; // 'all' or subjectId
  count: number;
  reason: string;
  dateAdded: string;
  applied: boolean;
}

export type SlotAction = 'default' | 'hypothetical_bunk' | 'hypothetical_attend' | 'cancelled';

export interface ProjectedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  type: SubjectType;
  room: string;
  batch: BatchType;
  isPastOrToday: boolean;
  isToday: boolean;
  action: SlotAction;
  isSafeToSkip: boolean;
  isCompulsory: boolean;
  cumulativeHeldAfter: number;
  cumulativeAttendedAfter: number;
  projectedPctAfter: number;
}

export interface SubjectMetrics {
  subjectId: string;
  name: string;
  code: string;
  type: SubjectType;
  attended: number;
  held: number;
  graceCredits: number;
  effectiveAttended: number;
  currentPercentage: number;
  targetThreshold: number;
  safeBunks: number;
  compulsoryNeeded: number;
  safetyTier: SafetyTier;
  color: string;
  projectedFinalPct?: number;
  projectedSafeBunks?: number;
}

export interface AggregateMetrics {
  totalAttended: number;
  totalHeld: number;
  totalGrace: number;
  effectiveAttended: number;
  overallPercentage: number;
  averageThreshold: number;
  safeBunksAvailable: number;
  compulsoryClassesNeeded: number;
  safetyTier: SafetyTier;
  totalBunked: number;
  totalProjectedSlotsRemaining: number;
}

export interface TrajectoryPoint {
  date: string;
  displayDate: string;
  held: number;
  attended: number;
  percentage: number;
  whatIfPercentage?: number;
  threshold: number;
  events?: string[];
  slotsCount: number;
}

export interface AttendanceHistoryEntry {
  id: string;
  date: string;
  slotId: string;
  subjectId: string;
  status: 'attended' | 'bunked' | 'cancelled';
  timestamp: number;
}
