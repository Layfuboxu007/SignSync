require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
  const { data: d2, error: e2 } = await supabase.from('users').select('first_name, last_name, name, fullname').limit(1);
  console.log("first_name column error:", e2);
}
check();
