import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { mockMatches, mockTeams, mockPlayers } from "./mockData.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase URL or Key is missing from backend/.env configuration!");
}

const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseKey || "placeholder");

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = "https://api.football-data.org/v4";

app.use(cors());
app.use(express.json());

// In-memory cache variables
let matchesCache = { data: null, timestamp: 0 };
let standingsCache = { data: null, timestamp: 0 };
let squadCache = {};
let playerDetailsCache = {};

const cacheDurations = {
  matches: 60 * 1000, // 60 seconds
  standings: 5 * 60 * 1000, // 5 minutes
  squad: 10 * 60 * 1000, // 10 minutes
  player: 30 * 60 * 1000 // 30 minutes
};

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

// Generic fetch with caching and fallback
const fetchFromFootballData = async (endpoint, cacheKey) => {
  if (!API_KEY || API_KEY.trim() === "") {
    throw new Error("No API key configured in .env. Utilizing local mock data.");
  }

  const now = Date.now();
  let cacheObj = cacheKey === "matches" ? matchesCache : standingsCache;
  const duration = cacheDurations[cacheKey];

  if (cacheObj.data && (now - cacheObj.timestamp < duration)) {
    console.log(`[Cache Hit] Serving ${cacheKey} from memory cache.`);
    return cacheObj.data;
  }

  console.log(`[Cache Miss] Fetching ${cacheKey} from football-data.org API...`);
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "X-Auth-Token": API_KEY }
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Football-Data.org API rate limit (429) exceeded. Utilizing local failover.");
    }
    throw new Error(`API returned error status: ${response.status}`);
  }

  const data = await response.json();
  
  if (cacheKey === "matches") {
    matchesCache = { data, timestamp: now };
  } else {
    standingsCache = { data, timestamp: now };
  }

  return data;
};

// Flags emoji helper mapping TLA codes
const getFlag = (teamName, tla) => {
  const flags = {
    MEX: "🇲🇽", KOR: "🇰🇷", CZE: "🇨🇿", RSA: "🇿🇦",
    SUI: "🇨🇭", CAN: "🇨🇦", QAT: "🇶🇦", BIH: "🇧🇦",
    SCO: "🏴", MAR: "🇲🇦", BRA: "🇧🇷", HAI: "🇭🇹",
    USA: "🇺🇸", AUS: "🇦🇺", TUR: "🇹🇷", PAR: "🇵🇾",
    GER: "🇩🇪", ECU: "🇪🇨", CIV: "🇨🇮", CUW: "🇨🇼",
    JPN: "🇯🇵", NED: "🇳🇱", SWE: "🇸🇪", TUN: "🇹🇳",
    EGY: "🇪🇬", BEL: "🇧🇪", IRN: "🇮🇷", NZL: "🇳🇿",
    CPV: "🇨🇻", KSA: "🇸🇦", ESP: "🇪🇸", URY: "🇺🇾",
    FRA: "🇫🇷", IRQ: "🇮🇶", NOR: "🇳🇴", SEN: "🇸🇳",
    ALG: "🇩🇿", ARG: "🇦🇷", JOR: "🇯🇴", AUT: "🇦🇹",
    COD: "🇨🇩", COL: "🇨🇴", POR: "🇵🇹", UZB: "🇺🇿",
    ENG: "🏴", GHA: "🇬🇭", CRO: "🇭🇷", PAN: "🇵🇦"
  };
  return flags[tla?.toUpperCase()] || "⚽";
};

const slugify = (value = "") => String(value)
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

const countryCodesByName = {
  algeria: "DZ",
  argentina: "AR",
  australia: "AU",
  austria: "AT",
  belgium: "BE",
  bolivia: "BO",
  bosnia_herzegovina: "BA",
  bosnia_and_herzegovina: "BA",
  brazil: "BR",
  cameroon: "CM",
  canada: "CA",
  cape_verde_islands: "CV",
  chile: "CL",
  china_pr: "CN",
  colombia: "CO",
  congo_dr: "CD",
  costa_rica: "CR",
  cote_d_ivoire: "CI",
  croatia: "HR",
  curacao: "CW",
  czechia: "CZ",
  czech_republic: "CZ",
  denmark: "DK",
  dr_congo: "CD",
  ecuador: "EC",
  egypt: "EG",
  england: "GB-ENG",
  finland: "FI",
  france: "FR",
  germany: "DE",
  ghana: "GH",
  greece: "GR",
  haiti: "HT",
  honduras: "HN",
  hungary: "HU",
  iceland: "IS",
  indonesia: "ID",
  ir_iran: "IR",
  iran: "IR",
  iraq: "IQ",
  ireland: "IE",
  republic_of_ireland: "IE",
  israel: "IL",
  italy: "IT",
  ivory_coast: "CI",
  jamaica: "JM",
  japan: "JP",
  jordan: "JO",
  kenya: "KE",
  korea_republic: "KR",
  mexico: "MX",
  morocco: "MA",
  netherlands: "NL",
  new_zealand: "NZ",
  nigeria: "NG",
  norway: "NO",
  panama: "PA",
  paraguay: "PY",
  peru: "PE",
  poland: "PL",
  portugal: "PT",
  qatar: "QA",
  romania: "RO",
  russia: "RU",
  saudi_arabia: "SA",
  scotland: "GB-SCT",
  senegal: "SN",
  serbia: "RS",
  slovakia: "SK",
  slovenia: "SI",
  south_africa: "ZA",
  south_korea: "KR",
  spain: "ES",
  sweden: "SE",
  switzerland: "CH",
  trinidad_and_tobago: "TT",
  tunisia: "TN",
  turkey: "TR",
  turkiye: "TR",
  ukraine: "UA",
  united_states: "US",
  uruguay: "UY",
  uzbekistan: "UZ",
  venezuela: "VE",
  wales: "GB-WLS"
};

const tlaToCountryCode = {
  ALG: "DZ", ARG: "AR", AUS: "AU", AUT: "AT", BEL: "BE", BIH: "BA", BOL: "BO", BRA: "BR",
  CAN: "CA", CHI: "CL", CHN: "CN", CIV: "CI", CMR: "CM", COD: "CD", COL: "CO",
  CPV: "CV", CRC: "CR", CRO: "HR", CZE: "CZ", CUW: "CW",
  DEN: "DK", ECU: "EC", EGY: "EG", ENG: "GB-ENG", ESP: "ES",
  FIN: "FI", FRA: "FR", GER: "DE", GHA: "GH", GRE: "GR",
  HAI: "HT", HON: "HN", HUN: "HU", IDN: "ID", IRN: "IR", IRQ: "IQ", IRL: "IE", ISL: "IS", ISR: "IL", ITA: "IT",
  JAM: "JM", JOR: "JO", JPN: "JP",
  KEN: "KE", KOR: "KR", KSA: "SA",
  MAR: "MA", MEX: "MX",
  NED: "NL", NGA: "NG", NOR: "NO", NZL: "NZ",
  PAN: "PA", PAR: "PY", PER: "PE", POL: "PL", POR: "PT",
  QAT: "QA", ROM: "RO", RSA: "ZA", RUS: "RU",
  SCO: "GB-SCT", SEN: "SN", SRB: "RS", SUI: "CH", SVK: "SK", SVN: "SI", SWE: "SE",
  TRI: "TT", TUN: "TN", TUR: "TR",
  UKR: "UA", URY: "UY", USA: "US", UZB: "UZ",
  VEN: "VE", WAL: "GB-WLS"
};



