import { useState, useEffect, useCallback } from 'react';
import {
  Subject,
  TimetableSlot,
  AcademicCalendar,
  GraceCredit,
  HolidayItem,
  BatchType,
  SlotAction,
  AggregateMetrics,
  SubjectMetrics,
  ProjectedSlot,
  TrajectoryPoint,
} from '../types';
import {
  calculateAggregateMetrics,
  calculateSubjectMetrics,
  generateProjectedSlots,
  generateTrajectoryPoints,
} from './attendanceEngine';

const STORAGE_KEY_PREFIX = 'bunksmart_v1_';

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub_os',
    name: 'Operating Systems',
    code: 'CS301',
    type: 'theory',
    targetThreshold: 0.75,
    attended: 22,
    held: 26,
    color: '#3B82F6', // Blue
    room: 'LH-301',
    faculty: 'Dr. A. Sharma',
  },
  {
    id: 'sub_dbms',
    name: 'Database Management Systems',
    code: 'CS302',
    type: 'theory',
    targetThreshold: 0.75,
    attended: 25,
    held: 28,
    color: '#10B981', // Emerald
    room: 'LH-302',
    faculty: 'Prof. K. Rao',
  },
  {
    id: 'sub_cn',
    name: 'Computer Networks',
    code: 'CS303',
    type: 'theory',
    targetThreshold: 0.75,
    attended: 18,
    held: 24, // 75% edge
    color: '#F59E0B', // Amber
    room: 'LH-303',
    faculty: 'Dr. M. Roy',
  },
  {
    id: 'sub_dm',
    name: 'Discrete Mathematics',
    code: 'CS304',
    type: 'theory',
    targetThreshold: 0.75,
    attended: 20,
    held: 28, // 71.4% (deficit)
    color: '#EC4899', // Pink
    room: 'LH-304',
    faculty: 'Prof. S. Gupta',
  },
  {
    id: 'sub_dld_lab',
    name: 'Digital Logic & Design Lab',
    code: 'CS305P',
    type: 'lab',
    targetThreshold: 0.75,
    attended: 8,
    held: 9,
    color: '#8B5CF6', // Purple
    room: 'Hardware Lab-2',
    faculty: 'Er. N. Patel',
  },
];

export const DEFAULT_CALENDAR: AcademicCalendar = {
  semesterStartDate: '2026-08-01',
  currentDate: '2026-08-27',
  targetEndDate: '2026-09-26',
  holidays: [
    {
      id: 'hol_1',
      date: '2026-08-15',
      name: 'Independence Day',
      type: 'holiday',
    },
    {
      id: 'hol_2',
      date: '2026-09-04',
      name: 'Janmashtami Break',
      type: 'holiday',
    },
    {
      id: 'hol_3',
      date: '2026-09-14',
      name: 'Ganesh Chaturthi',
      type: 'holiday',
    },
    {
      id: 'hol_4',
      date: '2026-09-21',
      name: 'Midterm Study Day',
      type: 'break',
    },
  ],
};

export const DEFAULT_TIMETABLE: TimetableSlot[] = [
  // Monday (1)
  { id: 'tt_m1', dayOfWeek: 1, startTime: '09:00', endTime: '10:00', subjectId: 'sub_os', type: 'theory', room: 'LH-301', batch: 'All' },
  { id: 'tt_m2', dayOfWeek: 1, startTime: '10:00', endTime: '11:00', subjectId: 'sub_dbms', type: 'theory', room: 'LH-302', batch: 'All' },
  { id: 'tt_m3', dayOfWeek: 1, startTime: '11:15', endTime: '12:15', subjectId: 'sub_cn', type: 'theory', room: 'LH-303', batch: 'All' },
  { id: 'tt_m4', dayOfWeek: 1, startTime: '14:00', endTime: '16:00', subjectId: 'sub_dld_lab', type: 'lab', room: 'HW Lab-2', batch: 'C1' },

  // Tuesday (2)
  { id: 'tt_t1', dayOfWeek: 2, startTime: '09:00', endTime: '10:00', subjectId: 'sub_dm', type: 'theory', room: 'LH-304', batch: 'All' },
  { id: 'tt_t2', dayOfWeek: 2, startTime: '10:00', endTime: '11:00', subjectId: 'sub_os', type: 'theory', room: 'LH-301', batch: 'All' },
  { id: 'tt_t3', dayOfWeek: 2, startTime: '11:15', endTime: '12:15', subjectId: 'sub_dbms', type: 'theory', room: 'LH-302', batch: 'All' },

  // Wednesday (3)
  { id: 'tt_w1', dayOfWeek: 3, startTime: '09:00', endTime: '10:00', subjectId: 'sub_cn', type: 'theory', room: 'LH-303', batch: 'All' },
  { id: 'tt_w2', dayOfWeek: 3, startTime: '10:00', endTime: '11:00', subjectId: 'sub_dm', type: 'theory', room: 'LH-304', batch: 'All' },
  { id: 'tt_w3', dayOfWeek: 3, startTime: '14:00', endTime: '16:00', subjectId: 'sub_dld_lab', type: 'lab', room: 'HW Lab-2', batch: 'C2' },

  // Thursday (4)
  { id: 'tt_th1', dayOfWeek: 4, startTime: '09:00', endTime: '10:00', subjectId: 'sub_os', type: 'theory', room: 'LH-301', batch: 'All' },
  { id: 'tt_th2', dayOfWeek: 4, startTime: '10:00', endTime: '11:00', subjectId: 'sub_dbms', type: 'theory', room: 'LH-302', batch: 'All' },
  { id: 'tt_th3', dayOfWeek: 4, startTime: '11:15', endTime: '12:15', subjectId: 'sub_cn', type: 'theory', room: 'LH-303', batch: 'All' },
  { id: 'tt_th4', dayOfWeek: 4, startTime: '14:00', endTime: '16:00', subjectId: 'sub_dld_lab', type: 'lab', room: 'HW Lab-2', batch: 'C1' },

  // Friday (5)
  { id: 'tt_f1', dayOfWeek: 5, startTime: '09:00', endTime: '10:00', subjectId: 'sub_dm', type: 'theory', room: 'LH-304', batch: 'All' },
  { id: 'tt_f2', dayOfWeek: 5, startTime: '10:00', endTime: '11:00', subjectId: 'sub_cn', type: 'theory', room: 'LH-303', batch: 'All' },
  { id: 'tt_f3', dayOfWeek: 5, startTime: '11:15', endTime: '12:15', subjectId: 'sub_os', type: 'theory', room: 'LH-301', batch: 'All' },

  // Saturday (6)
  { id: 'tt_s1', dayOfWeek: 6, startTime: '09:30', endTime: '11:00', subjectId: 'sub_dbms', type: 'theory', room: 'LH-302', batch: 'All' },
  { id: 'tt_s2', dayOfWeek: 6, startTime: '11:15', endTime: '12:45', subjectId: 'sub_dm', type: 'theory', room: 'LH-304', batch: 'All' },
];

