import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Volume2, Eye, Award, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { getStatusStyle } from '../utils/formatters';

function ScoreGauge({ label, score, subtitle, rating, color = 'blue' }) {
  // SVG circular progress calculation
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((score || 0) / 100) * circumference;

  const colorMap = {
    emerald: { stroke: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    amber: { stroke: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/10' },
    rose: { stroke: '#ef4444', text: 'text-rose-400', bg: 'bg-rose-500/10' },
    blue: { stroke: '#3b82f6', text: 'text-blue-400', bg: 'bg-blue-500/10' },
    purple: { stroke: '#a855f7', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-lg backdrop-blur-sm">
      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} stroke="#1e293b" strokeWidth="6" fill="transparent" />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={selectedColor.stroke}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-bold text-slate-100 font-mono">{score}%</span>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-300 truncate">{label}</span>
          {rating && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedColor.bg} ${selectedColor.text}`}>
              {rating}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}

export default function AssessmentCards({ assessment, metadata }) {
  if (!assessment) return null;

  const statusStyle = getStatusStyle(assessment.overallStatus);
  const totalIssues = assessment.totalIssues || 0;
  const severity = assessment.severityBreakdown || { critical: 0, warning: 0, minor: 0 };

  return (
    <div className="space-y-4">
      {/* Executive Status Banner */}
      <div
        className={`rounded-2xl border p-5 shadow-xl bg-gradient-to-r ${statusStyle.bannerGradient} ${statusStyle.bg}`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 shrink-0 shadow-lg">
              {statusStyle.badge === 'APPROVED' ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              ) : statusStyle.badge === 'REJECTED' ? (
                <XCircle className="w-7 h-7 text-rose-400" />
              ) : (
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Video Audit Verdict</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase border ${statusStyle.bg}`}
                >
                  {statusStyle.badge}
                </span>
                {metadata?.videoTitle && (
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">• {metadata.videoTitle}</span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-100 mt-1">
                {assessment.statusReason || 'Comprehensive analysis completed.'}
              </p>
            </div>
          </div>

          {/* Quick Issue Stats Count */}
          <div className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/10 shrink-0">
            <div className="px-3 py-1 text-center border-r border-slate-700/60">
              <div className="text-sm font-bold text-rose-400 font-mono">{severity.critical || 0}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Critical</div>
            </div>
            <div className="px-3 py-1 text-center border-r border-slate-700/60">
              <div className="text-sm font-bold text-amber-400 font-mono">{severity.warning || 0}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Warning</div>
            </div>
            <div className="px-3 py-1 text-center">
              <div className="text-sm font-bold text-sky-400 font-mono">{severity.minor || 0}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Minor</div>
            </div>
          </div>
        </div>

        {/* Executive Summary Prose */}
        {assessment.executiveSummary && (
          <div className="mt-4 pt-3.5 border-t border-white/10 text-xs text-slate-300 leading-relaxed bg-black/20 p-3 rounded-xl">
            <span className="font-semibold text-slate-200">Executive Summary: </span>
            {assessment.executiveSummary}
          </div>
        )}
      </div>

      {/* 4 Radial Gauges: Accuracy, Script Adherence, Audio Quality, Visual Consistency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreGauge
          label="Overall Accuracy"
          score={assessment.overallAccuracyPercentage || 0}
          subtitle="Total alignment across speech, pacing, and visual cues."
          color={
            assessment.overallAccuracyPercentage >= 90
              ? 'emerald'
              : assessment.overallAccuracyPercentage >= 75
              ? 'amber'
              : 'rose'
          }
        />

        <ScoreGauge
          label="Script Adherence"
          score={assessment.scriptAdherencePercentage || 0}
          subtitle="Word-for-word spoken dialogue matching rate."
          color={
            assessment.scriptAdherencePercentage >= 90
              ? 'emerald'
              : assessment.scriptAdherencePercentage >= 75
              ? 'blue'
              : 'rose'
          }
        />

        <ScoreGauge
          label="Audio Quality"
          score={assessment.audioQualityScore || 0}
          rating={assessment.audioQualityRating || 'Good'}
          subtitle={assessment.audioQualityNotes || 'Clarity, pacing, silences, and sync.'}
          color="purple"
        />

        <ScoreGauge
          label="Visual Consistency"
          score={assessment.visualConsistencyScore || 0}
          rating={assessment.visualConsistencyRating || 'Fair'}
          subtitle={assessment.visualConsistencyNotes || 'Scene fidelity and storyboard adherence.'}
          color="amber"
        />
      </div>
    </div>
  );
}
