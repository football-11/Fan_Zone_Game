import fs from 'fs';

type TeamId = 'red' | 'blue';
type EmojiId =
  | 'cry'
  | 'crying_smili'
  | 'love'
  | 'shock'
  | 'silly'
  | 'smali'
  | 'angry'
  | 'cool';
type MiniGameCategory =
  | 'jersey'
  | 'photo'
  | 'stadium'
  | 'logo'
  | 'tictactoe'
  | 'quiz'
  | 'number'
  | 'audio';
type ContentCategory = Exclude<MiniGameCategory, 'tictactoe'>;

interface ContentItem {
  id: string;
  category: ContentCategory;
  title: string;
  prompt: string;
  answer: string;
  mediaUrl?: string;
  blurAmount?: number;
  createdAt: string;
  updatedAt?: string;
}

interface BoardCard {
  cardNumber: number;
  emojiId: EmojiId;
  emojiLabel: string;
  category: MiniGameCategory;
  categoryTitle: string;
  revealed: boolean;
  scored: boolean;
  scoreResult: 'pending' | 'correct' | 'wrong';
  awardedTeam?: TeamId | null;
}

interface TicTacToeClub {
  id: string;
  name: string;
  shortName: string;
}

interface TicTacToeNation {
  id: string;
  name: string;
  code: string;
}

interface TicTacToeCell {
  index: number;
  row: number;
  col: number;
  owner: TeamId | null;
  playerName: string | null;
}

interface TicTacToeState {
  clubs: TicTacToeClub[];
  nations: TicTacToeNation[];
  cells: TicTacToeCell[];
  turn: TeamId;
  selectedCellIndex: number;
  winner: TeamId | 'draw' | null;
  winningLine: number[] | null;
  scoreAwarded: boolean;
  rejectedFeedback: {
    cellIndex: number;
    team: TeamId;
    attemptedName?: string;
    timestamp: number;
  } | null;
  hintsByCell?: Record<number, string[]>;
}

interface ActiveMiniGameState {
  cardNumber: number;
  category: MiniGameCategory;
  categoryTitle: string;
  snapshot: {
    itemId: string;
    category: ContentCategory;
    title: string;
    prompt: string;
    answer?: string;
    mediaUrl?: string;
    blurAmount?: number;
  } | null;
  timerSeconds: number;
  timerRunning: boolean;
  answerRevealed: boolean;
  imageUnblurred: boolean;
  audioPlaying: boolean;
  audioCommandTimestamp: number;
  scored: boolean;
  scoreResult: 'pending' | 'correct' | 'wrong';
  awardedTeam: TeamId | null;
  ticTacToe?: TicTacToeState;
}

interface GameSessionState {
  sessionId: string;
  redScore: number;
  blueScore: number;
  activeTeam: TeamId;
  lastScorePulse: {
    team: TeamId;
    delta: number;
    timestamp: number;
  } | null;
  selectedCardNumber: number;
  stage: 'board' | 'minigame';
  cards: BoardCard[];
  activeMiniGame: ActiveMiniGameState | null;
  updatedAt: number;
}

const FIXED_EMOJI_COVERS: {
  cardNumber: number;
  emojiId: EmojiId;
  emojiLabel: string;
}[] = [
  { cardNumber: 1, emojiId: 'cry', emojiLabel: 'Sad Tear' },
  { cardNumber: 2, emojiId: 'crying_smili', emojiLabel: 'Joy Tears' },
  { cardNumber: 3, emojiId: 'love', emojiLabel: 'Heart Eyes' },
  { cardNumber: 4, emojiId: 'shock', emojiLabel: 'Shocked' },
  { cardNumber: 5, emojiId: 'silly', emojiLabel: 'Wink Tongue' },
  { cardNumber: 6, emojiId: 'smali', emojiLabel: 'Big Smile' },
  { cardNumber: 7, emojiId: 'angry', emojiLabel: 'Fierce Angry' },
  { cardNumber: 8, emojiId: 'cool', emojiLabel: 'Cool Shades' },
];