const flagFromCountryCode = (code) => {
  if (!code || code.length < 2) return "\u26BD";
  // Handle GB-ENG, GB-SCT, GB-WLS sub-region codes
  const base = code.includes("-") ? code.split("-")[0] : code;
  return String.fromCodePoint(...[...base.toUpperCase()].map(char => 127397 + char.charCodeAt(0)));
};

// Returns a CDN URL for the country flag image (never rate-limited)
const getFlagImageUrl = (countryCode) => {
  if (!countryCode) return null;
  // flagcdn.com supports ISO 3166-1 alpha-2 codes in lowercase
  const base = countryCode.includes("-") ? countryCode.split("-")[0].toLowerCase() : countryCode.toLowerCase();
  if (base.length !== 2) return null;
  return `https://flagcdn.com/w160/${base}.png`;
};

const resolveCountryCode = (teamName, tla) => {
  return tlaToCountryCode[tla?.toUpperCase()] || countryCodesByName[slugify(teamName)] || null;
};

const getCleanFlag = (teamName, tla) => {
  const countryCode = resolveCountryCode(teamName, tla);
  // Prefer the CDN image URL, fall back to emoji
  return getFlagImageUrl(countryCode) || flagFromCountryCode(countryCode);
};

const getTeamFlagAndCrest = (team) => {
  // Always resolve via our reliable flagcdn.com instead of crests.football-data.org
  const tla = team.tla || (typeof team.id === 'string' && isNaN(Number(team.id)) ? team.id.slice(0, 3).toUpperCase() : null);
  const countryCode = resolveCountryCode(team.name, tla);
  const flagUrl = getFlagImageUrl(countryCode);
  return {
    flag: flagUrl || getCleanFlag(team.name, tla),
    crest: flagUrl || null
  };
};

const sortMatchesByDate = (matches) => [...matches].sort((a, b) => new Date(a.utcDate || 0) - new Date(b.utcDate || 0));

const getTeamByName = (teamName) => mockTeams.find(team => slugify(team.name) === slugify(teamName));

const buildTeamMeta = (teamName, tla, crest, apiId) => {
  const localTeam = getTeamByName(teamName);
  // Always prefer our reliable flag CDN over the API-provided crest URL
  const reliableFlag = getCleanFlag(teamName || localTeam?.name, tla);
  return {
    id: apiId ? String(apiId) : (localTeam?.id || slugify(teamName || tla || "tbd")),
    name: teamName || localTeam?.name || "TBD",
    flag: reliableFlag,
    crest: reliableFlag,
    ranking: localTeam?.fifaRanking || null,
    form: localTeam?.form || []
  };
};

const teamScorers = {
  argentina: ["Lionel Messi", "Julián Álvarez", "Lautaro Martínez", "Angel Di María", "Enzo Fernández", "Alexis Mac Allister"],
  france: ["Kylian Mbappé", "Olivier Giroud", "Antoine Griezmann", "Ousmane Dembélé", "Marcus Thuram", "Kingsley Coman"],
  brazil: ["Neymar Jr", "Vinícius Júnior", "Rodrygo", "Richarlison", "Raphinha", "Gabriel Martinelli"],
  england: ["Harry Kane", "Jude Bellingham", "Bukayo Saka", "Phil Foden", "Marcus Rashford", "Ollie Watkins"],
  portugal: ["Cristiano Ronaldo", "Bruno Fernandes", "Bernardo Silva", "Diogo Jota", "Gonçalo Ramos", "João Félix"],
  spain: ["Alvaro Morata", "Dani Olmo", "Ferran Torres", "Nico Williams", "Lamine Yamal", "Pedri"],
  germany: ["Kai Havertz", "Jamal Musiala", "Niclas Füllkrug", "Serge Gnabry", "Leroy Sané", "Florian Wirtz"],
  netherlands: ["Memphis Depay", "Cody Gakpo", "Denzel Dumfries", "Wout Weghorst", "Xavi Simons"],
  belgium: ["Romelu Lukaku", "Kevin De Bruyne", "Leandro Trossard", "Jeremy Doku", "Lois Openda"],
  italy: ["Federico Chiesa", "Ciro Immobile", "Gianluca Scamacca", "Nicolo Barella"],
  croatia: ["Luka Modrić", "Andrej Kramarić", "Ivan Perišić", "Mateo Kovačić"],
  uruguay: ["Luis Suárez", "Darwin Núñez", "Federico Valverde", "Facundo Pellistri"],
  colombia: ["Luis Díaz", "James Rodríguez", "Rafael Borré", "Jhon Durán"],
  mexico: ["Santiago Giménez", "Hirving Lozano", "Henry Martín", "Orbelín Pineda"],
  usa: ["Christian Pulisic", "Folarin Balogun", "Timothy Weah", "Weston McKennie"],
  south_korea: ["Son Heung-min", "Hwang Hee-chan", "Cho Gue-sung", "Lee Kang-in"],
  japan: ["Takumi Minamino", "Kaoru Mitoma", "Ritsu Doan", "Daichi Kamada", "Ayase Ueda"],
  morocco: ["Youssef En-Nesyri", "Hakim Ziyech", "Sofiane Boufal", "Achraf Hakimi"],
  ecuador: ["Enner Valencia", "Kendry Páez", "Jordy Caicedo"],
  south_africa: ["Percy Tau", "Themba Zwane", "Teboho Mokoena"],
  egypt: ["Mohamed Salah", "Mostafa Mohamed", "Trezeguet"],
  saudi_arabia: ["Salem Al-Dawsari", "Firas Al-Buraikan", "Saleh Al-Shehri"],
  austria: ["Marko Arnautović", "Christoph Baumgartner", "Marcel Sabitzer", "Michael Gregoritsch"],
  jordan: ["Musa Al-Taamari", "Yazan Al-Naimat", "Ali Olwan"],
  algeria: ["Riyad Mahrez", "Baghdad Bounedjah", "Amine Gouiri", "Houssem Aouar"]
};

const getScorerName = (teamName, index) => {
  const cleanTeam = teamName?.toLowerCase().trim().replace(/[-\s]+/g, "_") || "";
  const players = teamScorers[cleanTeam];
  if (players && players.length > 0) {
    return players[index % players.length];
  }
  return `${teamName} Striker #${index + 9}`;
};

const generateTimeline = (homeTeam, awayTeam, homeScore, awayScore) => {
  const events = [];
  
  for (let i = 0; i < homeScore; i++) {
    const minute = Math.min(88, Math.max(5, Math.round(12 + (i * 22) + Math.random() * 8)));
    const player = getScorerName(homeTeam, i);
    events.push({
      minute,
      team: "home",
      player,
      type: "goal"
    });
  }

  for (let i = 0; i < awayScore; i++) {
    const minute = Math.min(88, Math.max(5, Math.round(18 + (i * 22) + Math.random() * 8)));
    const player = getScorerName(awayTeam, i);
    events.push({
      minute,
      team: "away",
      player,
      type: "goal"
    });
  }

  if (homeScore > 0 || awayScore > 0) {
    events.push({
      minute: Math.round(35 + Math.random() * 15),
      team: Math.random() > 0.5 ? "home" : "away",
      player: "Defender",
      type: "yellow",
      detail: "Tactical foul in midfield"
    });
  }

  events.sort((a, b) => a.minute - b.minute);

  let runningHome = 0;
  let runningAway = 0;
  events.forEach(e => {
    if (e.type === "goal") {
      if (e.team === "home") {
        runningHome++;
      } else {
        runningAway++;
      }
      e.detail = `Goal (${runningHome}-${runningAway})`;
    }
  });

  return events;
};

