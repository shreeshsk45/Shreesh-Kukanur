import React from 'react';
import {
  Sparkles,
  Calendar,
  Layers,
  Award,
  BookOpen,
  Database,
  Sliders,
  TrendingUp,
  Percent,
  Clock,
} from 'lucide-react';
import { BatchType } from '../types';

interface NavbarProps {
  userBatch: BatchType;
  globalTarget: number;
  targetEndDate: string;
  onSetUserBatch: (batch: BatchType) => void;
  onSetGlobalTarget: (target: number) => void;
  onOpenWhatIf: () => void;
  onOpenTimetable: () => void;
  onOpenCalendar: () => void;
  onOpenGrace: () => void;
  onOpenSubjects: () => void;
  onOpenBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userBatch,
  globalTarget,
  targetEndDate,
  onSetUserBatch,
  onSetGlobalTarget,
  onOpenWhatIf,
  onOpenTimetable,
  onOpenCalendar,
  onOpenGrace,
  onOpenSubjects,
  onOpenBackup,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0A0C10]/85 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand & App Name */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] shrink-0">
            <div className="w-5 h-5 border-2 border-white rounded-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                BunkSmart
              </h1>
              <span className="hidden sm:inline-block bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-300 border border-white/10">
                FALL 2026
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                ON TRACK
              </span>
            </div>
            <p className="text-[11px] text-white/50 font-medium hidden md:block">
              Precision Attendance & Strategic Bunk Simulator
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Pills */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
          {/* Target Threshold Quick Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-md p-1 rounded-full border border-white/10 text-xs">
            <span className="text-white/40 px-2 font-bold text-[10px] uppercase tracking-wider">
              TARGET:
            </span>
            {[0.75, 0.80, 0.85].map((t) => (
              <button
                key={t}
                onClick={() => onSetGlobalTarget(t)}
                className={`px-3 py-1 rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
                  globalTarget === t
                    ? 'bg-white text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {(t * 100).toFixed(0)}%
              </button>
            ))}
          </div>

          {/* Batch Selector */}
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md p-1 rounded-full border border-white/10 text-xs">
            <span className="text-white/40 px-2 font-bold text-[10px] uppercase tracking-wider hidden sm:inline">
              BATCH:
            </span>
            {(['All', 'C1', 'C2'] as BatchType[]).map((b) => (
              <button
                key={b}
                onClick={() => onSetUserBatch(b)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  userBatch === b
                    ? 'bg-white text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Primary Action: What-If Simulator */}
          <button
            onClick={onOpenWhatIf}
            className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <TrendingUp className="w-4 h-4 stroke-[3]" />
            <span>What-If</span>
          </button>

          {/* Timetable trigger */}
          <button
            onClick={onOpenTimetable}
            title="Weekly Timetable"
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Academic Calendar trigger */}
          <button
            onClick={onOpenCalendar}
            title="Academic Calendar & Holidays"
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <Calendar className="w-4 h-4" />
          </button>

          {/* Grace & OD trigger */}
          <button
            onClick={onOpenGrace}
            title="Grace Credits & On-Duty Leaves"
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 hover:text-amber-200 transition-all cursor-pointer shrink-0"
          >
            <Award className="w-4 h-4" />
          </button>

          {/* Subject Manager trigger */}
          <button
            onClick={onOpenSubjects}
            title="Manage Courses & Targets"
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Data persistence trigger */}
          <button
            onClick={onOpenBackup}
            title="Data Backup & JSON Export"
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
