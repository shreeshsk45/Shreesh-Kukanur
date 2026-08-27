import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Flame,
  Calendar,
  Clock,
  MapPin,
  HelpCircle,
  RotateCcw,
  Check,
  X,
  Ban,
  TrendingUp,
} from 'lucide-react';
import { AggregateMetrics, ProjectedSlot, SafetyTier } from '../types';
import { RadialGauge } from './RadialGauge';

interface TopSummarySectionProps {
  aggregate: AggregateMetrics;
  todaySlots: ProjectedSlot[];
  targetEndDate: string;
  onQuickLogAttendance: (subjectId: string, deltaAttended: number, deltaHeld: number) => void;
  onOpenWhatIf: () => void;
}

export const TopSummarySection: React.FC<TopSummarySectionProps> = ({
  aggregate,
  todaySlots,
  targetEndDate,
  onQuickLogAttendance,
  onOpenWhatIf,
}) => {
  const {
    overallPercentage,
    averageThreshold,
    safeBunksAvailable,
    compulsoryClassesNeeded,
    safetyTier,
    totalAttended,
    totalHeld,
    totalGrace,
  } = aggregate;

  // Format safe bunks with leading zero if single digit for high impact display
  const formattedSafeBunks =
    safeBunksAvailable < 10 && safeBunksAvailable >= 0
      ? `0${safeBunksAvailable}`
      : `${safeBunksAvailable}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="top-summary-section">
      {/* Primary Mathematical Precision Card with Mega Bold Typography */}
      <div className="lg:col-span-7 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-[36px] sm:rounded-[40px] p-7 sm:p-10 flex flex-col justify-between relative overflow-hidden min-h-[400px] shadow-2xl">
        {/* Top title & quick what-if button */}
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">
              Mathematical Precision
            </p>
            <p className="text-[11px] text-white/40 font-mono mt-0.5">
              Target Horizon: {targetEndDate}
            </p>
          </div>

          <button
            onClick={onOpenWhatIf}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Simulate What-If</span>
          </button>
        </div>

        {/* Mega Number Display */}
        <div className="relative z-10 my-4">
          <motion.h2
            key={safeBunksAvailable}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="text-[100px] sm:text-[130px] md:text-[140px] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 font-numeric select-none"
          >
            {formattedSafeBunks}
          </motion.h2>
          <p className="text-2xl sm:text-3xl font-light text-white/80 -mt-2 italic">
            Safe Bunks Available
          </p>
        </div>

        {/* Bottom Stat Row: Compulsory Ahead, Safety Threshold & Circular Gauge */}
        <div className="relative z-10 flex flex-wrap gap-8 sm:gap-12 items-end pt-4 border-t border-white/10">
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">
              Compulsory Ahead
            </p>
            <motion.p
              key={compulsoryClassesNeeded}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`text-3xl sm:text-4xl font-bold font-numeric ${
                compulsoryClassesNeeded > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {compulsoryClassesNeeded < 10 && compulsoryClassesNeeded >= 0
                ? `0${compulsoryClassesNeeded}`
                : compulsoryClassesNeeded}
            </motion.p>
          </div>

          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">
              Safety Threshold
            </p>
            <p className="text-3xl sm:text-4xl font-bold font-numeric text-amber-400">
              {(averageThreshold * 100).toFixed(0)}%
            </p>
          </div>

          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">
              Attended / Held
            </p>
            <p className="text-2xl sm:text-3xl font-bold font-numeric text-white">
              {totalAttended + totalGrace}{' '}
              <span className="text-base text-white/40 font-normal">/ {totalHeld}</span>
            </p>
          </div>

          {/* Mini Radial Indicator */}
          <div className="ml-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-emerald-500/30 flex items-center justify-center relative shadow-lg shadow-emerald-500/10">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  fill="transparent"
                  stroke={
                    safetyTier === 'safe'
                      ? '#10B981'
                      : safetyTier === 'warning'
                      ? '#F59E0B'
                      : '#EF4444'
                  }
                  strokeWidth="6"
                  strokeDasharray={`${overallPercentage * 2.64} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-lg sm:text-xl font-black font-numeric text-white">
                {overallPercentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Ambient Blur Orb */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Today's Action Card */}
      <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-[32px] sm:rounded-[36px] p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">
              Today's Action Card
            </h3>
            <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-white/70 font-mono">
              {todaySlots.length} {todaySlots.length === 1 ? 'SLOT' : 'SLOTS'}
            </span>
          </div>

          {/* Today's slots list */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
            {todaySlots.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center flex flex-col items-center justify-center">
                <Sparkles className="w-8 h-8 text-emerald-400 mb-2 opacity-60" />
                <p className="text-base font-bold text-white">No classes scheduled today!</p>
                <p className="text-xs text-white/40 mt-1">
                  Enjoy your study break or extra preparation time.
                </p>
              </div>
            ) : (
              todaySlots.map((slot) => {
                const isSafe = slot.isSafeToSkip;

                return (
                  <motion.div
                    key={slot.id}
                    layout
                    className={`rounded-2xl p-4 flex flex-col gap-3 border transition-all ${
                      isSafe
                        ? 'bg-white/10 border-white/10 hover:bg-white/[0.14]'
                        : 'bg-red-500/20 border-red-500/30 hover:bg-red-500/25'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-base sm:text-lg font-bold text-white leading-snug">
                            {slot.subjectName}
                          </p>
                          <span className="text-xs font-mono font-bold text-white/60">
                            {slot.subjectCode}
                          </span>
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${
                            isSafe ? 'text-white/50' : 'text-red-300/70'
                          }`}
                        >
                          {slot.startTime} • {slot.type === 'lab' ? `Lab Slot (${slot.batch})` : 'Theory Lecture'} • {slot.room}
                        </p>
                      </div>

                      {/* Tag Badge */}
                      <span
                        className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                          isSafe
                            ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                            : 'bg-red-500 text-white shadow-md shadow-red-500/20'
                        }`}
                      >
                        {isSafe ? 'Safe to Skip' : 'Compulsory'}
                      </span>
                    </div>

                    {/* 1-Tap Quick Attendance Log Buttons */}
                    <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">
                        Quick Log:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onQuickLogAttendance(slot.subjectId, 1, 1)}
                          title="Mark Present (+1 Attended, +1 Held)"
                          className="px-3 py-1 rounded-xl bg-white text-black hover:bg-white/90 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Present</span>
                        </button>

                        <button
                          onClick={() => onQuickLogAttendance(slot.subjectId, 0, 1)}
                          title="Mark Bunked (+0 Attended, +1 Held)"
                          className="px-3 py-1 rounded-xl border border-white/20 text-white hover:bg-white/10 font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Bunk</span>
                        </button>

                        <button
                          onClick={() => onQuickLogAttendance(slot.subjectId, -1, -1)}
                          title="Undo / Subtract (-1 Attended, -1 Held)"
                          className="p-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer tip */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
          <span className="flex items-center gap-1.5 font-medium text-[11px]">
            <HelpCircle className="w-3.5 h-3.5" />
            Rigorous mathematical floor & ceil simulation
          </span>
        </div>
      </div>
    </div>
  );
};