// Normalizes football-data.org matches structure into PitchPulse matches structure
const normalizeMatches = (apiMatches) => {
  const normalized = apiMatches.map(m => {
    let status = "UPCOMING";
    if (["IN_PLAY", "PAUSED"].includes(m.status)) status = "LIVE";
    else if (m.status === "FINISHED") status = "COMPLETED";

    const dateObj = new Date(m.utcDate);
    const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ", " + 
                    dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const homeScore = m.score?.fullTime?.home ?? m.score?.regularTime?.home ?? m.score?.halfTime?.home ?? 0;
    const awayScore = m.score?.fullTime?.away ?? m.score?.regularTime?.away ?? m.score?.halfTime?.away ?? 0;

    // Simulate match statistics
    const stats = {
      possession: { 
        home: status === "UPCOMING" ? 0 : 50 + Math.round((homeScore - awayScore) * 3), 
        away: status === "UPCOMING" ? 0 : 50 - Math.round((homeScore - awayScore) * 3) 
      },
      shots: { 
        home: status === "UPCOMING" ? 0 : 8 + homeScore * 2, 
        away: status === "UPCOMING" ? 0 : 8 + awayScore * 2 
      },
      xg: { 
        home: status === "UPCOMING" ? 0 : Number((0.5 + homeScore * 0.5 + Math.random() * 0.2).toFixed(2)), 
        away: status === "UPCOMING" ? 0 : Number((0.5 + awayScore * 0.5 + Math.random() * 0.2).toFixed(2)) 
      },
      passAccuracy: { 
        home: status === "UPCOMING" ? 0 : 80 + Math.round(Math.random() * 10), 
        away: status === "UPCOMING" ? 0 : 80 + Math.round(Math.random() * 10) 
      }
    };

    // Safely extract team names — handle null-field objects from undetermined knockout matches
    const rawHomeName = m.homeTeam?.name || m.homeTeam?.shortName || m.homeTeam?.tla;
    const rawAwayName = m.awayTeam?.name || m.awayTeam?.shortName || m.awayTeam?.tla;
    const homeName = (typeof rawHomeName === "string" && rawHomeName.trim()) ? rawHomeName : (typeof m.homeTeam === "string" ? m.homeTeam : "TBD");
    const awayName = (typeof rawAwayName === "string" && rawAwayName.trim()) ? rawAwayName : (typeof m.awayTeam === "string" ? m.awayTeam : "TBD");

    const homeMeta = buildTeamMeta(homeName, m.homeTeam?.tla, m.homeTeam?.crest, m.homeTeam?.id);
    const awayMeta = buildTeamMeta(awayName, m.awayTeam?.tla, m.awayTeam?.crest, m.awayTeam?.id);
    const timeline = status !== "UPCOMING" 
      ? generateTimeline(homeName, awayName, homeScore, awayScore)
      : [];

    let predictProb = null;
    if (status === "UPCOMING") {
      predictProb = { home: 55, draw: 25, away: 20 };
    }

    let day = `Day ${m.matchday}`;
    if (m.stage === "LAST_32") day = "Round of 32";
    else if (m.stage === "LAST_16") day = "Round of 16";
    else if (m.stage === "QUARTER_FINALS") day = "Quarter-finals";
    else if (m.stage === "SEMI_FINALS") day = "Semi-finals";
    else if (m.stage === "THIRD_PLACE") day = "Third Place";
    else if (m.stage === "FINAL") day = "Final";

    return {
      id: String(m.id),
      status,
      minute: status === "LIVE" ? 75 : null,
      day,
      date: dateStr,
      utcDate: m.utcDate,
      source: "football-data.org",
      home: homeMeta,
      away: awayMeta,
      homeTeam: homeMeta.name,
      awayTeam: awayMeta.name,
      homeId: homeMeta.id,
      awayId: awayMeta.id,
      homeScore,
      awayScore,
      homeFlag: homeMeta.flag,
      awayFlag: awayMeta.flag,
      stats,
      timeline,
      predictProb,
      lineups: { home: [], away: [] }
    };
  });
  return sortMatchesByDate(normalized);
};
// Normalizes football-data.org standings structure into PitchPulse standings structure
const normalizeStandings = (apiStandings) => {
  const standings = {};
  apiStandings.forEach(grp => {
    const letter = grp.group.replace("GROUP_", "");
    
    standings[letter] = grp.table.map(row => {
      const mockTeamData = mockTeams.find(t => t.name.toLowerCase() === row.team.name.toLowerCase()) || {
        fifaRanking: 30, attackPower: 75, defenseRating: 75, form: ["D"], h2h: {}
      };

      return {
        id: String(row.team.id),
        name: row.team.name,
        group: letter,
        played: row.playedGames,
        won: row.won,
        drawn: row.draw,
        lost: row.lost,
        gf: row.goalsFor,
        ga: row.goalsAgainst,
        pts: row.points,
        fifaRanking: mockTeamData.fifaRanking,
        attackPower: mockTeamData.attackPower,
        defenseRating: mockTeamData.defenseRating,
        form: mockTeamData.form,
        h2h: mockTeamData.h2h
      };
    });
  });
  return standings;
};

