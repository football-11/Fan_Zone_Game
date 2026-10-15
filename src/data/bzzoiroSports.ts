import { TicTacToeClub } from '../types/game';

export const BZZOIRO_BASE_URL = 'https://sports.bzzoiro.com';

export function getBzzoiroTeamLogoUrl(bzzoiroTeamId: number, transparent = true): string {
  return `${BZZOIRO_BASE_URL}/img/team/${bzzoiroTeamId}/${transparent ? '?bg=transparent' : ''}`;
}

export function getBzzoiroPlayerImageUrl(bzzoiroPlayerId: number, cutout = true): string {
  return `${BZZOIRO_BASE_URL}/img/player/${bzzoiroPlayerId}/${
    cutout ? '?sor=true&bg=transparent' : ''
  }`;
}

export const BZZOIRO_CLUB_POOL: TicTacToeClub[] = [
  {
    id: 'real_madrid',
    name: 'Real Madrid',
    shortName: 'RMA',
    bzzoiroTeamId: 57,
    logoUrl: getBzzoiroTeamLogoUrl(57),
  },
  {
    id: 'barcelona',
    name: 'FC Barcelona',
    shortName: 'BAR',
    bzzoiroTeamId: 44,
    logoUrl: getBzzoiroTeamLogoUrl(44),
  },
  {
    id: 'man_city',
    name: 'Manchester City',
    shortName: 'MCI',
    bzzoiroTeamId: 12,
    logoUrl: getBzzoiroTeamLogoUrl(12),
  },
  {
    id: 'psg',
    name: 'Paris Saint-Germain',
    shortName: 'PSG',
    bzzoiroTeamId: 114,
    logoUrl: getBzzoiroTeamLogoUrl(114),
  },
  {
    id: 'chelsea',
    name: 'Chelsea FC',
    shortName: 'CHE',
    bzzoiroTeamId: 13,
    logoUrl: getBzzoiroTeamLogoUrl(13),
  },
  {
    id: 'ac_milan',
    name: 'AC Milan',
    shortName: 'MIL',
    bzzoiroTeamId: 63,
    logoUrl: getBzzoiroTeamLogoUrl(63),
  },
  {
    id: 'man_united',
    name: 'Manchester United',
    shortName: 'MUN',
    bzzoiroTeamId: 17,
    logoUrl: getBzzoiroTeamLogoUrl(17),
  },
  {
    id: 'juventus',
    name: 'Juventus FC',
    shortName: 'JUV',
    bzzoiroTeamId: 73,
    logoUrl: getBzzoiroTeamLogoUrl(73),
  },
  {
    id: 'bayern',
    name: 'Bayern Munich',
    shortName: 'BAY',
    bzzoiroTeamId: 79,
    logoUrl: getBzzoiroTeamLogoUrl(79),
  },
  {
    id: 'inter_milan',
    name: 'Inter Milan',
    shortName: 'INT',
    bzzoiroTeamId: 77,
    logoUrl: getBzzoiroTeamLogoUrl(77),
  },
];

const CLUB_BY_ID: Record<string, TicTacToeClub> = Object.fromEntries(
  BZZOIRO_CLUB_POOL.map((club) => [club.id, club])
);

export function getBzzoiroClubLogoById(clubId: string): string | undefined {
  return CLUB_BY_ID[clubId]?.logoUrl;
}

/**
 * Verified Bzzoiro Sports Data player IDs mapped from https://sports.bzzoiro.com/
 * Used for instant 0ms player cutout portraits on both /host and /studio
 */
