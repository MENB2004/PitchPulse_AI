import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

if (!supabaseUrl || !supabaseKey || !API_FOOTBALL_KEY) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Map of country names to their API-Football team IDs (to save search API requests)
const teamIdMap = {
  "Belgium": 1,
  "France": 2,
  "Croatia": 3,
  "Brazil": 6,
  "Uruguay": 7,
  "Spain": 9,
  "England": 10,
  "Japan": 12,
  "Senegal": 13,
  "Serbia": 14,
  "Switzerland": 15,
  "Mexico": 16,
  "South Korea": 17,
  "Australia": 20,
  "Denmark": 21,
  "Iran": 22,
  "Saudi Arabia": 23,
  "Poland": 24,
  "Germany": 25,
  "Argentina": 26,
  "Portugal": 27,
  "Tunisia": 28,
  "Costa Rica": 29,
  "Morocco": 31,
  "Wales": 767,
  "Netherlands": 1118,
  "Ghana": 1504,
  "Cameroon": 1530,
  "Qatar": 1569,
  "Ecuador": 2382,
  "USA": 2384,
  "United States": 2384,
  "Canada": 5529,
  "Colombia": 8,
  "Italy": 779,
  "Sweden": 783,
  "Paraguay": 18,
  "Egypt": 22,
  "South Africa": 797,
  "Turkey": 786,
  "Austria": 793,
  "Ivory Coast": 24,
  "Algeria": 28,
  "Norway": 782,
  "Scotland": 785,
  "Panama": 19,
  "Czechia": 788,
  "Bosnia-Herzegovina": 790,
  "Iraq": 1539,
  "Cape Verde Islands": 1514,
  "New Zealand": 2238,
  "Jordan": 1555,
  "Uzbekistan": 1558,
  "Congo DR": 1506,
  "Haiti": 1565,
  "Curaçao": 2379
};

function normalizeName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s]/g, "")     // remove special chars
    .replace(/\s+/g, " ")
    .trim();
}