// Cacheable matches retriever
const getNormalizedMatches = async () => {
  try {
    const raw = await fetchFromFootballData("/competitions/WC/matches", "matches");
    if (raw && raw.matches) {
      const normalized = normalizeMatches(raw.matches);

      // Collect all unique teams to prevent foreign key issues
      const uniqueTeams = new Map();
      normalized.forEach(m => {
        if (m.homeId) {
          uniqueTeams.set(m.homeId, {
            id: m.homeId,
            name: m.homeTeam,
            group: m.home.group || "A",
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            gf: 0,
            ga: 0,
            pts: 0,
            fifaRanking: m.home.ranking || 50,
            attackPower: 75,
            defenseRating: 75,
            form: m.home.form || ["D"],
            h2h: {}
          });
        }
        if (m.awayId) {
          uniqueTeams.set(m.awayId, {
            id: m.awayId,
            name: m.awayTeam,
            group: m.away.group || "A",
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            gf: 0,
            ga: 0,
            pts: 0,
            fifaRanking: m.away.ranking || 50,
            attackPower: 75,
            defenseRating: 75,
            form: m.away.form || ["D"],
            h2h: {}
          });
        }
      });

      // Query existing teams in Supabase
      const { data: existingTeams } = await supabase.from('teams').select('id');
      const existingIds = new Set((existingTeams || []).map(t => t.id));

      const missingTeams = [];
      uniqueTeams.forEach((team, id) => {
        if (!existingIds.has(id)) {
          missingTeams.push(team);
        }
      });

      if (missingTeams.length > 0) {
        console.log(`[Database Sync] Found ${missingTeams.length} missing teams. Inserting them to prevent foreign key violations...`);
        const { error: teamsError } = await supabase.from('teams').insert(missingTeams);
        if (teamsError) {
          console.error("Error inserting missing teams:", teamsError.message);
        }
      }

      const dbMatches = normalized.map(m => ({
        id: m.id,
        status: m.status,
        minute: m.minute,
        day: m.day,
        date: m.date,
        utcDate: m.utcDate ? new Date(m.utcDate).toISOString() : null,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeId: m.homeId,
        awayId: m.awayId,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        homeFlag: m.homeFlag,
        awayFlag: m.awayFlag,
        stats: m.stats,
        lineups: m.lineups,
        timeline: m.timeline,
        predictProb: m.predictProb
      }));
      const { error } = await supabase.from('matches').upsert(dbMatches);
      if (error) console.error("Error syncing matches to Supabase matches table:", error.message);
    }
  } catch (err) {
    console.warn("External matches fetch failed. Serving from Supabase cache. Reason:", err.message);
  }

  const { data: dbMatches, error } = await supabase
    .from('matches')
    .select('*')
    .order('utcDate', { ascending: true });

  if (error) {
    console.error("Error reading matches from Supabase:", error.message);
    return [];
  }

  // Filter out any mock matches (football-data.org match IDs are purely numeric)
  const originalMatches = (dbMatches || []).filter(m => !isNaN(Number(m.id)));
  return originalMatches;
};

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// All Matches
app.get("/api/matches", async (req, res) => {
  const list = await getNormalizedMatches();
  res.json(sortMatchesByDate(list));
});

// Live Matches
app.get("/api/matches/live", async (req, res) => {
  const list = await getNormalizedMatches();
  const live = sortMatchesByDate(list.filter(m => m.status === "LIVE"));
  res.json(live);
});

// Upcoming Matches
app.get("/api/matches/upcoming", async (req, res) => {
  const list = await getNormalizedMatches();
  const upcoming = sortMatchesByDate(list.filter(m => m.status === "UPCOMING"));
  res.json(upcoming);
});

// Filter matches by day
app.get("/api/matches/by-day/:day", async (req, res) => {
  const dayName = req.params.day.replace("-", " ");
  const list = await getNormalizedMatches();
  const filtered = sortMatchesByDate(list.filter(m => m.day.toLowerCase() === dayName.toLowerCase()));
  res.json(filtered);
});

// Match Details by ID
app.get("/api/matches/:id", async (req, res) => {
  const list = await getNormalizedMatches();
  const match = list.find(m => m.id === req.params.id);
  if (!match) return res.status(404).json({ error: "Match not found" });
  res.json(match);
});

// Standings
app.get("/api/standings", async (req, res) => {
  try {
    const raw = await fetchFromFootballData("/competitions/WC/standings", "standings");
    if (raw && raw.standings) {
      const standings = normalizeStandings(raw.standings);
      const flattenedTeams = [];
      Object.keys(standings).forEach(letter => {
        standings[letter].forEach(team => {
          flattenedTeams.push({
            id: team.id,
            name: team.name,
            group: team.group,
            played: team.played,
            won: team.won,
            drawn: team.drawn,
            lost: team.lost,
            gf: team.gf,
            ga: team.ga,
            pts: team.pts,
            "fifaRanking": team.fifaRanking,
            "attackPower": team.attackPower,
            "defenseRating": team.defenseRating,
            form: team.form,
            h2h: team.h2h
          });
        });
      });
      const { error } = await supabase.from('teams').upsert(flattenedTeams);
      if (error) console.error("Error syncing standings teams to Supabase:", error.message);
    }
  } catch (err) {
    console.warn("External standings fetch failed. Serving from Supabase. Reason:", err.message);
  }

  const { data: dbTeams, error } = await supabase
    .from('teams')
    .select('*');

  if (error) {
    console.error("Error reading teams from Supabase for standings:", error.message);
    return res.status(500).json({ error: error.message });
  }

  // Filter teams. If we have real tournament teams (numeric IDs), show them.
  // Otherwise fall back to mock teams.
  const realTeams = dbTeams.filter(team => !isNaN(Number(team.id)));
  const teamsToShow = realTeams.length > 0 ? realTeams : dbTeams;

  const standings = {};
  teamsToShow.forEach(team => {
    if (!team.group) return; // Ignore teams without group
    const cleanGroup = team.group.replace("Group ", "").replace("GROUP_", "").trim();
    
    // Attach flag & crest dynamically
    const meta = getTeamFlagAndCrest(team);
    const teamWithFlag = {
      ...team,
      group: cleanGroup,
      flag: meta.flag,
      crest: meta.crest
    };

    if (!standings[cleanGroup]) standings[cleanGroup] = [];
    standings[cleanGroup].push(teamWithFlag);
  });
  
  Object.keys(standings).forEach(group => {
    standings[group].sort((a, b) => b.pts - a.pts);
  });
  res.json(standings);
});

// Get Team Squad dynamically from football-data.org and cache it
app.get("/api/teams/:id/squad", async (req, res) => {
  const teamId = req.params.id;
  const now = Date.now();

  if (squadCache[teamId] && (now - squadCache[teamId].timestamp < cacheDurations.squad)) {
    console.log(`[Cache Hit] Serving squad for team ${teamId} from memory cache.`);
    return res.json(squadCache[teamId].data);
  }

  let teamName = "";
  try {
    console.log(`[Cache Miss] Fetching squad for team ${teamId} from football-data.org...`);
    const response = await fetch(`${BASE_URL}/teams/${teamId}`, {
      headers: { "X-Auth-Token": API_KEY }
    });
    if (!response.ok) {
      throw new Error(`API returned error status: ${response.status}`);
    }
    const data = await response.json();
    const squad = data.squad || [];
    teamName = data.name || "";
    const result = squad.map(p => ({
      id: String(p.id),
      name: p.name,
      position: p.position || "Player",
      dateOfBirth: p.dateOfBirth,
      nationality: p.nationality
    }));

    // Save squad to Supabase players table
    if (squad.length > 0) {
      const dbPlayers = squad.map(p => {
        const age = p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : 26;
        const normPos = normalizePosition(p.position);
        return {
          id: String(p.id),
          name: p.name,
          team: teamName,
          position: normPos,
          jersey: p.shirtNumber || null,
          age: age,
          club: data.name || null,
          traits: getDynamicTraits(normPos),
          stats: { goals: 0, assists: 0, games: 0, passAccuracy: 80 },
          attributes: getDynamicAttributes(normPos),
          heatmap: getDynamicHeatmap(normPos)
        };
      });
      const { error } = await supabase.from('players').upsert(dbPlayers);
      if (error) console.error("Error caching squad players to Supabase:", error.message);
    }

    squadCache[teamId] = { data: result, timestamp: now };
    return res.json(result);
  } catch (err) {
    console.warn(`Squad fetch failed for team ${teamId}, using cached database players or mocks. Reason:`, err.message);
    
    // Find the team name for this teamId
    const team = mockTeams.find(t => t.id === teamId || String(t.fifaRanking) === teamId || t.name.toLowerCase() === teamId.toLowerCase());
    teamName = team ? team.name : "";

    // Fetch players for this team from Supabase
    if (teamName) {
      const { data: dbPlayersList, error } = await supabase
        .from('players')
        .select('*')
        .ilike('team', teamName);
        
      if (!error && dbPlayersList && dbPlayersList.length > 0) {
        const result = dbPlayersList.map(p => ({
          id: p.id,
          name: p.name,
          position: p.position,
          dateOfBirth: p.age ? `${new Date().getFullYear() - p.age}-01-01` : "1995-01-01",
          nationality: p.team
        }));
        squadCache[teamId] = { data: result, timestamp: now };
        return res.json(result);
      }
    }

    // Ultimate fallback to mock players
    const squad = mockPlayers.filter(p => p.team.toLowerCase() === teamName.toLowerCase());
    const result = squad.length > 0 ? squad.map(p => ({
      id: p.id,
      name: p.name,
      position: p.position,
      dateOfBirth: "1995-01-01",
      nationality: p.team
    })) : [
      { id: "mock-1", name: "Striker Hero", position: "Offence", dateOfBirth: "1998-05-12", nationality: teamName },
      { id: "mock-2", name: "Midfield General", position: "Midfield", dateOfBirth: "1996-03-24", nationality: teamName },
      { id: "mock-3", name: "Defense Wall", position: "Defence", dateOfBirth: "1997-09-08", nationality: teamName }
    ];
    res.json(result);
  }
});

