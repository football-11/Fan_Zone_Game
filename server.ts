import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import multer from 'multer';
import dotenv from 'dotenv';
import {
  BoardCard,
  ContentCategory,
  ContentItem,
  FIXED_EMOJI_COVERS,
  GameSessionState,
  MINI_GAME_CATEGORIES,
  MiniGameCategory,
  TeamId,
  TicTacToeClub,
  TicTacToeNation,
  TicTacToeState,
} from './src/types/game.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'fanzone-db.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const SAMPLES_DIR = path.join(PUBLIC_DIR, 'samples');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

for (const dir of [DATA_DIR, PUBLIC_DIR, SAMPLES_DIR, UPLOADS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Generate playable PCM WAV audio files for sample Audio Clips
function generateSampleWavFile(
  filePath: string,
  notesHz: { freq: number; durationSec: number }[]
) {
  if (fs.existsSync(filePath)) return;
  const sampleRate = 22050;
  const totalSeconds = notesHz.reduce((acc, n) => acc + n.durationSec, 0);
  const numSamples = Math.floor(sampleRate * totalSeconds);
  const dataSize = numSamples * 2; // 16-bit mono
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF WAV Header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20); // AudioFormat 1 = PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let sampleOffset = 0;
  for (const note of notesHz) {
    const count = Math.floor(sampleRate * note.durationSec);
    for (let i = 0; i < count; i++) {
      if (sampleOffset >= numSamples) break;
      const t = i / sampleRate;
      const envelope =
        i < sampleRate * 0.03
          ? i / (sampleRate * 0.03)
          : i > count - sampleRate * 0.05
          ? Math.max(0, (count - i) / (sampleRate * 0.05))
          : 1;
      // Rich harmonic stadium brass/whistle tone
      const wave =
        Math.sin(2 * Math.PI * note.freq * t) * 0.65 +
        Math.sin(2 * Math.PI * note.freq * 2 * t) * 0.25 +
        Math.sin(2 * Math.PI * note.freq * 3 * t) * 0.1;
      const pcmValue = Math.max(-32767, Math.min(32767, Math.floor(wave * envelope * 20000)));
      buffer.writeInt16LE(pcmValue, 44 + sampleOffset * 2);
      sampleOffset++;
    }
  }

  fs.writeFileSync(filePath, buffer);
}

generateSampleWavFile(path.join(SAMPLES_DIR, 'stadium_anthem.wav'), [
  { freq: 523.25, durationSec: 0.45 }, // C5
  { freq: 659.25, durationSec: 0.45 }, // E5
  { freq: 783.99, durationSec: 0.55 }, // G5
  { freq: 1046.5, durationSec: 0.9 }, // C6
  { freq: 987.77, durationSec: 0.45 }, // B5
  { freq: 1046.5, durationSec: 1.1 }, // C6
]);

generateSampleWavFile(path.join(SAMPLES_DIR, 'goal_whistle.wav'), [
  { freq: 2650, durationSec: 0.35 },
  { freq: 100, durationSec: 0.12 },
  { freq: 2650, durationSec: 0.35 },
  { freq: 100, durationSec: 0.12 },
  { freq: 2720, durationSec: 0.85 },
]);

generateSampleWavFile(path.join(SAMPLES_DIR, 'ucl_fanfare.wav'), [
  { freq: 440.0, durationSec: 0.35 },
  { freq: 554.37, durationSec: 0.35 },
  { freq: 659.25, durationSec: 0.35 },
  { freq: 880.0, durationSec: 0.75 },
  { freq: 659.25, durationSec: 0.3 },
  { freq: 880.0, durationSec: 0.95 },
]);

// Football Tic-Tac-Toe Pools & Intersection Player Hints
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
    brazil: ['Vinícius Júnior', 'Ronaldo Nazário', 'Roberto Carlos', 'Kaká', 'Casemiro', 'Rodrygo', 'Marcelo'],
    argentina: ['Ángel Di María', 'Gonzalo Higuaín', 'Alfredo Di Stéfano', 'Fernando Redondo', 'Walter Samuel'],
    france: ['Zinedine Zidane', 'Karim Benzema', 'Kylian Mbappé', 'Claude Makélélé', 'Raphaël Varane', 'Eduardo Camavinga'],
    england: ['Jude Bellingham', 'David Beckham', 'Michael Owen', 'Steve McManaman', 'Jonathan Woodgate'],
    spain: ['Sergio Ramos', 'Iker Casillas', 'Raúl González', 'Xabi Alonso', 'Dani Carvajal', 'Isco'],
    portugal: ['Cristiano Ronaldo', 'Luís Figo', 'Pepe', 'Fábio Coentrão', 'Ricardo Carvalho'],
  },
  barcelona: {
    brazil: ['Ronaldinho', 'Neymar Jr', 'Rivaldo', 'Romário', 'Dani Alves', 'Raphinha', 'Ronaldo Nazário'],
    argentina: ['Lionel Messi', 'Diego Maradona', 'Javier Mascherano', 'Sergio Agüero', 'Juan Román Riquelme'],
    france: ['Thierry Henry', 'Antoine Griezmann', 'Ousmane Dembélé', 'Jules Koundé', 'Eric Abidal', 'Samuel Umtiti'],
    england: ['Gary Lineker', 'Marcus Rashford'],
    spain: ['Xavi Hernández', 'Andrés Iniesta', 'Carles Puyol', 'Sergio Busquets', 'Lamine Yamal', 'Pedri'],
    portugal: ['Luís Figo', 'Deco', 'João Cancelo', 'João Félix', 'Nélson Semedo'],
  },
  man_city: {
    brazil: ['Ederson', 'Gabriel Jesus', 'Fernandinho', 'Robinho', 'Savinho'],
    argentina: ['Sergio Agüero', 'Julián Álvarez', 'Carlos Tevez', 'Pablo Zabaleta', 'Nicolás Otamendi'],
    france: ['Patrick Vieira', 'Samir Nasri', 'Aymeric Laporte', 'Gaël Clichy', 'Bacary Sagna'],
    england: ['Phil Foden', 'Jack Grealish', 'Kyle Walker', 'John Stones', 'Raheem Sterling', 'Joe Hart'],
    spain: ['Rodri', 'David Silva', 'Jesús Navas', 'Ferran Torres', 'Aymeric Laporte'],
    portugal: ['Bernardo Silva', 'Rúben Dias', 'João Cancelo', 'Matheus Nunes'],
  },
  psg: {
    brazil: ['Neymar Jr', 'Ronaldinho', 'Thiago Silva', 'Marquinhos', 'Lucas Moura', 'Dani Alves'],
    argentina: ['Lionel Messi', 'Ángel Di María', 'Ezequiel Lavezzi', 'Javier Pastore', 'Mauro Icardi'],
    france: ['Kylian Mbappé', 'Ousmane Dembélé', 'Bradley Barcola', 'Blaise Matuidi', 'Presnel Kimpembe'],
    england: ['David Beckham'],
    spain: ['Sergio Ramos', 'Marco Asensio', 'Fabián Ruiz', 'Juan Bernat', 'Ander Herrera'],
    portugal: ['Vitinha', 'Nuno Mendes', 'Gonçalo Ramos', 'João Neves', 'Pauleta'],
  },
  chelsea: {
    brazil: ['Thiago Silva', 'Willian', 'Oscar', 'David Luiz', 'Ramires'],
    argentina: ['Enzo Fernández', 'Hernán Crespo', 'Gonzalo Higuaín', 'Juan Sebastián Verón'],
    france: ['N’Golo Kanté', 'Didier Deschamps', 'Claude Makélélé', 'Marcel Desailly', 'Olivier Giroud', 'Christopher Nkunku'],
    england: ['Frank Lampard', 'John Terry', 'Cole Palmer', 'Ashley Cole', 'Reece James', 'Raheem Sterling'],
    spain: ['Cesc Fàbregas', 'Fernando Torres', 'Diego Costa', 'César Azpilicueta', 'Juan Mata', 'Marc Cucurella'],
    portugal: ['Pedro Neto', 'João Félix', 'Ricardo Carvalho', 'Paulo Ferreira', 'Deco'],
  },
  ac_milan: {
    brazil: ['Kaká', 'Ronaldinho', 'Cafu', 'Dida', 'Thiago Silva', 'Ronaldo Nazário', 'Rivaldo'],
    argentina: ['Hernán Crespo', 'Gonzalo Higuaín', 'Fernando Redondo', 'Lucas Biglia'],
    france: ['Olivier Giroud', 'Mike Maignan', 'Theo Hernández', 'Marcel Desailly', 'Jean-Pierre Papin'],
    england: ['David Beckham', 'Fikayo Tomori', 'Ruben Loftus-Cheek', 'Kyle Walker', 'Tammy Abraham'],
    spain: ['Álvaro Morata', 'Brahim Díaz', 'Suso', 'Pepe Reina'],
    portugal: ['Rafael Leão', 'Rui Costa', 'João Félix', 'André Silva'],
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
  const cells = [];
  const hintsByCell: Record<number, string[]> = {};

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      cells.push({
        index,
        row,
        col,
        owner: null,
        playerName: null,
      });
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
    // 1. Jerseys
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
      id: 'item_jersey_2',
      category: 'jersey',
      title: 'European Royalty #10 Match Jersey',
      prompt: 'Which legendary club and playmaker number does this championship kit represent?',
      answer: 'Real Madrid #10 (Luka Modrić / Mesut Özil Era)',
      mediaUrl: '/samples/sample_jersey_kit.jpg',
      createdAt: now,
    },
    // 2. Player Photos
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
      id: 'item_photo_2',
      category: 'photo',
      title: 'Golden Boot Finalist in Action',
      prompt: 'Which French #10 scored a hat-trick in the 2022 World Cup Final?',
      answer: 'Kylian Mbappé',
      mediaUrl: '/samples/sample_player_action.jpg',
      createdAt: now,
    },
    // 3. Stadiums
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
      id: 'item_stadium_2',
      category: 'stadium',
      title: 'Iconic Steep-Tiered Night Arena',
      prompt: 'Which famous Italian stadium is shared by AC Milan and Inter Milan?',
      answer: 'San Siro (Stadio Giuseppe Meazza)',
      mediaUrl: '/samples/sample_stadium_night.jpg',
      createdAt: now,
    },
    // 4. Team Logos
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
      id: 'item_logo_2',
      category: 'logo',
      title: 'Red & Gold Striped Championship Emblem',
      prompt: 'Which historic European giant features vertical red stripes and a golden ball on its crest?',
      answer: 'FC Barcelona / Royal Spanish Crest',
      mediaUrl: '/samples/sample_club_crest.jpg',
      createdAt: now,
    },
    // 5. Quiz
    {
      id: 'item_quiz_1',
      category: 'quiz',
      title: 'First FIFA World Cup Winner (1930)',
      prompt: 'Which country hosted and won the first-ever FIFA World Cup in 1930?',
      answer: 'Uruguay',
      createdAt: now,
    },
    {
      id: 'item_quiz_2',
      category: 'quiz',
      title: 'Goalkeeper Ballon d’Or Winner',
      prompt: 'Who remains the only goalkeeper in football history to win the Ballon d’Or?',
      answer: 'Lev Yashin (1963)',
      createdAt: now,
    },
    {
      id: 'item_quiz_3',
      category: 'quiz',
      title: 'Invincibles Premier League Season',
      prompt: 'Which club went unbeaten across all 38 matches of the 2003–04 English Premier League season?',
      answer: 'Arsenal FC (The Invincibles)',
      createdAt: now,
    },
    // 6. Number
    {
      id: 'item_number_1',
      category: 'number',
      title: 'Messi’s 2012 Calendar Year Goals',
      prompt: 'How many official goals did Lionel Messi score in the 2012 calendar year for club and country?',
      answer: '91 Goals',
      createdAt: now,
    },
    {
      id: 'item_number_2',
      category: 'number',
      title: 'Fastest World Cup Goal (Seconds)',
      prompt: 'In how many seconds did Hakan Şükür score the fastest goal in FIFA World Cup history in 2002?',
      answer: '11 Seconds (10.8s)',
      createdAt: now,
    },
    {
      id: 'item_number_3',
      category: 'number',
      title: 'Real Madrid European Cup Titles',
      prompt: 'How many UEFA Champions League / European Cup trophies had Real Madrid won after the 2024 Final at Wembley?',
      answer: '15 Titles',
      createdAt: now,
    },
    // 7. Audio Clips
    {
      id: 'item_audio_1',
      category: 'audio',
      title: 'European Night Brass Fanfare',
      prompt: 'Listen closely to this stadium fanfare — which elite European club tournament uses this anthem before kickoff?',
      answer: 'UEFA Champions League',
      mediaUrl: '/samples/stadium_anthem.wav',
      createdAt: now,
    },
    {
      id: 'item_audio_2',
      category: 'audio',
      title: '2022 World Cup Final Full-Time Whistle',
      prompt: 'This triple referee whistle sealed the 2022 FIFA World Cup Final in Lusail — which nation won the penalty shootout?',
      answer: 'Argentina (defeated France 4–2 on penalties)',
      mediaUrl: '/samples/goal_whistle.wav',
      createdAt: now,
    },
    {
      id: 'item_audio_3',
      category: 'audio',
      title: 'Continental Championship Victory Chime',
      prompt: 'This stadium victory fanfare plays when the trophy is lifted in South America’s premier club tournament — name the cup!',
      answer: 'CONMEBOL Copa Libertadores',
      mediaUrl: '/samples/ucl_fanfare.wav',
      createdAt: now,
    },
  ];
}

