import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Play } from 'lucide-react';

export default function ScriptDiffView({ scriptText = '', issues = [], onSeekToTime }) {
  if (!scriptText) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        No script text provided.
      </div>
    );
  }

  const lines = scriptText.split('\n');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Script Alignment & In-Context Verification</span>
          </h2>
          <p className="text-xs text-slate-400">
            Original script with contextual annotations and corresponding video timestamps
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          {lines.length} Lines • {issues.length} Annotated Discrepancies
        </span>
      </div>

      <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-4 font-mono text-xs leading-relaxed max-h-[600px] overflow-y-auto space-y-1">
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const isCue = line.trim().startsWith('[') || line.trim().startsWith('VISUAL:') || line.trim().startsWith('NARRATOR:');
          const isHeader = line.trim().startsWith('Title:');

          // Check if any issue's expected content matches words in this line
          const matchingIssue = issues.find((iss) => {
            if (!iss.expectedContent) return false;
            const cleanExpected = iss.expectedContent.replace(/["']/g, '').toLowerCase().slice(0, 20);
            return cleanExpected.length > 5 && line.toLowerCase().includes(cleanExpected);
          });

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 py-0.5 px-2 rounded transition ${
                matchingIssue
                  ? 'bg-rose-950/30 border-l-2 border-rose-500'
                  : 'hover:bg-slate-900/50'
              }`}
            >
              <span className="text-slate-600 select-none w-8 text-right shrink-0">{lineNum}</span>
              <div className="flex-1">
                <span
                  className={
                    isHeader
                      ? 'text-cyan-400 font-bold'
                      : isCue
                      ? 'text-purple-300 font-semibold'
                      : matchingIssue
                      ? 'text-rose-200'
                      : 'text-slate-300'
                  }
                >
                  {line || ' '}
                </span>

                {matchingIssue && (
                  <div className="inline-flex items-center gap-2 ml-3 my-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 font-sans">
                    <button
                      type="button"
                      onClick={() => onSeekToTime(matchingIssue.startSeconds || 0)}
                      className="font-bold underline hover:text-white flex items-center gap-1 font-mono"
                    >
                      <Play className="w-2.5 h-2.5 fill-rose-300" />
                      <span>{matchingIssue.startTimestamp}</span>
                    </button>
                    <span>Flagged: {matchingIssue.categoryLabel || matchingIssue.category}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
