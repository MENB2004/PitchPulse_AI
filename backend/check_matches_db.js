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

async function run() {
  const { data: matches, error } = await supabase.from('matches').select('id, homeTeam, awayTeam, homeFlag, awayFlag').limit(5);
  if (error) {
    console.error("Error:", error);
    return;
  }
  console.log("Sample matches flags in database:");
  console.log(JSON.stringify(matches, null, 2));
}

run();