const MINI_GAME_CATEGORIES: {
  category: MiniGameCategory;
  title: string;
}[] = [
  { category: 'jersey', title: 'Guess the Jersey' },
  { category: 'photo', title: 'Guess the Player Photo' },
  { category: 'stadium', title: 'Guess the Stadium' },
  { category: 'logo', title: 'Guess the Team Logo' },
  { category: 'tictactoe', title: 'Football Tic-Tac-Toe' },
  { category: 'quiz', title: 'Quiz' },
  { category: 'number', title: 'Number' },
  { category: 'audio', title: 'Audio' },
];

const DB_FILE = '/tmp/fanzone-vercel-db.json';

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
    brazil: ['Vinícius Júnior', 'Ronaldo Nazário', 'Roberto Carlos', 'Kaká', 'Casemiro', 'Rodrygo'],
    argentina: ['Ángel Di María', 'Gonzalo Higuaín', 'Alfredo Di Stéfano', 'Fernando Redondo'],
    france: ['Zinedine Zidane', 'Karim Benzema', 'Kylian Mbappé', 'Claude Makélélé', 'Raphaël Varane'],
    england: ['Jude Bellingham', 'David Beckham', 'Michael Owen', 'Steve McManaman'],
    spain: ['Sergio Ramos', 'Iker Casillas', 'Raúl González', 'Xabi Alonso', 'Dani Carvajal'],
    portugal: ['Cristiano Ronaldo', 'Luís Figo', 'Pepe', 'Ricardo Carvalho'],
  },
  barcelona: {
    brazil: ['Ronaldinho', 'Neymar Jr', 'Rivaldo', 'Romário', 'Dani Alves', 'Raphinha'],
    argentina: ['Lionel Messi', 'Diego Maradona', 'Javier Mascherano', 'Sergio Agüero'],
    france: ['Thierry Henry', 'Antoine Griezmann', 'Ousmane Dembélé', 'Jules Koundé'],
    england: ['Gary Lineker', 'Marcus Rashford'],
    spain: ['Xavi Hernández', 'Andrés Iniesta', 'Carles Puyol', 'Sergio Busquets', 'Lamine Yamal'],
    portugal: ['Luís Figo', 'Deco', 'João Cancelo', 'João Félix'],
  },
  man_city: {
    brazil: ['Ederson', 'Gabriel Jesus', 'Fernandinho', 'Robinho'],
    argentina: ['Sergio Agüero', 'Julián Álvarez', 'Carlos Tevez', 'Pablo Zabaleta'],
    france: ['Patrick Vieira', 'Samir Nasri', 'Gaël Clichy', 'Bacary Sagna'],
    england: ['Phil Foden', 'Jack Grealish', 'Kyle Walker', 'John Stones', 'Raheem Sterling'],
    spain: ['Rodri', 'David Silva', 'Jesús Navas', 'Ferran Torres'],
    portugal: ['Bernardo Silva', 'Rúben Dias', 'João Cancelo', 'Matheus Nunes'],
  },
  psg: {
    brazil: ['Neymar Jr', 'Ronaldinho', 'Thiago Silva', 'Marquinhos', 'Lucas Moura'],
    argentina: ['Lionel Messi', 'Ángel Di María', 'Ezequiel Lavezzi', 'Javier Pastore'],
    france: ['Kylian Mbappé', 'Ousmane Dembélé', 'Bradley Barcola', 'Blaise Matuidi'],
    england: ['David Beckham'],
    spain: ['Sergio Ramos', 'Marco Asensio', 'Fabián Ruiz', 'Juan Bernat'],
    portugal: ['Vitinha', 'Nuno Mendes', 'Gonçalo Ramos', 'João Neves', 'Pauleta'],
  },
  chelsea: {
    brazil: ['Thiago Silva', 'Willian', 'Oscar', 'David Luiz', 'Ramires'],
    argentina: ['Enzo Fernández', 'Hernán Crespo', 'Gonzalo Higuaín'],
    france: ['N’Golo Kanté', 'Didier Deschamps', 'Claude Makélélé', 'Marcel Desailly', 'Olivier Giroud'],
    england: ['Frank Lampard', 'John Terry', 'Cole Palmer', 'Ashley Cole', 'Reece James'],
    spain: ['Cesc Fàbregas', 'Fernando Torres', 'Diego Costa', 'César Azpilicueta', 'Juan Mata'],
    portugal: ['Pedro Neto', 'João Félix', 'Ricardo Carvalho', 'Paulo Ferreira', 'Deco'],
  },
  ac_milan: {
    brazil: ['Kaká', 'Ronaldinho', 'Cafu', 'Dida', 'Thiago Silva', 'Ronaldo Nazário'],
    argentina: ['Hernán Crespo', 'Gonzalo Higuaín', 'Fernando Redondo'],
    france: ['Olivier Giroud', 'Mike Maignan', 'Theo Hernández', 'Marcel Desailly'],
    england: ['David Beckham', 'Fikayo Tomori', 'Ruben Loftus-Cheek', 'Kyle Walker'],
    spain: ['Álvaro Morata', 'Brahim Díaz', 'Suso'],
    portugal: ['Rafael Leão', 'Rui Costa', 'João Félix'],
  },
};

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createFreshTicTacToeState(startingTeam: TeamId = 'red'): TicTacToeState {
  const clubs = shuffleArray(CLUB_POOL).slice(0, 3);
  const nations = shuffleArray(NATION_POOL).slice(0, 3);
  const cells: TicTacToeCell[] = [];
  const hintsByCell: Record<number, string[]> = {};

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      cells.push({ index, row, col, owner: null, playerName: null });
      const clubId = clubs[col].id;
      const nationId = nations[row].id;
      hintsByCell[index] = TICTACTOE_HINTS[clubId]?.[nationId] || ['Valid Club + Nation Player'];
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

function createShuffledCards(): BoardCard[] {
  const shuffledCategories = shuffleArray(MINI_GAME_CATEGORIES);
  return FIXED_EMOJI_COVERS.map((emojiCover, idx) => {
    const cat = shuffledCategories[idx];
    return {
      cardNumber: emojiCover.cardNumber,
      emojiId: emojiCover.emojiId,
      emojiLabel: emojiCover.emojiLabel,
      category: cat.category,
      categoryTitle: cat.title,
      revealed: false,
      scored: false,
      scoreResult: 'pending',
      awardedTeam: null,
    };
  });
}

function createDefaultContentItems(): ContentItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'item_jersey_1',
      category: 'jersey',
      title: 'Iconic White & Gold Championship Home Kit',
      prompt: 'Identify the club that wore this famous white and metallic gold home strip!',
      answer: 'Real Madrid CF (2011/12 Home Kit)',
      mediaUrl: '/samples/sample_jersey_kit.jpg',
      createdAt: now,
    },
    {
      id: 'item_photo_1',
      category: 'photo',
      title: 'Floodlight Number 10 Volley',
      prompt: 'Name the world-class #10 superstar striking this volley under the stadium lights!',
      answer: 'Zinedine Zidane (Champions League Final Volley)',
      mediaUrl: '/samples/sample_player_action.jpg',
      createdAt: now,
    },
    {
      id: 'item_stadium_1',
      category: 'stadium',
      title: '80,000-Seat European Football Cathedral',
      prompt: 'Name this legendary four-tier European stadium illuminated on Champions League night!',
      answer: 'Estadio Santiago Bernabéu (Madrid)',
      mediaUrl: '/samples/sample_stadium_night.jpg',
      createdAt: now,
    },
    {
      id: 'item_logo_1',
      category: 'logo',
      title: 'Crowned Crimson & Gold Club Shield',
      prompt: 'Identify the football club represented by this crowned royal shield crest!',
      answer: 'Real Madrid CF',
      mediaUrl: '/samples/sample_club_crest.jpg',
      createdAt: now,
    },
    {
      id: 'item_quiz_1',
      category: 'quiz',
      title: 'First FIFA World Cup Winner (1930)',
      prompt: 'Which country hosted and won the first-ever FIFA World Cup in 1930?',
      answer: 'Uruguay',
      createdAt: now,
    },
    {
      id: 'item_number_1',
      category: 'number',
      title: 'Messi’s 2012 Calendar Year Goals',
      prompt: 'How many official goals did Lionel Messi score in the 2012 calendar year for club and country?',
      answer: '91 Goals',
      createdAt: now,
    },
    {
      id: 'item_audio_1',
      category: 'audio',
      title: 'European Night Brass Fanfare',
      prompt: 'Listen closely to this stadium fanfare — which elite European club tournament uses this anthem before kickoff?',
      answer: 'UEFA Champions League',
      mediaUrl: '/samples/stadium_anthem.wav',
      createdAt: now,
    },
  ];
}

