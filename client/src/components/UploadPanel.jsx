import React, { useState, useRef } from 'react';
import { Upload, Video, FileText, Settings, Play, Sparkles, CheckCircle2, AlertCircle, X, FileUp } from 'lucide-react';
import { SAMPLE_SCRIPT } from '../utils/sampleDemo';

export default function UploadPanel({
  onAnalyze,
  isAnalyzing,
  analysisStep,
  videoFile,
  setVideoFile,
  scriptText,
  setScriptText,
  scriptFile,
  setScriptFile,
  model,
  setModel,
  strictness,
  setStrictness,
}) {
  const [scriptMode, setScriptMode] = useState('text'); // 'text' | 'file'
  const [isDragOverVideo, setIsDragOverVideo] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const videoInputRef = useRef(null);
  const scriptInputRef = useRef(null);

  // Handle video selection
  const handleVideoSelect = (file) => {
    if (!file) return;
    setVideoFile(file);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  const handleVideoDrop = (e) => {
    e.preventDefault();
    setIsDragOverVideo(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle script file selection
  const handleScriptFileSelect = async (file) => {
    if (!file) return;
    setScriptFile(file);

    // If it's a simple text file, also preview it into the text box
    if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setScriptText(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const wordCount = scriptText ? scriptText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = scriptText ? scriptText.length : 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Upload Inputs & Parameters</h2>
            <p className="text-xs text-slate-400">Provide the target video and the original script</p>
          </div>
        </div>

        {/* Quick sample script injector */}
        <button
          type="button"
          onClick={() => {
            setScriptText(SAMPLE_SCRIPT);
            setScriptMode('text');
          }}
          className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Use Sample Script</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Video Upload */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-blue-400" />
              <span>Target Video File</span>
            </span>
            {videoFile && (
              <span className="text-[11px] text-emerald-400 font-mono">
                {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
              </span>
            )}
          </label>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverVideo(true);
            }}
            onDragLeave={() => setIsDragOverVideo(false)}
            onDrop={handleVideoDrop}
            onClick={() => videoInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[170px] ${
              isDragOverVideo
                ? 'border-blue-500 bg-blue-500/10'
                : videoFile
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40'
            }`}
          >
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/*"
              className="hidden"
              onChange={(e) => e.target.files && handleVideoSelect(e.target.files[0])}
            />

            {videoFile ? (
              <div className="space-y-2 w-full">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[240px] mx-auto">
                  {videoFile.name}
                </div>
                <p className="text-[11px] text-slate-400">Click or drag a new video to replace</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-200">Drag & drop video here, or browse</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Supports MP4, WebM, MOV, MKV up to 500MB</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Script Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Original Script</span>
            </label>

            {/* Mode switch */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => setScriptMode('text')}
                className={`px-2 py-0.5 rounded-md font-medium transition ${
                  scriptMode === 'text' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setScriptMode('file')}
                className={`px-2 py-0.5 rounded-md font-medium transition ${
                  scriptMode === 'file' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Upload File
              </button>
            </div>
          </div>

          {scriptMode === 'text' ? (
            <div className="relative">
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Paste the original video script here (dialogue, cues, timestamps, visual notes)..."
                rows={6}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none text-xs text-slate-200 font-mono leading-relaxed resize-none transition"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 mt-1">
                <span>{wordCount} words • {charCount} chars</span>
                {scriptText && (
                  <button
                    type="button"
                    onClick={() => setScriptText('')}
                    className="text-slate-400 hover:text-rose-400 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              onClick={() => scriptInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700/80 hover:border-slate-600 rounded-xl p-4 text-center cursor-pointer bg-slate-950/40 min-h-[170px] flex flex-col items-center justify-center transition"
            >
              <input
                ref={scriptInputRef}
                type="file"
                accept=".txt,.md,.pdf,.docx,.json"
                className="hidden"
                onChange={(e) => e.target.files && handleScriptFileSelect(e.target.files[0])}
              />
              {scriptFile ? (
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-200">{scriptFile.name}</p>
                  <p className="text-[11px] text-slate-500">Click to choose another document</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-200">Upload Script Document</p>
                  <p className="text-[11px] text-slate-500">Supports PDF, DOCX, TXT, Markdown, JSON</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Model & Strictness Configuration Bar */}
      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-slate-400 font-medium mb-1">AI Video Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none focus:border-blue-500 transition"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended: Fast, High Accuracy Multimodal)</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Standard Multimodal)</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Visual Reasoning)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Script Adherence Strictness</label>
          <select
            value={strictness}
            onChange={(e) => setStrictness(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none focus:border-blue-500 transition"
          >
            <option value="balanced">Balanced (Accepts natural speech cadence, flags real errors)</option>
            <option value="strict">Strict (Flags every minor synonym or visual discrepancy)</option>
            <option value="lenient">Lenient (Flags only major omissions and visual breaks)</option>
          </select>
        </div>
      </div>

      {/* Action / Analyze CTA */}
      <div className="pt-2">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || (!videoFile && !scriptText && !scriptFile)}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/25 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{analysisStep || 'Analyzing Complete Video Against Script...'}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Start Second-by-Second Video Verification</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
