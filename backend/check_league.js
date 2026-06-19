import dotenv from 'dotenv';

dotenv.config();

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

async function run() {
  if (!API_FOOTBALL_KEY) {
    console.error("API_FOOTBALL_KEY is missing");
    return;
  }
  try {
    console.log("Searching for league 'World Cup'...");
    const res = await fetch("https://v3.football.api-sports.io/leagues?name=World Cup", {
      headers: { "x-apisports-key": API_FOOTBALL_KEY }
    });
    const data = await res.json();
    console.log("Results count:", data.results);
    if (data.response) {
      data.response.forEach(item => {
        console.log(`League: ${item.league.name} (ID: ${item.league.id}), Type: ${item.league.type}`);
        // print seasons list size
        console.log(`  Seasons: ${item.seasons.map(s => s.year).join(", ")}`);
      });
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
}

run();
