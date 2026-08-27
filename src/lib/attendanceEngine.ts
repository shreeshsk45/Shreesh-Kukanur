import {
  Subject,
  TimetableSlot,
  AcademicCalendar,
  GraceCredit,
  SubjectMetrics,
  AggregateMetrics,
  ProjectedSlot,
  TrajectoryPoint,
  SafetyTier,
  BatchType,
  SlotAction,
} from '../types';

/**
 * Calculates safety tier based on percentage:
 * Green: >= 80%
 * Amber: 75% - 79.99%
 * Red: < 75%
 */
export function getSafetyTier(percentage: number, targetThreshold: number = 0.75): SafetyTier {
  const targetPct = targetThreshold * 100;
  if (percentage >= targetPct + 5) return 'safe';
  if (percentage >= targetPct) return 'warning';
  return 'danger';
}

/**
 * Precision Mathematical attendance calculations for a single subject:
 * Safe Bunks = floor((Attended - (T * Held)) / T)
 * Compulsory Classes Needed = ceil(((T * Held) - Attended) / (1 - T))
 */
export function calculateSubjectMetrics(
  subject: Subject,
  credits: GraceCredit[] = []
): SubjectMetrics {
  const subjectCredits = credits
    .filter((c) => c.applied && (c.subjectId === subject.id || c.subjectId === 'all'))
    .reduce((sum, c) => sum + c.count, 0);

  const effectiveAttended = subject.attended + subjectCredits;
  const held = Math.max(subject.held, 0);
  const target = subject.targetThreshold > 0 ? subject.targetThreshold : 0.75;

  const currentPercentage = held === 0 ? 100 : Number(((effectiveAttended / held) * 100).toFixed(2));

  let safeBunks = 0;
  let compulsoryNeeded = 0;

  if (held > 0) {
    const requiredAttended = target * held;
    if (effectiveAttended >= requiredAttended) {
      // Safe zone: how many consecutive classes can be skipped without dropping below target
      safeBunks = Math.floor((effectiveAttended - target * held) / target);
      compulsoryNeeded = 0;
    } else {
      // Deficit zone: how many consecutive classes must be attended to reach target
      safeBunks = 0;
      const numerator = target * held - effectiveAttended;
      const denominator = 1 - target;
      compulsoryNeeded = denominator > 0 ? Math.ceil(numerator / denominator) : 0;
    }
  }

  return {
    subjectId: subject.id,
    name: subject.name,
    code: subject.code,
    type: subject.type,
    attended: subject.attended,
    held: subject.held,
    graceCredits: subjectCredits,
    effectiveAttended,
    currentPercentage,
    targetThreshold: target,
    safeBunks: Math.max(0, safeBunks),
    compulsoryNeeded: Math.max(0, compulsoryNeeded),
    safetyTier: getSafetyTier(currentPercentage, target),
    color: subject.color,
  };
}

/**
 * Calculates aggregate attendance across all subjects with mathematical precision.
 */
export function calculateAggregateMetrics(
  subjects: Subject[],
  credits: GraceCredit[] = []
): AggregateMetrics {
  if (subjects.length === 0) {
    return {
      totalAttended: 0,
      totalHeld: 0,
      totalGrace: 0,
      effectiveAttended: 0,
      overallPercentage: 100,
      averageThreshold: 0.75,
      safeBunksAvailable: 0,
      compulsoryClassesNeeded: 0,
      safetyTier: 'safe',
      totalBunked: 0,
      totalProjectedSlotsRemaining: 0,
    };
  }

  let totalAttended = 0;
  let totalHeld = 0;
  let weightedThresholdSum = 0;

  subjects.forEach((s) => {
    totalAttended += s.attended;
    totalHeld += s.held;
    weightedThresholdSum += s.targetThreshold * (s.held || 1);
  });

  const totalGrace = credits
    .filter((c) => c.applied)
    .reduce((sum, c) => sum + c.count, 0);

  const effectiveAttended = totalAttended + totalGrace;
  const overallPercentage = totalHeld === 0 ? 100 : Number(((effectiveAttended / totalHeld) * 100).toFixed(2));
  const avgThreshold = totalHeld > 0 ? weightedThresholdSum / totalHeld : 0.75;

  let safeBunksAvailable = 0;
  let compulsoryClassesNeeded = 0;

  if (totalHeld > 0) {
    const requiredTotal = avgThreshold * totalHeld;
    if (effectiveAttended >= requiredTotal) {
      safeBunksAvailable = Math.floor((effectiveAttended - avgThreshold * totalHeld) / avgThreshold);
      compulsoryClassesNeeded = 0;
    } else {
      safeBunksAvailable = 0;
      const num = avgThreshold * totalHeld - effectiveAttended;
      const den = 1 - avgThreshold;
      compulsoryClassesNeeded = den > 0 ? Math.ceil(num / den) : 0;
    }
  }

  const totalBunked = Math.max(0, totalHeld - totalAttended);

  return {
    totalAttended,
    totalHeld,
    totalGrace,
    effectiveAttended,
    overallPercentage,
    averageThreshold: avgThreshold,
    safeBunksAvailable: Math.max(0, safeBunksAvailable),
    compulsoryClassesNeeded: Math.max(0, compulsoryClassesNeeded),
    safetyTier: getSafetyTier(overallPercentage, avgThreshold),
    totalBunked,
    totalProjectedSlotsRemaining: 0,
  };
}

