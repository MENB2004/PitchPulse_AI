import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { mockMatches, mockTeams, mockPlayers } from "./mockData.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

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
  argentina: "AR",
  australia: "AU",
  austria: "AT",
  belgium: "BE",
  bosnia_herzegovina: "BA",
  brazil: "BR",
  canada: "CA",
  cape_verde_islands: "CV",
  colombia: "CO",
  congo_dr: "CD",
  croatia: "HR",
  curacao: "CW",
  czechia: "CZ",
  ecuador: "EC",
  egypt: "EG",
  england: "GB",
  france: "FR",
  germany: "DE",
  ghana: "GH",
  haiti: "HT",
  iran: "IR",
  iraq: "IQ",
  ivory_coast: "CI",
  japan: "JP",
  jordan: "JO",
  mexico: "MX",
  morocco: "MA",
  netherlands: "NL",
  new_zealand: "NZ",
  norway: "NO",
  panama: "PA",
  paraguay: "PY",
  portugal: "PT",
  qatar: "QA",
  saudi_arabia: "SA",
  scotland: "GB",
  senegal: "SN",
  south_africa: "ZA",
  south_korea: "KR",
  spain: "ES",
  sweden: "SE",
  switzerland: "CH",
  tunisia: "TN",
  turkey: "TR",
  united_states: "US",
  uruguay: "UY",
  uzbekistan: "UZ"
};

const tlaToCountryCode = {
  ARG: "AR", AUS: "AU", AUT: "AT", BEL: "BE", BIH: "BA", BRA: "BR",
  CAN: "CA", CIV: "CI", COD: "CD", COL: "CO", CPV: "CV", CRO: "HR",
  CZE: "CZ", CUW: "CW", ECU: "EC", EGY: "EG", ENG: "GB", FRA: "FR",
  GER: "DE", GHA: "GH", HAI: "HT", IRN: "IR", IRQ: "IQ", JOR: "JO",
  JPN: "JP", KOR: "KR", KSA: "SA", MAR: "MA", MEX: "MX", NED: "NL",
  NOR: "NO", NZL: "NZ", PAN: "PA", PAR: "PY", POR: "PT", QAT: "QA",
  RSA: "ZA", SCO: "GB", SEN: "SN", ESP: "ES", SUI: "CH", SWE: "SE",
  TUN: "TN", TUR: "TR", URY: "UY", USA: "US", UZB: "UZ"
};



const flagFromCountryCode = (code) => {
  if (!code || code.length !== 2) return "\u26BD";
  return String.fromCodePoint(...[...code.toUpperCase()].map(char => 127397 + char.charCodeAt(0)));
};

const getCleanFlag = (teamName, tla) => {
  const countryCode = tlaToCountryCode[tla?.toUpperCase()] || countryCodesByName[slugify(teamName)];
  return flagFromCountryCode(countryCode);
};

const sortMatchesByDate = (matches) => [...matches].sort((a, b) => new Date(a.utcDate || 0) - new Date(b.utcDate || 0));

const getTeamByName = (teamName) => mockTeams.find(team => slugify(team.name) === slugify(teamName));

const buildTeamMeta = (teamName, tla, crest) => {
  const localTeam = getTeamByName(teamName);
  return {
    id: localTeam?.id || slugify(teamName || tla || "tbd"),
    name: teamName || localTeam?.name || "TBD",
    flag: getCleanFlag(teamName || localTeam?.name, tla),
    crest: crest || null,
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

    const homeMeta = buildTeamMeta(homeName, m.homeTeam?.tla, m.homeTeam?.crest);
    const awayMeta = buildTeamMeta(awayName, m.awayTeam?.tla, m.awayTeam?.crest);
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
        id: row.team.tla?.toLowerCase() || row.team.name.toLowerCase(),
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
      return normalizeMatches(raw.matches);
    }
  } catch (err) {
    console.warn("External matches fetch failed, using local mock data. Reason:", err.message);
  }
  
  // Inject relative, dynamic timestamps for mockMatches to center them in a 48h window relative to server time
  const now = new Date();
  let completedCount = 0;
  let liveCount = 0;
  let upcomingCount = 0;

  const normalized = mockMatches.map((m) => {
    let dateObj;
    if (m.status === "COMPLETED") {
      const hoursAgo = completedCount === 0 ? 10 : 18;
      dateObj = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      completedCount++;
    } else if (m.status === "LIVE") {
      const hoursAgo = liveCount === 0 ? 1.5 : 0.5;
      dateObj = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      liveCount++;
    } else {
      const hoursAhead = upcomingCount === 0 ? 6 : 16;
      dateObj = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
      upcomingCount++;
    }

    const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ", " + 
                    dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const homeMeta = buildTeamMeta(m.homeTeam, null, m.home?.crest);
    const awayMeta = buildTeamMeta(m.awayTeam, null, m.away?.crest);

    return {
      ...m,
      source: "local-fallback",
      home: homeMeta,
      away: awayMeta,
      homeId: homeMeta.id,
      awayId: awayMeta.id,
      homeFlag: homeMeta.flag,
      awayFlag: awayMeta.flag,
      utcDate: dateObj.toISOString(),
      date: dateStr
    };
  });

  return sortMatchesByDate(normalized);
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

