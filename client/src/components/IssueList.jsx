import React, { useState } from 'react';
import {
  Search,
  Filter,
  Play,
  Repeat,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Volume2,
  Eye,
  Clock,
} from 'lucide-react';
import { getSeverityStyle, getCategoryBadge } from '../utils/formatters';

export default function IssueList({
  issues = [],
  activeIssue,
  onSelectIssue,
  onReplaySegment,
  currentTime,
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories present in the issues
  const categories = ['all', ...Array.from(new Set(issues.map((i) => i.category).filter(Boolean)))];

  // Filtering logic
  const filteredIssues = issues.filter((iss) => {
    if (selectedCategory !== 'all' && iss.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && (iss.severity || '').toLowerCase() !== selectedSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (iss.title || '').toLowerCase().includes(q);
      const matchDesc = (iss.description || '').toLowerCase().includes(q);
      const matchExpected = (iss.expectedContent || '').toLowerCase().includes(q);
      const matchActual = (iss.actualContent || '').toLowerCase().includes(q);
      const matchCat = (iss.categoryLabel || iss.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchExpected && !matchActual && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl p-5 space-y-4 backdrop-blur-sm">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
            2
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>Second-by-Second Issues</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono text-slate-300">
                {filteredIssues.length} of {issues.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400">Jump to timestamps, inspect script deviations, and replay segments</p>
          </div>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
          {['all', 'critical', 'warning', 'minor'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg font-medium capitalize transition text-xs ${
                selectedSeverity === sev
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search dialogue, timestamp, or issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition capitalize"
          >
            <option value="all">All Issue Categories ({issues.length})</option>
            {categories
              .filter((c) => c !== 'all')
              .map((cat) => {
                const count = issues.filter((i) => i.category === cat).length;
                const badge = getCategoryBadge(cat);
                return (
                  <option key={cat} value={cat}>
                    {badge.label} ({count})
                  </option>
                );
              })}
          </select>
        </div>
      </div>

      {/* Issues List Container */}
      <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/40 rounded-xl border border-slate-800/60 p-6 space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No issues found matching criteria</p>
            <p className="text-xs text-slate-500">Try adjusting your severity or category filters.</p>
          </div>
        ) : (
          filteredIssues.map((iss) => {
            const isSelected = activeIssue && activeIssue.id === iss.id;
            const sevStyle = getSeverityStyle(iss.severity);
            const catBadge = getCategoryBadge(iss.category);

            // Is video currently in this timestamp range?
            const isCurrentlyPlayingThis =
              currentTime >= iss.startSeconds && currentTime <= iss.endSeconds;

            return (
              <div
                key={iss.id}
                onClick={() => onSelectIssue(iss)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-800/90 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                    : isCurrentlyPlayingThis
                    ? 'bg-slate-800/60 border-amber-500/50'
                    : 'bg-slate-950/50 hover:bg-slate-800/40 border-slate-800'
                }`}
              >
                {/* Top Row: Timestamp, Category, Severity & Action Buttons */}
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Timestamp Pill - Click to Seek */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIssue(iss);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 font-mono text-xs font-bold transition group"
                      title="Click to jump video to this exact timestamp"
                    >
                      <Play className="w-3 h-3 fill-blue-400 group-hover:scale-110 transition-transform" />
                      <span>
                        {iss.startTimestamp} – {iss.endTimestamp}
                      </span>
                    </button>

                    {/* Category Badge */}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${catBadge.color}`}
                    >
                      {iss.categoryLabel || catBadge.label}
                    </span>

                    {/* Severity Badge */}
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${sevStyle.badge}`}
                    >
                      {iss.severity}
                    </span>

                    {/* Confidence */}
                    {iss.confidence && (
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        • {iss.confidence}
                      </span>
                    )}
                  </div>

                  {/* Quick Action: Replay Segment */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReplaySegment(iss);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition active:scale-95"
                      title="Loop playback of this specific issue segment"
                    >
                      <Repeat className="w-3 h-3 text-indigo-400" />
                      <span>Replay Segment</span>
                    </button>
                  </div>
                </div>

                {/* Issue Title & Description */}
                <h3 className="text-xs font-bold text-slate-100">{iss.title || iss.description}</h3>
                {iss.title && iss.description && iss.title !== iss.description && (
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{iss.description}</p>
                )}

                {/* Side-by-Side Comparison: Script Expectation vs Video Observation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800/80 text-xs">
                  {/* Expected Content */}
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      <CheckCircle className="w-3 h-3" />
                      <span>Expected According to Script</span>
                    </div>
                    <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                      {iss.expectedContent || 'Script text specified for this segment.'}
                    </p>
                  </div>

                  {/* Actual Video Observation */}
                  <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                      <AlertCircle className="w-3 h-3" />
                      <span>Actual Video Observation</span>
                    </div>
                    <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                      {iss.actualContent || 'Discrepancy detected in video audio/frames.'}
                    </p>
                  </div>
                </div>

                {/* Suggested Action / Remediation */}
                {iss.suggestedCorrection && (
                  <div className="mt-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex items-start gap-2 text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">Recommended Fix: </span>
                      <span>{iss.suggestedCorrection}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
