import { createClient } from '@supabase/supabase-js';
import { mockTeams } from './mockData.js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = "https://api.football-data.org/v4";

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing SUPABASE_URL or Key.");
  process.exit(1);
}

if (!API_KEY) {
  console.error("Error: Missing FOOTBALL_DATA_API_KEY in backend/.env.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helpers for flags
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

const countryCodesByName = {
  algeria: "DZ", argentina: "AR", australia: "AU", austria: "AT", belgium: "BE", brazil: "BR",
  canada: "CA", colombia: "CO", croatia: "HR", czechia: "CZ", czech_republic: "CZ",
  denmark: "DK", ecuador: "EC", egypt: "EG", england: "GB-ENG", france: "FR", germany: "DE",
  ghana: "GH", haiti: "HT", iran: "IR", iraq: "IQ", italy: "IT", japan: "JP", jordan: "JO",
  mexico: "MX", morocco: "MA", netherlands: "NL", new_zealand: "NZ", norway: "NO",
  panama: "PA", paraguay: "PY", poland: "PL", portugal: "PT", qatar: "QA", saudi_arabia: "SA",
  scotland: "GB-SCT", senegal: "SN", south_africa: "ZA", south_korea: "KR", spain: "ES",
  sweden: "SE", switzerland: "CH", tunisia: "TN", turkey: "TR", united_states: "US", usa: "US",
  uruguay: "UY", uzbekistan: "UZ", congo_dr: "CD", curacao: "CW"
};

const slugify = (value = "") => String(value)
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

const flagFromCountryCode = (code) => {
  if (!code || code.length < 2) return "⚽";
  const base = code.includes("-") ? code.split("-")[0] : code;
  return String.fromCodePoint(...[...base.toUpperCase()].map(char => 127397 + char.charCodeAt(0)));
};

const getFlagImageUrl = (countryCode) => {
  if (!countryCode) return null;
  const base = countryCode.includes("-") ? countryCode.split("-")[0].toLowerCase() : countryCode.toLowerCase();
  if (base.length !== 2) return null;
  return `https://flagcdn.com/w160/${base}.png`;
};

const getCleanFlag = (teamName, tla) => {
  const code = tlaToCountryCode[tla?.toUpperCase()] || countryCodesByName[slugify(teamName)] || null;
  return getFlagImageUrl(code) || flagFromCountryCode(code);
};

const teamScorers = {
  argentina: ["Lionel Messi", "Julián Álvarez", "Lautaro Martínez", "Angel Di María"],
  france: ["Kylian Mbappé", "Olivier Giroud", "Antoine Griezmann", "Ousmane Dembélé"],
  brazil: ["Neymar Jr", "Vinícius Júnior", "Rodrygo", "Richarlison"],
  england: ["Harry Kane", "Jude Bellingham", "Bukayo Saka", "Phil Foden"],
  portugal: ["Cristiano Ronaldo", "Bruno Fernandes", "Bernardo Silva", "Diogo Jota"],
  spain: ["Alvaro Morata", "Dani Olmo", "Ferran Torres", "Nico Williams"],
  germany: ["Kai Havertz", "Jamal Musiala", "Niclas Füllkrug", "Serge Gnabry"],
  netherlands: ["Memphis Depay", "Cody Gakpo", "Denzel Dumfries", "Wout Weghorst"]
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
    events.push({
      minute: Math.min(88, Math.max(5, Math.round(12 + (i * 22) + Math.random() * 8))),
      team: "home",
      player: getScorerName(homeTeam, i),
      type: "goal"
    });
  }
  for (let i = 0; i < awayScore; i++) {
    events.push({
      minute: Math.min(88, Math.max(5, Math.round(18 + (i * 22) + Math.random() * 8))),
      team: "away",
      player: getScorerName(awayTeam, i),
      type: "goal"
    });
  }
  events.sort((a, b) => a.minute - b.minute);
  let runningHome = 0, runningAway = 0;
  events.forEach(e => {
    if (e.type === "goal") {
      if (e.team === "home") runningHome++;
      else runningAway++;
      e.detail = `Goal (${runningHome}-${runningAway})`;
    }
  });
  return events;
};

// Normalization functions
const normalizeMatches = (apiMatches) => {
  return apiMatches.map(m => {
    let status = "UPCOMING";
    if (["IN_PLAY", "PAUSED"].includes(m.status)) status = "LIVE";
    else if (m.status === "FINISHED") status = "COMPLETED";

    const dateObj = new Date(m.utcDate);
    const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ", " + 
                    dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const homeScore = m.score?.fullTime?.home ?? m.score?.regularTime?.home ?? 0;
    const awayScore = m.score?.fullTime?.away ?? m.score?.regularTime?.away ?? 0;

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

    const rawHomeName = m.homeTeam?.name || m.homeTeam?.shortName || m.homeTeam?.tla;
    const rawAwayName = m.awayTeam?.name || m.awayTeam?.shortName || m.awayTeam?.tla;
    const homeName = rawHomeName || "TBD";
    const awayName = rawAwayName || "TBD";

    const homeId = m.homeTeam?.id ? String(m.homeTeam.id) : slugify(homeName);
    const awayId = m.awayTeam?.id ? String(m.awayTeam.id) : slugify(awayName);

    const homeFlag = getCleanFlag(homeName, m.homeTeam?.tla);
    const awayFlag = getCleanFlag(awayName, m.awayTeam?.tla);

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
      utcDate: m.utcDate ? new Date(m.utcDate).toISOString() : null,
      homeTeam: homeName,
      awayTeam: awayName,
      homeId,
      awayId,
      homeScore,
      awayScore,
      homeFlag,
      awayFlag,
      stats,
      timeline,
      predictProb,
      lineups: { home: [], away: [] }
    };
  });
};

