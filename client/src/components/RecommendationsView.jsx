import React from 'react';
import { Sparkles, CheckCircle2, Wrench, Scissors, Mic, Film, ArrowRight } from 'lucide-react';

export default function RecommendationsView({ recommendations = [] }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        No specific recommendations generated.
      </div>
    );
  }

  const getRoleIcon = (role = '') => {
    const r = role.toLowerCase();
    if (r.includes('audio') || r.includes('voice') || r.includes('talent')) return Mic;
    if (r.includes('graphics') || r.includes('motion') || r.includes('animat')) return Film;
    if (r.includes('editor')) return Scissors;
    return Wrench;
  };

  const getPriorityBadge = (priority = '') => {
    const p = priority.toLowerCase();
    if (p.includes('high')) return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    if (p.includes('medium')) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Actionable Editorial & Production Recommendations</span>
          </h2>
          <p className="text-xs text-slate-400">
            Concrete remediation steps for video editors, audio engineers, and voice talent
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          {recommendations.length} Action Items
        </span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => {
          const RoleIcon = getRoleIcon(rec.targetRole);
          const priorityStyle = getPriorityBadge(rec.priority);

          return (
            <div
              key={rec.id || idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <RoleIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">
                    {rec.targetRole || 'Production Team'}
                  </span>
                  {rec.area && (
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {rec.area}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${priorityStyle}`}
                >
                  {rec.priority || 'Medium'} Priority
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-9">
                {rec.recommendation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
