import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, XCircle, Play, ChevronRight, FileText } from 'lucide-react';

export default function TimelineView({ timelineSections = [], onSeekToTime, currentTime }) {
  if (!timelineSections || timelineSections.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        No chronological timeline data available.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('follow') || s.includes('match') || s === 'full') {
      return {
        label: 'Follows Script',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: CheckCircle2,
      };
    }
    if (s.includes('diverg') || s.includes('fail') || s === 'mismatch') {
      return {
        label: 'Diverged from Script',
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        icon: XCircle,
      };
    }
    return {
      label: 'Partial Match',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
    };
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Chronological Video Timeline Breakdown</span>
          </h2>
          <p className="text-xs text-slate-400">
            Chronological interval analysis covering every minute and second from start to finish
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          {timelineSections.length} Chronological Blocks
        </span>
      </div>

      <div className="space-y-3.5">
        {timelineSections.map((sec, idx) => {
          const statusInfo = getStatusBadge(sec.status);
          const StatusIcon = statusInfo.icon;
          const isCurrent =
            currentTime >= (sec.startSeconds ?? 0) && currentTime <= (sec.endSeconds ?? 9999);

          return (
            <div
              key={sec.sectionId || idx}
              className={`p-4 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-slate-800/80 border-blue-500/60 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => onSeekToTime(sec.startSeconds || 0)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 font-mono text-xs font-bold transition group"
                    title="Jump video to start of this section"
                  >
                    <Play className="w-3 h-3 fill-blue-400 group-hover:scale-110 transition-transform" />
                    <span>{sec.timeRange || `${sec.startSeconds}s - ${sec.endSeconds}s`}</span>
                  </button>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.badge}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    <span>{statusInfo.label}</span>
                  </span>
                </div>

                {sec.adherenceScore !== undefined && (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>Adherence:</span>
                    <span className="font-bold text-slate-200">{sec.adherenceScore}%</span>
                  </div>
                )}
              </div>

              {/* Grid: What is happening vs Script Expectation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    What Is Happening in Video
                  </span>
                  <p className="text-slate-200 leading-relaxed">{sec.whatIsHappening || 'Scene action & dialogue'}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    What the Script Expects
                  </span>
                  <p className="text-slate-200 leading-relaxed">{sec.scriptExpectation || 'Prescribed script content'}</p>
                </div>
              </div>

              {/* Flagged Errors in this window */}
              {Array.isArray(sec.detectedErrors) && sec.detectedErrors.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800/80">
                  <span className="text-[11px] font-bold text-rose-400 block mb-1">
                    Detected Discrepancies in This Window:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {sec.detectedErrors.map((err, errIdx) => (
                      <li key={errIdx} className="flex items-start gap-1.5 font-mono text-[11px]">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {sec.notes && (
                <p className="text-[11px] text-slate-400 mt-2 italic border-t border-slate-800/40 pt-1.5">
                  Auditor Note: {sec.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
