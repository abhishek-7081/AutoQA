import React from 'react';
import { PieChart, AlertCircle, FileText, Volume2, Eye, Clock, MessageSquare, Zap } from 'lucide-react';
import { getCategoryBadge } from '../utils/formatters';

const ALL_CATEGORIES = [
  { key: 'missing_dialogue', label: 'Missing Dialogue', desc: 'Omitted sentences, words, or dialogues' },
  { key: 'script_mismatch', label: 'Script Mismatch', desc: 'Spoken dialogue deviates or substituted wording' },
  { key: 'extra_dialogue', label: 'Extra Dialogue', desc: 'Unexpected or ad-libbed dialogue not in script' },
  { key: 'pronunciation_error', label: 'Pronunciation Errors', desc: 'Unclear speech or mispronounced terms' },
  { key: 'audio_issue', label: 'Audio Issues & Silences', desc: 'Unnecessary pauses, dead air, or abrupt drops' },
  { key: 'visual_mismatch', label: 'Visual Mismatches', desc: 'Visual action/screens conflict with script cues' },
  { key: 'missing_scene', label: 'Missing Scenes', desc: 'Required graphics or storyboard scenes omitted' },
  { key: 'sync_issue', label: 'Timing & Sync Issues', desc: 'Lip-sync drift or audio-video offset' },
  { key: 'other_inconsistency', label: 'Other Inconsistencies', desc: 'Pacing or general quality issues' },
];

export default function ErrorSummaryView({ categorySummary = {}, issues = [], onFilterByCategory }) {
  const totalIssues = issues.length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-5">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-purple-400" />
          <span>Error Summary & Categorical Distribution</span>
        </h2>
        <p className="text-xs text-slate-400">
          Comprehensive grouping across 8 standardized quality assurance categories
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {ALL_CATEGORIES.map((cat) => {
          const badge = getCategoryBadge(cat.key);
          const count = issues.filter((i) => i.category === cat.key).length;
          const percentage = totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0;

          return (
            <div
              key={cat.key}
              onClick={() => onFilterByCategory && onFilterByCategory(cat.key)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                count > 0
                  ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:shadow-lg'
                  : 'bg-slate-950/30 border-slate-800/40 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.color}`}>
                  {cat.label}
                </span>
                <span
                  className={`text-sm font-bold font-mono ${
                    count > 0 ? 'text-slate-100' : 'text-slate-500'
                  }`}
                >
                  {count} {count === 1 ? 'issue' : 'issues'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mb-3">{cat.desc}</p>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    count > 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-transparent'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
                <span>{percentage}% of detected issues</span>
                {count > 0 && <span className="text-blue-400 hover:underline">View issues →</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