export const DEFAULT_GRACE_CREDITS: GraceCredit[] = [
  {
    id: 'gc_1',
    subjectId: 'sub_dm',
    count: 2,
    reason: 'Inter-College Hackathon On-Duty Leave',
    dateAdded: '2026-08-20',
    applied: true,
  },
];

export interface AppState {
  subjects: Subject[];
  timetable: TimetableSlot[];
  calendar: AcademicCalendar;
  graceCredits: GraceCredit[];
  userBatch: BatchType;
  globalTargetThreshold: number; // 0.75
  whatIfOverrides: Record<string, SlotAction>;
  lastSaved: number;
}

export function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}state`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        subjects: parsed.subjects || DEFAULT_SUBJECTS,
        timetable: parsed.timetable || DEFAULT_TIMETABLE,
        calendar: parsed.calendar || DEFAULT_CALENDAR,
        graceCredits: parsed.graceCredits || DEFAULT_GRACE_CREDITS,
        userBatch: parsed.userBatch || 'C1',
        globalTargetThreshold: parsed.globalTargetThreshold ?? 0.75,
        whatIfOverrides: parsed.whatIfOverrides || {},
        lastSaved: Date.now(),
      };
    }
  } catch (e) {
    console.warn('Failed to load saved state from localStorage, using defaults', e);
  }

  return {
    subjects: DEFAULT_SUBJECTS,
    timetable: DEFAULT_TIMETABLE,
    calendar: DEFAULT_CALENDAR,
    graceCredits: DEFAULT_GRACE_CREDITS,
    userBatch: 'C1',
    globalTargetThreshold: 0.75,
    whatIfOverrides: {},
    lastSaved: Date.now(),
  };
}

export function saveStateToStorage(state: AppState) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}state`, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

/**
 * Custom React Hook providing reactive, Bloc/Riverpod-like state for BunkSmart
 */
