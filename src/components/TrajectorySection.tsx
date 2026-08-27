import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Target,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { TrajectoryPoint } from '../types';

interface TrajectorySectionProps {
  points: TrajectoryPoint[];
  targetThreshold: number; // e.g. 0.75
  onOpenWhatIf: () => void;
}

export const TrajectorySection: React.FC<TrajectorySectionProps> = ({
  points,
  targetThreshold,
  onOpenWhatIf,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const targetPct = targetThreshold * 100;

  // Chart dimensions & scaling
  const chartHeight = 260;
  const chartWidth = 800; // viewbox coordinate space
  const padding = { top: 30, right: 30, bottom: 45, left: 50 };

  const usableWidth = chartWidth - padding.left - padding.right;
  const usableHeight = chartHeight - padding.top - padding.bottom;

  // Min and max Y values with padding
  const minY = 50;
  const maxY = 100;

  const getY = (pct: number) => {
    const clamped = Math.min(maxY, Math.max(minY, pct));
    const ratio = (clamped - minY) / (maxY - minY);
    return padding.top + (1 - ratio) * usableHeight;
  };

  const getX = (index: number) => {
    if (points.length <= 1) return padding.left + usableWidth / 2;
    return padding.left + (index / (points.length - 1)) * usableWidth;
  };

  // Build SVG paths
  const { pathBaseline, pathWhatIf, areaWhatIf, thresholdY } = useMemo(() => {
    if (points.length === 0) {
      return { pathBaseline: '', pathWhatIf: '', areaWhatIf: '', thresholdY: getY(targetPct) };
    }

    // Baseline trajectory path
    let pBase = `M ${getX(0)} ${getY(points[0].percentage)}`;
    for (let i = 1; i < points.length; i++) {
      pBase += ` L ${getX(i)} ${getY(points[i].percentage)}`;
    }

    // What-If trajectory path
    let pWhatIf = `M ${getX(0)} ${getY(points[0].whatIfPercentage ?? points[0].percentage)}`;
    for (let i = 1; i < points.length; i++) {
      pWhatIf += ` L ${getX(i)} ${getY(points[i].whatIfPercentage ?? points[i].percentage)}`;
    }

    // Area path under what-if curve
    let aWhatIf = pWhatIf;
    aWhatIf += ` L ${getX(points.length - 1)} ${padding.top + usableHeight}`;
    aWhatIf += ` L ${getX(0)} ${padding.top + usableHeight} Z`;

    return {
      pathBaseline: pBase,
      pathWhatIf: pWhatIf,
      areaWhatIf: aWhatIf,
      thresholdY: getY(targetPct),
    };
  }, [points, targetPct]);

  const activePoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : points[points.length - 1];

  const finalPoint = points[points.length - 1];
  const finalPct = finalPoint ? (finalPoint.whatIfPercentage ?? finalPoint.percentage) : targetPct;
  const isFinalSafe = finalPct >= targetPct;

  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden" id="trajectory-section">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Attendance Trajectory to Target Horizon (Sept 26)
            </h3>
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            Mathematical projection model simulating daily held & attended lectures up to semester finale
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-white/80">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              <span>Projected</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/50">
              <span className="w-3 h-0.5 bg-red-400/80 inline-block border-t border-dashed" />
              <span>75% Target Line</span>
            </div>
          </div>

          <button
            onClick={onOpenWhatIf}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Edit What-If</span>
          </button>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="relative mt-4">
        {/* Trajectory Outcome Pill */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/50" />
            <span className="text-white/80 font-medium">
              Projected Sept 26 Finale:{' '}
              <strong className={`font-mono font-bold text-sm ${isFinalSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                {finalPct.toFixed(1)}%
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isFinalSafe ? (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Target Cleared (+{(finalPct - targetPct).toFixed(1)}% Buffer)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-rose-300 border border-red-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Deficit Detected ({(targetPct - finalPct).toFixed(1)}% Short)
              </span>
            )}
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div className="relative w-full aspect-[21/9] min-h-[240px] max-h-[340px]">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full overflow-visible select-none"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                <stop offset="85%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[100, 90, 80, 75, 60, 50].map((val) => {
              const y = getY(val);
              const isTarget = val === 75;
              return (
                <g key={val}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke={isTarget ? '#F43F5E' : 'rgba(255, 255, 255, 0.08)'}
                    strokeWidth={isTarget ? 1.5 : 1}
                    strokeDasharray={isTarget ? '6 4' : '2 4'}
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 3.5}
                    fill={isTarget ? '#FB7185' : '#64748B'}
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    fontWeight={isTarget ? 700 : 500}
                    textAnchor="end"
                  >
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* 75% Target Zone Label */}
            <text
              x={chartWidth - padding.right}
              y={thresholdY - 6}
              fill="#FB7185"
              fontSize={10}
              fontFamily="JetBrains Mono"
              fontWeight={700}
              textAnchor="end"
            >
              75% Minimum Mandatory
            </text>

            {/* Area Fill */}
            {areaWhatIf && (
              <motion.path
                d={areaWhatIf}
                fill="url(#areaGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              />
            )}

            {/* Baseline Ghost Line (if different from what-if) */}
            {pathBaseline && (
              <path
                d={pathBaseline}
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            )}

            {/* Projected What-If Line */}
            {pathWhatIf && (
              <motion.path
                d={pathWhatIf}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            )}

            {/* Data point dots & hover targets */}
            {points.map((pt, idx) => {
              const x = getX(idx);
              const y = getY(pt.whatIfPercentage ?? pt.percentage);
              const isHovered = hoveredIndex === idx;
              const isToday = idx === 0;

              return (
                <g key={pt.date} className="cursor-pointer">
                  {/* Invisible wide hit area for easy hover/touch */}
                  <rect
                    x={x - (usableWidth / points.length) / 2}
                    y={padding.top}
                    width={usableWidth / points.length}
                    height={usableHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onTouchStart={() => setHoveredIndex(idx)}
                  />

                  {/* Dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : isToday ? 5 : 3.5}
                    fill={isHovered ? '#FFFFFF' : isToday ? '#38BDF8' : '#10B981'}
                    stroke="#090D16"
                    strokeWidth={2}
                    className="transition-all duration-150"
                  />

                  {/* X-axis date labels (show every few steps) */}
                  {(idx === 0 ||
                    idx === points.length - 1 ||
                    idx % Math.ceil(points.length / 5) === 0) && (
                    <text
                      x={x}
                      y={chartHeight - 12}
                      fill="#94A3B8"
                      fontSize={10}
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      {pt.displayDate}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Hover vertical guide line & point marker */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <g>
                <line
                  x1={getX(hoveredIndex)}
                  y1={padding.top}
                  x2={getX(hoveredIndex)}
                  y2={padding.top + usableHeight}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              </g>
            )}
          </svg>

          {/* Floating Tooltip with 120Hz spring positioning */}
          {activePoint && hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute z-20 top-2 left-1/2 transform -translate-x-1/2 p-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/15 shadow-2xl text-xs flex items-center gap-4 pointer-events-none"
            >
              <div>
                <span className="text-[11px] font-mono text-slate-400 block">
                  {activePoint.displayDate} ({activePoint.date})
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-lg font-bold font-numeric text-emerald-400">
                    {(activePoint.whatIfPercentage ?? activePoint.percentage).toFixed(1)}%
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({activePoint.attended} / {activePoint.held} classes)
                  </span>
                </div>
              </div>

              <div className="border-l border-white/10 pl-3">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Day Slots
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {activePoint.slotsCount} {activePoint.slotsCount === 1 ? 'Slot' : 'Slots'}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
