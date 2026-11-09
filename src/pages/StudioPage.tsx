import React, { useEffect, useState, useRef } from 'react';
import { GameSyncProvider, useGameSync } from '../context/GameSyncContext';
import { StudioStageView } from '../components/StudioStageView';
import { StudioErrorBoundary } from '../components/StudioErrorBoundary';
import { ArrowLeft, Maximize, Minimize, RefreshCw, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudioScreenContent: React.FC = () => {
  const { state, connected } = useGameSync();
  const [showToolbar, setShowToolbar] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectingElapsed, setConnectingElapsed] = useState(0);
  const toolbarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-track connecting wait duration
  useEffect(() => {
    if (state) return;
    const interval = setInterval(() => {
      setConnectingElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  // Mouse activity toolbar & cursor control
  const handleMouseMove = () => {
    setShowToolbar(true);
    if (toolbarTimeoutRef.current) {
      clearTimeout(toolbarTimeoutRef.current);
    }
    toolbarTimeoutRef.current = setTimeout(() => {
      setShowToolbar(false);
    }, 3200);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!state) {
    return (
      <div className="w-screen h-screen bg-[#030914] text-white flex flex-col items-center justify-center p-6 select-none font-['Outfit']">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-[#081326] border-2 border-amber-500/60 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.25)]">
            <Radio className="w-10 h-10 text-amber-400 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 animate-ping" />
        </div>

        <h1 className="text-2xl lg:text-3xl font-black tracking-wide text-amber-400 mb-2">
          FANZONE LIVE · CONNECTING STUDIO FEED...
        </h1>
        <p className="text-sm text-slate-400 max-w-md text-center mb-6">
          {connectingElapsed > 2
            ? 'Waiting for broadcast host session. You can force sync or switch to the host console below.'
            : 'Synchronizing real-time 16:9 stage mirror with host broadcast console.'}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs tracking-wider flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RETRY FEED</span>
          </button>
          <Link
            to="/host"
            className="px-5 py-2.5 rounded-xl bg-[#081326] border border-slate-700 hover:border-slate-500 text-slate-300 font-bold text-xs tracking-wider flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>GO TO HOST CONSOLE</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative w-screen h-screen bg-[#030914] overflow-hidden ${
        showToolbar ? 'cursor-default' : 'cursor-none'
      }`}
    >
      {/* Top Floating Broadcast Toolbar (Hover-Revealed) */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-2.5 bg-gradient-to-b from-[#030914]/95 via-[#081326]/85 to-transparent backdrop-blur-sm flex items-center justify-between transition-opacity duration-300 ${
          showToolbar ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            to="/host"
            className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-white font-['Outfit'] font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Host Console</span>
          </Link>
          <Link
            to="/content"
            className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-sky-400 text-slate-300 hover:text-white font-['Outfit'] font-bold text-xs transition-colors"
          >
            Content Bank
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-['JetBrains_Mono']">
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300">
              {connected ? 'BROADCAST SYNC LIVE' : 'AUTO-POLL SYNC ACTIVE'}
            </span>
          </div>

          <button
            onClick={() => window.location.reload()}
            title="Force reload studio feed"
            className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize className="w-3.5 h-3.5" />
            ) : (
              <Maximize className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <StudioStageView state={state} isPreview={false} />
    </div>
  );
};

export const StudioPage: React.FC = () => {
  return (
    <StudioErrorBoundary>
      <GameSyncProvider role="studio">
        <StudioScreenContent />
      </GameSyncProvider>
    </StudioErrorBoundary>
  );
};
