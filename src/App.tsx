/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBunkSmartStore } from './lib/storage';
import { Navbar } from './components/Navbar';
import { TopSummarySection } from './components/TopSummarySection';
import { DistributionSection } from './components/DistributionSection';
import { TrajectorySection } from './components/TrajectorySection';
import { WhatIfSimulatorModal } from './components/WhatIfSimulatorModal';
import { TimetableManagerModal } from './components/TimetableManagerModal';
import { CalendarManagerModal } from './components/CalendarManagerModal';
import { GraceTrackerModal } from './components/GraceTrackerModal';
import { SubjectManagerModal } from './components/SubjectManagerModal';
import { ExportImportModal } from './components/ExportImportModal';
import {
  Sparkles,
  Layers,
  Calendar,
  Award,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function App() {
  const {
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
    deleteTimetableSlot,
    updateCalendar,
    addHoliday,
    removeHoliday,
    addGraceCredit,
    toggleGraceCredit,
    deleteGraceCredit,
    resetToDefaults,
    importState,
  } = useBunkSmartStore();

  // Modal open states
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isTimetableOpen, setIsTimetableOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGraceOpen, setIsGraceOpen] = useState(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Filter today's slots
  const todaySlots = projectedSlots.filter((slot) => slot.isToday);

  // Active what-if bunks count
  const activeBunksCount = Object.values(state.whatIfOverrides).filter(
    (action) => action === 'hypothetical_bunk'
  ).length;

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300 pb-24">
      {/* Top Glassmorphic Navigation Bar */}
      <Navbar
        userBatch={state.userBatch}
        globalTarget={state.globalTargetThreshold}
        targetEndDate={state.calendar.targetEndDate}
        onSetUserBatch={setUserBatch}
        onSetGlobalTarget={setGlobalTarget}
        onOpenWhatIf={() => setIsWhatIfOpen(true)}
        onOpenTimetable={() => setIsTimetableOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenGrace={() => setIsGraceOpen(true)}
        onOpenSubjects={() => setIsSubjectsOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Active Simulation Notification Banner if what-ifs are active */}
        <AnimatePresence>
          {activeBunksCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 sm:p-5 rounded-[28px] bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 shadow-xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-black font-numeric text-base shadow-md">
                  {activeBunksCount}
                </div>
                <div>
                  <span className="font-bold text-amber-300 text-sm block">
                    What-If Bunk Simulation Active
                  </span>
                  <span className="text-xs text-white/60">
                    Showing projected attendance assuming {activeBunksCount} hypothetical class bunks.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWhatIfOpen(true)}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition-all border border-white/10"
                >
                  Adjust
                </button>
                <button
                  onClick={clearAllWhatIfs}
                  className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-400 text-white text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-md shadow-red-500/20"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Top Section: Pictorial & Bold Number Summary + Radial Gauge + Today's Action Card */}
        <TopSummarySection
          aggregate={aggregateMetrics}
          todaySlots={todaySlots}
          targetEndDate={state.calendar.targetEndDate}
          onQuickLogAttendance={updateSubjectAttendance}
          onOpenWhatIf={() => setIsWhatIfOpen(true)}
        />

        {/* 2. Middle Section: Distribution View (Animated Pie/Donut Chart) + Subject Cards Grid */}
        <DistributionSection
          metrics={subjectMetrics}
          aggregate={aggregateMetrics}
          projectedSlots={projectedSlots}
          onUpdateAttendance={updateSubjectAttendance}
          onSetSubjectTarget={setSubjectTarget}
          onOpenSubjectManager={() => setIsSubjectsOpen(true)}
        />

        {/* 3. Bottom Section: Trajectory View (Line Graph leading up to Sept 26 target date) */}
        <TrajectorySection
          points={trajectoryPoints}
          targetThreshold={state.globalTargetThreshold}
          onOpenWhatIf={() => setIsWhatIfOpen(true)}
        />

        {/* Mathematical Rules Card Footer */}
        <div className="p-6 rounded-[32px] bg-white/5 border border-white/10 text-xs text-white/50 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold">
            <Info className="w-4 h-4 text-emerald-400" />
            <span className="uppercase tracking-wider text-xs">Mathematical Precision Specifications</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-1">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-emerald-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Safe Bunks Formula:</span>
              <span className="text-white/90">Safe Bunks = floor((Attended - (T × TotalHeld)) / T)</span>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-red-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Compulsory Needed Formula:</span>
              <span className="text-white/90">Compulsory = ceil(((T × TotalHeld) - Attended) / (1 - T))</span>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Pill Navigation Bar from Design Theme */}
      <nav className="fixed bottom-6 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-2xl border border-white/15 rounded-full p-1.5 flex gap-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-auto overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-white text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-md"
          >
            Dashboard
          </button>
          <button
            onClick={() => setIsTimetableOpen(true)}
            className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs font-bold text-white/60 hover:text-white uppercase tracking-widest transition-all active:scale-95 cursor-pointer hover:bg-white/5"
          >
            Schedule
          </button>
          <button
            onClick={() => setIsWhatIfOpen(true)}
            className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs font-bold text-white/60 hover:text-white uppercase tracking-widest transition-all active:scale-95 cursor-pointer hover:bg-white/5"
          >
            Analytics
          </button>
          <button
            onClick={() => setIsSubjectsOpen(true)}
            className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs font-bold text-white/60 hover:text-white uppercase tracking-widest transition-all active:scale-95 cursor-pointer hover:bg-white/5"
          >
            Settings
          </button>
        </div>
      </nav>

      {/* Interactive Modals */}
      <WhatIfSimulatorModal
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        projectedSlots={projectedSlots}
        subjects={state.subjects}
        whatIfOverrides={state.whatIfOverrides}
        onToggleSlot={toggleWhatIfSlot}
        onClearAll={clearAllWhatIfs}
        currentAggregate={aggregateMetrics}
      />

      <TimetableManagerModal
        isOpen={isTimetableOpen}
        onClose={() => setIsTimetableOpen(false)}
        timetable={state.timetable}
        subjects={state.subjects}
        userBatch={state.userBatch}
        onAddSlot={addTimetableSlot}
        onDeleteSlot={deleteTimetableSlot}
        onSetUserBatch={setUserBatch}
      />

      <CalendarManagerModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        calendar={state.calendar}
        onUpdateCalendar={updateCalendar}
        onAddHoliday={addHoliday}
        onRemoveHoliday={removeHoliday}
      />

      <GraceTrackerModal
        isOpen={isGraceOpen}
        onClose={() => setIsGraceOpen(false)}
        graceCredits={state.graceCredits}
        subjects={state.subjects}
        onAddGraceCredit={addGraceCredit}
        onToggleGraceCredit={toggleGraceCredit}
        onDeleteGraceCredit={deleteGraceCredit}
      />

      <SubjectManagerModal
        isOpen={isSubjectsOpen}
        onClose={() => setIsSubjectsOpen(false)}
        subjects={state.subjects}
        onAddSubject={addSubject}
        onUpdateSubject={updateSubject}
        onDeleteSubject={deleteSubject}
        onResetDefaults={resetToDefaults}
      />

      <ExportImportModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        state={state}
        onImportState={importState}
        onResetDefaults={resetToDefaults}
      />
    </div>
  );
}
