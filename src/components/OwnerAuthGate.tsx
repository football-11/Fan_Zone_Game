import React, { useState } from 'react';
import { Shield, Lock, KeyRound, Tv } from 'lucide-react';
import { useGameSync } from '../context/GameSyncContext';

export const OwnerAuthGate: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => {
  const { ownerAuth, authError, loginWithPasscode, loginWithGoogle } = useGameSync();
  const [passcode, setPasscode] = useState('2026');
  const [submitting, setSubmitting] = useState(false);

  if (ownerAuth.authenticated) {
    return <>{children}</>;
  }

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await loginWithPasscode(passcode.trim() || '2026');
    setSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    await loginWithGoogle();
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#030914] text-slate-100 flex items-center justify-center p-6 font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-md bg-[#081326] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-['Outfit'] tracking-tight text-white">
                {title}
              </h1>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>
          <a
            href="/studio"
            target="_blank"
            rel="noreferrer"
            className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-sky-400 hover:bg-slate-800 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
          >
            <Tv className="w-4 h-4" />
            Studio Screen
          </a>
        </div>

        {/* Google Sign-In for Broadcast Owner */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-white text-slate-950 font-semibold text-sm flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors cursor-pointer mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
            />
          </svg>
          <span>Sign in with Google Owner Account</span>
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-800" />
          <span className="flex-shrink mx-3 text-xs text-slate-400">
            Or Studio Owner Passcode Fallback
          </span>
          <div className="flex-grow border-t border-slate-800" />
        </div>

        <form onSubmit={handlePasscodeSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Studio Owner Passcode (Default: 2026)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Studio Owner Passcode (2026)"
                className="w-full min-h-[48px] pl-10 pr-4 py-2.5 rounded-xl bg-[#030914] border border-slate-700 text-white font-['JetBrains_Mono'] text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{submitting ? 'Unlocking Console...' : 'Unlock Broadcast Console'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