interface ServerlessDB {
  session: GameSessionState;
  contentItems: ContentItem[];
  timerStartedAt?: number | null;
  timerInitialSeconds?: number;
}

let memoryDb: ServerlessDB | null = null;

function getDb(): ServerlessDB {
  if (memoryDb) {
    syncDynamicTimer(memoryDb);
    return memoryDb;
  }
  try {
    if (fs.existsSync(DB_FILE)) {
      memoryDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (memoryDb) {
        syncDynamicTimer(memoryDb);
        return memoryDb;
      }
    }
  } catch {
    // ignore
  }
  memoryDb = {
    session: {
      sessionId: 'fanzone-live-session',
      redScore: 0,
      blueScore: 0,
      activeTeam: 'red',
      lastScorePulse: null,
      selectedCardNumber: 1,
      stage: 'board',
      cards: createShuffledCards(),
      activeMiniGame: null,
      updatedAt: Date.now(),
    },
    contentItems: createDefaultContentItems(),
    timerStartedAt: null,
    timerInitialSeconds: 30,
  };
  saveDb(memoryDb);
  return memoryDb;
}

function saveDb(db: ServerlessDB) {
  db.session.updatedAt = Date.now();
  memoryDb = db;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db), 'utf-8');
  } catch {
    // ignore
  }
}