export const BZZOIRO_PLAYER_IDS: Record<string, number> = {
  'Ronaldinho': 64281,
  'Zlatan Ibrahimović': 127589,
  'Rivaldo': 19244,
  'Gianluca Zambrotta': 199968,
  'Mark van Bommel': 196819,
  'Mario Mandžukić': 157729,
  'Pepe Reina': 99109,
  'Thiago Silva': 2907,
  'Olivier Giroud': 1455,
  'Christian Pulisic': 1991,
  'Fikayo Tomori': 1988,
  'Andriy Shevchenko': 199805,
  'Hernán Crespo': 200965,
  'Andrea Pirlo': 176472,
  'Clarence Seedorf': 194370,
  'Hakan Çalhanoğlu': 1684,
  'Roberto Baggio': 19697,
  'Filippo Inzaghi': 199969,
  'Leonardo Bonucci': 119057,
  'Gonzalo Higuaín': 131730,
  'Robinho': 1244,
  'Mario Balotelli': 78408,
  'Kyle Walker': 403,
  'Nigel de Jong': 174645,
  'David Beckham': 196752,
  'Matteo Darmian': 4538,
  'Diogo Dalot': 1795,
  'Gianluigi Donnarumma': 843,
  'Theo Hernández': 7994,
  'Brahim Díaz': 598,
  'Robert Lewandowski': 748,
  'Thiago Alcântara': 121353,
  'Arturo Vidal': 55612,
  'Philippe Coutinho': 661,
  'João Cancelo': 8331,
  'Cesc Fàbregas': 155217,
  'Pedro': 204551,
  'Pedro Rodríguez': 204551,
  'Deco': 21057,
  'Samuel Eto’o': 174637,
  "Samuel Eto'o": 174637,
  'Pierre-Emerick Aubameyang': 1932,
  'João Félix': 7881,
  'Alexis Sánchez': 1558,
  'Dani Alves': 129308,
  'Thierry Henry': 190722,
  'Edgar Davids': 196960,
  'Miralem Pjanić': 132116,
  'İlkay Gündoğan': 3729,
  'Sergio Agüero': 139598,
  'Yaya Touré': 172154,
  'Ferran Torres': 749,
  'Claudio Bravo': 9905,
  'Gerard Piqué': 131123,
  'Memphis Depay': 3940,
  'Marcus Rashford': 750,
  'Lionel Messi': 9063,
  'Neymar Jr': 215,
  'Neymar': 215,
  'Ousmane Dembélé': 2253,
  'Javier Saviola': 186814,
  'Marcos Alonso': 1254,
  'Arjen Robben': 157923,
  'Michael Ballack': 200155,
  'Claudio Pizarro': 164477,
  'Kalidou Koulibaly': 7992,
  'Lúcio': 190535,
  'Ivan Perišić': 3510,
  'Benjamin Pavard': 1924,
  'Yann Sommer': 1678,
  'Kingsley Coman': 8245,
  'Matthijs de Ligt': 1790,
  'Douglas Costa': 27082,
  'Leroy Sané': 3732,
  'Jérôme Boateng': 116056,
  'Martín Demichelis': 179278,
  'Bastian Schweinsteiger': 167579,
  'Owen Hargreaves': 200743,
  'Noussair Mazraoui': 1799,
  'Marcel Sabitzer': 2161,
  'Eric Maxim Choupo-Moting': 9616,
  'Lucas Hernández': 2246,
  'Juan Bernat': 35934,
  'Renato Sanches': 4574,
  'Toni Kroos': 57860,
  'Xabi Alonso': 179466,
  'David Alaba': 4020,
  'James Rodríguez': 10128,
  'Zé Roberto': 17460,
  'Romelu Lukaku': 8676,
  'Mateo Kovačić': 4350,
  'Juan Sebastián Verón': 179208,
  'Victor Moses': 80811,
  'Álvaro Morata': 2841,
  'Juan Cuadrado': 4132,
  'Nicolas Anelka': 194032,
  'Denis Zakaria': 3616,
  'Kevin De Bruyne': 4374,
  'Raheem Sterling': 12177,
  'Cole Palmer': 395,
  'Frank Lampard': 181534,
  'Juan Mata': 122551,
  'Nemanja Matić': 2849,
  'Mason Mount': 1797,
  'Jadon Sancho': 521,
  'Radamel Falcao': 19456,
  'David Luiz': 3601,
  'Christopher Nkunku': 1996,
  'Eden Hazard': 126584,
  'Thibaut Courtois': 585,
  'Antonio Rüdiger': 588,
  'Ricardo Carvalho': 166258,
  'Edin Džeko': 1343,
  'Aleksandar Kolarov': 136414,
  'Maicon': 11247,
  'Nemanja Vidić': 151221,
  'Ashley Young': 6157,
  'André Onana': 4827,
  'Achraf Hakimi': 4241,
  'Mauro Icardi': 3733,
  'Milan Škriniar': 3408,
  'Thiago Motta': 174374,
  'Wesley Sneijder': 172721,
  'Danilo': 49,
  'Cristiano Ronaldo': 7880,
  'Paul Pogba': 2236,
  'Patrice Evra': 174572,
  'Gianluigi Buffon': 129303,
  'Ángel Di María': 23759,
  'Adrien Rabiot': 1994,
  'Sami Khedira': 157842,
  'Sylvain Distin': 184857,
  'Emmanuel Adebayor': 164659,
  'Edinson Cavani': 21996,
  'Ander Herrera': 22009,
  'Manuel Ugarte': 1806,
  'Casemiro': 1793,
  'Raphaël Varane': 117215,
  'Ruud van Nistelrooy': 199939,
  'Kylian Mbappé': 594,
  'Sergio Ramos': 10185,
  'Keylor Navas': 10062,
  'Luka Modrić': 1993,
  'Erling Haaland': 852,
  'Jude Bellingham': 592,
};

function normalizePlayerKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, "'")
    .trim()
    .toLowerCase();
}

const NORMALIZED_PLAYER_ID_MAP: Record<string, number> = {};
for (const [playerName, playerId] of Object.entries(BZZOIRO_PLAYER_IDS)) {
  NORMALIZED_PLAYER_ID_MAP[normalizePlayerKey(playerName)] = playerId;
}

export function resolveBzzoiroPlayerId(playerName?: string | null): number | null {
  if (!playerName) return null;
  const trimmed = playerName.trim();
  if (!trimmed) return null;
  if (BZZOIRO_PLAYER_IDS[trimmed]) {
    return BZZOIRO_PLAYER_IDS[trimmed];
  }
  const norm = normalizePlayerKey(trimmed);
  if (NORMALIZED_PLAYER_ID_MAP[norm]) {
    return NORMALIZED_PLAYER_ID_MAP[norm];
  }
  // Partial surname/fullname match against known dictionary
  for (const [key, id] of Object.entries(NORMALIZED_PLAYER_ID_MAP)) {
    if (key === norm || key.endsWith(` ${norm}`) || norm.endsWith(` ${key}`)) {
      return id;
    }
  }
  return null;
}

export function resolveBzzoiroPlayerImageUrl(playerName?: string | null): string | null {
  const id = resolveBzzoiroPlayerId(playerName);
  if (!id) return null;
  return getBzzoiroPlayerImageUrl(id, true);
}

export interface BzzoiroSearchResultItem {
  id: number;
  type: 'player' | 'team';
  name: string;
  extra: string;
  imageUrl: string;
  fallbackImageUrl: string;
}

export async function searchBzzoiroSports(
  query: string,
  filterType?: 'player' | 'team'
): Promise<BzzoiroSearchResultItem[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  try {
    const res = await fetch(
      `/api/bzzoiro/search?q=${encodeURIComponent(q)}${filterType ? `&type=${filterType}` : ''}`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results)) {
        return data.results;
      }
    }
  } catch {
    // Fall back to direct Bzzoiro search below if backend route is unreachable
  }

  try {
    const directRes = await fetch(`${BZZOIRO_BASE_URL}/search/?q=${encodeURIComponent(q)}`);
    if (!directRes.ok) return [];
    const data = await directRes.json();
    const rawResults = Array.isArray(data.results) ? data.results : [];
    return rawResults
      .filter(
        (r: any) =>
          r.sport === 'football' &&
          (r.type === 'player' || r.type === 'team') &&
          (!filterType || r.type === filterType)
      )
      .map((r: any) => {
        const idMatch = String(r.img || r.url || '').match(/\/(\d+)\//);
        const numericId = idMatch ? Number(idMatch[1]) : 0;
        const isPlayer = r.type === 'player';
        return {
          id: numericId,
          type: isPlayer ? 'player' : 'team',
          name: String(r.name || ''),
          extra: String(r.extra || ''),
          imageUrl: numericId
            ? isPlayer
              ? getBzzoiroPlayerImageUrl(numericId, true)
              : getBzzoiroTeamLogoUrl(numericId, true)
            : `${BZZOIRO_BASE_URL}${r.img}`,
          fallbackImageUrl: numericId
            ? isPlayer
              ? getBzzoiroPlayerImageUrl(numericId, false)
              : getBzzoiroTeamLogoUrl(numericId, false)
            : `${BZZOIRO_BASE_URL}${r.img}`,
        };
      });
  } catch {
    return [];
  }
}
