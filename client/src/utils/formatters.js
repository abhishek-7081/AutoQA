/**
 * Formatting and helper utilities for AutoQA
 */

export function formatTime(seconds) {
  if (seconds === undefined || seconds === null || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function parseTimestampToSeconds(ts) {
  if (!ts) return 0;
  const parts = ts.toString().trim().split(':');
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
  }
  if (parts.length === 3) {
    return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
  }
  return parseFloat(ts) || 0;
}

export function getSeverityStyle(severity) {
  switch ((severity || '').toLowerCase()) {
    case 'critical':
      return {
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        marker: 'bg-rose-500',
        dot: 'bg-rose-400',
        border: 'border-rose-500/40',
        glow: 'shadow-rose-500/20',
        label: 'Critical Error',
      };
    case 'warning':
      return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        marker: 'bg-amber-500',
        dot: 'bg-amber-400',
        border: 'border-amber-500/40',
        glow: 'shadow-amber-500/20',
        label: 'Warning',
      };
    case 'minor':
    default:
      return {
        badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        marker: 'bg-sky-500',
        dot: 'bg-sky-400',
        border: 'border-sky-500/40',
        glow: 'shadow-sky-500/20',
        label: 'Minor Note',
      };
  }
}

export function getCategoryBadge(category) {
  const map = {
    missing_dialogue: { label: 'Missing Dialogue', color: 'text-rose-400 bg-rose-950/60 border-rose-800/60' },
    script_mismatch: { label: 'Script Mismatch', color: 'text-amber-400 bg-amber-950/60 border-amber-800/60' },
    audio_issue: { label: 'Audio / Silence', color: 'text-yellow-400 bg-yellow-950/60 border-yellow-800/60' },
    pronunciation_error: { label: 'Pronunciation', color: 'text-purple-400 bg-purple-950/60 border-purple-800/60' },
    visual_mismatch: { label: 'Visual Mismatch', color: 'text-orange-400 bg-orange-950/60 border-orange-800/60' },
    missing_scene: { label: 'Missing Scene', color: 'text-red-400 bg-red-950/60 border-red-800/60' },
    sync_issue: { label: 'Timing / Sync', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60' },
    extra_dialogue: { label: 'Extra Dialogue', color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60' },
    other_inconsistency: { label: 'Inconsistency', color: 'text-slate-400 bg-slate-800/60 border-slate-700/60' },
  };
  return map[category] || { label: category || 'General', color: 'text-slate-400 bg-slate-800/60 border-slate-700/60' };
}

export function getStatusStyle(status) {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('approved')) {
    return {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      icon: 'CheckCircle2',
      badge: 'APPROVED',
      bannerGradient: 'from-emerald-950/80 via-emerald-900/30 to-slate-950',
    };
  }
  if (normalized.includes('reject')) {
    return {
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      icon: 'XCircle',
      badge: 'REJECTED',
      bannerGradient: 'from-rose-950/80 via-rose-900/30 to-slate-950',
    };
  }
  return {
    bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    icon: 'AlertTriangle',
    badge: 'NEEDS IMPROVEMENT',
    bannerGradient: 'from-amber-950/80 via-amber-900/30 to-slate-950',
  };
}
