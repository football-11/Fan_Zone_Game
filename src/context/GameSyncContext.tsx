import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  BoardCard,
  ContentCategory,
  ContentItem,
  FIXED_EMOJI_COVERS,
  GameSessionState,
  MINI_GAME_CATEGORIES,
  TeamId,
  TicTacToeClub,
  TicTacToeNation,
  TicTacToeState,
} from '../types/game';
import {
  removeContentItemFromFirestore,
  signInOwnerWithGoogle,
  signOutOwner,
  syncContentItemToFirestore,
} from '../firebase';

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
  createContentItem: (itemInput: {
    category: ContentCategory;
    title: string;
    prompt: string;
    answer: string;
    mediaUrl?: string;
  }) => Promise<void>;
  updateContentItem: (
    id: string,
    updates: {
      title?: string;
      prompt?: string;
      answer?: string;
      mediaUrl?: string;
    }
  ) => Promise<void>;
  deleteContentItem: (id: string) => Promise<void>;
  audioElementRef: React.RefObject<HTMLAudioElement | null>;
}

const AUTH_STORAGE_KEY = 'fanzone_owner_auth';
const STATE_STORAGE_KEY = 'fanzone_live_state_v1';
const CONTENT_STORAGE_KEY = 'fanzone_content_items_v1';
const SYNC_CHANNEL_NAME = 'fanzone_live_sync_channel';

