import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { GraceCredit, Subject } from '../types';
import { formatDisplayDate } from '../lib/attendanceEngine';

interface GraceTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  graceCredits: GraceCredit[];
  subjects: Subject[];
  onAddGraceCredit: (credit: Omit<GraceCredit, 'id'>) => void;
  onToggleGraceCredit: (id: string) => void;
  onDeleteGraceCredit: (id: string) => void;
}

export const GraceTrackerModal: React.FC<GraceTrackerModalProps> = ({
  isOpen,
  onClose,
  graceCredits,
  subjects,
  onAddGraceCredit,
  onToggleGraceCredit,
  onDeleteGraceCredit,
}) => {
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || 'all');
  const [count, setCount] = useState<number>(2);
  const [reason, setReason] = useState<string>('');
  const [dateAdded, setDateAdded] = useState<string>('2026-08-27');

  if (!isOpen) return null;

  const handleAddCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || count <= 0) return;

    onAddGraceCredit({
      subjectId,
      count: Number(count),
      reason: reason.trim(),
      dateAdded,
      applied: true,
    });

    setReason('');
    setCount(2);
  };

  const subjectsMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

  const totalAppliedCredits = graceCredits
    .filter((g) => g.applied)
    .reduce((sum, g) => sum + g.count, 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[85vh] glass-panel rounded-3xl shadow-2xl border border-white/15 flex flex-col overflow-hidden bg-[#0F172A]/95"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Grace Attendance & On-Duty (OD) Tracker
                </h3>
                <p className="text-xs text-slate-400">
                  Track pending attendance credits from sports, fests, hackathons & medical leaves
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

          {/* Quick summary stat */}
          <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs">
            <span className="text-amber-300 font-semibold flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              Active Applied Credits:
            </span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              +{totalAppliedCredits} Classes Added to Attended
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
            {/* Add Credit Form */}
            <form onSubmit={handleAddCredit} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3 text-xs">
              <span className="font-bold text-white block">Add New Attendance Credit / OD</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Target Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white"
                  >
                    <option value="all">All Subjects (Global Credit)</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Number of Credits (+Classes)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={count}
                    onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Event / Medical Justification</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Smart India Hackathon Grand Finale On-Duty"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Attendance Credit</span>
                </button>
              </div>
            </form>

            {/* List of credits */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Registered Attendance Adjustments</h4>

              <div className="space-y-2">
                {graceCredits.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No grace credits or ODs logged yet.
                  </div>
                ) : (
                  graceCredits.map((credit) => {
                    const sub = credit.subjectId === 'all' ? null : subjectsMap.get(credit.subjectId);

                    return (
                      <div
                        key={credit.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                          credit.applied
                            ? 'bg-amber-500/5 border-amber-500/20'
                            : 'bg-white/[0.02] border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onToggleGraceCredit(credit.id)}
                            className="text-amber-400 hover:scale-110 transition-all cursor-pointer"
                            title={credit.applied ? 'Click to disable' : 'Click to enable'}
                          >
                            {credit.applied ? (
                              <CheckCircle2 className="w-5 h-5 text-amber-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-500" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{credit.reason}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                                +{credit.count} {credit.count === 1 ? 'Credit' : 'Credits'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Subject:{' '}
                              <strong className="text-slate-300">
                                {sub ? `${sub.name} (${sub.code})` : 'All Subjects'}
                              </strong>{' '}
                              • Logged on {formatDisplayDate(credit.dateAdded)}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteGraceCredit(credit.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-slate-900 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
