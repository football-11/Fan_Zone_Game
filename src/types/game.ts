export type TeamId = 'red' | 'blue';

export type EmojiId =
  | 'cry'
  | 'crying_smili'
  | 'love'
  | 'shock'
  | 'silly'
  | 'smali'
  | 'angry'
  | 'cool';

export type MiniGameCategory =
  | 'jersey'
  | 'photo'
  | 'stadium'
  | 'logo'
  | 'tictactoe'
  | 'quiz'
  | 'number'
  | 'audio';

export type ContentCategory = Exclude<MiniGameCategory, 'tictactoe'>;

export interface ContentItem {
  id: string;
  category: ContentCategory;
  title: string;
  prompt: string;
  answer: string;
  mediaUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BoardCard {
  cardNumber: number; // 1..8
  emojiId: EmojiId;
  emojiLabel: string;
  category: MiniGameCategory;
  categoryTitle: string;
  revealed: boolean;
  scored: boolean;
  scoreResult: 'pending' | 'correct' | 'wrong';
  awardedTeam?: TeamId | null;
}

export interface ActiveRoundSnapshot {
  itemId: string;
  category: ContentCategory;
  title: string;
  prompt: string;
  answer?: string; // Stripped for /studio until answerRevealed === true
  mediaUrl?: string;
}

export interface TicTacToeClub {
  id: string;
  name: string;
  shortName: string;
}

export interface TicTacToeNation {
  id: string;
  name: string;
  code: string;
}

export interface TicTacToeCell {
  index: number; // 0..8 (Square 1..9)
  row: number; // 0..2 (Nation)
  col: number; // 0..2 (Club)
  owner: TeamId | null;
  playerName: string | null;
}

export interface TicTacToeState {
  clubs: TicTacToeClub[]; // 3 columns
  nations: TicTacToeNation[]; // 3 rows
  cells: TicTacToeCell[]; // 9 cells
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
  // Private hints only populated for /host payload
  hintsByCell?: Record<number, string[]>;
}

export interface ActiveMiniGameState {
  cardNumber: number;
  category: MiniGameCategory;
  categoryTitle: string;
  snapshot: ActiveRoundSnapshot | null;
  timerSeconds: number; // 0..30
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

export interface GameSessionState {
  sessionId: string;
  redScore: number;
  blueScore: number;
  activeTeam: TeamId;
  lastScorePulse: {
    team: TeamId;
    delta: number;
    timestamp: number;
  } | null;
  selectedCardNumber: number; // 1..8
  stage: 'board' | 'minigame';
  cards: BoardCard[];
  activeMiniGame: ActiveMiniGameState | null;
  updatedAt: number;
}

export const FIXED_EMOJI_COVERS: {
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

export const MINI_GAME_CATEGORIES: {
  category: MiniGameCategory;
  title: string;
  shortTitle: string;
}[] = [
  { category: 'jersey', title: 'Guess the Jersey', shortTitle: 'Jerseys' },
  { category: 'photo', title: 'Guess the Player Photo', shortTitle: 'Player Photos' },
  { category: 'stadium', title: 'Guess the Stadium', shortTitle: 'Stadiums' },
  { category: 'logo', title: 'Guess the Team Logo', shortTitle: 'Team Logos' },
  { category: 'tictactoe', title: 'Football Tic-Tac-Toe', shortTitle: 'Tic-Tac-Toe' },
  { category: 'quiz', title: 'Quiz', shortTitle: 'Quiz' },
  { category: 'number', title: 'Number', shortTitle: 'Number' },
  { category: 'audio', title: 'Audio', shortTitle: 'Audio Clips' },
];

export const CONTENT_CATEGORIES: {
  id: ContentCategory;
  label: string;
  mediaType: 'image' | 'audio' | 'none';
  description: string;
}[] = [
  {
    id: 'jersey',
    label: 'Jerseys',
    mediaType: 'image',
    description: 'Upload kit/jersey photos — blurred on Studio until timer ends or revealed.',
  },
  {
    id: 'photo',
    label: 'Player Photos',
    mediaType: 'image',
    description: 'Upload player action/portrait photos — blurred on Studio during 30s countdown.',
  },
  {
    id: 'stadium',
    label: 'Stadiums',
    mediaType: 'image',
    description: 'Upload iconic football stadium photos — blurred on Studio during 30s countdown.',
  },
  {
    id: 'logo',
    label: 'Team Logos',
    mediaType: 'image',
    description: 'Upload club or national crest images — blurred on Studio during 30s countdown.',
  },
  {
    id: 'quiz',
    label: 'Quiz',
    mediaType: 'none',
    description: 'Broadcast trivia questions — answer reveals only when Host presses Reveal Answer.',
  },
  {
    id: 'number',
    label: 'Number',
    mediaType: 'none',
    description: 'Numeric football stat challenges — answer reveals only when Host presses Reveal Answer.',
  },
  {
    id: 'audio',
    label: 'Audio Clips',
    mediaType: 'audio',
    description: 'Upload MP3/WAV/OGG/M4A commentary, chants, or stadium audio clips.',
  },
];
