import { ContentCategory, ContentItem, MiniGameCategory } from '../types/game';
import { getBzzoiroPlayerImageUrl, getBzzoiroTeamLogoUrl } from './bzzoiroSports';

export const AUTOMATIC_CONTENT_ITEMS: ContentItem[] = [
  // ==================== 1. GUESS THE JERSEY (KITS) ====================
  {
    id: 'auto_jersey_1',
    category: 'jersey',
    title: 'Iconic White & Gold Championship Home Kit',
    prompt: 'Identify the European royalty club that wore this famous white and metallic gold home kit!',
    answer: 'Real Madrid CF (2011/12 La Liga 100-Point Season)',
    mediaUrl: '/samples/sample_jersey_kit.jpg',
    blurAmount: 26,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_jersey_2',
    category: 'jersey',
    title: 'Historic European Playmaker #10 Home Kit',
    prompt: 'Which legendary royal club and midfield playmaker era does this white jersey represent?',
    answer: 'Real Madrid #10 (Luka Modrić / Mesut Özil Era)',
    mediaUrl: '/samples/sample_jersey_kit.jpg',
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_jersey_3',
    category: 'jersey',
    title: 'Classic Deep Blaugrana Striped Home Jersey',
    prompt: 'Which historic club wore vertical garnet and deep blue stripes to win two European trebles?',
    answer: 'FC Barcelona (Blaugrana Home Kit)',
    mediaUrl: getBzzoiroTeamLogoUrl(44),
    blurAmount: 32,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_jersey_4',
    category: 'jersey',
    title: 'Iconic Sky Blue Championship Home Jersey',
    prompt: 'Which Premier League powerhouse wears pure sky blue and secured a historic continental treble in 2023?',
    answer: 'Manchester City FC',
    mediaUrl: getBzzoiroTeamLogoUrl(12),
    blurAmount: 28,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_jersey_5',
    category: 'jersey',
    title: 'Rossoneri Red & Black Vertical Striped Jersey',
    prompt: 'Which 7-time European champion wears iconic vertical red and black stripes at the San Siro?',
    answer: 'AC Milan (Rossoneri)',
    mediaUrl: getBzzoiroTeamLogoUrl(63),
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_jersey_6',
    category: 'jersey',
    title: 'Zebra Black & White Striped Italian Jersey',
    prompt: 'Which Italian giant is celebrated worldwide for wearing historic black and white vertical zebra stripes?',
    answer: 'Juventus FC (Bianconeri)',
    mediaUrl: getBzzoiroTeamLogoUrl(73),
    blurAmount: 32,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_jersey_7',
    category: 'jersey',
    title: 'All-Red Bavarian Champions Strip',
    prompt: 'Identify the German powerhouse that commands the Bundesliga in their fiery all-red home strip!',
    answer: 'FC Bayern Munich (Die Roten)',
    mediaUrl: getBzzoiroTeamLogoUrl(79),
    blurAmount: 28,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_jersey_8',
    category: 'jersey',
    title: 'Midnight Blue with Central Hechter Red Stripe',
    prompt: 'Which French Ligue 1 champions wear the famous midnight blue kit with a central vertical red stripe?',
    answer: 'Paris Saint-Germain (PSG Hechter Kit)',
    mediaUrl: getBzzoiroTeamLogoUrl(114),
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ==================== 2. GUESS THE PLAYER PHOTO ====================
  {
    id: 'auto_photo_1',
    category: 'photo',
    title: 'Floodlight European Volley Legend',
    prompt: 'Name the iconic French #10 striking this legendary volley in the Champions League Final!',
    answer: 'Zinedine Zidane (Real Madrid vs Leverkusen 2002 Final)',
    mediaUrl: '/samples/sample_player_action.jpg',
    blurAmount: 28,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_photo_2',
    category: 'photo',
    title: 'World Cup Final Hat-Trick Prodigy',
    prompt: 'Identify the world-class French superstar who scored a hat-trick in the 2022 World Cup Final!',
    answer: 'Kylian Mbappé',
    mediaUrl: getBzzoiroPlayerImageUrl(594),
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_photo_3',
    category: 'photo',
    title: 'The 8-Time Ballon d’Or World Champion',
    prompt: 'Identify this iconic Argentine legend who captained his nation to glory in Qatar 2022!',
    answer: 'Lionel Messi',
    mediaUrl: getBzzoiroPlayerImageUrl(9063),
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_photo_4',
    category: 'photo',
    title: 'All-Time Champions League Top Scorer #7',
    prompt: 'Name the Portuguese phenomenon with 5 Ballon d’Or awards and over 900 official career goals!',
    answer: 'Cristiano Ronaldo',
    mediaUrl: getBzzoiroPlayerImageUrl(7880),
    blurAmount: 32,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_photo_5',
    category: 'photo',
    title: 'Norwegian Goalscoring Phenomenon',
    prompt: 'Which clinical striker broke the Premier League single-season scoring record with 36 goals in his debut season?',
    answer: 'Erling Haaland',
    mediaUrl: getBzzoiroPlayerImageUrl(852),
    blurAmount: 28,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_photo_6',
    category: 'photo',
    title: 'English Midfield Sensation #5',
    prompt: 'Name this dynamic midfielder whose open-arms celebration electrified the Bernabéu during his debut La Liga campaign!',
    answer: 'Jude Bellingham',
    mediaUrl: getBzzoiroPlayerImageUrl(592),
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_photo_7',
    category: 'photo',
    title: 'Belgian Playmaking Visionary Maestro',
    prompt: 'Which midfield wizard led Manchester City to back-to-back league crowns with precision assists?',
    answer: 'Kevin De Bruyne',
    mediaUrl: getBzzoiroPlayerImageUrl(4374),
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_photo_8',
    category: 'photo',
    title: '41-Goal Record-Breaking Polish Striker',
    prompt: 'Identify the Polish talisman who broke Gerd Müller’s 49-year-old single-season Bundesliga scoring record!',
    answer: 'Robert Lewandowski',
    mediaUrl: getBzzoiroPlayerImageUrl(748),
    blurAmount: 28,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_photo_9',
    category: 'photo',
    title: '6-Time Champions League Winner & Ballon d’Or Maestro',
    prompt: 'Name this Croatian maestro who captained his nation to two World Cup podiums and won six European Cups!',
    answer: 'Luka Modrić',
    mediaUrl: getBzzoiroPlayerImageUrl(1993),
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_photo_10',
    category: 'photo',
    title: 'The Joga Bonito Samba Magician',
    prompt: 'Identify this iconic Brazilian number 10 whose joy and elastico dribbles earned a standing ovation at the Bernabéu!',
    answer: 'Ronaldinho Gaucho',
    mediaUrl: getBzzoiroPlayerImageUrl(64281),
    blurAmount: 32,
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ==================== 3. GUESS THE STADIUM ====================
  {
    id: 'auto_stadium_1',
    category: 'stadium',
    title: '85,000-Seat Spanish European Cathedral',
    prompt: 'Name this legendary newly-renovated four-tier European stadium illuminated on Champions League night!',
    answer: 'Estadio Santiago Bernabéu (Madrid)',
    mediaUrl: '/samples/sample_stadium_night.jpg',
    blurAmount: 28,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_stadium_2',
    category: 'stadium',
    title: 'Iconic Steep-Tiered Milanese Colosseum',
    prompt: 'Which famous Italian stadium with spiral cylindrical towers is shared by AC Milan and Inter Milan?',
    answer: 'San Siro (Stadio Giuseppe Meazza)',
    mediaUrl: '/samples/sample_stadium_night.jpg',
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_stadium_3',
    category: 'stadium',
    title: 'The Home of Football & Twin Towers Heritage',
    prompt: 'Which 90,000-capacity London cathedral with a monumental 133m steel arch hosts the FA Cup and Euro Finals?',
    answer: 'Wembley Stadium (London)',
    mediaUrl: '/samples/sample_stadium_night.jpg',
    blurAmount: 28,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_stadium_4',
    category: 'stadium',
    title: 'Bavarian Illuminated Inflatable Diamond Arena',
    prompt: 'Which European stadium is celebrated for its luminous exterior foil panels that glow brilliant red for matchdays?',
    answer: 'Allianz Arena (Munich)',
    mediaUrl: '/samples/sample_stadium_night.jpg',
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_stadium_5',
    category: 'stadium',
    title: '99,000-Capacity Catalan Cathedral',
    prompt: 'Name this colossal stadium, the largest football ground in Europe, home to FC Barcelona since 1957!',
    answer: 'Camp Nou (Spotify Camp Nou, Barcelona)',
    mediaUrl: '/samples/sample_stadium_night.jpg',
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_stadium_6',
    category: 'stadium',
    title: 'The Kop & "You’ll Never Walk Alone" Fortress',
    prompt: 'Which historic English football cathedral is home to the famous Kop terrace and European comeback nights?',
    answer: 'Anfield (Liverpool FC)',
    mediaUrl: '/samples/sample_stadium_night.jpg',
    blurAmount: 28,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_stadium_7',
    category: 'stadium',
    title: 'The Yellow Wall 81,000-Seat Arena',
    prompt: 'Which iconic German stadium boasts Europe’s largest standing terrace with 25,000 roaring supporters?',
    answer: 'Signal Iduna Park (Westfalenstadion, Dortmund)',
    mediaUrl: '/samples/sample_stadium_night.jpg',
    blurAmount: 32,
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ==================== 4. GUESS THE TEAM LOGO ====================
  {
    id: 'auto_logo_1',
    category: 'logo',
    title: 'Crowned Royal Crimson & Gold Shield',
    prompt: 'Identify the 15-time European champions represented by this crowned royal crest with a diagonal purple band!',
    answer: 'Real Madrid CF',
    mediaUrl: getBzzoiroTeamLogoUrl(57),
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_logo_2',
    category: 'logo',
    title: 'Blaugrana Shield with St George’s Cross',
    prompt: 'Which Catalan powerhouse sports a bowl-shaped shield with the Senyera stripes and an antique golden football?',
    answer: 'FC Barcelona',
    mediaUrl: getBzzoiroTeamLogoUrl(44),
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_logo_3',
    category: 'logo',
    title: 'Sky Blue Circular Ship Crest',
    prompt: 'Which English champions’ circular crest features the Manchester ship canal vessel and the red rose of Lancashire?',
    answer: 'Manchester City FC',
    mediaUrl: getBzzoiroTeamLogoUrl(12),
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_logo_4',
    category: 'logo',
    title: 'Bavarian Blue & White Checkered Roundel',
    prompt: 'Identify the German record champions whose circular badge displays the blue and white lozenges of Bavaria!',
    answer: 'FC Bayern Munich',
    mediaUrl: getBzzoiroTeamLogoUrl(79),
    blurAmount: 32,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_logo_5',
    category: 'logo',
    title: 'Eiffel Tower & Fleur-de-Lys Round Emblem',
    prompt: 'Which French capital club features a stylized Eiffel Tower and golden fleur-de-lys on its deep blue circular crest?',
    answer: 'Paris Saint-Germain (PSG)',
    mediaUrl: getBzzoiroTeamLogoUrl(114),
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_logo_6',
    category: 'logo',
    title: 'Modern Minimalist Double-J Monogram',
    prompt: 'Which Italian giant stunned the football world by rebranding to a sleek black-and-white minimalist double-J icon?',
    answer: 'Juventus FC',
    mediaUrl: getBzzoiroTeamLogoUrl(73),
    blurAmount: 32,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_logo_7',
    category: 'logo',
    title: 'The Blue Lion Rampant Regardant',
    prompt: 'Which West London club features a ceremonial heraldic lion clutching a golden staff on its circular badge?',
    answer: 'Chelsea FC',
    mediaUrl: getBzzoiroTeamLogoUrl(13),
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_logo_8',
    category: 'logo',
    title: 'Rossoneri Red & Black Oval Shield with St Ambrose Cross',
    prompt: 'Which 7-time Champions League winner uses an oval crest combining Milan’s red cross with red and black stripes?',
    answer: 'AC Milan',
    mediaUrl: getBzzoiroTeamLogoUrl(63),
    blurAmount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_logo_9',
    category: 'logo',
    title: 'The Red Devil & Ship of Manchester',
    prompt: 'Which 20-time English champions feature a triton-carrying devil and golden ship on their iconic crest?',
    answer: 'Manchester United FC',
    mediaUrl: getBzzoiroTeamLogoUrl(17),
    blurAmount: 32,
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ==================== 5. TRIVIA QUIZ ====================
  {
    id: 'auto_quiz_1',
    category: 'quiz',
    title: 'Inaugural FIFA World Cup Winner (1930)',
    prompt: 'Which country both hosted and won the first-ever FIFA World Cup in 1930, defeating Argentina in the final?',
    answer: 'Uruguay',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_quiz_2',
    category: 'quiz',
    title: 'Sole Goalkeeper Ballon d’Or Winner',
    prompt: 'Who remains the only goalkeeper in football history to win the prestigious Ballon d’Or award?',
    answer: 'Lev Yashin (1963, "The Black Spider")',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_quiz_3',
    category: 'quiz',
    title: 'The Invincibles 38-Match Unbeaten Season',
    prompt: 'Which English club went entirely undefeated across all 38 matches of the 2003–04 Premier League season?',
    answer: 'Arsenal FC (The Invincibles)',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_quiz_4',
    category: 'quiz',
    title: 'Most Men’s FIFA World Cup Trophies',
    prompt: 'Which nation has won the most men’s FIFA World Cup tournaments in history?',
    answer: 'Brazil (5 Titles: 1958, 1962, 1970, 1994, 2002)',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_quiz_5',
    category: 'quiz',
    title: 'Fastest Premier League Hat-Trick Record',
    prompt: 'Which player scored the fastest hat-trick in Premier League history, timing in at just 2 minutes and 56 seconds?',
    answer: 'Sadio Mané (Southampton vs Aston Villa, May 2015)',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_quiz_6',
    category: 'quiz',
    title: 'All-Time Champions League Top Scorer',
    prompt: 'Who holds the all-time UEFA Champions League goalscoring record with 140 goals in the competition?',
    answer: 'Cristiano Ronaldo (140 Goals)',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_quiz_7',
    category: 'quiz',
    title: 'First-Ever Continental Sextuple (2009)',
    prompt: 'Which club won all six possible trophies in a single calendar year (2009) under Pep Guardiola?',
    answer: 'FC Barcelona (Sextuple 2009)',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_quiz_8',
    category: 'quiz',
    title: 'Only Player to Win 3 FIFA World Cups',
    prompt: 'Who remains the only footballer in history to have won three FIFA World Cup tournaments as a player?',
    answer: 'Pelé (1958, 1962, 1970 with Brazil)',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ==================== 6. NUMERIC CHALLENGES ====================
  {
    id: 'auto_number_1',
    category: 'number',
    title: 'Messi’s Unprecedented 2012 Calendar Year Goals',
    prompt: 'How many official goals did Lionel Messi score in the 2012 calendar year for FC Barcelona and Argentina?',
    answer: '91 Goals (in 69 matches)',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_number_2',
    category: 'number',
    title: 'Fastest World Cup Goal in History (Seconds)',
    prompt: 'In how many seconds did Turkey’s Hakan Şükür score the fastest goal in FIFA World Cup history against South Korea in 2002?',
    answer: '11 Seconds (10.8s)',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_number_3',
    category: 'number',
    title: 'Real Madrid European Cup / UCL Trophy Count',
    prompt: 'How many European Cup / UEFA Champions League trophies had Real Madrid won following the 2024 Wembley Final?',
    answer: '15 Trophies',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_number_4',
    category: 'number',
    title: 'Premier League Single-Season Goal Record',
    prompt: 'How many Premier League goals did Erling Haaland score in his record-shattering 2022–23 debut season?',
    answer: '36 Goals (35 appearances)',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_number_5',
    category: 'number',
    title: 'Leicester City 2015-16 Championship Pre-Season Odds',
    prompt: 'What astronomical pre-season betting odds were famously set on Leicester City to win the 2015–16 Premier League title?',
    answer: '5,000 to 1',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_number_6',
    category: 'number',
    title: 'Cristiano Ronaldo Senior Career Official Goals',
    prompt: 'In September 2024, Cristiano Ronaldo scored his milestone official senior goal against Croatia — what monumental number was it?',
    answer: '900 Goals (900+ official career goals)',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_number_7',
    category: 'number',
    title: 'Real Madrid Modern Era UCL Three-Peat',
    prompt: 'How many consecutive UEFA Champions League titles did Zinedine Zidane’s Real Madrid win between 2016 and 2018?',
    answer: '3 Consecutive Titles (The Modern Three-Peat)',
    mediaUrl: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
  },

  // ==================== 7. AUDIO CLIPS ====================
  {
    id: 'auto_audio_1',
    category: 'audio',
    title: 'European Night Brass Stadium Fanfare',
    prompt: 'Listen closely to this iconic brass stadium fanfare — which elite continental tournament uses this anthem before kickoff?',
    answer: 'UEFA Champions League Anthem',
    mediaUrl: '/samples/stadium_anthem.wav',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_audio_2',
    category: 'audio',
    title: '2022 World Cup Final Full-Time Whistle',
    prompt: 'This triple referee whistle sealed the 2022 FIFA World Cup Final in Lusail — which nation won the shootout?',
    answer: 'Argentina (defeated France 4–2 on penalties)',
    mediaUrl: '/samples/goal_whistle.wav',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'auto_audio_3',
    category: 'audio',
    title: 'Continental Championship Victory Fanfare',
    prompt: 'This grand stadium victory theme plays when the champions lift the cup in South America’s premier tournament — name the cup!',
    answer: 'CONMEBOL Copa Libertadores',
    mediaUrl: '/samples/ucl_fanfare.wav',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * Returns count of total, remaining unpicked, and picked/removed items for a category.
 */
export function getCategoryUsageStats(
  category: MiniGameCategory,
  availableCustomItems: ContentItem[] = [],
  usedItemIds: string[] = []
): { total: number; available: number; picked: number } {
  if (category === 'tictactoe') return { total: 0, available: 0, picked: 0 };
  const combined = [
    ...availableCustomItems.filter((i) => i.category === category),
    ...AUTOMATIC_CONTENT_ITEMS.filter((i) => i.category === category),
  ];
  const uniqueIds = new Set(combined.map((i) => i.id));
  const total = uniqueIds.size;
  const picked = Array.from(uniqueIds).filter((id) => usedItemIds.includes(id)).length;
  const available = Math.max(0, total - picked);
  return { total, available, picked };
}

/**
 * Automatically picks a question & photo for the given category.
 * CRITICAL RULE: Once an item is picked, it is strictly REMOVED from the mini games and never picked again.
 */
export function getAutomaticContentItem(
  category: MiniGameCategory,
  availableCustomItems: ContentItem[] = [],
  usedItemIds: string[] = [],
  forceDifferentFromId?: string
): ContentItem {
  if (category === 'tictactoe') {
    throw new Error('TicTacToe uses football matrix hints instead of content items');
  }

  // Combine custom uploaded items with built-in rich automatic items
  const combined: ContentItem[] = [
    ...availableCustomItems.filter((i) => i.category === category),
    ...AUTOMATIC_CONTENT_ITEMS.filter((i) => i.category === category),
  ];

  // De-duplicate items by id
  const uniqueItemsMap = new Map<string, ContentItem>();
  for (const item of combined) {
    if (!uniqueItemsMap.has(item.id)) {
      uniqueItemsMap.set(item.id, item);
    }
  }
  const allCategoryItems = Array.from(uniqueItemsMap.values());

  // STRICT REMOVAL: Filter out items already used in this session
  let eligible = allCategoryItems.filter((i) => !usedItemIds.includes(i.id));

  if (forceDifferentFromId) {
    eligible = eligible.filter((i) => i.id !== forceDifferentFromId);
  }

  // If ALL items in this category have already been picked and removed:
  // Strictly DO NOT recycle previously used items.
  if (eligible.length === 0) {
    return {
      id: `exhausted_${category}_${Date.now()}`,
      category: category as ContentCategory,
      title: `${category.toUpperCase()} Challenges Completed`,
      prompt: `All available ${category} questions and photos have been picked and completed in this session!`,
      answer: 'All Category Challenges Completed',
      mediaUrl: category === 'audio' ? '/samples/stadium_anthem.wav' : '/samples/sample_player_action.jpg',
      blurAmount: 0,
      createdAt: new Date().toISOString(),
    };
  }

  // Pick a random unpicked eligible item
  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex];
}