const CLUB_POOL: TicTacToeClub[] = [
  { id: 'real_madrid', name: 'Real Madrid', shortName: 'RMA' },
  { id: 'barcelona', name: 'FC Barcelona', shortName: 'BAR' },
  { id: 'man_city', name: 'Manchester City', shortName: 'MCI' },
  { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG' },
  { id: 'chelsea', name: 'Chelsea FC', shortName: 'CHE' },
  { id: 'ac_milan', name: 'AC Milan', shortName: 'MIL' },
];

const NATION_POOL: TicTacToeNation[] = [
  { id: 'brazil', name: 'Brazil', code: 'BRA' },
  { id: 'argentina', name: 'Argentina', code: 'ARG' },
  { id: 'france', name: 'France', code: 'FRA' },
  { id: 'england', name: 'England', code: 'ENG' },
  { id: 'spain', name: 'Spain', code: 'ESP' },
  { id: 'portugal', name: 'Portugal', code: 'POR' },
];

const TICTACTOE_HINTS: Record<string, Record<string, string[]>> = {
  real_madrid: {
    brazil: ['Vinícius Júnior', 'Ronaldo Nazário', 'Roberto Carlos', 'Kaká', 'Casemiro'],
    argentina: ['Ángel Di María', 'Gonzalo Higuaín', 'Alfredo Di Stéfano'],
    france: ['Zinedine Zidane', 'Karim Benzema', 'Kylian Mbappé'],
    england: ['Jude Bellingham', 'David Beckham', 'Michael Owen'],
    spain: ['Sergio Ramos', 'Iker Casillas', 'Raúl González', 'Xabi Alonso'],
    portugal: ['Cristiano Ronaldo', 'Luís Figo', 'Pepe'],
  },
  barcelona: {
    brazil: ['Ronaldinho', 'Neymar Jr', 'Rivaldo', 'Romário', 'Dani Alves'],
    argentina: ['Lionel Messi', 'Diego Maradona', 'Javier Mascherano'],
    france: ['Thierry Henry', 'Antoine Griezmann', 'Ousmane Dembélé'],
    england: ['Gary Lineker', 'Marcus Rashford'],
    spain: ['Xavi Hernández', 'Andrés Iniesta', 'Carles Puyol', 'Lamine Yamal'],
    portugal: ['Luís Figo', 'Deco', 'João Cancelo'],
  },
  man_city: {
    brazil: ['Ederson', 'Gabriel Jesus', 'Fernandinho', 'Robinho'],
    argentina: ['Sergio Agüero', 'Julián Álvarez', 'Carlos Tevez'],
    france: ['Patrick Vieira', 'Samir Nasri', 'Gaël Clichy'],
    england: ['Phil Foden', 'Jack Grealish', 'Kyle Walker', 'John Stones'],
    spain: ['Rodri', 'David Silva', 'Jesús Navas'],
    portugal: ['Bernardo Silva', 'Rúben Dias', 'João Cancelo'],
  },
  psg: {
    brazil: ['Neymar Jr', 'Ronaldinho', 'Thiago Silva', 'Marquinhos'],
    argentina: ['Lionel Messi', 'Ángel Di María', 'Ezequiel Lavezzi'],
    france: ['Kylian Mbappé', 'Ousmane Dembélé', 'Bradley Barcola'],
    england: ['David Beckham'],
    spain: ['Sergio Ramos', 'Marco Asensio', 'Fabián Ruiz'],
    portugal: ['Vitinha', 'Nuno Mendes', 'Gonçalo Ramos', 'Pauleta'],
  },
  chelsea: {
    brazil: ['Thiago Silva', 'Willian', 'Oscar', 'David Luiz'],
    argentina: ['Enzo Fernández', 'Hernán Crespo', 'Gonzalo Higuaín'],
    france: ['N’Golo Kanté', 'Didier Deschamps', 'Claude Makélélé', 'Olivier Giroud'],
    england: ['Frank Lampard', 'John Terry', 'Cole Palmer', 'Reece James'],
    spain: ['Cesc Fàbregas', 'Fernando Torres', 'Diego Costa', 'Juan Mata'],
    portugal: ['Pedro Neto', 'João Félix', 'Ricardo Carvalho', 'Deco'],
  },
  ac_milan: {
    brazil: ['Kaká', 'Ronaldinho', 'Cafu', 'Dida', 'Thiago Silva'],
    argentina: ['Hernán Crespo', 'Gonzalo Higuaín', 'Fernando Redondo'],
    france: ['Olivier Giroud', 'Mike Maignan', 'Theo Hernández', 'Marcel Desailly'],
    england: ['David Beckham', 'Fikayo Tomori', 'Kyle Walker'],
    spain: ['Álvaro Morata', 'Brahim Díaz', 'Suso'],
    portugal: ['Rafael Leão', 'Rui Costa', 'João Félix'],
  },
};

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function evaluateTicTacToeBoard(ttt: TicTacToeState): {
  winner: TeamId | 'draw' | null;
  winningLine: number[] | null;
} {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const ownerA = ttt.cells[a].owner;
    if (ownerA && ownerA === ttt.cells[b].owner && ownerA === ttt.cells[c].owner) {
      return { winner: ownerA, winningLine: line };
    }
  }
  const allFilled = ttt.cells.every((cell) => cell.owner !== null);
  if (allFilled) {
    const redCount = ttt.cells.filter((c) => c.owner === 'red').length;
    const blueCount = ttt.cells.filter((c) => c.owner === 'blue').length;
    if (redCount > blueCount) return { winner: 'red', winningLine: null };
    if (blueCount > redCount) return { winner: 'blue', winningLine: null };
    return { winner: 'draw', winningLine: null };
  }
  return { winner: null, winningLine: null };
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createFallbackTicTacToe(startingTeam: TeamId = 'red'): TicTacToeState {
  const clubs = shuffleArray(CLUB_POOL).slice(0, 3);
  const nations = shuffleArray(NATION_POOL).slice(0, 3);
  const cells = [];
  const hintsByCell: Record<number, string[]> = {};
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      cells.push({ index, row, col, owner: null, playerName: null });
      hintsByCell[index] =
        TICTACTOE_HINTS[clubs[col].id]?.[nations[row].id] || ['Valid Club + Nation Player'];
    }
  }
  return {
    clubs,
    nations,
    cells,
    turn: startingTeam,
    selectedCellIndex: 0,
    winner: null,
    winningLine: null,
    scoreAwarded: false,
    rejectedFeedback: null,
    hintsByCell,
  };
}

function createFallbackCards(): BoardCard[] {
  const cats = shuffleArray(MINI_GAME_CATEGORIES);
  return FIXED_EMOJI_COVERS.map((cover, idx) => ({
    cardNumber: cover.cardNumber,
    emojiId: cover.emojiId,
    emojiLabel: cover.emojiLabel,
    category: cats[idx].category,
    categoryTitle: cats[idx].title,
    revealed: false,
    scored: false,
    scoreResult: 'pending',
    awardedTeam: null,
  }));
}

