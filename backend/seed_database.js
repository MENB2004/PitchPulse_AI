import { createClient } from '@supabase/supabase-js';
import { mockTeams, mockPlayers, mockMatches } from './mockData.js';
import dotenv from 'dotenv';

dotenv.config();

// Try to read credentials from .env or .env.local
const supabaseUrl = process.env.SUPABASE_URL;
// Use service_role key to bypass Row Level Security (RLS) policies for seeding
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.");
  console.error("Please ensure you have configured them in your backend/.env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🚀 Starting database seed...");

  // 1. Seed Teams
  console.log("Seeding teams...");
  const { error: teamError } = await supabase.from('teams').upsert(mockTeams);
  if (teamError) {
    console.error("❌ Error seeding teams:", teamError.message);
  } else {
    console.log("✅ Teams seeded successfully.");
  }

  // 2. Seed Players
  console.log("Seeding players...");
  const { error: playerError } = await supabase.from('players').upsert(mockPlayers);
  if (playerError) {
    console.error("❌ Error seeding players:", playerError.message);
  } else {
    console.log("✅ Players seeded successfully.");
  }

  // 3. Seed Matches
  console.log("Seeding matches...");
  const formattedMatches = mockMatches.map(m => ({
    ...m,
    utcDate: m.utcDate ? new Date(m.utcDate).toISOString() : null
  }));
  const { error: matchError } = await supabase.from('matches').upsert(formattedMatches);
  if (matchError) {
    console.error("❌ Error seeding matches:", matchError.message);
  } else {
    console.log("✅ Matches seeded successfully.");
  }

  console.log("🎉 Seeding complete!");
}

seed();
