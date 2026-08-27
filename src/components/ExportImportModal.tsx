import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Upload, RotateCcw, Database, Check } from 'lucide-react';
import { AppState } from '../lib/storage';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onImportState: (state: Partial<AppState>) => void;
  onResetDefaults: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  state,
  onImportState,
  onResetDefaults,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bunksmart_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      onImportState(parsed);
      setImportStatus('Successfully imported timetable and attendance state!');
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1200);
    } catch (err) {
      setImportStatus('Invalid JSON formatting. Please verify backup payload.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg glass-panel rounded-3xl shadow-2xl border border-white/15 flex flex-col overflow-hidden bg-[#0F172A]/95"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-600 to-slate-400 flex items-center justify-center text-white shadow-lg">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Data Persistence & Backup
                </h3>
                <p className="text-xs text-slate-400">
                  Instant local storage, offline backup and state export
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
          <div className="p-5 space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white block">Download JSON Backup</span>
                <span className="text-slate-400 text-[11px]">
                  Exports all subjects, schedules, holidays & grace credits
                </span>
              </div>

              <button
                onClick={handleExport}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>

            {/* Paste JSON to restore */}
            <div className="space-y-2">
              <label className="text-slate-300 font-semibold block">
                Paste JSON Backup to Restore:
              </label>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='Paste exported JSON here...'
                rows={4}
                className="w-full p-3 rounded-2xl bg-slate-900 border border-white/10 text-white font-mono text-[11px]"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handleImportJson}
                  disabled={!jsonText.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restore Data</span>
                </button>

                <button
                  onClick={() => {
                    onResetDefaults();
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-rose-300 text-xs font-semibold cursor-pointer border border-rose-500/20"
                >
                  Reset to Defaults
                </button>
              </div>

              {importStatus && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{importStatus}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-white/10 bg-slate-900 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
