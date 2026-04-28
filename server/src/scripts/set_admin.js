require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setFirstUserAsAdmin() {
  console.log("Looking for users to promote to admin...");
  
  // Get the first user
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('id, email, role')
    .limit(1);

  if (fetchError) {
    console.error("Error fetching users:", fetchError.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log("No users found in the public.users table. Please register a user first through the app, then run this script again.");
    return;
  }

  const user = users[0];
  console.log(`Found user: ${user.email} (Current role: ${user.role})`);

  const { data, error: updateError } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('id', user.id)
    .select();

  if (updateError) {
    console.error("Error updating user role:", updateError.message);
  } else {
    console.log(`Successfully promoted ${user.email} to ADMIN.`);
  }
}

setFirstUserAsAdmin();