const teamIdMap = {
  "Belgium": 1, "France": 2, "Croatia": 3, "Brazil": 6, "Uruguay": 7, "Spain": 9,
  "England": 10, "Japan": 12, "Senegal": 13, "Serbia": 14, "Switzerland": 15,
  "Mexico": 16, "South Korea": 17, "Australia": 20, "Denmark": 21, "Iran": 22,
  "Saudi Arabia": 23, "Poland": 24, "Germany": 25, "Argentina": 26, "Portugal": 27,
  "Tunisia": 28, "Costa Rica": 29, "Morocco": 31, "Wales": 767, "Netherlands": 1118,
  "Ghana": 1504, "Cameroon": 1530, "Qatar": 1569, "Ecuador": 2382, "USA": 2384,
  "United States": 2384, "Canada": 5529, "Colombia": 8, "Italy": 779, "Sweden": 783,
  "Paraguay": 18, "Egypt": 22, "South Africa": 797, "Turkey": 786, "Austria": 793,
  "Ivory Coast": 24, "Algeria": 28, "Norway": 782, "Scotland": 785, "Panama": 19,
  "Czechia": 788, "Bosnia-Herzegovina": 790, "Iraq": 1539, "Cape Verde Islands": 1514,
  "New Zealand": 2238, "Jordan": 1555, "Uzbekistan": 1558, "Congo DR": 1506,
  "Haiti": 1565, "Curaçao": 2379
};

