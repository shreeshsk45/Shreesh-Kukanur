import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Clock,
  FlaskConical,
  BookOpen,
  Filter,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { ProjectedSlot, Subject, SlotAction, AggregateMetrics } from '../types';
import { formatDisplayDate, formatDayName } from '../lib/attendanceEngine';

interface WhatIfSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectedSlots: ProjectedSlot[];
  subjects: Subject[];
  whatIfOverrides: Record<string, SlotAction>;
  onToggleSlot: (slotKey: string, action: SlotAction) => void;
  onClearAll: () => void;
  currentAggregate: AggregateMetrics;
}

export const WhatIfSimulatorModal: React.FC<WhatIfSimulatorModalProps> = ({
  isOpen,
  onClose,
  projectedSlots,
  subjects,
  whatIfOverrides,
  onToggleSlot,
  onClearAll,
  currentAggregate,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  if (!isOpen) return null;

  // Filter slots
  const filteredSlots = projectedSlots.filter((slot) => {
    if (selectedSubjectFilter !== 'all' && slot.subjectId !== selectedSubjectFilter) {
      return false;
    }
    return true;
  });

  // Count active what-if bunks
  const activeBunksCount = Object.values(whatIfOverrides).filter(
    (action) => action === 'hypothetical_bunk'
  ).length;

  const activeCancelsCount = Object.values(whatIfOverrides).filter(
    (action) => action === 'cancelled'
  ).length;

  // Group slots by date
  const groupedByDate = new Map<string, ProjectedSlot[]>();
  filteredSlots.forEach((slot) => {
    const arr = groupedByDate.get(slot.date) || [];
    arr.push(slot);
    groupedByDate.set(slot.date, arr);
  });

  const datesList = Array.from(groupedByDate.keys()).sort();

  // Preset shortcut helpers
  const applyLongWeekend = () => {
    // Mark next Friday slots as bunks
    projectedSlots.forEach((slot) => {
      if (slot.dayOfWeek === 5 && slot.action === 'default') {
        onToggleSlot(slot.id, 'hypothetical_bunk');
      }
    });
  };

  const applySkipTomorrow = () => {
    if (datesList.length > 0) {
      const tomorrowDate = datesList[0];
      const tomorrowSlots = groupedByDate.get(tomorrowDate) || [];
      tomorrowSlots.forEach((slot) => {
        if (slot.action === 'default') {
          onToggleSlot(slot.id, 'hypothetical_bunk');
        }
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full sm:max-w-3xl max-h-[90vh] glass-panel rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/15 flex flex-col overflow-hidden bg-[#0F172A]/95"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Interactive "What-If" Bunk Simulator</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Hypothetically skip upcoming classes and test mathematical safety in real time
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Preset Buttons & Active State Bar */}
          <div className="p-4 bg-white/[0.02] border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400">Quick Tests:</span>
              <button
                onClick={applyLongWeekend}
                className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Skip Fridays (Long Weekend)</span>
              </button>
              <button
                onClick={applySkipTomorrow}
                className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Calendar className="w-3 h-3 text-cyan-400" />
                <span>Skip Tomorrow</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {(activeBunksCount > 0 || activeCancelsCount > 0) && (
                <button
                  onClick={onClearAll}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All ({activeBunksCount} bunks)</span>
                </button>
              )}
            </div>
          </div>

          {/* Subject Filter Bar */}
          <div className="px-4 py-2.5 bg-black/20 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => setSelectedSubjectFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedSubjectFilter === 'all'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              All Courses
            </button>
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectFilter(sub.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedSubjectFilter === sub.id
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: sub.color }}
                />
                <span>{sub.code}</span>
              </button>
            ))}
          </div>

          {/* Slots List Grouped by Date */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
            {datesList.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No upcoming slots found in the academic calendar.
              </div>
            ) : (
              datesList.map((dateStr) => {
                const daySlots = groupedByDate.get(dateStr) || [];
                const firstSlot = daySlots[0];
                const dayName = firstSlot ? formatDayName(firstSlot.dayOfWeek) : '';
                const displayDate = formatDisplayDate(dateStr);

                return (
                  <div key={dateStr} className="space-y-2">
                    {/* Date Header */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                      <span className="flex items-center gap-2 text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-bold text-white">{dayName}</span>, {displayDate}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {daySlots.length} {daySlots.length === 1 ? 'lecture' : 'lectures'}
                      </span>
                    </div>

                    {/* Day Slots */}
                    <div className="space-y-2">
                      {daySlots.map((slot) => {
                        const isBunked = slot.action === 'hypothetical_bunk';
                        const isCancelled = slot.action === 'cancelled';

                        return (
                          <motion.div
                            key={slot.id}
                            layout
                            className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isBunked
                                ? 'bg-rose-500/10 border-rose-500/30'
                                : isCancelled
                                ? 'bg-slate-800/40 border-slate-700/50 opacity-60'
                                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5'
                            }`}
                          >
                            {/* Slot Info */}
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  slot.type === 'lab'
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : 'bg-blue-500/20 text-blue-300'
                                }`}
                              >
                                {slot.type === 'lab' ? (
                                  <FlaskConical className="w-4 h-4" />
                                ) : (
                                  <BookOpen className="w-4 h-4" />
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-white">
                                    {slot.subjectName}
                                  </span>
                                  <span className="text-xs font-mono font-semibold text-slate-300">
                                    {slot.subjectCode}
                                  </span>
                                  {slot.type === 'lab' && (
                                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300">
                                      Lab ({slot.batch})
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  <span>•</span>
                                  <span>{slot.room}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons & Mathematical Prediction */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                              {/* Safety Pill */}
                              <div className="text-right">
                                {slot.isSafeToSkip ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    Safe to Skip
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                    Compulsory
                                  </span>
                                )}
                              </div>

                              {/* Toggle Buttons */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => onToggleSlot(slot.id, 'hypothetical_bunk')}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                                    isBunked
                                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                                      : 'bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10'
                                  }`}
                                >
                                  {isBunked ? 'Bunked (Simulated)' : 'Simulate Bunk'}
                                </button>

                                <button
                                  onClick={() => onToggleSlot(slot.id, 'cancelled')}
                                  title="Mark lecture as cancelled by faculty"
                                  className={`px-2 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                                    isCancelled
                                      ? 'bg-slate-600 text-white'
                                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                                  }`}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-slate-900/90 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <span className="text-white font-bold">{activeBunksCount}</span> hypothetical bunks applied.
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95"
            >
              Done & View Trajectory
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