function syncDynamicTimer(db: ServerlessDB) {
  const mg = db.session.activeMiniGame;
  if (!mg || !mg.timerRunning || !db.timerStartedAt) return;
  const elapsed = Math.floor((Date.now() - db.timerStartedAt) / 1000);
  const remaining = Math.max(0, (db.timerInitialSeconds ?? 30) - elapsed);
  mg.timerSeconds = remaining;
  if (remaining === 0) {
    mg.timerRunning = false;
    db.timerStartedAt = null;
    if (
      mg.category === 'jersey' ||
      mg.category === 'photo' ||
      mg.category === 'stadium' ||
      mg.category === 'logo'
    ) {
      mg.imageUnblurred = true;
      mg.answerRevealed = true;
    }
    saveDb(db);
  }
}

function sanitizeStateForStudio(state: GameSessionState): GameSessionState {
  const cloned: GameSessionState = JSON.parse(JSON.stringify(state));
  cloned.cards = cloned.cards.map((card) =>
    card.revealed ? card : { ...card, category: 'quiz', categoryTitle: 'HIDDEN SPORT' }
  );
  if (cloned.activeMiniGame) {
    if (cloned.activeMiniGame.snapshot && !cloned.activeMiniGame.answerRevealed) {
      delete cloned.activeMiniGame.snapshot.answer;
    }
    if (cloned.activeMiniGame.ticTacToe) {
      delete cloned.activeMiniGame.ticTacToe.hintsByCell;
    }
  }
  return cloned;
}

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

const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'footballtotel11@gmail.com').toLowerCase();
const OWNER_PASSCODES = new Set([
  (process.env.STUDIO_OWNER_PASSCODE || '2026').toUpperCase(),
  'FANZONE2026',
  '2026',
  '1234',
  'ADMIN',
  'FANZONE',
  'FOOTBALLTOTEL11@GMAIL.COM',
]);

