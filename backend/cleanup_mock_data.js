import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log("🧹 Fetching all matches, teams, and players to identify mock data...");

  // 1. Clean matches
  const { data: matches } = await supabase.from('matches').select('id');
  const mockMatchIds = (matches || []).filter(m => isNaN(Number(m.id))).map(m => m.id);
  if (mockMatchIds.length > 0) {
    console.log(`Deleting ${mockMatchIds.length} mock matches...`);
    const { error } = await supabase.from('matches').delete().in('id', mockMatchIds);
    if (error) console.error("Error deleting mock matches:", error.message);
  }

  // 2. Clean teams
  const { data: teams } = await supabase.from('teams').select('id');
  const mockTeamIds = (teams || []).filter(t => isNaN(Number(t.id))).map(t => t.id);
  if (mockTeamIds.length > 0) {
    console.log(`Deleting ${mockTeamIds.length} mock teams...`);
    const { error } = await supabase.from('teams').delete().in('id', mockTeamIds);
    if (error) console.error("Error deleting mock teams:", error.message);
  }

  // 3. Clean players
  const { data: players } = await supabase.from('players').select('id');
  const mockPlayerIds = (players || []).filter(p => isNaN(Number(p.id))).map(p => p.id);
  if (mockPlayerIds.length > 0) {
    console.log(`Deleting ${mockPlayerIds.length} mock players...`);
    const { error } = await supabase.from('players').delete().in('id', mockPlayerIds);
    if (error) console.error("Error deleting mock players:", error.message);
  }

  console.log("🎉 Database mock data cleanup complete!");
}

cleanup();