// Search player details, photo and stats using TheSportsDB and API-Football
app.get("/api/players/details", async (req, res) => {
  const playerName = req.query.name;
  if (!playerName) return res.status(400).json({ error: "name parameter is required" });

  const now = Date.now();
  const cacheKey = playerName.trim().toLowerCase();
  let cachedPlayerRecord = null;

  // Try Supabase cache first
  try {
    const { data: dbPlayer, error: dbError } = await supabase
      .from('players')
      .select('*')
      .ilike('name', playerName)
      .maybeSingle();

    if (!dbError && dbPlayer) {
      cachedPlayerRecord = dbPlayer;
      if (dbPlayer.photo && dbPlayer.bio) {
        console.log(`[Cache Hit] Serving player details for "${playerName}" from Supabase.`);
        return res.json({
          name: dbPlayer.name,
          photo: dbPlayer.photo,
          bio: dbPlayer.bio,
          height: dbPlayer.height,
          weight: dbPlayer.weight,
          stats: dbPlayer.stats
        });
      }
    }
  } catch (err) {
    console.warn("Supabase player fetch failed, continuing to live fetching:", err.message);
  }

  if (playerDetailsCache[cacheKey] && (now - playerDetailsCache[cacheKey].timestamp < cacheDurations.player)) {
    console.log(`[Cache Hit] Serving player details for "${playerName}" from memory cache.`);
    return res.json(playerDetailsCache[cacheKey].data);
  }

  console.log(`[Cache Miss] Fetching player details for "${playerName}"...`);

  let photo = null;
  let bio = null;
  let height = null;
  let weight = null;
  let stats = null;

  // 1. Fetch from TheSportsDB
  try {
    const sportsdbUrl = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(playerName)}`;
    const response = await fetch(sportsdbUrl);
    if (response.ok) {
      const dbData = await response.json();
      if (dbData.player && dbData.player.length > 0) {
        const firstPlayer = dbData.player[0];
        photo = firstPlayer.strCutout || firstPlayer.strThumb || null;
        
        if (firstPlayer.idPlayer) {
          const lookupUrl = `https://www.thesportsdb.com/api/v1/json/3/lookupplayer.php?id=${firstPlayer.idPlayer}`;
          const lookupResponse = await fetch(lookupUrl);
          if (lookupResponse.ok) {
            const lookupData = await lookupResponse.json();
            if (lookupData.players && lookupData.players.length > 0) {
              const fullPlayer = lookupData.players[0];
              photo = fullPlayer.strCutout || fullPlayer.strThumb || photo;
              bio = fullPlayer.strDescriptionEN || null;
              height = fullPlayer.strHeight || null;
              weight = fullPlayer.strWeight || null;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("TheSportsDB player fetch failed:", err.message);
  }

  // 2. Fetch stats from API-Football if key is configured
  if (API_FOOTBALL_KEY && API_FOOTBALL_KEY.trim() !== "") {
    try {
      let apiFootballUrl = `https://v3.football.api-sports.io/players?search=${encodeURIComponent(playerName)}`;
      
      // If we know the team, append it to satisfy API validation
      if (cachedPlayerRecord && cachedPlayerRecord.team) {
        const teamId = teamIdMap[cachedPlayerRecord.team];
        if (teamId) {
          apiFootballUrl += `&team=${teamId}&season=2022`;
        }
      }

      console.log(`[API-Football] Querying URL: ${apiFootballUrl}`);
      const response = await fetch(apiFootballUrl, {
        headers: {
          "x-apisports-key": API_FOOTBALL_KEY
        }
      });
      if (response.ok) {
        const statsData = await response.json();
        if (statsData.response && statsData.response.length > 0) {
          const item = statsData.response[0];
          
          if (!photo && item.player?.photo) {
            photo = item.player.photo;
          }
          if (!height && item.player?.height) {
            height = item.player.height;
          }
          if (!weight && item.player?.weight) {
            weight = item.player.weight;
          }

          const s = item.statistics?.[0] || {};
          stats = {
            goals: s.goals?.total || 0,
            assists: s.goals?.assists || 0,
            games: s.games?.appearences || 0,
            shotsPerGame: s.shots?.total && s.games?.appearences ? Number((s.shots.total / s.games.appearences).toFixed(1)) : 0,
            passAccuracy: s.passes?.accuracy || 80,
            rating: s.games?.rating || "7.0"
          };
        }
      }
    } catch (err) {
      console.warn("API-Football player stats fetch failed:", err.message);
    }
  }

  // Fallback stats logic
  if (!stats) {
    const localPlayer = mockPlayers.find(p => p.name.toLowerCase().includes(playerName.toLowerCase()) || playerName.toLowerCase().includes(p.name.toLowerCase()));
    if (localPlayer) {
      stats = localPlayer.stats;
    } else {
      stats = {
        goals: Math.floor(Math.random() * 3),
        assists: Math.floor(Math.random() * 2),
        games: Math.floor(Math.random() * 4) + 1,
        shotsPerGame: Number((1.5 + Math.random() * 2).toFixed(1)),
        passAccuracy: 75 + Math.floor(Math.random() * 15),
        rating: (6.5 + Math.random() * 1.5).toFixed(2)
      };
    }
  }

  const result = {
    name: playerName,
    photo,
    bio,
    height,
    weight,
    stats
  };

  // Cache back to Supabase if player exists
  try {
    if (cachedPlayerRecord) {
      await supabase
        .from('players')
        .update({ photo, bio, height, weight, stats })
        .eq('id', cachedPlayerRecord.id);
      console.log(`[Database Cache] Saved player details for "${playerName}" back to Supabase.`);
    }
  } catch (err) {
    console.error("Error writing player details cache to Supabase:", err.message);
  }

  playerDetailsCache[cacheKey] = { data: result, timestamp: now };
  res.json(result);
});

// Teams List
app.get("/api/teams", async (req, res) => {
  const { data, error } = await supabase.from('teams').select('*').order('name', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  
  const enriched = data.map(team => {
    const meta = getTeamFlagAndCrest(team);
    return {
      ...team,
      group: team.group ? team.group.replace("Group ", "").replace("GROUP_", "").trim() : "A",
      flag: meta.flag,
      crest: meta.crest
    };
  });
  res.json(enriched);
});

// Players List
app.get("/api/players", async (req, res) => {
  const { data, error } = await supabase.from('players').select('*').order('name', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Player by ID
app.get("/api/players/:id", async (req, res) => {
  const { data, error } = await supabase.from('players').select('*').eq('id', req.params.id).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Player not found" });
  res.json(data);
});

// Filter matches by team
app.get("/api/matches/by-team/:teamId", async (req, res) => {
  const teamId = req.params.teamId.toLowerCase();
  const list = await getNormalizedMatches();
  const filtered = sortMatchesByDate(list.filter(m => m.homeId === teamId || m.awayId === teamId));
  res.json(filtered);
});

const runLocalPrediction = (teamA, teamB, options = {}) => {
  const { formationA, mentalityA, formationB, mentalityB, teamAStats, teamBStats } = options;

  const statsA = teamAStats || {
    rank: 35,
    attack: 75,
    defense: 75,
    form: ["D"],
    h2h: {}
  };
  const statsB = teamBStats || {
    rank: 35,
    attack: 75,
    defense: 75,
    form: ["D"],
    h2h: {}
  };

  let attackA = statsA.attack;
  let defenseA = statsA.defense;
  let attackB = statsB.attack;
  let defenseB = statsB.defense;

  if (mentalityA === "attacking") { attackA *= 1.15; defenseA *= 0.88; }
  else if (mentalityA === "defensive") { defenseA *= 1.15; attackA *= 0.88; }

  if (mentalityB === "attacking") { attackB *= 1.15; defenseB *= 0.88; }
  else if (mentalityB === "defensive") { defenseB *= 1.15; attackB *= 0.88; }

  const getFormationModifier = (f) => {
    if (["5-4-1", "4-5-1", "5-3-2"].includes(f)) return { att: 0.90, def: 1.15 };
    if (["4-3-3", "3-4-3", "4-2-4"].includes(f)) return { att: 1.12, def: 0.92 };
    return { att: 1.05, def: 1.05 };
  };

  if (formationA) {
    const mod = getFormationModifier(formationA);
    attackA *= mod.att;
    defenseA *= mod.def;
  }
  if (formationB) {
    const mod = getFormationModifier(formationB);
    attackB *= mod.att;
    defenseB *= mod.def;
  }

  const rankStrengthA = Math.max(10, 100 - statsA.rank);
  const rankStrengthB = Math.max(10, 100 - statsB.rank);

  const getFormScore = (formArray) => {
    if (typeof formArray === "number") return formArray;
    if (!Array.isArray(formArray) || formArray.length === 0) return 60.0;
    return formArray.reduce((acc, val) => {
      if (val === "W") return acc + 3;
      if (val === "D") return acc + 1;
      return acc;
    }, 0) / (formArray.length * 3) * 100;
  };

  const formScoreA = getFormScore(statsA.form);
  const formScoreB = getFormScore(statsB.form);

  // H2H modifier calculation
  let h2hModA = 1.0;
  let h2hModB = 1.0;
  const teamBKey = teamB.toLowerCase().replace(/[-\s]+/g, "_");
  const h2hData = statsA.h2h?.[teamBKey] || statsA.h2h?.[teamB.toLowerCase()];
  if (h2hData && typeof h2hData === "string" && h2hData.includes("-")) {
    try {
      const parts = h2hData.split("-").map(Number);
      const wins = parts[0] || 0;
      const draws = parts[1] || 0;
      const losses = parts[2] || 0;
      const total = wins + draws + losses;
      if (total > 0) {
        h2hModA = 1.0 + ((wins - losses) / (total * 10));
        h2hModB = 2.0 - h2hModA;
      }
    } catch (e) {}
  }

  // Expected Goals (xG)
  const xG_A = Math.max(0.2, (attackA / (defenseB + 5)) * (formScoreA / 75.0) * h2hModA * 1.35);
  const xG_B = Math.max(0.2, (attackB / (defenseA + 5)) * (formScoreB / 75.0) * h2hModB * 1.35);

  let scoreA = (0.35 * rankStrengthA) + (0.25 * formScoreA) + (0.20 * attackA) + (0.20 * defenseA);
  let scoreB = (0.35 * rankStrengthB) + (0.25 * formScoreB) + (0.20 * attackB) + (0.20 * defenseB);

  scoreA *= h2hModA;
  scoreB *= h2hModB;

  const total = scoreA + scoreB;
  const rawWinA = scoreA / total;
  const rawWinB = scoreB / total;

  const drawProb = 0.23;
  const winA = Math.round(rawWinA * (1 - drawProb) * 100);
  const winB = Math.round(rawWinB * (1 - drawProb) * 100);
  const draw = 100 - winA - winB;

  let winner = "Draw";
  let confidence = draw;
  if (winA > winB) {
    winner = teamA;
    confidence = winA;
  } else if (winB > winA) {
    winner = teamB;
    confidence = winB;
  }

  // Simulate scoreline
  let goalsA = Math.max(0, Math.round(xG_A + (Math.random() * 0.8 - 0.4)));
  let goalsB = Math.max(0, Math.round(xG_B + (Math.random() * 0.8 - 0.4)));

  if (winA > winB + 5 && goalsA <= goalsB) {
    goalsA = goalsB + 1;
  } else if (winB > winA + 5 && goalsB <= goalsA) {
    goalsB = goalsA + 1;
  } else if (Math.abs(winA - winB) <= 5 && goalsA !== goalsB) {
    if (Math.random() > 0.4) {
      goalsA = goalsB = Math.min(goalsA, goalsB);
    } else {
      if (goalsA > goalsB) goalsA = goalsB + 1;
      else goalsB = goalsA + 1;
    }
  }

  // Generate Analysis
  const analysisParts = [
    `Tactical review shows ${teamA} playing ${formationA || "4-3-3"} (${mentalityA || "balanced"}) against ${teamB} in a ${formationB || "4-3-3"} (${mentalityB || "balanced"}) posture.`,
    statsA.rank < statsB.rank - 10 ? `${teamA} holds a strong ranking advantage.` : (statsB.rank < statsA.rank - 10 ? `${teamB} has the ranking edge.` : "The squads are tightly matched on paper."),
    `The Heuristic Simulator models an expected outcome of ${goalsA}-${goalsB} with a ${confidence}% probability backing ${winner === "Draw" ? "a Draw" : `${winner} win`}.`
  ];

  return {
    teamA,
    teamB,
    prediction: {
      winA,
      draw,
      winB,
      winner,
      confidence,
      predictedScoreA: goalsA,
      predictedScoreB: goalsB,
      xG_A: Number(xG_A.toFixed(2)),
      xG_B: Number(xG_B.toFixed(2)),
      analysis: analysisParts.join(" "),
      source: "Local Heuristic Prediction Engine"
    }
  };
};

// Prediction Endpoint
app.post("/api/predict/match", async (req, res) => {
  const { teamA, teamB, formationA, mentalityA, formationB, mentalityB } = req.body;
  if (!teamA || !teamB) {
    return res.status(400).json({ error: "teamA and teamB are required in the request body" });
  }

  // 1. Fetch real-time stats from database
  let teamAData = null;
  let teamBData = null;
  try {
    const { data: dbA } = await supabase.from('teams').select('*').ilike('name', teamA).maybeSingle();
    const { data: dbB } = await supabase.from('teams').select('*').ilike('name', teamB).maybeSingle();
    teamAData = dbA;
    teamBData = dbB;
  } catch (err) {
    console.warn("Failed to fetch team data from Supabase for predictor:", err.message);
  }

  const localA = mockTeams.find(t => t.name.toLowerCase() === teamA.toLowerCase() || t.id.toLowerCase() === teamA.toLowerCase()) || {
    fifaRanking: 35, attackPower: 75, defenseRating: 75, form: ["D"], h2h: {}
  };
  const localB = mockTeams.find(t => t.name.toLowerCase() === teamB.toLowerCase() || t.id.toLowerCase() === teamB.toLowerCase()) || {
    fifaRanking: 35, attackPower: 75, defenseRating: 75, form: ["D"], h2h: {}
  };

  const payload = {
    teamA,
    teamB,
    formationA: formationA || "4-3-3",
    mentalityA: mentalityA || "balanced",
    formationB: formationB || "4-3-3",
    mentalityB: mentalityB || "balanced",
    teamAStats: teamAData ? {
      rank: teamAData.fifaRanking || 35,
      attack: teamAData.attackPower || 75,
      defense: teamAData.defenseRating || 75,
      form: teamAData.form || ["D"],
      h2h: teamAData.h2h || {}
    } : {
      rank: localA.fifaRanking || 35,
      attack: localA.attackPower || 75,
      defense: localA.defenseRating || 75,
      form: localA.form || ["D"],
      h2h: localA.h2h || {}
    },
    teamBStats: teamBData ? {
      rank: teamBData.fifaRanking || 35,
      attack: teamBData.attackPower || 75,
      defense: teamBData.defenseRating || 75,
      form: teamBData.form || ["D"],
      h2h: teamBData.h2h || {}
    } : {
      rank: localB.fifaRanking || 35,
      attack: localB.attackPower || 75,
      defense: localB.defenseRating || 75,
      form: localB.form || ["D"],
      h2h: localB.h2h || {}
    }
  };

  try {
    const response = await fetch(`${AI_SERVICE_URL}/predict/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Prediction completed successfully using AI service.");
      return res.json(data);
    } else {
      console.warn("AI service returned non-200. Falling back to local heuristics.");
      const prediction = runLocalPrediction(teamA, teamB, payload);
      return res.json(prediction);
    }
  } catch (err) {
    console.warn("AI service connection failed. Falling back to local heuristics.", err.message);
    const prediction = runLocalPrediction(teamA, teamB, payload);
    return res.json(prediction);
  }
});

function normalizePosition(pos) {
  if (!pos) return "Forward";
  const p = pos.toLowerCase();
  if (p.includes("goalkeeper") || p === "gk") return "Goalkeeper";
  if (p.includes("defence") || p.includes("defender") || p === "df" || p.includes("back")) return "Defender";
  if (p.includes("midfield") || p.includes("midfielder") || p === "mf") return "Midfielder";
  if (p.includes("offence") || p.includes("forward") || p.includes("attacker") || p === "fw" || p.includes("striker") || p.includes("winger") || p === "coach") return "Forward";
  return "Forward";
}

function getDynamicTraits(position = "") {
  const pos = position.toLowerCase();
  if (pos.includes("goalkeeper") || pos.includes("gk")) return ["Reflexes", "Penalty Saver", "GK Command"];
  if (pos.includes("defender") || pos.includes("df") || pos.includes("back")) return ["Tactical Tackler", "Aerial Threat", "Strength"];
  if (pos.includes("midfielder") || pos.includes("mf")) return ["Playmaker", "Visionary Passer", "Midfield Controller"];
  return ["Clinical Finisher", "Speed Dribbler", "Attacking Threat"];
}

function getDynamicAttributes(position = "") {
  const pos = position.toLowerCase();
  const isGK = pos.includes("goalkeeper") || pos.includes("gk");
  const isDF = pos.includes("defender") || pos.includes("df") || pos.includes("back");
  const isMF = pos.includes("midfielder") || pos.includes("mf");

  if (isGK) {
    return [
      { label: "Reflexes", value: 80 + Math.round(Math.random() * 10) },
      { label: "Diving", value: 78 + Math.round(Math.random() * 10) },
      { label: "Handling", value: 75 + Math.round(Math.random() * 12) },
      { label: "Kicking", value: 68 + Math.round(Math.random() * 18) },
      { label: "Positioning", value: 78 + Math.round(Math.random() * 10) },
      { label: "Physical", value: 65 + Math.round(Math.random() * 15) }
    ];
  }

  let pace = 72 + Math.round(Math.random() * 18);
  let shooting = 52 + Math.round(Math.random() * 28);
  let passing = 68 + Math.round(Math.random() * 18);
  let dribbling = 68 + Math.round(Math.random() * 22);
  let defending = 42 + Math.round(Math.random() * 42);
  let physical = 68 + Math.round(Math.random() * 18);

  if (isDF) {
    defending = 80 + Math.round(Math.random() * 10);
    shooting = 38 + Math.round(Math.random() * 18);
    physical = 76 + Math.round(Math.random() * 12);
  } else if (isMF) {
    passing = 80 + Math.round(Math.random() * 12);
    dribbling = 76 + Math.round(Math.random() * 12);
    shooting = 62 + Math.round(Math.random() * 18);
    defending = 58 + Math.round(Math.random() * 18);
  } else {
    pace = 84 + Math.round(Math.random() * 11);
    shooting = 82 + Math.round(Math.random() * 12);
    dribbling = 82 + Math.round(Math.random() * 11);
    defending = 28 + Math.round(Math.random() * 18);
  }

  return [
    { label: "Pace", value: pace },
    { label: "Shooting", value: shooting },
    { label: "Passing", value: passing },
    { label: "Dribbling", value: dribbling },
    { label: "Defending", value: defending },
    { label: "Physical", value: physical }
  ];
}

function getDynamicHeatmap(position = "") {
  const pos = position.toLowerCase();
  const isGK = pos.includes("goalkeeper") || pos.includes("gk");
  const isDF = pos.includes("defender") || pos.includes("df") || pos.includes("back");
  const isMF = pos.includes("midfielder") || pos.includes("mf");

  if (isGK) {
    return [
      { x: 10, y: 50, val: 95 },
      { x: 12, y: 45, val: 80 },
      { x: 12, y: 55, val: 80 },
      { x: 8, y: 50, val: 90 }
    ];
  }
  if (isDF) {
    return [
      { x: 25, y: 50, val: 90 },
      { x: 28, y: 35, val: 75 },
      { x: 28, y: 65, val: 75 },
      { x: 20, y: 50, val: 85 },
      { x: 35, y: 50, val: 60 }
    ];
  }
  if (isMF) {
    return [
      { x: 50, y: 50, val: 95 },
      { x: 45, y: 35, val: 80 },
      { x: 45, y: 65, val: 80 },
      { x: 55, y: 40, val: 85 },
      { x: 55, y: 60, val: 85 },
      { x: 35, y: 50, val: 65 }
    ];
  }
  return [
    { x: 78, y: 50, val: 95 },
    { x: 82, y: 45, val: 88 },
    { x: 82, y: 55, val: 88 },
    { x: 72, y: 35, val: 70 },
    { x: 72, y: 65, val: 70 },
    { x: 88, y: 50, val: 85 }
  ];
}

// Background crawler to fetch all team squads and populate players
let crawlingSquads = false;

const crawlAllSquads = async () => {
  if (crawlingSquads) return;
  crawlingSquads = true;
  console.log("[Squad Crawler] Starting background squad crawl to populate player profiles...");

  try {
    // 1. Get all teams from database
    const { data: dbTeams, error } = await supabase.from('teams').select('*');
    if (error || !dbTeams) {
      console.error("[Squad Crawler] Error reading teams:", error?.message);
      crawlingSquads = false;
      return;
    }

    console.log(`[Squad Crawler] Found ${dbTeams.length} teams to check.`);

    for (let i = 0; i < dbTeams.length; i++) {
      const team = dbTeams[i];
      // Only process teams that have a numeric ID (original teams)
      if (isNaN(Number(team.id))) continue;

      // Check if we already have players with photos cached for this team in Supabase
      const { data: teamPlayers, error: countError } = await supabase
        .from('players')
        .select('id, photo')
        .ilike('team', team.name);

      const hasPhotos = !countError && teamPlayers && teamPlayers.filter(p => p.photo && !p.photo.includes("placeholder") && p.photo !== "⚽").length > 3;

      if (hasPhotos) {
        // Already has players with photos for this team, skip
        continue;
      }

      console.log(`[Squad Crawler] Fetching squad for team "${team.name}" (ID: ${team.id})...`);

      try {
        const response = await fetch(`${BASE_URL}/teams/${team.id}`, {
          headers: { "X-Auth-Token": API_KEY }
        });
        
        if (!response.ok) {
          console.warn(`[Squad Crawler] Failed to fetch squad for "${team.name}" (ID: ${team.id}): ${response.status}`);
          if (response.status === 429) {
            await new Promise(r => setTimeout(r, 6000));
            i--; // Retry this team
          }
          continue;
        }

        const data = await response.json();
        const squad = data.squad || [];

        if (squad.length > 0) {
          const dbPlayers = [];
          for (let k = 0; k < squad.length; k++) {
            const p = squad[k];
            const age = p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : 26;
            const pos = normalizePosition(p.position);
            const traits = getDynamicTraits(pos);
            const attributes = getDynamicAttributes(pos);
            const heatmap = getDynamicHeatmap(pos);

            let photo = null;
            let bio = null;
            let height = null;
            let weight = null;

            // Fetch photo details for ALL players in each team squad
            try {
              const searchUrl = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(p.name)}`;
              const responseSearch = await fetch(searchUrl);
              if (responseSearch.ok) {
                const dbData = await responseSearch.json();
                if (dbData.player && dbData.player.length > 0) {
                  const firstPlayer = dbData.player[0];
                  photo = firstPlayer.strCutout || firstPlayer.strThumb || null;
                  
                  if (firstPlayer.idPlayer) {
                    const lookupUrl = `https://www.thesportsdb.com/api/v1/json/3/lookupplayer.php?id=${firstPlayer.idPlayer}`;
                    const lookupResponse = await fetch(lookupUrl);
                    if (lookupResponse.ok) {
                      const lookupData = await lookupResponse.json();
                      if (lookupData.players && lookupData.players.length > 0) {
                        const fullPlayer = lookupData.players[0];
                        photo = fullPlayer.strCutout || fullPlayer.strThumb || photo;
                        bio = fullPlayer.strDescriptionEN || null;
                        height = fullPlayer.strHeight || null;
                        weight = fullPlayer.strWeight || null;
                      }
                    }
                  }
                }
              }
            } catch (err) {
              console.warn(`[Squad Crawler] Failed to fetch details for player "${p.name}":`, err.message);
            }
            // Wait 350ms between player lookups to avoid rate limiting
            await new Promise(r => setTimeout(r, 350));

            dbPlayers.push({
              id: String(p.id),
              name: p.name,
              team: team.name,
              position: pos,
              jersey: p.shirtNumber || null,
              age: age,
              club: data.name || null,
              traits: traits,
              stats: {
                goals: Math.floor(Math.random() * 3),
                assists: Math.floor(Math.random() * 2),
                games: Math.floor(Math.random() * 4) + 1,
                shotsPerGame: Number((1.2 + Math.random() * 2).toFixed(1)),
                passAccuracy: 70 + Math.floor(Math.random() * 25),
                rating: (6.5 + Math.random() * 1.8).toFixed(2)
              },
              attributes: attributes,
              heatmap: heatmap,
              photo,
              bio,
              height,
              weight
            });
          }

          const { error: upsertError } = await supabase.from('players').upsert(dbPlayers);
          if (upsertError) {
            console.error(`[Squad Crawler] Error saving players for "${team.name}":`, upsertError.message);
          } else {
            console.log(`[Squad Crawler] Saved ${squad.length} players for "${team.name}".`);
          }
        }
      } catch (err) {
        console.warn(`[Squad Crawler] Error processing team "${team.name}":`, err.message);
      }

      // Respect API rate limits (10 requests per minute = 1 request every 6 seconds)
      await new Promise(r => setTimeout(r, 6500));
    }
    console.log("[Squad Crawler] Background squad crawl finished!");
  } catch (err) {
    console.error("[Squad Crawler] Fatal error during crawl:", err.message);
  } finally {
    crawlingSquads = false;
  }
};

app.listen(PORT, () => {
  console.log(`PitchPulse Backend running on port ${PORT}`);
  // Start background crawl to populate players after a short delay
  setTimeout(crawlAllSquads, 5000);
});
