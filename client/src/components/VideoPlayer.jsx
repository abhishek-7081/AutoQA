import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Repeat,
  FastForward,
  Rewind,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatTime, getSeverityStyle } from '../utils/formatters';

export default function VideoPlayer({
  videoUrl,
  issues = [],
  currentTime,
  onTimeUpdate,
  activeIssue,
  onSelectIssue,
  duration,
  setDuration,
  loopSegment,
  setLoopSegment,
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hoveredIssue, setHoveredIssue] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const timelineRef = useRef(null);

  // Sync external seek requests
  useEffect(() => {
    if (videoRef.current && currentTime !== undefined && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Handle loop segment check
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    onTimeUpdate(time);

    // If loop segment is active
    if (loopSegment && loopSegment.startSeconds !== undefined && loopSegment.endSeconds !== undefined) {
      if (time >= loopSegment.endSeconds || time < loopSegment.startSeconds - 0.5) {
        videoRef.current.currentTime = loopSegment.startSeconds;
        videoRef.current.play();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 150);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekBy = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
  };

  const handleTimelineClick = (e) => {
    if (!timelineRef.current || !videoRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(clickX / rect.width, 1));
    const targetSeconds = fraction * (duration || 150);
    videoRef.current.currentTime = targetSeconds;
    onTimeUpdate(targetSeconds);
  };

  const changeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const totalDuration = duration || 150;
  const progressPercent = totalDuration ? Math.min(100, ((currentTime || 0) / totalDuration) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Video Viewport */}
      <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />
        ) : (
          <div className="text-center p-8 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center border border-slate-700">
              <Play className="w-8 h-8 ml-1" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">No Video Loaded</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Upload a video above or click <span className="text-indigo-400 font-semibold">Load Sample Demo</span> in
                the header to launch the interactive player.
              </p>
            </div>
          </div>
        )}

        {/* Replay Segment Badge overlay when looping */}
        {loopSegment && (
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-indigo-600/90 text-white text-xs font-semibold flex items-center gap-2 backdrop-blur-md shadow-lg animate-pulse">
            <Repeat className="w-3.5 h-3.5" />
            <span>
              Looping Segment: {formatTime(loopSegment.startSeconds)} – {formatTime(loopSegment.endSeconds)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLoopSegment(null);
              }}
              className="ml-1 text-xs text-indigo-200 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {/* Hover Center Play Button overlay */}
        {videoUrl && !isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl shadow-blue-500/50 hover:scale-110 active:scale-95 transition"
          >
            <Play className="w-7 h-7 ml-1 fill-white" />
          </button>
        )}
      </div>

      {/* Interactive Timeline & Scrubber with Color-Coded Issue Markers */}
      <div className="px-4 pt-3 pb-2 bg-slate-950/80 border-t border-slate-800/80">
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="relative h-6 flex items-center cursor-pointer select-none group/timeline"
        >
          {/* Base track */}
          <div className="w-full h-2 rounded-full bg-slate-800 relative overflow-visible">
            {/* Played progress */}
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Scrubber Playhead Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-blue-600 -ml-2 group-hover/timeline:scale-125 transition-transform"
              style={{ left: `${progressPercent}%` }}
            />

            {/* Colored Issue Markers along Timeline */}
            {issues.map((iss) => {
              const startSec = iss.startSeconds ?? 0;
              const endSec = iss.endSeconds ?? startSec + 3;
              const leftPercent = Math.max(0, Math.min((startSec / totalDuration) * 100, 100));
              const widthPercent = Math.max(1.5, Math.min(((endSec - startSec) / totalDuration) * 100, 100));
              const isSelected = activeIssue && activeIssue.id === iss.id;

              const style = getSeverityStyle(iss.severity);

              return (
                <div
                  key={iss.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIssue(iss);
                    if (videoRef.current) {
                      videoRef.current.currentTime = iss.startSeconds;
                      videoRef.current.play();
                    }
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredIssue(iss);
                    setTooltipPos({ x: rect.left, y: rect.top });
                  }}
                  onMouseLeave={() => setHoveredIssue(null)}
                  className={`absolute top-0 h-full rounded-sm opacity-90 hover:opacity-100 hover:h-3.5 hover:-top-[3px] transition-all z-10 ${style.marker} ${
                    isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 h-4 -top-1' : ''
                  }`}
                  style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Hover Tooltip for Timeline Markers */}
        {hoveredIssue && (
          <div
            className="fixed z-50 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl text-xs text-slate-100 pointer-events-none -translate-x-1/2 -translate-y-full mb-2"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  hoveredIssue.severity === 'critical'
                    ? 'bg-rose-500'
                    : hoveredIssue.severity === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-sky-500'
                }`}
              />
              <span className="font-bold text-slate-200">
                {hoveredIssue.startTimestamp} – {hoveredIssue.endTimestamp}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                {hoveredIssue.categoryLabel || hoveredIssue.category}
              </span>
            </div>
            <p className="text-slate-300 font-medium">{hoveredIssue.title || hoveredIssue.description}</p>
            <p className="text-[10px] text-blue-400 mt-1">Click marker to seek and highlight issue</p>
          </div>
        )}

        {/* Timeline Control Bar: Playback Controls, Time Display, Speed, Volume */}
        <div className="flex items-center justify-between text-xs text-slate-300 pt-2">
          {/* Left: Playback buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 transition active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={() => seekBy(-5)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Rewind 5 seconds"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={() => seekBy(5)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Forward 5 seconds"
            >
              <FastForward className="w-4 h-4" />
            </button>

            {/* Current / Total Time */}
            <div className="font-mono text-slate-300 ml-2">
              <span className="font-semibold text-slate-100">{formatTime(currentTime || 0)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span className="text-slate-400">{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Right: Controls & Speed */}
          <div className="flex items-center gap-2">
            {/* Speed toggle */}
            <button
              onClick={changeSpeed}
              className="px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono text-[11px] font-semibold transition"
              title="Playback speed"
            >
              {playbackRate}x
            </button>

            {/* Mute */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Severity Legend */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/50 mt-2">
          <span className="text-slate-500 font-semibold uppercase text-[10px]">Timeline Markers:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Critical / Missing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Warning / Discrepancy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Minor / Audio Note</span>
          </div>
        </div>
      </div>
    </div>
  );
}