/**
 * Generate projected timetable day-by-day between calendar dates
 */
export function generateProjectedSlots(
  calendar: AcademicCalendar,
  timetable: TimetableSlot[],
  subjects: Subject[],
  userBatch: BatchType = 'All',
  whatIfOverrides: Record<string, SlotAction> = {}
): ProjectedSlot[] {
  const subjectsMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const holidayDates = new Set(calendar.holidays.map((h) => h.date));

  const slots: ProjectedSlot[] = [];
  const start = new Date(calendar.currentDate);
  const end = new Date(calendar.targetEndDate);

  // Guard against invalid date order
  if (start > end) return slots;

  const current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    const jsDay = current.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Exclude Sundays (0) and Blackout holidays/exams
    if (jsDay !== 0 && !holidayDates.has(dateStr)) {
      // Find matching slots for this dayOfWeek
      const daySlots = timetable.filter(
        (t) =>
          t.dayOfWeek === jsDay &&
          (t.batch === 'All' || userBatch === 'All' || t.batch === userBatch)
      );

      // Sort by start time
      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

      daySlots.forEach((slot) => {
        const sub = subjectsMap.get(slot.subjectId);
        if (!sub) return;

        const slotKey = `${dateStr}_${slot.id}`;
        const overrideAction = whatIfOverrides[slotKey] || 'default';
        const isToday = dateStr === calendar.currentDate;

        slots.push({
          id: slotKey,
          date: dateStr,
          dayOfWeek: jsDay,
          startTime: slot.startTime,
          endTime: slot.endTime,
          subjectId: slot.subjectId,
          subjectName: sub.name,
          subjectCode: sub.code,
          type: slot.type,
          room: slot.room,
          batch: slot.batch,
          isPastOrToday: isToday,
          isToday,
          action: overrideAction,
          isSafeToSkip: false, // will be evaluated dynamically
          isCompulsory: false,
          cumulativeHeldAfter: 0,
          cumulativeAttendedAfter: 0,
          projectedPctAfter: 0,
        });
      });
    }

    current.setDate(current.getDate() + 1);
  }

  // Calculate dynamic slot safety per subject
  evaluateSlotsSafetyAndProjection(slots, subjects, calendar);

  return slots;
}

/**
 * Dynamically computes whether each upcoming slot is safe to skip or compulsory,
 * keeping track of running simulated held & attended counters.
 */
