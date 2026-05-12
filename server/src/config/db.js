const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Primary client — used for DB queries (service role, bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// Separate client for auth verification ONLY.
// This prevents supabase.auth.getUser(token) from polluting
// the primary client's auth state, which would cause subsequent
// DB queries to run under the user's JWT (subject to RLS)
// instead of the service role key.
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = { supabase, supabaseAuth };
