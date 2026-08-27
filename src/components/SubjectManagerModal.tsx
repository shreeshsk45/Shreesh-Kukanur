import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  FlaskConical,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Subject, SubjectType } from '../types';

interface SubjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onAddSubject: (sub: Omit<Subject, 'id'>) => void;
  onUpdateSubject: (sub: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onResetDefaults: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
];

export const SubjectManagerModal: React.FC<SubjectManagerModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onResetDefaults,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<SubjectType>('theory');
  const [targetThreshold, setTargetThreshold] = useState(0.75);
  const [attended, setAttended] = useState(20);
  const [held, setHeld] = useState(25);
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [room, setRoom] = useState('LH-301');

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setType('theory');
    setTargetThreshold(0.75);
    setAttended(20);
    setHeld(25);
    setColor(PRESET_COLORS[subjects.length % PRESET_COLORS.length]);
    setRoom('LH-301');
    setShowAddForm(true);
  };

  const handleStartEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setName(sub.name);
    setCode(sub.code);
    setType(sub.type);
    setTargetThreshold(sub.targetThreshold);
    setAttended(sub.attended);
    setHeld(sub.held);
    setColor(sub.color);
    setRoom(sub.room || 'LH-301');
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingId) {
      onUpdateSubject({
        id: editingId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        type,
        targetThreshold,
        attended: Math.min(attended, held),
        held: Math.max(0, held),
        color,
        room,
      });
    } else {
      onAddSubject({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        type,
        targetThreshold,
        attended: Math.min(attended, held),
        held: Math.max(0, held),
        color,
        room,
      });
    }

    setShowAddForm(false);
    setEditingId(null);
  };

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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Course & Subject Manager
                </h3>
                <p className="text-xs text-slate-400">
                  Configure attendance thresholds, course codes & theory vs lab types
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
          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
            {/* Add or Edit Form */}
            {!showAddForm ? (
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handleStartAdd}
                  className="flex-1 py-3 rounded-2xl border border-dashed border-white/15 hover:border-emerald-400/50 bg-white/[0.02] hover:bg-emerald-500/5 text-slate-300 hover:text-emerald-300 transition-all flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New University Course</span>
                </button>

                <button
                  onClick={onResetDefaults}
                  className="px-3 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer border border-white/10"
                  title="Reset to pre-seeded engineering curriculum"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="font-bold text-white">
                    {editingId ? 'Edit Course Parameters' : 'Add New Course'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Course Title</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Operating Systems"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Course Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. CS301"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as SubjectType)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white"
                    >
                      <option value="theory">Theory Lecture</option>
                      <option value="lab">Lab / Practical</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">
                      Minimum Threshold: {(targetThreshold * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.50"
                      max="0.95"
                      step="0.05"
                      value={targetThreshold}
                      onChange={(e) => setTargetThreshold(parseFloat(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Classes Attended So Far</label>
                    <input
                      type="number"
                      min="0"
                      value={attended}
                      onChange={(e) => setAttended(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Total Classes Conducted</label>
                    <input
                      type="number"
                      min="0"
                      value={held}
                      onChange={(e) => setHeld(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Accent Color Picker */}
                <div>
                  <label className="text-slate-400 block mb-1.5">Color Accent Tag</label>
                  <div className="flex items-center gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                          color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-70'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-400 transition-all cursor-pointer"
                  >
                    {editingId ? 'Save Changes' : 'Create Course'}
                  </button>
                </div>
              </form>
            )}

            {/* Courses List */}
            <div className="space-y-2">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3 hover:bg-white/[0.05] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-10 rounded-full"
                      style={{ backgroundColor: sub.color }}
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{sub.name}</span>
                        <span className="text-xs font-mono font-semibold text-slate-400">
                          {sub.code}
                        </span>
                        <span className="px-1.5 py-0.2 text-[10px] rounded bg-white/5 text-slate-300 font-medium">
                          {sub.type === 'lab' ? 'Lab' : 'Theory'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mt-1">
                        Attended: <strong className="text-white font-mono">{sub.attended}</strong> /{' '}
                        <strong className="text-white font-mono">{sub.held}</strong> • Target:{' '}
                        <strong className="text-emerald-400 font-mono">
                          {(sub.targetThreshold * 100).toFixed(0)}%
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStartEdit(sub)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                      title="Edit subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteSubject(sub.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 cursor-pointer"
                      title="Delete subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
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