function evaluateSlotsSafetyAndProjection(
  projectedSlots: ProjectedSlot[],
  subjects: Subject[],
  calendar: AcademicCalendar
) {
  // Track running held & attended state per subject
  const runningState = new Map<string, { attended: number; held: number; threshold: number }>();
  subjects.forEach((s) => {
    runningState.set(s.id, {
      attended: s.attended,
      held: s.held,
      threshold: s.targetThreshold,
    });
  });

  projectedSlots.forEach((slot) => {
    const state = runningState.get(slot.subjectId);
    if (!state) return;

    // What happens if we bunk this slot?
    const testHeld = state.held + 1;
    const testAttendedIfBunk = state.attended; // no increase
    const testPctIfBunk = testHeld > 0 ? (testAttendedIfBunk / testHeld) * 100 : 100;
    const targetPct = state.threshold * 100;

    // A slot is Safe to Skip if bunking it still leaves the subject >= target threshold
    const isSafe = testPctIfBunk >= targetPct;
    slot.isSafeToSkip = isSafe;
    slot.isCompulsory = !isSafe;

    // Update running state based on user's action
    if (slot.action === 'cancelled') {
      // Doesn't increment held or attended
    } else if (slot.action === 'hypothetical_bunk') {
      state.held += 1;
      // attended remains same
    } else {
      // default or hypothetical_attend: assume student attends
      state.held += 1;
      state.attended += 1;
    }

    slot.cumulativeHeldAfter = state.held;
    slot.cumulativeAttendedAfter = state.attended;
    slot.projectedPctAfter = state.held > 0 ? Number(((state.attended / state.held) * 100).toFixed(2)) : 100;
  });
}

/**
 * Builds chronological trajectory data points from semester start to target end date,
 * showing the 75% target line, baseline projection, and what-if simulation curve.
 */
export function generateTrajectoryPoints(
  calendar: AcademicCalendar,
  subjects: Subject[],
  projectedSlots: ProjectedSlot[],
  whatIfOverrides: Record<string, SlotAction> = {}
): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];

  // Group projected slots by date
  const slotsByDate = new Map<string, ProjectedSlot[]>();
  projectedSlots.forEach((slot) => {
    const arr = slotsByDate.get(slot.date) || [];
    arr.push(slot);
    slotsByDate.set(slot.date, arr);
  });

  // Calculate baseline initial
  let baseAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  let baseHeld = subjects.reduce((sum, s) => sum + s.held, 0);

  let whatIfAttended = baseAttended;
  let whatIfHeld = baseHeld;

  // Add current date point
  const currentPct = baseHeld > 0 ? Number(((baseAttended / baseHeld) * 100).toFixed(2)) : 100;
  points.push({
    date: calendar.currentDate,
    displayDate: formatDisplayDate(calendar.currentDate),
    held: baseHeld,
    attended: baseAttended,
    percentage: currentPct,
    whatIfPercentage: currentPct,
    threshold: 75,
    slotsCount: (slotsByDate.get(calendar.currentDate) || []).length,
  });

  // Iterate chronologically through future dates
  const sortedDates = Array.from(slotsByDate.keys()).sort();

  sortedDates.forEach((dateStr) => {
    if (dateStr === calendar.currentDate) return;

    const daySlots = slotsByDate.get(dateStr) || [];
    let dayHeldDelta = 0;
    let dayBaselineAttendedDelta = 0;
    let dayWhatIfAttendedDelta = 0;

    daySlots.forEach((slot) => {
      if (slot.action === 'cancelled') {
        // No change
      } else if (slot.action === 'hypothetical_bunk') {
        dayHeldDelta += 1;
        dayBaselineAttendedDelta += 1; // baseline assumes attendance
        // whatIfAttended does not increase
      } else {
        // default / hypothetical_attend
        dayHeldDelta += 1;
        dayBaselineAttendedDelta += 1;
        dayWhatIfAttendedDelta += 1;
      }
    });

    baseHeld += dayHeldDelta;
    baseAttended += dayBaselineAttendedDelta;

    whatIfHeld += dayHeldDelta;
    whatIfAttended += dayWhatIfAttendedDelta;

    const basePct = baseHeld > 0 ? Number(((baseAttended / baseHeld) * 100).toFixed(2)) : 100;
    const whatIfPct = whatIfHeld > 0 ? Number(((whatIfAttended / whatIfHeld) * 100).toFixed(2)) : 100;

    points.push({
      date: dateStr,
      displayDate: formatDisplayDate(dateStr),
      held: whatIfHeld,
      attended: whatIfAttended,
      percentage: basePct,
      whatIfPercentage: whatIfPct,
      threshold: 75,
      slotsCount: daySlots.length,
    });
  });

  return points;
}

export function formatDisplayDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatDayName(dayIndex: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex % 7] || '';
}
