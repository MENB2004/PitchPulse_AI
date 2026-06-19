import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTeams() {
  const { data, error } = await supabase.from('teams').select('id, name, group');
  if (error) {
    console.error("Error fetching teams:", error);
    return;
  }
  const numericTeams = data.filter(t => !isNaN(Number(t.id)));
  const mockTeams = data.filter(t => isNaN(Number(t.id)));
  
  console.log("Total teams in database:", data.length);
  console.log("Numeric IDs (Original teams) count:", numericTeams.length);
  console.log("Mock IDs (Mock teams) count:", mockTeams.length);
  
  console.log("Sample numeric teams:");
  console.log(numericTeams.slice(0, 5));
}

checkTeams();
