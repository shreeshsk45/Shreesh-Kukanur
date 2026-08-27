import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { AcademicCalendar, HolidayItem } from '../types';
import { formatDisplayDate } from '../lib/attendanceEngine';

interface CalendarManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendar: AcademicCalendar;
  onUpdateCalendar: (cal: AcademicCalendar) => void;
  onAddHoliday: (hol: Omit<HolidayItem, 'id'>) => void;
  onRemoveHoliday: (id: string) => void;
}

export const CalendarManagerModal: React.FC<CalendarManagerModalProps> = ({
  isOpen,
  onClose,
  calendar,
  onUpdateCalendar,
  onAddHoliday,
  onRemoveHoliday,
}) => {
  const [startDate, setStartDate] = useState(calendar.semesterStartDate);
  const [targetEndDate, setTargetEndDate] = useState(calendar.targetEndDate);
  const [currentDate, setCurrentDate] = useState(calendar.currentDate);

  // New holiday form
  const [holDate, setHolDate] = useState('2026-09-10');
  const [holName, setHolName] = useState('');
  const [holType, setHolType] = useState<'holiday' | 'exam' | 'break'>('holiday');

  if (!isOpen) return null;

  const handleSaveDates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCalendar({
      ...calendar,
      semesterStartDate: startDate,
      targetEndDate,
      currentDate,
    });
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holName.trim()) return;

    onAddHoliday({
      date: holDate,
      name: holName.trim(),
      type: holType,
    });

    setHolName('');
  };

  // Quick statistics
  const start = new Date(startDate);
  const end = new Date(targetEndDate);
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  const blackoutCount = calendar.holidays.length;

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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Academic Calendar Configurator
                </h3>
                <p className="text-xs text-slate-400">
                  Configure semester boundaries, target horizon date & official holidays
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar">
            {/* Semester Bounds Form */}
            <form onSubmit={handleSaveDates} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Semester Timeline</span>
                <span className="text-xs font-mono text-cyan-400 font-semibold">{totalDays} Calendar Days</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Semester Start</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Current Reference Date</label>
                  <input
                    type="date"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Target End Date</label>
                  <input
                    type="date"
                    value={targetEndDate}
                    onChange={(e) => setTargetEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-500/50 text-cyan-300 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-all cursor-pointer"
                >
                  Update Timeline Dates
                </button>
              </div>
            </form>

            {/* Blackout Holidays & Exam Dates Manager */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Official Holidays & Blackout Dates</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                    {blackoutCount} excluded
                  </span>
                </h4>
              </div>

              {/* Add holiday form */}
              <form
                onSubmit={handleAddHoliday}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-end gap-2 text-xs"
              >
                <div className="w-full sm:w-1/3">
                  <label className="text-slate-400 block mb-1">Holiday / Event Name</label>
                  <input
                    type="text"
                    value={holName}
                    onChange={(e) => setHolName(e.target.value)}
                    placeholder="e.g. Cultural Fest"
                    className="w-full p-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                    required
                  />
                </div>

                <div className="w-full sm:w-1/3">
                  <label className="text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={holDate}
                    onChange={(e) => setHolDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                    required
                  />
                </div>

                <div className="w-full sm:w-1/4">
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={holType}
                    onChange={(e) => setHolType(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-white/10 text-white"
                  >
                    <option value="holiday">Official Holiday</option>
                    <option value="exam">Midterms / Exam</option>
                    <option value="break">Study Break</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-400 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>

              {/* List of holidays */}
              <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                {calendar.holidays.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No holidays or blackout dates configured.
                  </div>
                ) : (
                  calendar.holidays.map((hol) => (
                    <div
                      key={hol.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-cyan-300 font-semibold">
                          {formatDisplayDate(hol.date)}
                        </span>
                        <span className="font-semibold text-white">{hol.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            hol.type === 'holiday'
                              ? 'bg-amber-500/20 text-amber-300'
                              : hol.type === 'exam'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {hol.type}
                        </span>
                      </div>

                      <button
                        onClick={() => onRemoveHoliday(hol.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                        title="Remove holiday"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
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
