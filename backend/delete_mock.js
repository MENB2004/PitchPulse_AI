import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const idsToDelete = ['live-1', 'live-2', 'live-3', 'completed-1', 'completed-2', 'completed-3', 'upcoming-1', 'upcoming-2', 'upcoming-3'];
  console.log("Deletable mock IDs:", idsToDelete);

  const res = await supabase.from('matches').delete().in('id', idsToDelete);
  console.log("Delete matches result:", JSON.stringify(res, null, 2));

  // Let's also fetch what is left in matches table
  const { data } = await supabase.from('matches').select('id, homeTeam, awayTeam');
  console.log("Current matches in database:", data);
}

run();