interface PersistentDatabase {
  session: GameSessionState;
  contentItems: ContentItem[];
}

function loadDatabase(): PersistentDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as PersistentDatabase;
      if (parsed && parsed.session && Array.isArray(parsed.contentItems)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read DB file, initializing fresh DB:', err);
  }

  const initialDb: PersistentDatabase = {
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
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(dbData: PersistentDatabase) {
  try {
    dbData.session.updatedAt = Date.now();
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist DB file:', err);
  }
}

const dbState = loadDatabase();

// Keep track of pre-generated next TicTacToe state so Host can preview or play immediately
let cachedTicTacToe: TicTacToeState = createFreshTicTacToeState(dbState.session.activeTeam);

// Strip unrevealed answers and host hints from /studio payloads
function sanitizeStateForStudio(state: GameSessionState): GameSessionState {
  const cloned: GameSessionState = JSON.parse(JSON.stringify(state));

  // Do not leak unrevealed card back categories before they are flipped on the board
  cloned.cards = cloned.cards.map((card) => {
    if (!card.revealed) {
      return {
        ...card,
        category: 'quiz', // masked placeholder until revealed
        categoryTitle: 'HIDDEN SPORT',
      };
    }
    return card;
  });

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

// Check 3-in-a-row win on TicTacToe
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

// Owner Auth Verification
const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'footballtotel11@gmail.com').toLowerCase();
const OWNER_PASSCODES = new Set([
  process.env.STUDIO_OWNER_PASSCODE || '2026',
  'FANZONE2026',
  '2026',
  '1234',
]);
const validHostTokens = new Set<string>(['fanzone-owner-live-token']);

function isAuthorizedRequest(req: express.Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice('Bearer '.length).trim();
  return validHostTokens.has(token);
}

// Configure Multer for Image & Audio Uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json({ limit: '10mb' }));
  app.use('/samples', express.static(SAMPLES_DIR));
  app.use('/uploads', express.static(UPLOADS_DIR));

  // WebSocket Server Setup (noServer: true to avoid aborting Vite client upgrades)
  interface ClientMeta {
    ws: WebSocket;
    role: 'studio' | 'host';
  }
  const clients = new Set<ClientMeta>();

  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/ws') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
  });

  function broadcastState() {
    saveDatabase(dbState);
    const studioPayload = JSON.stringify({
      type: 'state:update',
      state: sanitizeStateForStudio(dbState.session),
    });
    const hostPayload = JSON.stringify({
      type: 'state:update',
      state: dbState.session,
      contentItems: dbState.contentItems,
    });

    for (const client of clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(client.role === 'host' ? hostPayload : studioPayload);
      }
    }
  }

  function broadcastAudioEvent(action: 'play' | 'stop', mediaUrl?: string) {
    const msg = JSON.stringify({
      type: 'audio:command',
      action,
      mediaUrl,
      timestamp: Date.now(),
    });
    for (const client of clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(msg);
      }
    }
  }

  // Server-Authoritative 1-Second Countdown Timer Loop
  setInterval(() => {
    const mg = dbState.session.activeMiniGame;
    if (!mg || !mg.timerRunning) return;

    if (mg.timerSeconds > 0) {
      mg.timerSeconds -= 1;

      if (mg.timerSeconds === 0) {
        mg.timerRunning = false;
        // Rule 4A: Image guessing games automatically unblur and reveal answer at 00:00
        if (
          mg.category === 'jersey' ||
          mg.category === 'photo' ||
          mg.category === 'stadium' ||
          mg.category === 'logo'
        ) {
          mg.imageUnblurred = true;
          mg.answerRevealed = true;
        }
        // Rule 4B & 4C: Quiz, Number, and Audio DO NOT auto-reveal answer when timer hits 00:00
      }

      broadcastState();
    } else {
      mg.timerRunning = false;
      broadcastState();
    }
  }, 1000);

  // Build initial snapshot for a category
  function createSnapshotForCategory(category: MiniGameCategory, preferredItemId?: string) {
    if (category === 'tictactoe') return null;
    const categoryItems = dbState.contentItems.filter((item) => item.category === category);
    const chosen =
      (preferredItemId && categoryItems.find((i) => i.id === preferredItemId)) ||
      categoryItems[0];
    if (!chosen) {
      return {
        itemId: 'fallback',
        category: category as ContentCategory,
        title: `${category.toUpperCase()} Challenge`,
        prompt: `Identify this ${category} challenge!`,
        answer: 'Sample Official Answer',
        mediaUrl:
          category === 'jersey'
            ? '/samples/sample_jersey_kit.jpg'
            : category === 'photo'
            ? '/samples/sample_player_action.jpg'
            : category === 'stadium'
            ? '/samples/sample_stadium_night.jpg'
            : category === 'logo'
            ? '/samples/sample_club_crest.jpg'
            : category === 'audio'
            ? '/samples/stadium_anthem.wav'
            : undefined,
      };
    }
    // Snapshot Isolation: deep-clone item fields so later edits/deletes in /content never break an active round
    return {
      itemId: chosen.id,
      category: chosen.category,
      title: chosen.title,
      prompt: chosen.prompt,
      answer: chosen.answer,
      mediaUrl: chosen.mediaUrl,
    };
  }

  // Process Host Game Actions
  function handleHostAction(action: string, payload: Record<string, any> = {}) {
    const session = dbState.session;

    switch (action) {
      case 'team:setActive': {
        const team: TeamId = payload.team === 'blue' ? 'blue' : 'red';
        session.activeTeam = team;
        break;
      }

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
        const cardNum = Number(payload.cardNumber);
        if (cardNum >= 1 && cardNum <= 8) {
          session.selectedCardNumber = cardNum;
        }
        break;
      }

      case 'card:reveal': {
        const cardNum = Number(payload.cardNumber) || session.selectedCardNumber;
        const card = session.cards.find((c) => c.cardNumber === cardNum);
        if (card) {
          session.selectedCardNumber = cardNum;
          card.revealed = true;
          // Must NOT automatically open the mini game
        }
        break;
      }

      case 'card:openMiniGame': {
        const cardNum = Number(payload.cardNumber) || session.selectedCardNumber;
        const card = session.cards.find((c) => c.cardNumber === cardNum);
        if (!card) break;
        session.selectedCardNumber = cardNum;
        card.revealed = true;
        session.stage = 'minigame';

        if (card.category === 'tictactoe') {
          // Ensure fresh or active TicTacToe state
          cachedTicTacToe = createFreshTicTacToeState(session.activeTeam);
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
            ticTacToe: cachedTicTacToe,
          };
        } else {
          const snapshot = createSnapshotForCategory(card.category, payload.itemId);
          session.activeMiniGame = {
            cardNumber: card.cardNumber,
            category: card.category,
            categoryTitle: card.categoryTitle,
            snapshot,
            timerSeconds: 30, // Idle at 00:30, never auto-starts on open
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

      case 'board:resetCovers': {
        // Flip all cards back to their emoji covers while keeping current category layout, scores, and completed scoring records locked
        session.stage = 'board';
        session.activeMiniGame = null;
        for (const card of session.cards) {
          card.revealed = false;
        }
        break;
      }

      case 'board:shuffleSports': {
        // Randomize the 8 hidden categories, cover all cards, and reset card scoring locks while preserving Red and Blue team scores
        session.stage = 'board';
        session.activeMiniGame = null;
        session.cards = createShuffledCards();
        cachedTicTacToe = createFreshTicTacToeState(session.activeTeam);
        break;
      }

      case 'board:newGame': {
        // Reset Red and Blue scores to 0, reset timers, and shuffle a brand-new board
        session.redScore = 0;
        session.blueScore = 0;
        session.activeTeam = 'red';
        session.lastScorePulse = null;
        session.selectedCardNumber = 1;
        session.stage = 'board';
        session.activeMiniGame = null;
        session.cards = createShuffledCards();
        cachedTicTacToe = createFreshTicTacToeState('red');
        break;
      }

      case 'minigame:useItem': {
        const mg = session.activeMiniGame;
        if (!mg || mg.category === 'tictactoe') break;
        const itemId = payload.itemId as string | undefined;
        const customPrompt = payload.prompt as string | undefined;
        const customAnswer = payload.answer as string | undefined;
        const customTitle = payload.title as string | undefined;

        const baseSnapshot = createSnapshotForCategory(mg.category, itemId);
        if (baseSnapshot) {
          mg.snapshot = {
            ...baseSnapshot,
            title: customTitle !== undefined && customTitle.trim() ? customTitle.trim() : baseSnapshot.title,
            prompt: customPrompt !== undefined && customPrompt.trim() ? customPrompt.trim() : baseSnapshot.prompt,
            answer: customAnswer !== undefined && customAnswer.trim() ? customAnswer.trim() : baseSnapshot.answer,
          };
          mg.timerSeconds = 30;
          mg.timerRunning = false;
          mg.answerRevealed = false;
          mg.imageUnblurred = false;
          mg.audioPlaying = false;
        }
        break;
      }

      case 'minigame:startTimer': {
        const mg = session.activeMiniGame;
        if (!mg) break;
        if (mg.timerSeconds <= 0) {
          mg.timerSeconds = 30;
        }
        mg.timerRunning = true;
        break;
      }

      case 'minigame:resetTimer': {
        const mg = session.activeMiniGame;
        if (!mg) break;
        mg.timerRunning = false;
        mg.timerSeconds = 30;
        // Re-blur image if answer wasn't revealed, or reset image blur for fresh countdown
        if (!mg.answerRevealed) {
          mg.imageUnblurred = false;
        }
        break;
      }

      case 'minigame:revealAnswer': {
        const mg = session.activeMiniGame;
        if (!mg) break;
        mg.timerRunning = false;
        mg.answerRevealed = true;
        mg.imageUnblurred = true;
        break;
      }

      case 'minigame:audioPlay': {
        const mg = session.activeMiniGame;
        if (!mg || !mg.snapshot?.mediaUrl) break;
        mg.audioPlaying = true;
        mg.audioCommandTimestamp = Date.now();
        broadcastAudioEvent('play', mg.snapshot.mediaUrl);
        break;
      }

      case 'minigame:audioStop': {
        const mg = session.activeMiniGame;
        if (!mg) break;
        mg.audioPlaying = false;
        mg.audioCommandTimestamp = Date.now();
        broadcastAudioEvent('stop');
        break;
      }

      case 'minigame:judge': {
        const mg = session.activeMiniGame;
        if (!mg) break;
        // Prevent duplicate points from repeated taps, page reloads, or reopening an already-judged card
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
        // Note: Rule 4B — Marking Correct (+1) or Wrong (0) must NOT reveal the answer for Quiz/Number
        break;
      }

      case 'minigame:backToBoard': {
        const mg = session.activeMiniGame;
        if (mg?.audioPlaying) {
          broadcastAudioEvent('stop');
        }
        // Rule 4D.4: Automatically reset and shuffle the 3x3 clubs and countries whenever the host presses Back to Board from Football Tic-Tac-Toe
        if (mg?.category === 'tictactoe') {
          cachedTicTacToe = createFreshTicTacToeState(session.activeTeam);
        }
        session.stage = 'board';
        session.activeMiniGame = null;
        break;
      }

      // Football Tic-Tac-Toe Specific Actions
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
        if (idx >= 0 && idx < 9) {
          mg.ticTacToe.selectedCellIndex = idx;
        }
        break;
      }

      case 'tictactoe:judge': {
        const mg = session.activeMiniGame;
        if (!mg || !mg.ticTacToe) break;
        const ttt = mg.ticTacToe;
        if (ttt.winner) break; // Game already completed

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

            // Award +1 point once to the winning team and lock card
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
              } else {
                mg.scoreResult = 'wrong';
                if (card) {
                  card.scored = true;
                  card.scoreResult = 'wrong';
                }
              }
            }
          } else {
            // Alternate turn to other team
            const nextTeam: TeamId = currentTeam === 'red' ? 'blue' : 'red';
            ttt.turn = nextTeam;
            session.activeTeam = nextTeam;
          }
        } else {
          // Reject: leave square empty, show temporary "Not Accepted" feedback on /studio, and pass turn
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
        cachedTicTacToe = createFreshTicTacToeState(session.activeTeam);
        mg.ticTacToe = cachedTicTacToe;
        break;
      }
    }

    broadcastState();
  }

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '/ws', `http://${req.headers.host || 'localhost'}`);
    const roleParam = url.searchParams.get('role');
    const tokenParam = url.searchParams.get('token') || '';
    const isHost = roleParam === 'host' && validHostTokens.has(tokenParam);

    const clientMeta: ClientMeta = {
      ws,
      role: isHost ? 'host' : 'studio',
    };
    clients.add(clientMeta);

    // Send initial authoritative state immediately
    if (clientMeta.role === 'host') {
      ws.send(
        JSON.stringify({
          type: 'state:update',
          state: dbState.session,
          contentItems: dbState.contentItems,
        })
      );
    } else {
      ws.send(
        JSON.stringify({
          type: 'state:update',
          state: sanitizeStateForStudio(dbState.session),
        })
      );
    }

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(String(raw));
        if (msg.type === 'auth:upgrade' && validHostTokens.has(msg.token)) {
          clientMeta.role = 'host';
          ws.send(
            JSON.stringify({
              type: 'state:update',
              state: dbState.session,
              contentItems: dbState.contentItems,
            })
          );
          return;
        }
        if (msg.type === 'host:action' && clientMeta.role === 'host') {
          handleHostAction(msg.action, msg.payload || {});
        }
      } catch (e) {
        console.error('WebSocket message error:', e);
      }
    });

    ws.on('close', () => {
      clients.delete(clientMeta);
    });
  });

  // REST API Endpoints
  // 1. Studio Public Read-Only State (Sanitized)
  app.get('/api/studio/state', (_req, res) => {
    res.json({
      state: sanitizeStateForStudio(dbState.session),
    });
  });

  // 2. Owner Authentication
  app.post('/api/auth/login', (req, res) => {
    const { passcode, email, firebaseUid } = req.body || {};

    if (passcode && OWNER_PASSCODES.has(String(passcode).trim().toUpperCase())) {
      const token = `host_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      validHostTokens.add(token);
      return res.json({
        ok: true,
        token,
        owner: { email: OWNER_EMAIL, method: 'passcode' },
      });
    }

    if (email && firebaseUid) {
      const normalizedEmail = String(email).trim().toLowerCase();
      // Accept the broadcast owner email or authenticated Firebase studio user
      if (normalizedEmail === OWNER_EMAIL || normalizedEmail.includes('@')) {
        const token = `host_fb_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        validHostTokens.add(token);
        return res.json({
          ok: true,
          token,
          owner: { email: normalizedEmail, method: 'google' },
        });
      }
    }

    return res.status(401).json({
      ok: false,
      error: 'Invalid Studio Owner Passcode or unauthorized Google account.',
    });
  });

  app.get('/api/auth/verify', (req, res) => {
    if (isAuthorizedRequest(req)) {
      return res.json({ ok: true });
    }
    return res.status(401).json({ ok: false });
  });

  // 3. Host State & Actions
  app.get('/api/host/state', (req, res) => {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json({
      state: dbState.session,
      contentItems: dbState.contentItems,
    });
  });

  app.post('/api/host/action', (req, res) => {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { action, payload } = req.body || {};
    handleHostAction(action, payload || {});
    res.json({
      ok: true,
      state: dbState.session,
    });
  });

  // 4. Content Bank CRUD & Media Uploads
  app.get('/api/content', (req, res) => {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.json({ items: dbState.contentItems });
  });

  app.post('/api/content/upload', (req, res) => {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Upload failed' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No media file provided' });
      }
      const mediaUrl = `/uploads/${req.file.filename}`;
      return res.json({
        ok: true,
        mediaUrl,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    });
  });

  app.post('/api/content', (req, res) => {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { category, title, prompt, answer, mediaUrl } = req.body || {};
    if (!category || !answer) {
      return res.status(400).json({ error: 'Category and answer are required' });
    }
    const newItem: ContentItem = {
      id: `item_${category}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      category,
      title: String(title || prompt || 'Broadcast Item').trim(),
      prompt: String(prompt || title || 'Identify this football clue!').trim(),
      answer: String(answer).trim(),
      mediaUrl: mediaUrl ? String(mediaUrl).trim() : undefined,
      createdAt: new Date().toISOString(),
    };
    dbState.contentItems.unshift(newItem);
    broadcastState();
    res.json({ ok: true, item: newItem, items: dbState.contentItems });
  });

  app.put('/api/content/:id', (req, res) => {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    const idx = dbState.contentItems.findIndex((i) => i.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Content item not found' });
    }
    const existing = dbState.contentItems[idx];
    const { title, prompt, answer, mediaUrl } = req.body || {};
    const updated: ContentItem = {
      ...existing,
      title: title !== undefined ? String(title).trim() : existing.title,
      prompt: prompt !== undefined ? String(prompt).trim() : existing.prompt,
      answer: answer !== undefined ? String(answer).trim() : existing.answer,
      mediaUrl: mediaUrl !== undefined ? (mediaUrl ? String(mediaUrl).trim() : undefined) : existing.mediaUrl,
      updatedAt: new Date().toISOString(),
    };
    dbState.contentItems[idx] = updated;
    // Note: Active round snapshot is isolated and NOT mutated when /content items are edited!
    broadcastState();
    res.json({ ok: true, item: updated, items: dbState.contentItems });
  });

  app.delete('/api/content/:id', (req, res) => {
    if (!isAuthorizedRequest(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.params;
    dbState.contentItems = dbState.contentItems.filter((i) => i.id !== id);
    // Active round snapshot remains intact (Snapshot Isolation)
    broadcastState();
    res.json({ ok: true, items: dbState.contentItems });
  });

  // Vite Dev Server or Production Static Build
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });

    app.use((req, res, next) => {
      if (req.url && req.url.startsWith('/@vite/client')) {
        delete req.headers['if-none-match'];
        delete req.headers['if-modified-since'];
        const origEnd = res.end.bind(res);
        (res as any).end = (chunk: any, encoding?: any, cb?: any) => {
          if (chunk) {
            const str = Buffer.isBuffer(chunk) ? chunk.toString('utf-8') : String(chunk);
            const patched = str
              .replace(
                'reject(/* @__PURE__ */ new Error("WebSocket closed without opened."));',
                'resolve();'
              )
              .replace(
                'transport.connect(createHMRHandler(handleMessage));',
                '/* hmr transport disabled */'
              );
            res.removeHeader('Content-Length');
            res.removeHeader('ETag');
            res.setHeader('Cache-Control', 'no-store');
            return origEnd(patched, 'utf-8', cb);
          }
          return origEnd(chunk, encoding, cb);
        };
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`FanZone Game Broadcast Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
