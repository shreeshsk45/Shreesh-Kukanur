import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Calendar,
  Layers,
  BookOpen,
  FlaskConical,
  Check,
} from 'lucide-react';
import { TimetableSlot, Subject, BatchType, SubjectType } from '../types';
import { formatDayName } from '../lib/attendanceEngine';

interface TimetableManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetable: TimetableSlot[];
  subjects: Subject[];
  userBatch: BatchType;
  onAddSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  onDeleteSlot: (id: string) => void;
  onSetUserBatch: (batch: BatchType) => void;
}

export const TimetableManagerModal: React.FC<TimetableManagerModalProps> = ({
  isOpen,
  onClose,
  timetable,
  subjects,
  userBatch,
  onAddSlot,
  onDeleteSlot,
  onSetUserBatch,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1); // 1 = Monday
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New slot form state
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [type, setType] = useState<SubjectType>('theory');
  const [room, setRoom] = useState<string>('LH-301');
  const [batch, setBatch] = useState<BatchType>('All');

  if (!isOpen) return null;

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;

    onAddSlot({
      dayOfWeek: selectedDay,
      startTime,
      endTime,
      subjectId,
      type,
      room: room || 'Classroom',
      batch,
    });

    setShowAddForm(false);
  };

  const daySlots = timetable
    .filter((t) => t.dayOfWeek === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const subjectsMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Weekly Timetable Scheduler
                </h3>
                <p className="text-xs text-slate-400">
                  Map recurring theory & lab slots (Mon–Sat) with batch filtering
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

          {/* User Batch Selector Bar */}
          <div className="px-5 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 font-semibold">Active Student Batch:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {(['All', 'C1', 'C2', 'C3'] as BatchType[]).map((b) => (
                <button
                  key={b}
                  onClick={() => onSetUserBatch(b)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userBatch === b
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Day of Week Tabs (Monday to Saturday) */}
          <div className="flex items-center gap-1 p-2 bg-black/25 border-b border-white/5 overflow-x-auto no-scrollbar">
            {[1, 2, 3, 4, 5, 6].map((dayNum) => (
              <button
                key={dayNum}
                onClick={() => {
                  setSelectedDay(dayNum);
                  setShowAddForm(false);
                }}
                className={`flex-1 min-w-[70px] py-2 px-3 rounded-2xl text-xs font-bold text-center transition-all cursor-pointer ${
                  selectedDay === dayNum
                    ? 'bg-white/10 text-white shadow-sm border border-white/15'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {formatDayName(dayNum)}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
            {/* Add Slot Button or Form */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 rounded-2xl border border-dashed border-white/15 hover:border-emerald-400/50 bg-white/[0.02] hover:bg-emerald-500/5 text-slate-300 hover:text-emerald-300 transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Class Slot to {formatDayName(selectedDay)}</span>
              </button>
            ) : (
              <form
                onSubmit={handleCreateSlot}
                className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white pb-2 border-b border-white/5">
                  <span>Add Class Slot ({formatDayName(selectedDay)})</span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Subject Dropdown */}
                  <div>
                    <label className="text-slate-400 block mb-1">Course / Subject</label>
                    <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white"
                      required
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Batch Slot */}
                  <div>
                    <label className="text-slate-400 block mb-1">Applicable Batch</label>
                    <select
                      value={batch}
                      onChange={(e) => setBatch(e.target.value as BatchType)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white"
                    >
                      <option value="All">All Students</option>
                      <option value="C1">Batch C1 Only</option>
                      <option value="C2">Batch C2 Only</option>
                      <option value="C3">Batch C3 Only</option>
                    </select>
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="text-slate-400 block mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white"
                      required
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="text-slate-400 block mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="text-slate-400 block mb-1">Class Format</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as SubjectType)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white"
                    >
                      <option value="theory">Theory Lecture</option>
                      <option value="lab">Lab / Practical</option>
                    </select>
                  </div>

                  {/* Room */}
                  <div>
                    <label className="text-slate-400 block mb-1">Room / Hall</label>
                    <input
                      type="text"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="e.g. LH-301 or Lab 2"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-400 transition-all cursor-pointer"
                  >
                    Save Slot
                  </button>
                </div>
              </form>
            )}

            {/* List of slots for the selected day */}
            <div className="space-y-2">
              {daySlots.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No timetable slots defined for {formatDayName(selectedDay)}.
                </div>
              ) : (
                daySlots.map((slot) => {
                  const sub = subjectsMap.get(slot.subjectId);

                  return (
                    <div
                      key={slot.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 hover:bg-white/[0.05] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
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
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">
                              {sub?.name || 'Unknown Subject'}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              {sub?.code}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {slot.room}
                            </span>
                            <span>•</span>
                            <span className="text-[11px] font-semibold text-slate-300">
                              Batch: {slot.batch}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteSlot(slot.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        title="Delete slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
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
