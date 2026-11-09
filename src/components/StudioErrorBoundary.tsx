import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class StudioErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'Render error' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Studio Display ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('fanzone_live_state_v1');
    } catch {
      // ignore
    }
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-[#030914] text-white flex flex-col items-center justify-center p-6 text-center select-none font-['Outfit']">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/15 border-2 border-amber-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <span className="text-3xl text-amber-400">⚡</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
            FANZONE LIVE · STUDIO FEED RECOVERY
          </h1>
          <p className="text-sm lg:text-base text-slate-400 max-w-md mb-8">
            The studio display encountered a temporary display hiccup. The broadcast state has been
            protected and can be refreshed instantly.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={this.handleReset}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-xl cursor-pointer transition-all active:scale-95"
            >
              RECOVER & RELOAD STUDIO
            </button>
            <a
              href="/host"
              className="px-6 py-3 rounded-xl bg-[#081326] border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-sm tracking-wide transition-all"
            >
              OPEN HOST CONSOLE
            </a>
          </div>

          {this.state.errorMessage && (
            <p className="mt-8 font-['JetBrains_Mono'] text-xs text-slate-600 max-w-xl truncate">
              Detail: {this.state.errorMessage}
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