const normalizePosition = (pos = "") => {
  const p = pos.toLowerCase();
  if (p.includes("keeper") || p.includes("gk")) return "Goalkeeper";
  if (p.includes("back") || p.includes("defender") || p.includes("df")) return "Defender";
  if (p.includes("midfield") || p.includes("mf")) return "Midfielder";
  return "Forward";
};

const getDynamicTraits = (pos) => {
  if (pos === "Goalkeeper") return ["Reflexes", "Penalty Saver", "GK Command"];
  if (pos === "Defender") return ["Tactical Tackler", "Aerial Threat", "Physical Strength"];
  if (pos === "Midfielder") return ["Playmaker", "Visionary Passer", "Midfield Controller"];
  return ["Clinical Finisher", "Speed Dribbler", "Attacking Threat"];
};

const getDynamicAttributes = (pos) => {
  let pace = 72 + Math.round(Math.random() * 18);
  let shooting = 52 + Math.round(Math.random() * 28);
  let passing = 68 + Math.round(Math.random() * 18);
  let dribbling = 68 + Math.round(Math.random() * 22);
  let defending = 42 + Math.round(Math.random() * 42);
  let physical = 68 + Math.round(Math.random() * 18);

  if (pos === "Defender") {
    defending = 80 + Math.round(Math.random() * 10);
    shooting = 38 + Math.round(Math.random() * 18);
    physical = 76 + Math.round(Math.random() * 12);
  } else if (pos === "Midfielder") {
    passing = 80 + Math.round(Math.random() * 12);
    dribbling = 76 + Math.round(Math.random() * 12);
    shooting = 62 + Math.round(Math.random() * 18);
    defending = 58 + Math.round(Math.random() * 18);
  } else if (pos === "Forward") {
    pace = 84 + Math.round(Math.random() * 11);
    shooting = 82 + Math.round(Math.random() * 12);
    dribbling = 82 + Math.round(Math.random() * 11);
    defending = 28 + Math.round(Math.random() * 18);
  } else if (pos === "Goalkeeper") {
    return [
      { label: "Reflexes", value: 80 + Math.round(Math.random() * 10) },
      { label: "Diving", value: 78 + Math.round(Math.random() * 10) },
      { label: "Handling", value: 75 + Math.round(Math.random() * 12) },
      { label: "Kicking", value: 68 + Math.round(Math.random() * 18) },
      { label: "Positioning", value: 78 + Math.round(Math.random() * 10) },
      { label: "Physical", value: 65 + Math.round(Math.random() * 15) }
    ];
  }

  return [
    { label: "Pace", value: pace },
    { label: "Shooting", value: shooting },
    { label: "Passing", value: passing },
    { label: "Dribbling", value: dribbling },
    { label: "Defending", value: defending },
    { label: "Physical", value: physical }
  ];
};

const getDynamicHeatmap = (pos) => {
  if (pos === "Goalkeeper") {
    return [
      { x: 10, y: 50, val: 95 },
      { x: 12, y: 45, val: 80 },
      { x: 12, y: 55, val: 80 },
      { x: 8, y: 50, val: 90 }
    ];
  }
  if (pos === "Defender") {
    return [
      { x: 25, y: 50, val: 90 },
      { x: 28, y: 35, val: 75 },
      { x: 28, y: 65, val: 75 },
      { x: 20, y: 50, val: 85 }
    ];
  }
  if (pos === "Midfielder") {
    return [
      { x: 50, y: 50, val: 95 },
      { x: 45, y: 35, val: 80 },
      { x: 45, y: 65, val: 80 },
      { x: 55, y: 40, val: 85 }
    ];
  }
  return [
    { x: 78, y: 50, val: 95 },
    { x: 82, y: 45, val: 88 },
    { x: 82, y: 55, val: 88 },
    { x: 72, y: 35, val: 70 }
  ];
};