// Filter matches by team
app.get("/api/matches/by-team/:teamId", async (req, res) => {
  const teamId = req.params.teamId.toLowerCase();
  const list = await getNormalizedMatches();
  const filtered = sortMatchesByDate(list.filter(m => m.homeId === teamId || m.awayId === teamId));
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
      return res.json(standings);
    }
  } catch (err) {
    console.warn("External standings fetch failed, using local mock data. Reason:", err.message);
  }

  // Fallback to local standings
  const standings = {};
  mockTeams.forEach(team => {
    if (!standings[team.group]) standings[team.group] = [];
    standings[team.group].push(team);
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
    const result = squad.map(p => ({
      id: String(p.id),
      name: p.name,
      position: p.position || "Player",
      dateOfBirth: p.dateOfBirth,
      nationality: p.nationality
    }));

    squadCache[teamId] = { data: result, timestamp: now };
    res.json(result);
  } catch (err) {
    console.warn(`Squad fetch failed for team ${teamId}, using mock players. Reason:`, err.message);
    const team = mockTeams.find(t => t.id === teamId || String(t.fifaRanking) === teamId || t.name.toLowerCase() === teamId.toLowerCase());
    const teamName = team ? team.name : "";
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

// Search player details, photo and stats using TheSportsDB and API-Football
app.get("/api/players/details", async (req, res) => {
  const playerName = req.query.name;
  if (!playerName) return res.status(400).json({ error: "name parameter is required" });

  const now = Date.now();
  const cacheKey = playerName.trim().toLowerCase();

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
      const apiFootballUrl = `https://v3.football.api-sports.io/players?search=${encodeURIComponent(playerName)}`;
      const response = await fetch(apiFootballUrl, {
        headers: {
          "x-apisports-key": API_FOOTBALL_KEY
        }
      });
      if (response.ok) {
        const statsData = await response.json();
        if (statsData.response && statsData.response.length > 0) {
          const item = statsData.response[0];
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

  playerDetailsCache[cacheKey] = { data: result, timestamp: now };
  res.json(result);
});

// Teams List
app.get("/api/teams", (req, res) => {
  res.json(mockTeams);
});

// Players List
app.get("/api/players", (req, res) => {
  res.json(mockPlayers);
});

// Player by ID
app.get("/api/players/:id", (req, res) => {
  const player = mockPlayers.find(p => p.id === req.params.id);
  if (!player) return res.status(404).json({ error: "Player not found" });
  res.json(player);
});

// Local Heuristic Prediction fallback logic
const runLocalPrediction = (teamA, teamB, options = {}) => {
  const { formationA, mentalityA, formationB, mentalityB } = options;

  const tA = mockTeams.find(t => t.id === teamA.toLowerCase() || t.name.toLowerCase() === teamA.toLowerCase()) || {
    name: teamA, fifaRanking: 30, attackPower: 75, defenseRating: 75, form: ["D"]
  };
  const tB = mockTeams.find(t => t.id === teamB.toLowerCase() || t.name.toLowerCase() === teamB.toLowerCase()) || {
    name: teamB, fifaRanking: 30, attackPower: 75, defenseRating: 75, form: ["D"]
  };

  let attackA = tA.attackPower;
  let defenseA = tA.defenseRating;
  let attackB = tB.attackPower;
  let defenseB = tB.defenseRating;

  if (mentalityA === "attacking") { attackA *= 1.15; defenseA *= 0.88; }
  else if (mentalityA === "defensive") { defenseA *= 1.15; attackA *= 0.88; }

  if (mentalityB === "attacking") { attackB *= 1.15; defenseB *= 0.88; }
  else if (mentalityB === "defensive") { defenseB *= 1.15; attackB *= 0.88; }

  const getFormationModifier = (f) => {
    if (["5-4-1", "4-5-1", "5-3-2"].includes(f)) return { att: 0.92, def: 1.12 };
    if (["4-3-3", "3-4-3", "4-2-4"].includes(f)) return { att: 1.10, def: 0.94 };
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

  const rankStrengthA = Math.max(1, 100 - tA.fifaRanking);
  const rankStrengthB = Math.max(1, 100 - tB.fifaRanking);

  const getFormScore = (formArray) => {
    return formArray.reduce((acc, val) => {
      if (val === "W") return acc + 3;
      if (val === "D") return acc + 1;
      return acc;
    }, 0) / (formArray.length * 3) * 100;
  };

  const formA = getFormScore(tA.form);
  const formB = getFormScore(tB.form);

  const scoreA = (0.35 * rankStrengthA) + (0.25 * formA) + (0.20 * attackA) + (0.20 * defenseA);
  const scoreB = (0.35 * rankStrengthB) + (0.25 * formB) + (0.20 * attackB) + (0.20 * defenseB);

  const total = scoreA + scoreB;
  const rawWinA = scoreA / total;
  const rawWinB = scoreB / total;

  const drawProb = 0.22;
  const winA = Math.round(rawWinA * (1 - drawProb) * 100);
  const winB = Math.round(rawWinB * (1 - drawProb) * 100);
  const draw = 100 - winA - winB;

  return {
    teamA: tA.name,
    teamB: tB.name,
    prediction: {
      winA,
      draw,
      winB,
      winner: winA > winB ? tA.name : (winB > winA ? tB.name : "Draw"),
      confidence: Math.max(winA, winB),
      source: "Local Heuristic Fallback"
    }
  };
};

// Prediction Endpoint
app.post("/api/predict/match", async (req, res) => {
  const { teamA, teamB, formationA, mentalityA, formationB, mentalityB } = req.body;
  if (!teamA || !teamB) {
    return res.status(400).json({ error: "teamA and teamB are required in the request body" });
  }

  const payload = { teamA, teamB, formationA, mentalityA, formationB, mentalityB };

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

app.listen(PORT, () => {
  console.log(`PitchPulse Backend running on port ${PORT}`);
});
