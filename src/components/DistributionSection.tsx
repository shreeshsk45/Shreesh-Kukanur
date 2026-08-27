import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  FlaskConical,
  Plus,
  Minus,
  Check,
  X,
  RotateCcw,
  Sliders,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SubjectMetrics, AggregateMetrics, ProjectedSlot } from '../types';

interface DistributionSectionProps {
  metrics: SubjectMetrics[];
  aggregate: AggregateMetrics;
  projectedSlots: ProjectedSlot[];
  onUpdateAttendance: (subjectId: string, deltaAttended: number, deltaHeld: number) => void;
  onSetSubjectTarget: (subjectId: string, threshold: number) => void;
  onOpenSubjectManager: () => void;
}

export const DistributionSection: React.FC<DistributionSectionProps> = ({
  metrics,
  aggregate,
  projectedSlots,
  onUpdateAttendance,
  onSetSubjectTarget,
  onOpenSubjectManager,
}) => {
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);

  // Compute distribution numbers
  const totalAttended = aggregate.totalAttended + aggregate.totalGrace;
  const totalBunked = aggregate.totalBunked;
  const totalFuture = projectedSlots.filter((s) => s.action !== 'cancelled').length;
  const totalCancelled = projectedSlots.filter((s) => s.action === 'cancelled').length;

  const totalSum = Math.max(1, totalAttended + totalBunked + totalFuture + totalCancelled);

  const attendedPct = (totalAttended / totalSum) * 100;
  const bunkedPct = (totalBunked / totalSum) * 100;
  const futurePct = (totalFuture / totalSum) * 100;
  const cancelledPct = (totalCancelled / totalSum) * 100;

  // SVG Donut Chart generation
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Segments offsets
  const segAttended = (attendedPct / 100) * circumference;
  const segBunked = (bunkedPct / 100) * circumference;
  const segFuture = (futurePct / 100) * circumference;
  const segCancelled = (cancelledPct / 100) * circumference;

  const offsetAttended = 0;
  const offsetBunked = -segAttended;
  const offsetFuture = -(segAttended + segBunked);
  const offsetCancelled = -(segAttended + segBunked + segFuture);

  return (
    <div className="space-y-6" id="distribution-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Course Attendance & Status Distribution</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Subject-wise mathematical tracking with dynamic safe bunk limits and rapid logging
          </p>
        </div>

        <button
          onClick={onOpenSubjectManager}
          className="px-4 py-2 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer active:scale-95 shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5 text-white/70" />
          <span>Configure Courses</span>
        </button>
      </div>

      {/* Grid: Donut Chart Distribution + Subject Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Animated Distribution Donut View */}
        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[32px] p-6 sm:p-7 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">
                Semester Breakdown
              </h3>
              <span className="text-[11px] font-mono text-white/60 bg-white/10 px-2.5 py-0.5 rounded-full">
                {totalSum} Total Slots
              </span>
            </div>

            {/* Donut graphic */}
            <div className="relative flex items-center justify-center my-6">
              <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />

                {/* Attended Segment (Emerald) */}
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#10B981"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${segAttended} ${circumference}`}
                  strokeDashoffset={offsetAttended}
                  fill="transparent"
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${segAttended} ${circumference}` }}
                  transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                />

                {/* Bunked Segment (Rose) */}
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#EF4444"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${segBunked} ${circumference}`}
                  strokeDashoffset={offsetBunked}
                  fill="transparent"
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${segBunked} ${circumference}` }}
                  transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.05 }}
                />

                {/* Future Projected Segment (Blue) */}
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#3B82F6"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${segFuture} ${circumference}`}
                  strokeDashoffset={offsetFuture}
                  fill="transparent"
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${segFuture} ${circumference}` }}
                  transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.1 }}
                />

                {/* Cancelled/Holiday Segment (Slate) */}
                {segCancelled > 0 && (
                  <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#64748B"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${segCancelled} ${circumference}`}
                    strokeDashoffset={offsetCancelled}
                    fill="transparent"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${segCancelled} ${circumference}` }}
                    transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.15 }}
                  />
                )}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-3xl font-black font-numeric text-white leading-none">
                  {totalAttended}
                </span>
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">
                  Attended
                </span>
              </div>
            </div>

            {/* Interactive Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                  <span className="text-white/80 font-medium">Attended (with OD)</span>
                </div>
                <div className="font-mono font-bold text-white">
                  {totalAttended}{' '}
                  <span className="text-[11px] text-white/40 font-normal">
                    ({attendedPct.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
                  <span className="text-white/80 font-medium">Missed / Bunked</span>
                </div>
                <div className="font-mono font-bold text-white">
                  {totalBunked}{' '}
                  <span className="text-[11px] text-white/40 font-normal">
                    ({bunkedPct.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
                  <span className="text-white/80 font-medium">Projected Remaining</span>
                </div>
                <div className="font-mono font-bold text-white">
                  {totalFuture}{' '}
                  <span className="text-[11px] text-white/40 font-normal">
                    ({futurePct.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {totalCancelled > 0 && (
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shadow-sm" />
                    <span className="text-white/80 font-medium">Cancelled / Excluded</span>
                  </div>
                  <div className="font-mono font-bold text-white">
                    {totalCancelled}{' '}
                    <span className="text-[11px] text-white/40 font-normal">
                      ({cancelledPct.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                Quick Simulator
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono text-white/70">
                What-If Mode
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (metrics[0]) onUpdateAttendance(metrics[0].subjectId, 0, 1);
                }}
                className="flex-1 py-3 rounded-2xl bg-white text-black font-bold text-xs hover:bg-white/90 transition-all active:scale-95 cursor-pointer"
              >
                BUNK 1 CLASS
              </button>
              <button
                onClick={() => {
                  if (metrics[0]) onUpdateAttendance(metrics[0].subjectId, 1, 1);
                }}
                className="flex-1 py-3 rounded-2xl border border-white/20 text-white font-bold text-xs hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
              >
                ATTEND +1
              </button>
            </div>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {metrics.map((sub, idx) => {
              const targetPct = sub.targetThreshold * 100;
              const isBelow = sub.currentPercentage < targetPct;
              const isEditing = editingSubjectId === sub.subjectId;

              return (
                <motion.div
                  key={sub.subjectId}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    type: 'spring',
                    stiffness: 180,
                    damping: 18,
                    delay: idx * 0.04,
                  }}
                  className="bg-white/5 border border-white/10 rounded-[28px] p-6 flex flex-col justify-between shadow-xl hover:border-white/20 transition-all group relative overflow-hidden"
                >
                  {/* Subject top color bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 opacity-80"
                    style={{ backgroundColor: sub.color }}
                  />

                  <div>
                    {/* Header: Name, Code, Type */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-white truncate">
                            {sub.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                          <span className="font-mono font-bold text-white/70">
                            {sub.code}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {sub.type === 'lab' ? (
                              <>
                                <FlaskConical className="w-3 h-3 text-purple-400" />
                                <span className="text-purple-300 font-medium">Lab / Practical</span>
                              </>
                            ) : (
                              <>
                                <BookOpen className="w-3 h-3 text-blue-400" />
                                <span>Theory</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Threshold Settings Trigger */}
                      <button
                        onClick={() => setEditingSubjectId(isEditing ? null : sub.subjectId)}
                        title="Adjust course target threshold"
                        className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                          isEditing
                            ? 'bg-white text-black font-bold shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-white/60'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Percentage & Fraction Display */}
                    <div className="flex items-baseline justify-between mt-4">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`text-3xl font-black font-numeric ${
                            isBelow ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {sub.currentPercentage.toFixed(1)}%
                        </span>
                        <span className="text-xs text-white/40 font-medium">
                          (Target: {targetPct}%)
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold font-numeric text-white">
                          {sub.effectiveAttended} / {sub.held}
                        </span>
                        <span className="text-[10px] text-white/40 uppercase font-bold block">
                          Classes
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar with Threshold Mark */}
                    <div className="relative w-full h-2.5 bg-white/10 rounded-full mt-2.5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: isBelow ? '#EF4444' : sub.color,
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, Math.max(0, sub.currentPercentage))}%`,
                        }}
                        transition={{ type: 'spring', stiffness: 90, damping: 15 }}
                      />
                      {/* Target threshold indicator line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm pointer-events-none"
                        style={{ left: `${targetPct}%` }}
                        title={`Target: ${targetPct}%`}
                      />
                    </div>

                    {/* Dynamic Bunk/Attend badge */}
                    <div className="mt-3">
                      {sub.safeBunks > 0 ? (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            Can bunk {sub.safeBunks} {sub.safeBunks === 1 ? 'class' : 'classes'}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 uppercase font-black">
                            Safe
                          </span>
                        </div>
                      ) : sub.compulsoryNeeded > 0 ? (
                        <div className="px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-between text-xs">
                          <span className="font-bold text-rose-300 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                            Must attend next {sub.compulsoryNeeded}{' '}
                            {sub.compulsoryNeeded === 1 ? 'class' : 'classes'}
                          </span>
                          <span className="text-[10px] font-mono text-rose-400 uppercase font-black">
                            Deficit
                          </span>
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-300">
                            On the exact threshold ({targetPct}%)
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 uppercase font-black">
                            Zero Buffer
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expandable Threshold slider when edit icon tapped */}
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white/80 font-semibold">Course Minimum Target:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {(sub.targetThreshold * 100).toFixed(0)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.50"
                          max="0.95"
                          step="0.05"
                          value={sub.targetThreshold}
                          onChange={(e) => onSetSubjectTarget(sub.subjectId, parseFloat(e.target.value))}
                          className="w-full accent-emerald-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-white/40 font-mono">
                          <span>50%</span>
                          <span>75% (Std)</span>
                          <span>85%</span>
                          <span>95%</span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Micro-interaction Action Controls */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">
                      Quick Log:
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateAttendance(sub.subjectId, 1, 1)}
                        title="Mark Present (+1 Attended, +1 Held)"
                        className="px-2.5 py-1 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-bold flex items-center gap-1 transition-all active:scale-90 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Present</span>
                      </button>

                      <button
                        onClick={() => onUpdateAttendance(sub.subjectId, 0, 1)}
                        title="Mark Bunked (+0 Attended, +1 Held)"
                        className="px-2.5 py-1 rounded-xl border border-white/20 text-white hover:bg-white/10 text-xs font-bold flex items-center gap-1 transition-all active:scale-90 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Bunk</span>
                      </button>

                      <button
                        onClick={() => onUpdateAttendance(sub.subjectId, -1, -1)}
                        title="Undo Last Entry (-1 Attended, -1 Held)"
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-xs transition-all active:scale-90 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