function matchPlayer(dbName, dbPosition, apiPlayers) {
  const cleanDb = normalizeName(dbName);
  const dbWords = cleanDb.split(" ").filter(w => w.length > 1);
  
  // 1. Try exact match first
  let found = apiPlayers.find(p => normalizeName(p.name) === cleanDb);
  if (found) return found;

  // 2. Filter API players by position to reduce false positives
  const positionFiltered = apiPlayers.filter(p => {
    const apiPos = p.position?.toLowerCase() || "";
    const dbPos = dbPosition?.toLowerCase() || "";
    if (dbPos.includes("goalkeeper") || dbPos === "gk") return apiPos.includes("goalkeeper") || apiPos === "gk";
    if (dbPos.includes("defender") || dbPos === "df") return apiPos.includes("defender") || apiPos === "df" || apiPos.includes("back");
    if (dbPos.includes("midfielder") || dbPos === "mf") return apiPos.includes("midfielder") || apiPos === "mf";
    if (dbPos.includes("forward") || dbPos === "fw" || dbPos.includes("striker") || dbPos.includes("winger") || dbPos.includes("offence")) {
      return apiPos.includes("forward") || apiPos === "fw" || apiPos.includes("striker") || apiPos.includes("winger") || apiPos.includes("attacker");
    }
    return true;
  });

  // 3. Try matching by last name or important words
  for (const apiP of positionFiltered) {
    const cleanApi = normalizeName(apiP.name);
    const apiWords = cleanApi.split(" ").filter(w => w.length > 1);
    
    // Check if the last word of db name matches the last word of api name
    if (dbWords.length > 0 && apiWords.length > 0) {
      if (dbWords[dbWords.length - 1] === apiWords[apiWords.length - 1]) {
        return apiP;
      }
    }

    // Check if any word matches
    const common = dbWords.filter(w => apiWords.includes(w));
    if (common.length > 0) {
      return apiP;
    }
  }

  // 4. Fallback search on all players
  for (const apiP of apiPlayers) {
    const cleanApi = normalizeName(apiP.name);
    const apiWords = cleanApi.split(" ").filter(w => w.length > 1);
    const common = dbWords.filter(w => apiWords.includes(w));
    if (common.length > 0) {
      return apiP;
    }
  }

  return null;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  try {
    // 1. Fetch all players missing photos
    console.log("Fetching players missing photos from Supabase...");
    const { data: dbPlayers, error } = await supabase
      .from('players')
      .select('id, name, team, position, photo');
    
    if (error) {
      console.error("Supabase select error:", error);
      return;
    }

    const missingPlayers = dbPlayers.filter(p => !p.photo || p.photo.trim() === "" || p.photo.includes("placeholder") || p.photo === "⚽");
    console.log(`Found ${missingPlayers.length} total players missing photos out of ${dbPlayers.length}.`);

    // Group missing players by team
    const playersByTeam = {};
    missingPlayers.forEach(p => {
      if (!playersByTeam[p.team]) playersByTeam[p.team] = [];
      playersByTeam[p.team].push(p);
    });

    const teamsToEnrich = Object.keys(playersByTeam);
    console.log(`Teams to enrich: ${teamsToEnrich.length} teams.`);

    for (let i = 0; i < teamsToEnrich.length; i++) {
      const teamName = teamsToEnrich[i];
      const teamPlayers = playersByTeam[teamName];
      console.log(`\n--------------------------------------------`);
      console.log(`Processing team [${i+1}/${teamsToEnrich.length}]: "${teamName}" (${teamPlayers.length} players missing photos)...`);

      let teamId = teamIdMap[teamName];
      
      // If team ID not mapped, query API-Football
      if (!teamId) {
        console.log(`Team ID not pre-mapped for "${teamName}". Querying search...`);
        try {
          const searchUrl = `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(teamName)}`;
          const searchRes = await fetch(searchUrl, {
            headers: { "x-apisports-key": API_FOOTBALL_KEY }
          });
          
          if (searchRes.status === 429) {
            console.log("Hit rate limit on search. Sleeping 15s before retry...");
            await sleep(15000);
            i--; // retry
            continue;
          }

          const searchData = await searchRes.json();
          if (searchData.errors && (searchData.errors.rateLimit || searchData.errors.plan)) {
            console.log("API returned rateLimit/plan error on search:", searchData.errors);
            console.log("Sleeping 15s before retry...");
            await sleep(15000);
            i--; // retry
            continue;
          }

          if (searchData.response && searchData.response.length > 0) {
            // Find national team
            const foundTeam = searchData.response.find(t => t.team.national === true) || searchData.response[0];
            teamId = foundTeam.team.id;
            console.log(`Found ID for "${teamName}" via search: ${teamId}`);
          }
        } catch (err) {
          console.error(`Failed to search ID for "${teamName}":`, err.message);
        }
        await sleep(6500); // sleep after search request
      }

      if (!teamId) {
        console.warn(`Could not determine API-Football team ID for "${teamName}". Skipping.`);
        continue;
      }

      // Fetch squad list from API-Football
      console.log(`Fetching squad for team "${teamName}" (ID: ${teamId})...`);
      let squadData = null;
      try {
        const squadRes = await fetch(`https://v3.football.api-sports.io/players/squads?team=${teamId}`, {
          headers: { "x-apisports-key": API_FOOTBALL_KEY }
        });
        
        if (squadRes.status === 429) {
          console.log("Hit rate limit (429) on squad fetch. Sleeping 15s before retry...");
          await sleep(15000);
          i--; // retry
          continue;
        }

        squadData = await squadRes.json();
        if (squadData.errors && (squadData.errors.rateLimit || squadData.errors.plan)) {
          console.log("API returned rateLimit/plan error on squad fetch:", squadData.errors);
          console.log("Sleeping 15s before retry...");
          await sleep(15000);
          i--; // retry
          continue;
        }
      } catch (err) {
        console.error(`Failed to fetch squad for "${teamName}":`, err.message);
        continue;
      }

      if (!squadData.response || squadData.response.length === 0) {
        console.warn(`No squad response from API-Football for "${teamName}".`);
        await sleep(6500);
        continue;
      }

      const apiPlayers = squadData.response[0].players;
      console.log(`Found ${apiPlayers.length} players in API squad.`);

      // Match and update
      let matchedCount = 0;
      const updates = [];

      for (const dbP of teamPlayers) {
        const match = matchPlayer(dbP.name, dbP.position, apiPlayers);
        if (match) {
          matchedCount++;
          updates.push({
            id: dbP.id,
            photo: match.photo
          });
        }
      }

      console.log(`Matched ${matchedCount}/${teamPlayers.length} players.`);

      if (updates.length > 0) {
        console.log(`Updating ${updates.length} player photos in database...`);
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('players')
            .update({ photo: update.photo })
            .eq('id', update.id);
          
          if (updateError) {
            console.error(`Error updating player ID ${update.id}:`, updateError.message);
          }
        }
        console.log(`Updates completed for "${teamName}".`);
      }

      // Sleep for 6.5 seconds to comply with rate limits (10 requests per minute)
      console.log("Sleeping 6.5s...");
      await sleep(6500);
    }

    console.log("\nEnrichment process completed!");
  } catch (err) {
    console.error("Fatal error:", err.message);
  }
}

run();
