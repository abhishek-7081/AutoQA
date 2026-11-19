import React from 'react';
import { Play, Sparkles, Key, FileDown, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Header({ onOpenApiKeyModal, onLoadSampleDemo, hasReport, onExportPDF, isDemoLoading }) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                AutoQA
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                AI Video & Script Auditor
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Second-by-Second Multimodal Video Verification & Compliance Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Load Sample Demo Button */}
          <button
            onClick={onLoadSampleDemo}
            disabled={isDemoLoading}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 border border-indigo-500/30 transition-all shadow-sm hover:shadow-indigo-500/10 active:scale-95 disabled:opacity-50"
            title="Load realistic sample video and verification report instantly without uploading"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{isDemoLoading ? 'Loading Demo...' : 'Load Sample Demo'}</span>
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKeyModal}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-all hover:border-slate-600 active:scale-95"
            title="Configure your Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">API Key</span>
          </button>

          {/* Export PDF Button (active when report is present) */}
          {hasReport && (
            <button
              onClick={onExportPDF}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-blue-600/40 active:scale-95"
              title="Download full analysis report as a formatted PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