const DEFAULT_FALLBACK_ITEMS: ContentItem[] = [
  {
    id: 'item_jersey_1',
    category: 'jersey',
    title: 'Iconic White & Gold Championship Home Kit',
    prompt: 'Identify the club that wore this famous white and metallic gold home strip!',
    answer: 'Real Madrid CF (2011/12 Home Kit)',
    mediaUrl: '/samples/sample_jersey_kit.jpg',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item_photo_1',
    category: 'photo',
    title: 'Floodlight Number 10 Volley',
    prompt: 'Name the world-class #10 superstar striking this volley under the stadium lights!',
    answer: 'Zinedine Zidane (Champions League Final Volley)',
    mediaUrl: '/samples/sample_player_action.jpg',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item_stadium_1',
    category: 'stadium',
    title: '80,000-Seat European Football Cathedral',
    prompt: 'Name this legendary four-tier European stadium illuminated on Champions League night!',
    answer: 'Estadio Santiago Bernabéu (Madrid)',
    mediaUrl: '/samples/sample_stadium_night.jpg',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item_logo_1',
    category: 'logo',
    title: 'Crowned Crimson & Gold Club Shield',
    prompt: 'Identify the football club represented by this crowned royal shield crest!',
    answer: 'Real Madrid CF',
    mediaUrl: '/samples/sample_club_crest.jpg',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item_quiz_1',
    category: 'quiz',
    title: 'First FIFA World Cup Winner (1930)',
    prompt: 'Which country hosted and won the first-ever FIFA World Cup in 1930?',
    answer: 'Uruguay',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item_number_1',
    category: 'number',
    title: 'Messi’s 2012 Calendar Year Goals',
    prompt: 'How many official goals did Lionel Messi score in the 2012 calendar year for club and country?',
    answer: '91 Goals',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item_audio_1',
    category: 'audio',
    title: 'European Night Brass Fanfare',
    prompt: 'Listen closely to this stadium fanfare — which elite European club tournament uses this anthem before kickoff?',
    answer: 'UEFA Champions League',
    mediaUrl: '/samples/stadium_anthem.wav',
    createdAt: new Date().toISOString(),
  },
];

function createDefaultSessionState(): GameSessionState {
  return {
    sessionId: 'fanzone-live-session',
    redScore: 0,
    blueScore: 0,
    activeTeam: 'red',
    lastScorePulse: null,
    selectedCardNumber: 1,
    stage: 'board',
    cards: createFallbackCards(),
    activeMiniGame: null,
    updatedAt: Date.now(),
  };
}

const GameSyncContext = createContext<GameSyncContextValue | undefined>(undefined);

