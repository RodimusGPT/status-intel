const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL || "https://gzftisinrsssqmrgjsrw.supabase.co",
  process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6ZnRpc2lucnNzc3Ftcmdqc3J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MTU4MDEsImV4cCI6MjA4NDQ5MTgwMX0.hIcLdvyKTF8PfcIz9DDoRtO-l23UXUNMEdwXGWbh1fc"
);

async function main() {
  const { data: details } = await supabase
    .from("property_details")
    .select("property_id, elite_intelligence");

  const { data: scores } = await supabase
    .from("property_scores")
    .select("property_id, evs_score");

  const scoreMap = new Map();
  if (scores) {
    scores.forEach(s => scoreMap.set(s.property_id, s.evs_score));
  }

  const missing = [];
  for (const d of details || []) {
    const jsonScore = d.elite_intelligence?.evs_score;
    const tableScore = scoreMap.get(d.property_id);

    if (jsonScore != null && tableScore == null) {
      missing.push({
        property_id: d.property_id,
        evs_score: jsonScore,
        suite_upgrade_pct: d.elite_intelligence?.suite_upgrade_pct || null,
        room_upgrade_pct: d.elite_intelligence?.room_upgrade_pct || null
      });
    }
  }

  console.log("Properties with JSON score but missing property_scores:", missing.length);
  console.log(JSON.stringify(missing, null, 2));
}

main();