// Seeding orchestrator
async function seedOriginalData() {
  console.log("🧹 Clearing old mock records from Supabase tables...");
  
  // Clean all existing records
  await supabase.from("matches").delete().neq("id", "0");
  await supabase.from("players").delete().neq("id", "0");
  await supabase.from("teams").delete().neq("id", "0");
  
  console.log("✅ Database tables cleared.");

  // 1. Fetch real WC matches
  console.log("📡 Fetching matches from football-data.org...");
  try {
    const res = await fetch(`${BASE_URL}/competitions/WC/matches`, {
      headers: { "X-Auth-Token": API_KEY }
    });
    if (!res.ok) throw new Error(`Matches status: ${res.status}`);
    const rawMatches = await res.json();
    
    if (rawMatches.matches && rawMatches.matches.length > 0) {
      const normalizedMatches = normalizeMatches(rawMatches.matches);
      const { error } = await supabase.from("matches").upsert(normalizedMatches);
      if (error) console.error("❌ Error seeding matches:", error.message);
      else console.log(`✅ Seeded ${normalizedMatches.length} original matches successfully.`);
    }
  } catch (err) {
    console.error("❌ Fatal error fetching matches:", err.message);
  }

  // 2. Fetch WC Standings / Teams
  console.log("📡 Fetching standings and teams from football-data.org...");
  let seededTeams = [];
  try {
    const res = await fetch(`${BASE_URL}/competitions/WC/standings`, {
      headers: { "X-Auth-Token": API_KEY }
    });
    if (!res.ok) throw new Error(`Standings status: ${res.status}`);
    const rawStandings = await res.json();
    
    if (rawStandings.standings && rawStandings.standings.length > 0) {
      const teams = [];
      rawStandings.standings.forEach(grp => {
        const letter = grp.group.replace("GROUP_", "").replace("Group ", "").trim();
        grp.table.forEach(row => {
          // Align stats with mockData if available, otherwise use defaults
          const mockData = mockTeams.find(t => t.name.toLowerCase() === row.team.name.toLowerCase()) || {
            fifaRanking: 30, attackPower: 75, defenseRating: 75, form: ["D"], h2h: {}
          };
          teams.push({
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
            fifaRanking: mockData.fifaRanking,
            attackPower: mockData.attackPower,
            defenseRating: mockData.defenseRating,
            form: mockData.form,
            h2h: mockData.h2h
          });
        });
      });
      
      const { error } = await supabase.from("teams").upsert(teams);
      if (error) console.error("❌ Error seeding teams:", error.message);
      else {
        console.log(`✅ Seeded ${teams.length} original teams successfully.`);
        seededTeams = teams;
      }
    }
  } catch (err) {
    console.error("❌ Fatal error fetching standings/teams:", err.message);
  }

  // 3. Fetch Squads / Players for each team
  if (seededTeams.length > 0) {
    console.log(`📡 Fetching squads for ${seededTeams.length} teams...`);
    console.log("⚠️ Respecting API rate limits: waiting 6.5s between squad requests.");
    
    for (let i = 0; i < seededTeams.length; i++) {
      const team = seededTeams[i];
      console.log(`[${i+1}/${seededTeams.length}] Fetching squad for ${team.name} (ID: ${team.id})...`);
      
      try {
        const res = await fetch(`${BASE_URL}/teams/${team.id}`, {
          headers: { "X-Auth-Token": API_KEY }
        });
        
        if (res.ok) {
          const teamDetails = await res.json();
          const squad = teamDetails.squad || [];
          
          if (squad.length > 0) {
            const dbPlayers = squad.map(p => {
              const age = p.dateOfBirth ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear() : 26;
              const pos = normalizePosition(p.position);
              return {
                id: String(p.id),
                name: p.name,
                team: team.name,
                position: pos,
                jersey: p.shirtNumber || null,
                age: age,
                club: teamDetails.name || null,
                traits: getDynamicTraits(pos),
                stats: {
                  goals: Math.floor(Math.random() * 3),
                  assists: Math.floor(Math.random() * 2),
                  games: Math.floor(Math.random() * 4) + 1,
                  shotsPerGame: Number((1.2 + Math.random() * 2).toFixed(1)),
                  passAccuracy: 70 + Math.floor(Math.random() * 25),
                  rating: (6.5 + Math.random() * 1.8).toFixed(2)
                },
                attributes: getDynamicAttributes(pos),
                heatmap: getDynamicHeatmap(pos),
                photo: null,
                bio: null,
                height: null,
                weight: null
              };
            });
            
            const { error } = await supabase.from("players").upsert(dbPlayers);
            if (error) console.error(`❌ Error saving squad for ${team.name}:`, error.message);
            else console.log(`   Saved ${dbPlayers.length} players for ${team.name}.`);
          }
        } else {
          console.error(`❌ Failed to fetch squad for ${team.name}: HTTP ${res.status}`);
          if (res.status === 429) {
            // Rate limit triggered, wait longer and retry
            console.log("   Rate limit hit. Waiting 15s before retrying...");
            await new Promise(r => setTimeout(r, 15000));
            i--; // Decrement index to retry
            continue;
          }
        }
      } catch (err) {
        console.error(`❌ Error fetching squad for ${team.name}:`, err.message);
      }
      
      // Delay to avoid hitting football-data.org 10 requests/min rate limits
      await new Promise(resolve => setTimeout(resolve, 6500));
    }
    console.log("🎉 Seeding original players list complete!");
  }
  
  console.log("🎉 Original data sync complete!");
}

seedOriginalData();