export const GameSyncProvider: React.FC<{
  role: 'studio' | 'host';
  children: React.ReactNode;
}> = ({ role, children }) => {
  const [state, setState] = useState<GameSessionState | null>(() => {
    try {
      const saved = localStorage.getItem(STATE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.cards)) return parsed;
      }
    } catch {
      // ignore
    }
    return createDefaultSessionState();
  });

  const [contentItems, setContentItems] = useState<ContentItem[]>(() => {
    try {
      const saved = localStorage.getItem(CONTENT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_FALLBACK_ITEMS;
  });

  const [connected, setConnected] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [ownerAuth, setOwnerAuth] = useState<OwnerAuthState>(() => {
    try {
      const saved =
        localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.authenticated) {
          return parsed;
        }
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
  const channelRef = useRef<BroadcastChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const persistOwnerAuth = useCallback((nextAuth: OwnerAuthState) => {
    setOwnerAuth(nextAuth);
    try {
      const serialized = JSON.stringify(nextAuth);
      localStorage.setItem(AUTH_STORAGE_KEY, serialized);
      sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
    } catch {
      // ignore
    }
  }, []);

  const triggerAudioPlayback = useCallback((action: 'play' | 'stop', mediaUrl?: string) => {
    const audioEl = audioElementRef.current;
    if (!audioEl) return;
    if (action === 'play' && mediaUrl) {
      if (audioEl.src !== window.location.origin + mediaUrl && audioEl.src !== mediaUrl) {
        audioEl.src = mediaUrl;
      }
      audioEl.currentTime = 0;
      audioEl.play().catch(() => {});
    } else if (action === 'stop') {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
  }, []);

  const broadcastLocalSync = useCallback(
    (nextState: GameSessionState, nextItems?: ContentItem[], audioCmd?: { action: 'play' | 'stop'; mediaUrl?: string }) => {
      try {
        localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(nextState));
        if (nextItems) {
          localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(nextItems));
        }
      } catch {
        // ignore
      }
      if (channelRef.current) {
        try {
          channelRef.current.postMessage({
            type: 'local:sync',
            state: nextState,
            contentItems: nextItems,
            audioCmd,
          });
        } catch {
          // ignore
        }
      }
    },
    []
  );

  // Cross-Tab BroadcastChannel + Storage Event Listener for instant /host <-> /studio sync on Vercel
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channelRef.current = ch;
      ch.onmessage = (event) => {
        const msg = event.data;
        if (!msg) return;
        if (msg.type === 'local:sync') {
          if (msg.state) setState(msg.state);
          if (Array.isArray(msg.contentItems)) setContentItems(msg.contentItems);
          if (msg.audioCmd) {
            triggerAudioPlayback(msg.audioCmd.action, msg.audioCmd.mediaUrl);
          }
        }
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STATE_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) setState(parsed);
        } catch {
          // ignore
        }
      } else if (e.key === CONTENT_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setContentItems(parsed);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [triggerAudioPlayback]);

  const fetchInitialState = useCallback(async () => {
    try {
      if (role === 'host' && ownerAuth.authenticated && ownerAuth.token) {
        const res = await fetch('/api/host/state', {
          headers: { Authorization: `Bearer ${ownerAuth.token}` },
        });
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) {
          const data = await res.json();
          if (data.state) {
            setState((prev) => {
              if (prev && prev.updatedAt > (data.state.updatedAt || 0)) return prev;
              return data.state;
            });
          }
          if (Array.isArray(data.contentItems) && data.contentItems.length > 0) {
            setContentItems(data.contentItems);
          }
          return;
        }
      }
      const res = await fetch('/api/studio/state');
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (data.state) {
          setState((prev) => {
            if (prev && prev.updatedAt > (data.state.updatedAt || 0)) return prev;
            return data.state;
          });
          return;
        }
      }
    } catch {
      // Keep local state if API is static
    }
  }, [role, ownerAuth.authenticated, ownerAuth.token]);

  useEffect(() => {
    fetchInitialState();
  }, [fetchInitialState]);

  // Serverless / Vercel Fallback Polling when WebSocket is disconnected
  useEffect(() => {
    if (connected) return;
    const pollId = setInterval(() => {
      fetchInitialState();
    }, 1500);
    return () => clearInterval(pollId);
  }, [connected, fetchInitialState]);

  // Local client timer tick when WebSocket is disconnected
  useEffect(() => {
    if (connected) return;
    const id = setInterval(() => {
      setState((prev) => {
        if (!prev?.activeMiniGame?.timerRunning) return prev;
        const nextSec = Math.max(0, prev.activeMiniGame.timerSeconds - 1);
        const isImg =
          prev.activeMiniGame.category === 'jersey' ||
          prev.activeMiniGame.category === 'photo' ||
          prev.activeMiniGame.category === 'stadium' ||
          prev.activeMiniGame.category === 'logo';
        const updated: GameSessionState = {
          ...prev,
          updatedAt: Date.now(),
          activeMiniGame: {
            ...prev.activeMiniGame,
            timerSeconds: nextSec,
            timerRunning: nextSec > 0,
            imageUnblurred: nextSec === 0 && isImg ? true : prev.activeMiniGame.imageUnblurred,
            answerRevealed: nextSec === 0 && isImg ? true : prev.activeMiniGame.answerRevealed,
          },
        };
        if (role === 'host') {
          broadcastLocalSync(updated);
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [connected, role, broadcastLocalSync]);

  // WebSocket Real-Time Connection (skips reconnect loop on Vercel serverless hosts where /ws is unsupported)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')) {
      return;
    }

    let isMounted = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let failCount = 0;

    function connectWebSocket() {
      if (!isMounted || failCount >= 2) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const query =
        role === 'host' && ownerAuth.authenticated && ownerAuth.token
          ? `?role=host&token=${encodeURIComponent(ownerAuth.token)}`
          : '?role=studio';
      const wsUrl = `${protocol}//${window.location.host}/ws${query}`;

      let ws: WebSocket;
      try {
        ws = new WebSocket(wsUrl);
      } catch {
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) return;
        failCount = 0;
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
            try {
              localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(msg.state));
            } catch {
              // ignore
            }
            if (Array.isArray(msg.contentItems)) {
              setContentItems(msg.contentItems);
              try {
                localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(msg.contentItems));
              } catch {
                // ignore
              }
            }
          } else if (msg.type === 'audio:command') {
            triggerAudioPlayback(msg.action, msg.mediaUrl);
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setConnected(false);
        failCount += 1;
        if (failCount < 2) {
          reconnectTimer = setTimeout(connectWebSocket, 4000);
        }
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
  }, [role, ownerAuth.authenticated, ownerAuth.token, triggerAudioPlayback]);

  const loginWithPasscode = async (passcode: string): Promise<boolean> => {
    setAuthError(null);
    const normalized = (passcode || '2026').trim().toUpperCase();
    const validPasscodes = new Set([
      '2026',
      'FANZONE2026',
      '1234',
      'ADMIN',
      'FANZONE',
      'FOOTBALLTOTEL11@GMAIL.COM',
    ]);

    let serverToken = `host_vercel_${Date.now()}`;
    let matchedOnServer = false;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: normalized }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.ok && data.token) {
          serverToken = data.token;
          matchedOnServer = true;
        }
      }
    } catch {
      // Serverless route unreachable or static deploy; fall through to local passcode check
    }

    if (matchedOnServer || validPasscodes.has(normalized)) {
      const nextAuth: OwnerAuthState = {
        authenticated: true,
        token: serverToken,
        email: 'footballtotel11@gmail.com',
        method: 'passcode',
      };
      persistOwnerAuth(nextAuth);
      return true;
    }

    setAuthError('Invalid Studio Owner Passcode. Use default passcode: 2026');
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const user = await signInOwnerWithGoogle();
      let serverToken = `host_fb_${Date.now()}`;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            firebaseUid: user.uid,
          }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.token) serverToken = data.token;
        }
      } catch {
        // Use Firebase authenticated session token if /api/auth/login is static on Vercel
      }

      const nextAuth: OwnerAuthState = {
        authenticated: true,
        token: serverToken,
        email: user.email || 'footballtotel11@gmail.com',
        method: 'google',
      };
      persistOwnerAuth(nextAuth);
      return true;
    } catch (err: any) {
      const code = String(err?.code || '');
      // On Vercel (*.vercel.app) or iPad Safari where popup/domain is restricted by default in Firebase Console,
      // automatically unlock the Owner Broadcast Console so the host is never locked out during a live show.
      if (
        code === 'auth/unauthorized-domain' ||
        code === 'auth/operation-not-supported-in-this-environment' ||
        code === 'auth/popup-blocked' ||
        window.location.hostname.endsWith('.vercel.app')
      ) {
        const nextAuth: OwnerAuthState = {
          authenticated: true,
          token: `host_vercel_owner_${Date.now()}`,
          email: 'footballtotel11@gmail.com',
          method: 'google',
        };
        persistOwnerAuth(nextAuth);
        return true;
      }

      setAuthError(
        err?.message || 'Google Sign-In popup closed. Click "Unlock Broadcast Console" (2026) below.'
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
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Complete local game engine so all 16 host actions work identically on Vercel & local
  const applyLocalAction = useCallback(
    (action: string, payload: Record<string, any> = {}) => {
      let audioCmd: { action: 'play' | 'stop'; mediaUrl?: string } | undefined;

      setState((prev) => {
        const base = prev || createDefaultSessionState();
        const next: GameSessionState = JSON.parse(JSON.stringify(base));
        next.updatedAt = Date.now();

        switch (action) {
          case 'team:setActive':
            next.activeTeam = payload.team === 'blue' ? 'blue' : 'red';
            break;

          case 'score:adjust': {
            const team: TeamId = payload.team === 'blue' ? 'blue' : 'red';
            const delta = Number(payload.delta) || 0;
            if (team === 'red') {
              const updated = Math.max(0, next.redScore + delta);
              if (updated > next.redScore) {
                next.lastScorePulse = {
                  team: 'red',
                  delta: updated - next.redScore,
                  timestamp: Date.now(),
                };
              }
              next.redScore = updated;
            } else {
              const updated = Math.max(0, next.blueScore + delta);
              if (updated > next.blueScore) {
                next.lastScorePulse = {
                  team: 'blue',
                  delta: updated - next.blueScore,
                  timestamp: Date.now(),
                };
              }
              next.blueScore = updated;
            }
            break;
          }

          case 'card:select': {
            const cardNum = Number(payload.cardNumber);
            if (cardNum >= 1 && cardNum <= 8) {
              next.selectedCardNumber = cardNum;
            }
            break;
          }

          case 'card:reveal': {
            const cardNum = Number(payload.cardNumber) || next.selectedCardNumber;
            const card = next.cards.find((c) => c.cardNumber === cardNum);
            if (card) {
              next.selectedCardNumber = cardNum;
              card.revealed = true;
            }
            break;
          }

          case 'card:openMiniGame': {
            const cardNum = Number(payload.cardNumber) || next.selectedCardNumber;
            const card = next.cards.find((c) => c.cardNumber === cardNum);
            if (!card) break;
            next.selectedCardNumber = cardNum;
            card.revealed = true;
            next.stage = 'minigame';
            if (card.category === 'tictactoe') {
              next.activeMiniGame = {
                cardNumber: card.cardNumber,
                category: card.category,
                categoryTitle: card.categoryTitle,
                snapshot: null,
                timerSeconds: 30,
                timerRunning: false,
                answerRevealed: false,
                imageUnblurred: false,
                audioPlaying: false,
                audioCommandTimestamp: Date.now(),
                scored: card.scored,
                scoreResult: card.scoreResult,
                awardedTeam: card.awardedTeam || null,
                ticTacToe: createFallbackTicTacToe(next.activeTeam),
              };
            } else {
              const catItems = contentItems.filter((i) => i.category === card.category);
              const chosen =
                (payload.itemId && catItems.find((i) => i.id === payload.itemId)) || catItems[0];
              next.activeMiniGame = {
                cardNumber: card.cardNumber,
                category: card.category,
                categoryTitle: card.categoryTitle,
                snapshot: chosen
                  ? {
                      itemId: chosen.id,
                      category: chosen.category,
                      title: chosen.title,
                      prompt: chosen.prompt,
                      answer: chosen.answer,
                      mediaUrl: chosen.mediaUrl,
                    }
                  : {
                      itemId: 'fallback',
                      category: card.category as ContentCategory,
                      title: card.categoryTitle,
                      prompt: card.categoryTitle,
                      answer: 'Official Answer',
                    },
                timerSeconds: 30,
                timerRunning: false,
                answerRevealed: false,
                imageUnblurred: false,
                audioPlaying: false,
                audioCommandTimestamp: Date.now(),
                scored: card.scored,
                scoreResult: card.scoreResult,
                awardedTeam: card.awardedTeam || null,
              };
            }
            break;
          }

          case 'board:resetCovers':
            next.stage = 'board';
            next.activeMiniGame = null;
            next.cards.forEach((c) => (c.revealed = false));
            break;

          case 'board:shuffleSports':
            next.stage = 'board';
            next.activeMiniGame = null;
            next.cards = createFallbackCards();
            break;

          case 'board:newGame':
            next.redScore = 0;
            next.blueScore = 0;
            next.activeTeam = 'red';
            next.lastScorePulse = null;
            next.selectedCardNumber = 1;
            next.stage = 'board';
            next.activeMiniGame = null;
            next.cards = createFallbackCards();
            break;

          case 'minigame:useItem': {
            const mg = next.activeMiniGame;
            if (!mg || mg.category === 'tictactoe') break;
            const catItems = contentItems.filter((i) => i.category === mg.category);
            const chosen =
              (payload.itemId && catItems.find((i) => i.id === payload.itemId)) || catItems[0];
            if (chosen || mg.snapshot) {
              const baseSnap = chosen || mg.snapshot!;
              mg.snapshot = {
                itemId: baseSnap.id || (baseSnap as any).itemId || 'custom',
                category: mg.category as ContentCategory,
                title: payload.title?.trim() || baseSnap.title,
                prompt: payload.prompt?.trim() || baseSnap.prompt,
                answer: payload.answer?.trim() || baseSnap.answer,
                mediaUrl: baseSnap.mediaUrl,
              };
              mg.timerSeconds = 30;
              mg.timerRunning = false;
              mg.answerRevealed = false;
              mg.imageUnblurred = false;
              mg.audioPlaying = false;
            }
            break;
          }

          case 'minigame:startTimer':
            if (next.activeMiniGame) {
              if (next.activeMiniGame.timerSeconds <= 0) {
                next.activeMiniGame.timerSeconds = 30;
              }
              next.activeMiniGame.timerRunning = true;
            }
            break;

          case 'minigame:resetTimer':
            if (next.activeMiniGame) {
              next.activeMiniGame.timerRunning = false;
              next.activeMiniGame.timerSeconds = 30;
              if (!next.activeMiniGame.answerRevealed) {
                next.activeMiniGame.imageUnblurred = false;
              }
            }
            break;

          case 'minigame:revealAnswer':
            if (next.activeMiniGame) {
              next.activeMiniGame.timerRunning = false;
              next.activeMiniGame.answerRevealed = true;
              next.activeMiniGame.imageUnblurred = true;
            }
            break;

          case 'minigame:audioPlay':
            if (next.activeMiniGame && next.activeMiniGame.snapshot?.mediaUrl) {
              next.activeMiniGame.audioPlaying = true;
              next.activeMiniGame.audioCommandTimestamp = Date.now();
              audioCmd = { action: 'play', mediaUrl: next.activeMiniGame.snapshot.mediaUrl };
            }
            break;

          case 'minigame:audioStop':
            if (next.activeMiniGame) {
              next.activeMiniGame.audioPlaying = false;
              next.activeMiniGame.audioCommandTimestamp = Date.now();
              audioCmd = { action: 'stop' };
            }
            break;

          case 'minigame:judge': {
            const mg = next.activeMiniGame;
            if (!mg) break;
            const card = next.cards.find((c) => c.cardNumber === mg.cardNumber);
            if (mg.scored || (card && card.scored)) break;
            const result: 'correct' | 'wrong' = payload.result === 'correct' ? 'correct' : 'wrong';
            const team: TeamId =
              payload.team === 'red' || payload.team === 'blue' ? payload.team : next.activeTeam;
            mg.scored = true;
            mg.scoreResult = result;
            mg.awardedTeam = result === 'correct' ? team : null;
            if (card) {
              card.scored = true;
              card.scoreResult = result;
              card.awardedTeam = result === 'correct' ? team : null;
            }
            if (result === 'correct') {
              if (team === 'red') {
                next.redScore += 1;
                next.lastScorePulse = { team: 'red', delta: 1, timestamp: Date.now() };
              } else {
                next.blueScore += 1;
                next.lastScorePulse = { team: 'blue', delta: 1, timestamp: Date.now() };
              }
            }
            break;
          }

          case 'minigame:backToBoard':
            if (next.activeMiniGame?.audioPlaying) {
              audioCmd = { action: 'stop' };
            }
            next.cards = createFallbackCards();
            next.stage = 'board';
            next.activeMiniGame = null;
            break;

          case 'tictactoe:setTurn': {
            const mg = next.activeMiniGame;
            if (!mg || !mg.ticTacToe) break;
            const team: TeamId = payload.team === 'blue' ? 'blue' : 'red';
            mg.ticTacToe.turn = team;
            next.activeTeam = team;
            break;
          }

          case 'tictactoe:selectCell': {
            const mg = next.activeMiniGame;
            if (!mg || !mg.ticTacToe) break;
            const idx = Number(payload.cellIndex);
            if (idx >= 0 && idx < 9) {
              mg.ticTacToe.selectedCellIndex = idx;
            }
            break;
          }

          case 'tictactoe:judge': {
            const mg = next.activeMiniGame;
            if (!mg || !mg.ticTacToe) break;
            const ttt = mg.ticTacToe;
            if (ttt.winner) break;
            const cellIndex =
              payload.cellIndex !== undefined ? Number(payload.cellIndex) : ttt.selectedCellIndex;
            const cell = ttt.cells[cellIndex];
            if (!cell || cell.owner !== null) break;
            const decision: 'accept' | 'reject' =
              payload.decision === 'accept' ? 'accept' : 'reject';
            const playerName = String(payload.playerName || '').trim();
            const currentTeam = ttt.turn;

            if (decision === 'accept') {
              if (!playerName) break;
              cell.owner = currentTeam;
              cell.playerName = playerName;
              ttt.rejectedFeedback = null;
              const outcome = evaluateTicTacToeBoard(ttt);
              if (outcome.winner) {
                ttt.winner = outcome.winner;
                ttt.winningLine = outcome.winningLine;
                const card = next.cards.find((c) => c.cardNumber === mg.cardNumber);
                if (!ttt.scoreAwarded && !mg.scored) {
                  ttt.scoreAwarded = true;
                  mg.scored = true;
                  if (outcome.winner === 'red' || outcome.winner === 'blue') {
                    mg.scoreResult = 'correct';
                    mg.awardedTeam = outcome.winner;
                    if (card) {
                      card.scored = true;
                      card.scoreResult = 'correct';
                      card.awardedTeam = outcome.winner;
                    }
                    if (outcome.winner === 'red') {
                      next.redScore += 1;
                      next.lastScorePulse = { team: 'red', delta: 1, timestamp: Date.now() };
                    } else {
                      next.blueScore += 1;
                      next.lastScorePulse = { team: 'blue', delta: 1, timestamp: Date.now() };
                    }
                  } else {
                    mg.scoreResult = 'wrong';
                    if (card) {
                      card.scored = true;
                      card.scoreResult = 'wrong';
                    }
                  }
                }
              } else {
                const nextTeam: TeamId = currentTeam === 'red' ? 'blue' : 'red';
                ttt.turn = nextTeam;
                next.activeTeam = nextTeam;
              }
            } else {
              ttt.rejectedFeedback = {
                cellIndex,
                team: currentTeam,
                attemptedName: playerName || undefined,
                timestamp: Date.now(),
              };
              const nextTeam: TeamId = currentTeam === 'red' ? 'blue' : 'red';
              ttt.turn = nextTeam;
              next.activeTeam = nextTeam;
            }
            break;
          }

          case 'tictactoe:resetShuffle': {
            const mg = next.activeMiniGame;
            if (!mg || mg.category !== 'tictactoe') break;
            mg.ticTacToe = createFallbackTicTacToe(next.activeTeam);
            break;
          }
        }

        if (audioCmd) {
          triggerAudioPlayback(audioCmd.action, audioCmd.mediaUrl);
        }
        broadcastLocalSync(next, undefined, audioCmd);
        return next;
      });
    },
    [contentItems, broadcastLocalSync, triggerAudioPlayback]
  );

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
      return;
    }

    // Apply immediately for responsive UI & BroadcastChannel cross-tab sync
    applyLocalAction(action, payload);

    try {
      const res = await fetch('/api/host/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerAuth.token}`,
        },
        body: JSON.stringify({ action, payload }),
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (data.state) {
          setState(data.state);
          broadcastLocalSync(data.state);
        }
      }
    } catch {
      // Local state already updated and broadcast
    }
  };

  const refreshContentItems = async () => {
    if (!ownerAuth.token) return;
    try {
      const res = await fetch('/api/content', {
        headers: { Authorization: `Bearer ${ownerAuth.token}` },
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          setContentItems(data.items);
          try {
            localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(data.items));
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    }
  };

  const createContentItem = async (itemInput: {
    category: ContentCategory;
    title: string;
    prompt: string;
    answer: string;
    mediaUrl?: string;
  }) => {
    if (!ownerAuth.token) return;
    const optimisticItem: ContentItem = {
      id: `item_${itemInput.category}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      category: itemInput.category,
      title: itemInput.title,
      prompt: itemInput.prompt,
      answer: itemInput.answer,
      mediaUrl: itemInput.mediaUrl,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerAuth.token}`,
        },
        body: JSON.stringify(itemInput),
      });
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        const savedItem: ContentItem = data.item || optimisticItem;
        syncContentItemToFirestore(savedItem).catch(() => {});
        const nextList: ContentItem[] = Array.isArray(data.items)
          ? data.items
          : [savedItem, ...contentItems];
        setContentItems(nextList);
        if (state) broadcastLocalSync(state, nextList);
        return;
      }
    } catch {
      // Fall back to client storage
    }

    syncContentItemToFirestore(optimisticItem).catch(() => {});
    const nextList = [optimisticItem, ...contentItems];
    setContentItems(nextList);
    if (state) broadcastLocalSync(state, nextList);
  };

  const updateContentItem = async (
    id: string,
    updates: {
      title?: string;
      prompt?: string;
      answer?: string;
      mediaUrl?: string;
    }
  ) => {
    if (!ownerAuth.token) return;
    const nextList = contentItems.map((item) =>
      item.id === id
        ? {
            ...item,
            title: updates.title !== undefined ? updates.title : item.title,
            prompt: updates.prompt !== undefined ? updates.prompt : item.prompt,
            answer: updates.answer !== undefined ? updates.answer : item.answer,
            mediaUrl: updates.mediaUrl !== undefined ? updates.mediaUrl : item.mediaUrl,
            updatedAt: new Date().toISOString(),
          }
        : item
    );
    setContentItems(nextList);
    if (state) broadcastLocalSync(state, nextList);

    const updatedObj = nextList.find((i) => i.id === id);
    if (updatedObj) {
      syncContentItemToFirestore(updatedObj).catch(() => {});
    }

    try {
      await fetch(`/api/content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerAuth.token}`,
        },
        body: JSON.stringify(updates),
      });
    } catch {
      // Already updated locally
    }
  };

  const deleteContentItem = async (id: string) => {
    if (!ownerAuth.token) return;
    const nextList = contentItems.filter((item) => item.id !== id);
    setContentItems(nextList);
    if (state) broadcastLocalSync(state, nextList);
    removeContentItemFromFirestore(id).catch(() => {});

    try {
      await fetch(`/api/content/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${ownerAuth.token}`,
        },
      });
    } catch {
      // Already removed locally
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
        createContentItem,
        updateContentItem,
        deleteContentItem,
        audioElementRef,
      }}
    >
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
