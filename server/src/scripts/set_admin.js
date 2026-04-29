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

async function setUserAsAdmin(targetEmail) {
  console.log(`Looking for user with email: ${targetEmail}...`);

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', targetEmail)
    .single();

  if (fetchError) {
    console.error("Error fetching user:", fetchError.message);
    return;
  }

  if (!user) {
    console.log(`No user found with email: ${targetEmail}. Please register this user first through the app, then run this script again.`);
    return;
  }

  console.log(`Found user: ${user.email} (Current role: ${user.role})`);

  if (user.role === 'admin') {
    console.log("User is already an admin. No changes needed.");
    return;
  }

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

const email = process.argv[2] || 'jandieb@gmail.com';
setUserAsAdmin(email);
