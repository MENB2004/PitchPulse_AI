import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

const slugify = (value = "") => String(value)
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

const resolveCountryCode = (teamName, tla) => {
  return tlaToCountryCode[tla?.toUpperCase()] || countryCodesByName[slugify(teamName)] || null;
};

const getFlagImageUrl = (countryCode) => {
  if (!countryCode) return null;
  const base = countryCode.includes("-") ? countryCode.split("-")[0].toLowerCase() : countryCode.toLowerCase();
  if (base.length !== 2) return null;
  return `https://flagcdn.com/w160/${base}.png`;
};

const getCleanFlag = (teamName, tla) => {
  const countryCode = resolveCountryCode(teamName, tla);
  return getFlagImageUrl(countryCode) || null;
};

async function run() {
  console.log("Fetching matches from Supabase...");
  const { data: matches, error } = await supabase.from('matches').select('*');
  if (error) {
    console.error("DB error:", error);
    return;
  }
  console.log(`Found ${matches.length} matches in database.`);

  let updatedCount = 0;
  for (const match of matches) {
    let needsUpdate = false;
    let homeFlag = match.homeFlag;
    let awayFlag = match.awayFlag;

    // Check home flag
    if (!homeFlag || homeFlag.includes("crests.football-data.org")) {
      const homeTla = match.homeId && isNaN(Number(match.homeId)) ? match.homeId.slice(0, 3).toUpperCase() : null;
      const cleanUrl = getCleanFlag(match.homeTeam, homeTla);
      if (cleanUrl) {
        homeFlag = cleanUrl;
        needsUpdate = true;
      }
    }

    // Check away flag
    if (!awayFlag || awayFlag.includes("crests.football-data.org")) {
      const awayTla = match.awayId && isNaN(Number(match.awayId)) ? match.awayId.slice(0, 3).toUpperCase() : null;
      const cleanUrl = getCleanFlag(match.awayTeam, awayTla);
      if (cleanUrl) {
        awayFlag = cleanUrl;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      console.log(`Updating flags for Match ${match.id} (${match.homeTeam} vs ${match.awayTeam}):`);
      console.log(`  Home flag: ${match.homeFlag} -> ${homeFlag}`);
      console.log(`  Away flag: ${match.awayFlag} -> ${awayFlag}`);
      const { error: updateError } = await supabase
        .from('matches')
        .update({ homeFlag, awayFlag })
        .eq('id', match.id);
      
      if (updateError) {
        console.error("  Update failed:", updateError.message);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`Successfully migrated flags for ${updatedCount} matches.`);
}

run();
