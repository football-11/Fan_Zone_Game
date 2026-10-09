import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { ContentItem, GameSessionState } from '../types/game';
import { signInOwnerWithGoogle, signOutOwner } from '../firebase';

interface OwnerAuthState {
  authenticated: boolean;
  token: string | null;
  email: string | null;
  method: 'google' | 'passcode' | null;
}

interface GameSyncContextValue {
  state: GameSessionState | null;
  contentItems: ContentItem[];
  connected: boolean;
  ownerAuth: OwnerAuthState;
  authError: string | null;
  loginWithPasscode: (passcode: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logoutOwner: () => void;
  sendHostAction: (action: string, payload?: Record<string, any>) => Promise<void>;
  refreshContentItems: () => Promise<void>;
  audioElementRef: React.RefObject<HTMLAudioElement | null>;
}

const GameSyncContext = createContext<GameSyncContextValue | undefined>(undefined);

export const GameSyncProvider: React.FC<{
  role: 'studio' | 'host';
  children: React.ReactNode;
}> = ({ role, children }) => {
  const [state, setState] = useState<GameSessionState | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [connected, setConnected] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Store owner session token in memory + sessionStorage (never used for cross-screen game state sync)
  const [ownerAuth, setOwnerAuth] = useState<OwnerAuthState>(() => {
    try {
      const saved = sessionStorage.getItem('fanzone_owner_auth');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      authenticated: false,
      token: null,
      email: null,
      method: null,
    };
  });

  const wsRef = useRef<WebSocket | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initial HTTP state fetch
  const fetchInitialState = useCallback(async () => {
    try {
      if (role === 'host' && ownerAuth.authenticated && ownerAuth.token) {
        const res = await fetch('/api/host/state', {
          headers: { Authorization: `Bearer ${ownerAuth.token}` },
        });
        if (res.status === 401) {
          // Token expired on server restart; re-authenticate seamlessly if passcode/owner session existed
          const reAuthRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ passcode: '2026' }),
          });
          if (reAuthRes.ok) {
            const data = await reAuthRes.json();
            const nextAuth: OwnerAuthState = {
              authenticated: true,
              token: data.token,
              email: ownerAuth.email || data.owner?.email || 'footballtotel11@gmail.com',
              method: ownerAuth.method || 'passcode',
            };
            setOwnerAuth(nextAuth);
            sessionStorage.setItem('fanzone_owner_auth', JSON.stringify(nextAuth));
            return;
          }
        }
        if (res.ok) {
          const data = await res.json();
          setState(data.state);
          if (Array.isArray(data.contentItems)) {
            setContentItems(data.contentItems);
          }
          return;
        }
      }
      // Fallback or Studio public sanitized state
      const res = await fetch('/api/studio/state');
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
      }
    } catch (err) {
      console.error('Failed to fetch initial state:', err);
    }
  }, [role, ownerAuth.authenticated, ownerAuth.token, ownerAuth.email, ownerAuth.method]);

  useEffect(() => {
    fetchInitialState();
  }, [fetchInitialState]);

  // Serverless / Vercel Fallback Polling when WebSocket is disconnected
  useEffect(() => {
    if (connected) return;
    const pollId = setInterval(() => {
      fetchInitialState();
    }, 900);
    return () => clearInterval(pollId);
  }, [connected, fetchInitialState]);

  // WebSocket Real-Time Connection with Auto-Reconnect
  useEffect(() => {
    let isMounted = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connectWebSocket() {
      if (!isMounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const query =
        role === 'host' && ownerAuth.authenticated && ownerAuth.token
          ? `?role=host&token=${encodeURIComponent(ownerAuth.token)}`
          : '?role=studio';
      const wsUrl = `${protocol}//${window.location.host}/ws${query}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) return;
        setConnected(true);
        if (role === 'host' && ownerAuth.authenticated && ownerAuth.token) {
          ws.send(JSON.stringify({ type: 'auth:upgrade', token: ownerAuth.token }));
        }
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'state:update' && msg.state) {
            setState(msg.state);
            if (Array.isArray(msg.contentItems)) {
              setContentItems(msg.contentItems);
            }
          } else if (msg.type === 'audio:command') {
            const audioEl = audioElementRef.current;
            if (audioEl) {
              if (msg.action === 'play' && msg.mediaUrl) {
                if (audioEl.src !== window.location.origin + msg.mediaUrl) {
                  audioEl.src = msg.mediaUrl;
                }
                audioEl.currentTime = 0;
                audioEl.play().catch(() => {
                  // Autoplay blocked by browser until user interacts
                });
              } else if (msg.action === 'stop') {
                audioEl.pause();
                audioEl.currentTime = 0;
              }
            }
          }
        } catch (err) {
          console.error('WS parse error:', err);
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setConnected(false);
        reconnectTimer = setTimeout(connectWebSocket, 1500);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [role, ownerAuth.authenticated, ownerAuth.token]);

  const loginWithPasscode = async (passcode: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(data.error || 'Invalid Studio Passcode');
        return false;
      }
      const nextAuth: OwnerAuthState = {
        authenticated: true,
        token: data.token,
        email: data.owner?.email || 'footballtotel11@gmail.com',
        method: 'passcode',
      };
      setOwnerAuth(nextAuth);
      sessionStorage.setItem('fanzone_owner_auth', JSON.stringify(nextAuth));
      return true;
    } catch {
      setAuthError('Network error verifying passcode');
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const user = await signInOwnerWithGoogle();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          firebaseUid: user.uid,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAuthError(data.error || 'Google account not authorized as Studio Owner');
        return false;
      }
      const nextAuth: OwnerAuthState = {
        authenticated: true,
        token: data.token,
        email: user.email,
        method: 'google',
      };
      setOwnerAuth(nextAuth);
      sessionStorage.setItem('fanzone_owner_auth', JSON.stringify(nextAuth));
      return true;
    } catch (err: any) {
      setAuthError(
        err?.message || 'Google Sign-In popup closed or blocked. Use Studio Owner Passcode below.'
      );
      return false;
    }
  };

  const logoutOwner = () => {
    signOutOwner().catch(() => {});
    const cleared: OwnerAuthState = {
      authenticated: false,
      token: null,
      email: null,
      method: null,
    };
    setOwnerAuth(cleared);
    sessionStorage.removeItem('fanzone_owner_auth');
  };

  const sendHostAction = async (action: string, payload: Record<string, any> = {}) => {
    if (!ownerAuth.token) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'host:action',
          action,
          payload,
        })
      );
    } else {
      const res = await fetch('/api/host/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerAuth.token}`,
        },
        body: JSON.stringify({ action, payload }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) setState(data.state);
      }
    }
  };

  const refreshContentItems = async () => {
    if (!ownerAuth.token) return;
    const res = await fetch('/api/content', {
      headers: { Authorization: `Bearer ${ownerAuth.token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        setContentItems(data.items);
      }
    }
  };

  return (
    <GameSyncContext.Provider
      value={{
        state,
        contentItems,
        connected,
        ownerAuth,
        authError,
        loginWithPasscode,
        loginWithGoogle,
        logoutOwner,
        sendHostAction,
        refreshContentItems,
        audioElementRef,
      }}
    >
      {/* Hidden synchronized audio player element for studio/host */}
      <audio ref={audioElementRef} className="hidden" preload="auto" />
      {children}
    </GameSyncContext.Provider>
  );
};

export function useGameSync() {
  const ctx = useContext(GameSyncContext);
  if (!ctx) throw new Error('useGameSync must be used within GameSyncProvider');
  return ctx;
}
