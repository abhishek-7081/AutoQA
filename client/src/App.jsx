import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ApiKeyModal from './components/ApiKeyModal';
import UploadPanel from './components/UploadPanel';
import VideoPlayer from './components/VideoPlayer';
import AssessmentCards from './components/AssessmentCards';
import IssueList from './components/IssueList';
import TimelineView from './components/TimelineView';
import ErrorSummaryView from './components/ErrorSummaryView';
import RecommendationsView from './components/RecommendationsView';
import ScriptDiffView from './components/ScriptDiffView';

import { exportReportToPDF } from './utils/pdfGenerator';
import { SAMPLE_SCRIPT, SAMPLE_ANALYSIS_REPORT, createSyntheticDemoVideoBlob } from './utils/sampleDemo';
import {
  ListChecks,
  Clock,
  PieChart,
  Sparkles,
  FileText,
  FileDown,
  Download,
  Share2,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('autoqa_gemini_api_key') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Inputs
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [scriptText, setScriptText] = useState('');
  const [scriptFile, setScriptFile] = useState(null);
  const [model, setModel] = useState('gemini-3.5-flash');
  const [strictness, setStrictness] = useState('balanced');

  // Video Player state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(150);
  const [activeIssue, setActiveIssue] = useState(null);
  const [loopSegment, setLoopSegment] = useState(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState('issues'); // issues | timeline | summary | recommendations | script
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Save API key
  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem('autoqa_gemini_api_key', newKey);
  };

  // Quick Load Sample Demo
  const handleLoadSampleDemo = async () => {
    setIsDemoLoading(true);
    try {
      setScriptText(SAMPLE_SCRIPT);
      setReport(SAMPLE_ANALYSIS_REPORT);
      setActiveTab('issues');
      setActiveIssue(SAMPLE_ANALYSIS_REPORT.issues[0]);

      // If user hasn't uploaded a video yet, create the synthetic video stream
      if (!videoUrl) {
        const demoVideoBlobUrl = await createSyntheticDemoVideoBlob();
        setVideoUrl(demoVideoBlobUrl);
      }
    } catch (err) {
      console.error('Error generating demo video:', err);
      // Fallback: report is still loaded
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Video file selection update
  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

  // Main Analysis Trigger
  const handleAnalyze = async () => {
    if (!videoFile) {
      alert('Please select or upload a video file first.');
      return;
    }
    if (!scriptText.trim() && !scriptFile) {
      alert('Please provide the original script (text or document).');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('Uploading video and script to AutoQA server...');

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      if (scriptFile) {
        formData.append('scriptFile', scriptFile);
      } else {
        formData.append('scriptText', scriptText);
      }
      formData.append('model', model);
      formData.append('strictness', strictness);
      if (apiKey) formData.append('apiKey', apiKey);

      setAnalysisStep('Processing multimodal video frames & speech with Gemini...');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete video verification analysis');
      }

      setReport(data.report);
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      }
      if (data.scriptText) {
        setScriptText(data.scriptText);
      }
      if (data.report?.issues && data.report.issues.length > 0) {
        setActiveIssue(data.report.issues[0]);
      }
      setActiveTab('issues');
    } catch (error) {
      console.error('Analysis failed:', error);
      alert(`Analysis Error: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  // Export handlers
  const handleExportPDF = () => {
    if (report) {
      exportReportToPDF(report, scriptText);
    }
  };

  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.metadata?.videoTitle || 'AutoQA_Report'}_Analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!report || !report.issues) return;
    const headers = ['Timestamp', 'Category', 'Severity', 'Title', 'Description', 'Expected Content', 'Actual Content', 'Correction'];
    const rows = report.issues.map((i) => [
      `"${i.startTimestamp} - ${i.endTimestamp}"`,
      `"${i.categoryLabel || i.category}"`,
      `"${i.severity}"`,
      `"${(i.title || '').replace(/"/g, '""')}"`,
      `"${(i.description || '').replace(/"/g, '""')}"`,
      `"${(i.expectedContent || '').replace(/"/g, '""')}"`,
      `"${(i.actualContent || '').replace(/"/g, '""')}"`,
      `"${(i.suggestedCorrection || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.metadata?.videoTitle || 'AutoQA_Report'}_Issues.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectIssue = (iss) => {
    setActiveIssue(iss);
    setCurrentTime(iss.startSeconds || 0);
  };

  const handleReplaySegment = (iss) => {
    setActiveIssue(iss);
    setLoopSegment({
      startSeconds: iss.startSeconds || 0,
      endSeconds: iss.endSeconds || (iss.startSeconds || 0) + 4,
    });
    setCurrentTime(iss.startSeconds || 0);
  };

  const tabs = [
    { id: 'issues', label: 'Issues & Inspector', icon: ListChecks, count: report?.issues?.length },
    { id: 'timeline', label: 'Timeline Breakdown', icon: Clock, count: report?.timelineSections?.length },
    { id: 'summary', label: 'Category Summary', icon: PieChart },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles, count: report?.recommendations?.length },
    { id: 'script', label: 'Script Diff View', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onLoadSampleDemo={handleLoadSampleDemo}
        hasReport={!!report}
        onExportPDF={handleExportPDF}
        isDemoLoading={isDemoLoading}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Top Section: Upload Inputs & Parameters */}
        <UploadPanel
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          analysisStep={analysisStep}
          videoFile={videoFile}
          setVideoFile={setVideoFile}
          scriptText={scriptText}
          setScriptText={setScriptText}
          scriptFile={scriptFile}
          setScriptFile={setScriptFile}
          model={model}
          setModel={setModel}
          strictness={strictness}
          setStrictness={setStrictness}
        />

        {/* Video Player & Interactive Scrubber */}
        {(videoUrl || report) && (
          <div className="space-y-4">
            <VideoPlayer
              videoUrl={videoUrl}
              issues={report?.issues || []}
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              activeIssue={activeIssue}
              onSelectIssue={handleSelectIssue}
              duration={duration}
              setDuration={setDuration}
              loopSegment={loopSegment}
              setLoopSegment={setLoopSegment}
            />
          </div>
        )}

        {/* Assessment Dashboard Section */}
        {report && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Executive Assessment Banner & Circular Gauges */}
            <AssessmentCards assessment={report.assessment} metadata={report.metadata} />

            {/* Navigation Tab Bar & Export Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Data Export Quick Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                  title="Download issue log in CSV format"
                >
                  <Download className="w-3 h-3 text-emerald-400" />
                  <span>CSV</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                  title="Download full report JSON"
                >
                  <Download className="w-3 h-3 text-cyan-400" />
                  <span>JSON</span>
                </button>

                <button
                  onClick={handleExportPDF}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF Report</span>
                </button>
              </div>
            </div>

            {/* Active Tab View Rendering */}
            <div>
              {activeTab === 'issues' && (
                <IssueList
                  issues={report.issues || []}
                  activeIssue={activeIssue}
                  onSelectIssue={handleSelectIssue}
                  onReplaySegment={handleReplaySegment}
                  currentTime={currentTime}
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineView
                  timelineSections={report.timelineSections || []}
                  onSeekToTime={(seconds) => {
                    setCurrentTime(seconds);
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  currentTime={currentTime}
                />
              )}

              {activeTab === 'summary' && (
                <ErrorSummaryView
                  categorySummary={report.categorySummary}
                  issues={report.issues || []}
                  onFilterByCategory={(cat) => {
                    setActiveTab('issues');
                  }}
                />
              )}

              {activeTab === 'recommendations' && (
                <RecommendationsView recommendations={report.recommendations || []} />
              )}

              {activeTab === 'script' && (
                <ScriptDiffView
                  scriptText={scriptText}
                  issues={report.issues || []}
                  onSeekToTime={(seconds) => {
                    setCurrentTime(seconds);
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>AutoQA — Automated AI Video & Script Verification Engine</p>
          <p className="text-[11px] text-slate-600 font-mono">
            Powered by Google Gemini Multimodal APIs (Audio + Video Frame Alignment)
          </p>
        </div>
      </footer>
    </div>
  );
}