export function useBunkSmartStore() {
  const [state, setState] = useState<AppState>(loadInitialState);

  // Sync to local storage
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Derived mathematical states (instant zero-lag memoization)
  const subjectMetrics: SubjectMetrics[] = state.subjects.map((sub) =>
    calculateSubjectMetrics(sub, state.graceCredits)
  );

  const aggregateMetrics: AggregateMetrics = calculateAggregateMetrics(
    state.subjects,
    state.graceCredits
  );

  const projectedSlots: ProjectedSlot[] = generateProjectedSlots(
    state.calendar,
    state.timetable,
    state.subjects,
    state.userBatch,
    state.whatIfOverrides
  );

  const trajectoryPoints: TrajectoryPoint[] = generateTrajectoryPoints(
    state.calendar,
    state.subjects,
    projectedSlots,
    state.whatIfOverrides
  );

  // Actions
  const updateSubjectAttendance = useCallback(
    (subjectId: string, deltaAttended: number, deltaHeld: number) => {
      setState((prev) => ({
        ...prev,
        subjects: prev.subjects.map((s) => {
          if (s.id !== subjectId) return s;
          const newAttended = Math.max(0, s.attended + deltaAttended);
          const newHeld = Math.max(0, s.held + deltaHeld);
          return {
            ...s,
            attended: Math.min(newAttended, newHeld),
            held: newHeld,
          };
        }),
      }));
    },
    []
  );

  const setSubjectTarget = useCallback((subjectId: string, threshold: number) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) =>
        s.id === subjectId ? { ...s, targetThreshold: threshold } : s
      ),
    }));
  }, []);

  const setGlobalTarget = useCallback((threshold: number) => {
    setState((prev) => ({
      ...prev,
      globalTargetThreshold: threshold,
      subjects: prev.subjects.map((s) => ({ ...s, targetThreshold: threshold })),
    }));
  }, []);

  const setUserBatch = useCallback((batch: BatchType) => {
    setState((prev) => ({ ...prev, userBatch: batch }));
  }, []);

  const toggleWhatIfSlot = useCallback((slotKey: string, action: SlotAction) => {
    setState((prev) => {
      const nextOverrides = { ...prev.whatIfOverrides };
      if (action === 'default' || nextOverrides[slotKey] === action) {
        delete nextOverrides[slotKey];
      } else {
        nextOverrides[slotKey] = action;
      }
      return { ...prev, whatIfOverrides: nextOverrides };
    });
  }, []);

  const clearAllWhatIfs = useCallback(() => {
    setState((prev) => ({ ...prev, whatIfOverrides: {} }));
  }, []);

  const addSubject = useCallback((newSubject: Omit<Subject, 'id'>) => {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { ...newSubject, id }],
    }));
  }, []);

  const updateSubject = useCallback((updated: Subject) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === updated.id ? updated : s)),
    }));
  }, []);

  const deleteSubject = useCallback((subjectId: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== subjectId),
      timetable: prev.timetable.filter((t) => t.subjectId !== subjectId),
      graceCredits: prev.graceCredits.filter((g) => g.subjectId !== subjectId),
    }));
  }, []);

  const addTimetableSlot = useCallback((newSlot: Omit<TimetableSlot, 'id'>) => {
    const id = `tt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setState((prev) => ({
      ...prev,
      timetable: [...prev.timetable, { ...newSlot, id }],
    }));
  }, []);

  const updateTimetableSlot = useCallback((updated: TimetableSlot) => {
    setState((prev) => ({
      ...prev,
      timetable: prev.timetable.map((t) => (t.id === updated.id ? updated : t)),
    }));
  }, []);

  const deleteTimetableSlot = useCallback((slotId: string) => {
    setState((prev) => ({
      ...prev,
      timetable: prev.timetable.filter((t) => t.id !== slotId),
    }));
  }, []);

  const updateCalendar = useCallback((calendar: AcademicCalendar) => {
    setState((prev) => ({ ...prev, calendar }));
  }, []);

  const addHoliday = useCallback((holiday: Omit<HolidayItem, 'id'>) => {
    const id = `hol_${Date.now()}`;
    setState((prev) => ({
      ...prev,
      calendar: {
        ...prev.calendar,
        holidays: [...prev.calendar.holidays, { ...holiday, id }],
      },
    }));
  }, []);

  const removeHoliday = useCallback((holidayId: string) => {
    setState((prev) => ({
      ...prev,
      calendar: {
        ...prev.calendar,
        holidays: prev.calendar.holidays.filter((h) => h.id !== holidayId),
      },
    }));
  }, []);

  const addGraceCredit = useCallback((credit: Omit<GraceCredit, 'id'>) => {
    const id = `gc_${Date.now()}`;
    setState((prev) => ({
      ...prev,
      graceCredits: [...prev.graceCredits, { ...credit, id }],
    }));
  }, []);

  const toggleGraceCredit = useCallback((creditId: string) => {
    setState((prev) => ({
      ...prev,
      graceCredits: prev.graceCredits.map((g) =>
        g.id === creditId ? { ...g, applied: !g.applied } : g
      ),
    }));
  }, []);

  const deleteGraceCredit = useCallback((creditId: string) => {
    setState((prev) => ({
      ...prev,
      graceCredits: prev.graceCredits.filter((g) => g.id !== creditId),
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setState({
      subjects: DEFAULT_SUBJECTS,
      timetable: DEFAULT_TIMETABLE,
      calendar: DEFAULT_CALENDAR,
      graceCredits: DEFAULT_GRACE_CREDITS,
      userBatch: 'C1',
      globalTargetThreshold: 0.75,
      whatIfOverrides: {},
      lastSaved: Date.now(),
    });
  }, []);

  const importState = useCallback((importedState: Partial<AppState>) => {
    setState((prev) => ({
      ...prev,
      ...importedState,
      lastSaved: Date.now(),
    }));
  }, []);

  return {
    state,
    subjectMetrics,
    aggregateMetrics,
    projectedSlots,
    trajectoryPoints,
    updateSubjectAttendance,
    setSubjectTarget,
    setGlobalTarget,
    setUserBatch,
    toggleWhatIfSlot,
    clearAllWhatIfs,
    addSubject,
    updateSubject,
    deleteSubject,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    updateCalendar,
    addHoliday,
    removeHoliday,
    addGraceCredit,
    toggleGraceCredit,
    deleteGraceCredit,
    resetToDefaults,
    importState,
  };
}