function isAuthorizedRequest(req: any): boolean {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  return token.length > 0;
}

async function parseJsonBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string' && req.body.length > 0) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res: any, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any) {
  const method = (req.method || 'GET').toUpperCase();
  const parsedUrl = new URL(req.url || '/', `http://${req.headers?.host || 'localhost'}`);
  const rewritten = parsedUrl.searchParams.get('__path');
  const routePath = rewritten
    ? `/api/${rewritten.replace(/^\/+/, '')}`
    : parsedUrl.pathname.startsWith('/api/')
    ? parsedUrl.pathname
    : `/api/${parsedUrl.pathname.replace(/^\/+/, '')}`;

  // 1. GET /api/studio/state
  if (method === 'GET' && routePath === '/api/studio/state') {
    const db = getDb();
    return sendJson(res, 200, { state: sanitizeStateForStudio(db.session) });
  }

  // 2. POST /api/auth/login
  if (method === 'POST' && routePath === '/api/auth/login') {
    const body = await parseJsonBody(req);
    const { passcode, email, firebaseUid } = body || {};
    if (passcode && OWNER_PASSCODES.has(String(passcode).trim().toUpperCase())) {
      const token = `host_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      return sendJson(res, 200, {
        ok: true,
        token,
        owner: { email: OWNER_EMAIL, method: 'passcode' },
      });
    }
    if (email && firebaseUid) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (normalizedEmail === OWNER_EMAIL || normalizedEmail.includes('@')) {
        const token = `host_fb_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        return sendJson(res, 200, {
          ok: true,
          token,
          owner: { email: normalizedEmail, method: 'google' },
        });
      }
    }
    return sendJson(res, 401, {
      ok: false,
      error: 'Invalid Studio Owner Passcode (Default: 2026) or unauthorized Google account.',
    });
  }

  // 3. GET /api/auth/verify
  if (method === 'GET' && routePath === '/api/auth/verify') {
    if (isAuthorizedRequest(req)) return sendJson(res, 200, { ok: true });
    return sendJson(res, 401, { ok: false });
  }

  // 4. GET /api/host/state
  if (method === 'GET' && routePath === '/api/host/state') {
    if (!isAuthorizedRequest(req)) return sendJson(res, 401, { error: 'Unauthorized' });
    const db = getDb();
    return sendJson(res, 200, { state: db.session, contentItems: db.contentItems });
  }

  // 5. POST /api/host/action
  if (method === 'POST' && routePath === '/api/host/action') {
    if (!isAuthorizedRequest(req)) return sendJson(res, 401, { error: 'Unauthorized' });
    const body = await parseJsonBody(req);
    const db = getDb();
    const session = db.session;
    const { action, payload = {} } = body || {};

    switch (action) {
      case 'team:setActive':
        session.activeTeam = payload.team === 'blue' ? 'blue' : 'red';
        break;
      case 'score:adjust': {
        const team: TeamId = payload.team === 'blue' ? 'blue' : 'red';
        const delta = Number(payload.delta) || 0;
        if (team === 'red') {
          const next = Math.max(0, session.redScore + delta);
          if (next > session.redScore) {
            session.lastScorePulse = { team: 'red', delta: next - session.redScore, timestamp: Date.now() };
          }
          session.redScore = next;
        } else {
          const next = Math.max(0, session.blueScore + delta);
          if (next > session.blueScore) {
            session.lastScorePulse = { team: 'blue', delta: next - session.blueScore, timestamp: Date.now() };
          }
          session.blueScore = next;
        }
        break;
      }
      case 'card:select': {
        const revealedCard = session.cards.find((c) => c.revealed);
        if (revealedCard) {
          session.selectedCardNumber = revealedCard.cardNumber;
          break;
        }
        const cardNum = Number(payload.cardNumber);
        if (cardNum >= 1 && cardNum <= 8) session.selectedCardNumber = cardNum;
        break;
      }
      case 'card:reveal': {
        const revealedCard = session.cards.find((c) => c.revealed);
        if (revealedCard) {
          session.selectedCardNumber = revealedCard.cardNumber;
          break;
        }
        const cardNum = Number(payload.cardNumber) || session.selectedCardNumber;
        const card = session.cards.find((c) => c.cardNumber === cardNum);
        if (card) {
          session.selectedCardNumber = cardNum;
          card.revealed = true;
        }
        break;
      }
      case 'card:openMiniGame': {
        const revealedCard = session.cards.find((c) => c.revealed);
        const cardNum = revealedCard
          ? revealedCard.cardNumber
          : Number(payload.cardNumber) || session.selectedCardNumber;
        const card = session.cards.find((c) => c.cardNumber === cardNum);
        if (!card) break;
        session.selectedCardNumber = card.cardNumber;
        card.revealed = true;
        session.stage = 'minigame';
        db.timerStartedAt = null;
        db.timerInitialSeconds = 30;

        if (card.category === 'tictactoe') {
          session.activeMiniGame = {
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
            ticTacToe: createFreshTicTacToeState(session.activeTeam),
          };
        } else {
          const categoryItems = db.contentItems.filter((item) => item.category === card.category);
          const chosen =
            (payload.itemId && categoryItems.find((i) => i.id === payload.itemId)) ||
            categoryItems[0];
          session.activeMiniGame = {
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
                  blurAmount: typeof chosen.blurAmount === 'number' ? chosen.blurAmount : 28,
                }
              : {
                  itemId: 'fallback',
                  category: card.category as ContentCategory,
                  title: card.categoryTitle,
                  prompt: `Identify this ${card.categoryTitle}!`,
                  answer: 'Official Answer',
                  blurAmount: 28,
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
        session.stage = 'board';
        session.activeMiniGame = null;
        db.timerStartedAt = null;
        for (const card of session.cards) card.revealed = false;
        break;
      case 'board:shuffleSports':
        session.stage = 'board';
        session.activeMiniGame = null;
        db.timerStartedAt = null;
        session.cards = createShuffledCards();
        break;
      case 'board:newGame':
        session.redScore = 0;
        session.blueScore = 0;
        session.activeTeam = 'red';
        session.lastScorePulse = null;
        session.selectedCardNumber = 1;
        session.stage = 'board';
        session.activeMiniGame = null;
        db.timerStartedAt = null;
        session.cards = createShuffledCards();
        break;
      case 'minigame:useItem': {
        const mg = session.activeMiniGame;
        if (!mg || mg.category === 'tictactoe') break;
        const categoryItems = db.contentItems.filter((item) => item.category === mg.category);
        const chosen =
          (payload.itemId && categoryItems.find((i) => i.id === payload.itemId)) ||
          categoryItems[0];
        if (chosen) {
          const customBlur =
            payload.blurAmount !== undefined ? Number(payload.blurAmount) : undefined;
          mg.snapshot = {
            itemId: chosen.id,
            category: chosen.category,
            title: payload.title?.trim() || chosen.title,
            prompt: payload.prompt?.trim() || chosen.prompt,
            answer: payload.answer?.trim() || chosen.answer,
            mediaUrl: chosen.mediaUrl,
            blurAmount:
              customBlur !== undefined && !Number.isNaN(customBlur)
                ? Math.max(0, Math.min(60, customBlur))
                : chosen.blurAmount ?? 28,
          };
          mg.timerSeconds = 30;
          mg.timerRunning = false;
          db.timerStartedAt = null;
          db.timerInitialSeconds = 30;
          mg.answerRevealed = false;
          mg.imageUnblurred = false;
          mg.audioPlaying = false;
        }
        break;
      }
      case 'minigame:setBlur': {
        const mg = session.activeMiniGame;
        if (!mg || !mg.snapshot) break;
        const nextBlur = Number(payload.blurAmount);
        if (!Number.isNaN(nextBlur)) {
          mg.snapshot.blurAmount = Math.max(0, Math.min(60, nextBlur));
        }
        break;
      }
      case 'minigame:startTimer': {
        const mg = session.activeMiniGame;
        if (!mg) break;
        if (mg.timerSeconds <= 0) mg.timerSeconds = 30;
        mg.timerRunning = true;
        db.timerStartedAt = Date.now();
        db.timerInitialSeconds = mg.timerSeconds;
        break;
      }
      case 'minigame:resetTimer': {
        const mg = session.activeMiniGame;
        if (!mg) break;
        mg.timerRunning = false;
        mg.timerSeconds = 30;
        db.timerStartedAt = null;
        db.timerInitialSeconds = 30;
        if (!mg.answerRevealed) mg.imageUnblurred = false;
        break;
      }
      case 'minigame:revealAnswer': {
        const mg = session.activeMiniGame;
        if (!mg) break;
        mg.timerRunning = false;
        db.timerStartedAt = null;
        mg.answerRevealed = true;
        mg.imageUnblurred = true;
        break;
      }
      case 'minigame:audioPlay': {
        const mg = session.activeMiniGame;
        if (!mg) break;
        mg.audioPlaying = true;
        mg.audioCommandTimestamp = Date.now();
        break;
      }
      case 'minigame:audioStop': {
        const mg = session.activeMiniGame;
        if (!mg) break;
        mg.audioPlaying = false;
        mg.audioCommandTimestamp = Date.now();
        break;
      }
      case 'minigame:judge': {
        const mg = session.activeMiniGame;
        if (!mg) break;
        const card = session.cards.find((c) => c.cardNumber === mg.cardNumber);
        if (mg.scored || (card && card.scored)) break;
        const result: 'correct' | 'wrong' = payload.result === 'correct' ? 'correct' : 'wrong';
        const team: TeamId =
          payload.team === 'red' || payload.team === 'blue' ? payload.team : session.activeTeam;
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
            session.redScore += 1;
            session.lastScorePulse = { team: 'red', delta: 1, timestamp: Date.now() };
          } else {
            session.blueScore += 1;
            session.lastScorePulse = { team: 'blue', delta: 1, timestamp: Date.now() };
          }
        }
        break;
      }
      case 'minigame:backToBoard':
        session.cards = createShuffledCards();
        session.stage = 'board';
        session.activeMiniGame = null;
        db.timerStartedAt = null;
        break;
      case 'tictactoe:setTurn': {
        const mg = session.activeMiniGame;
        if (!mg || !mg.ticTacToe) break;
        const team: TeamId = payload.team === 'blue' ? 'blue' : 'red';
        mg.ticTacToe.turn = team;
        session.activeTeam = team;
        break;
      }
      case 'tictactoe:selectCell': {
        const mg = session.activeMiniGame;
        if (!mg || !mg.ticTacToe) break;
        const idx = Number(payload.cellIndex);
        if (idx >= 0 && idx < 9) mg.ticTacToe.selectedCellIndex = idx;
        break;
      }
      case 'tictactoe:judge': {
        const mg = session.activeMiniGame;
        if (!mg || !mg.ticTacToe) break;
        const ttt = mg.ticTacToe;
        if (ttt.winner) break;
        const cellIndex =
          payload.cellIndex !== undefined ? Number(payload.cellIndex) : ttt.selectedCellIndex;
        const cell = ttt.cells[cellIndex];
        if (!cell || cell.owner !== null) break;
        const decision: 'accept' | 'reject' = payload.decision === 'accept' ? 'accept' : 'reject';
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
            const card = session.cards.find((c) => c.cardNumber === mg.cardNumber);
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
                  session.redScore += 1;
                  session.lastScorePulse = { team: 'red', delta: 1, timestamp: Date.now() };
                } else {
                  session.blueScore += 1;
                  session.lastScorePulse = { team: 'blue', delta: 1, timestamp: Date.now() };
                }
              }
            }
          } else {
            const nextTeam: TeamId = currentTeam === 'red' ? 'blue' : 'red';
            ttt.turn = nextTeam;
            session.activeTeam = nextTeam;
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
          session.activeTeam = nextTeam;
        }
        break;
      }
      case 'tictactoe:resetShuffle': {
        const mg = session.activeMiniGame;
        if (!mg || mg.category !== 'tictactoe') break;
        mg.ticTacToe = createFreshTicTacToeState(session.activeTeam);
        break;
      }
    }

    saveDb(db);
    return sendJson(res, 200, { ok: true, state: db.session });
  }

  // 6. GET /api/content
  if (method === 'GET' && routePath === '/api/content') {
    if (!isAuthorizedRequest(req)) return sendJson(res, 401, { error: 'Unauthorized' });
    const db = getDb();
    return sendJson(res, 200, { items: db.contentItems });
  }

  // 7. POST /api/content
  if (method === 'POST' && routePath === '/api/content') {
    if (!isAuthorizedRequest(req)) return sendJson(res, 401, { error: 'Unauthorized' });
    const body = await parseJsonBody(req);
    const db = getDb();
    const { category, title, prompt, answer, mediaUrl, blurAmount } = body || {};
    if (!category || !answer) {
      return sendJson(res, 400, { error: 'Category and answer are required' });
    }
    const parsedBlur =
      blurAmount !== undefined && !Number.isNaN(Number(blurAmount))
        ? Math.max(0, Math.min(60, Number(blurAmount)))
        : 28;
    const newItem: ContentItem = {
      id: `item_${category}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      category,
      title: String(title || prompt || 'Broadcast Item').trim(),
      prompt: String(prompt || title || 'Identify this football clue!').trim(),
      answer: String(answer).trim(),
      mediaUrl: mediaUrl ? String(mediaUrl).trim() : undefined,
      blurAmount: parsedBlur,
      createdAt: new Date().toISOString(),
    };
    db.contentItems.unshift(newItem);
    saveDb(db);
    return sendJson(res, 200, { ok: true, item: newItem, items: db.contentItems });
  }

  // 8. PUT / DELETE /api/content/:id
  if (routePath.startsWith('/api/content/') && routePath !== '/api/content/upload') {
    if (!isAuthorizedRequest(req)) return sendJson(res, 401, { error: 'Unauthorized' });
    const id = routePath.slice('/api/content/'.length);
    const db = getDb();

    if (method === 'PUT') {
      const body = await parseJsonBody(req);
      const idx = db.contentItems.findIndex((i) => i.id === id);
      if (idx === -1) return sendJson(res, 404, { error: 'Not found' });
      const existing = db.contentItems[idx];
      const { title, prompt, answer, mediaUrl, blurAmount } = body || {};
      const parsedBlur =
        blurAmount !== undefined && !Number.isNaN(Number(blurAmount))
          ? Math.max(0, Math.min(60, Number(blurAmount)))
          : existing.blurAmount ?? 28;
      db.contentItems[idx] = {
        ...existing,
        title: title !== undefined ? String(title).trim() : existing.title,
        prompt: prompt !== undefined ? String(prompt).trim() : existing.prompt,
        answer: answer !== undefined ? String(answer).trim() : existing.answer,
        mediaUrl:
          mediaUrl !== undefined
            ? mediaUrl
              ? String(mediaUrl).trim()
              : undefined
            : existing.mediaUrl,
        blurAmount: parsedBlur,
        updatedAt: new Date().toISOString(),
      };
      saveDb(db);
      return sendJson(res, 200, { ok: true, item: db.contentItems[idx], items: db.contentItems });
    }

    if (method === 'DELETE') {
      db.contentItems = db.contentItems.filter((i) => i.id !== id);
      saveDb(db);
      return sendJson(res, 200, { ok: true, items: db.contentItems });
    }
  }

  return sendJson(res, 404, { error: 'Route not found', routePath });
}
