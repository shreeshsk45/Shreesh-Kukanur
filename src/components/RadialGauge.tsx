import React from 'react';
import { motion } from 'motion/react';
import { SafetyTier } from '../types';

interface RadialGaugeProps {
  percentage: number;
  threshold: number; // e.g. 0.75 for 75%
  safetyTier: SafetyTier;
  size?: number;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  percentage,
  threshold,
  safetyTier,
  size = 200,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  // Threshold marker angle (0 to 360 deg)
  const targetPct = threshold * 100;
  const thresholdAngle = (targetPct / 100) * 360 - 90;
  const thresholdRad = (thresholdAngle * Math.PI) / 180;
  const markerX = size / 2 + (radius - 1) * Math.cos(thresholdRad);
  const markerY = size / 2 + (radius - 1) * Math.sin(thresholdRad);

  const getTierColors = () => {
    switch (safetyTier) {
      case 'safe':
        return {
          stroke: '#10B981', // Emerald
          gradientStart: '#34D399',
          gradientEnd: '#059669',
          bgGlow: 'rgba(16, 185, 129, 0.15)',
          badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          tierLabel: 'Safe Zone (≥80%)',
        };
      case 'warning':
        return {
          stroke: '#F59E0B', // Amber
          gradientStart: '#FBBF24',
          gradientEnd: '#D97706',
          bgGlow: 'rgba(245, 158, 11, 0.15)',
          badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          tierLabel: 'Calculated Edge (75-79.9%)',
        };
      case 'danger':
      default:
        return {
          stroke: '#F43F5E', // Rose
          gradientStart: '#FB7185',
          gradientEnd: '#E11D48',
          bgGlow: 'rgba(244, 63, 94, 0.18)',
          badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          tierLabel: 'Critical Deficit (<75%)',
        };
    }
  };

  const colors = getTierColors();

  return (
    <div className="relative flex flex-col items-center justify-center" id="radial-gauge-container">
      <div
        className="relative flex items-center justify-center rounded-full transition-all duration-700"
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 45px -10px ${colors.bgGlow}`,
        }}
      >
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.gradientStart} />
              <stop offset="100%" stopColor={colors.gradientEnd} />
            </linearGradient>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-800/80"
          />

          {/* 75% target threshold background zone marker */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth + 4}
            strokeDasharray={`${(targetPct / 100) * circumference} ${circumference}`}
            fill="transparent"
          />

          {/* Progress arc with spring animation */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              type: 'spring',
              stiffness: 60,
              damping: 15,
            }}
            strokeLinecap="round"
            fill="transparent"
            filter="url(#gaugeGlow)"
          />

          {/* Threshold indicator dot */}
          <circle
            cx={markerX}
            cy={markerY}
            r={4}
            fill="#FFFFFF"
            stroke="#090D16"
            strokeWidth={2}
          />
        </svg>

        {/* Center stats */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <motion.span
            key={percentage}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-4xl font-extrabold tracking-tight font-numeric text-white"
          >
            {percentage.toFixed(1)}
            <span className="text-xl font-medium text-slate-400 ml-0.5">%</span>
          </motion.span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
            Aggregate
          </span>
          <span className="text-[11px] font-mono text-slate-400 mt-0.5">
            Min Target: {targetPct}%
          </span>
        </div>
      </div>

      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${colors.badgeBg} flex items-center gap-1.5 shadow-sm`}>
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: colors.stroke }}
        />
        <span>{colors.tierLabel}</span>
      </div>
    </div>
  );
};
