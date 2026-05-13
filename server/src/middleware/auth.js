const { supabase, supabaseAuth } = require("../config/db");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

  if (error || !user) {
    return res.status(403).json({ error: "Invalid token" });
  }

  // FIXED: Also select auth_id so we can use it for updates
  let { data: dbUser } = await supabase
    .from('users')
    .select('id, auth_id, role, membership_status, membership_expires_at')
    .eq('email', user.email)
    .single();

  // Auto-create user if not exists
  if (!dbUser) {
    const meta = user.user_metadata || {};
    const { data: newUser, error: insertError } = await supabase.from('users').insert({
      first_name: meta.first_name || meta.firstName || '',
      last_name: meta.last_name || meta.lastName || '',
      username: meta.username || user.email.split('@')[0],
      role: meta.role || 'learner',
      email: user.email,
      auth_id: user.id,  // ← Store the Supabase UUID
      password_hash: 'supabase-auth',
      membership_status: 'free'
    }).select('id, auth_id, role, membership_status, membership_expires_at').maybeSingle();

    if (insertError) {
      console.error("Auto-create user failed:", insertError);
      const uniqueUsername = `${(meta.username || user.email.split('@')[0])}_${Date.now().toString(36).slice(-4)}`;
      const { data: retryUser } = await supabase.from('users').insert({
        first_name: meta.first_name || meta.firstName || '',
        last_name: meta.last_name || meta.lastName || '',
        username: uniqueUsername,
        role: meta.role || 'learner',
        email: user.email,
        auth_id: user.id,  // ← Store the Supabase UUID
        password_hash: 'supabase-auth',
        membership_status: 'free'
      }).select('id, auth_id, role, membership_status, membership_expires_at').maybeSingle();
      dbUser = retryUser;
    } else {
      dbUser = newUser;
    }
  }

  if (!dbUser) {
    console.error(`[Auth] No DB user found/created for email: ${user.email}`);
    return res.status(500).json({ error: "Account setup failed. Please try again." });
  }

  // FIXED: Use auth_id for updates
  if (
    dbUser.membership_status === 'member' &&
    dbUser.membership_expires_at &&
    new Date(dbUser.membership_expires_at) < new Date()
  ) {
    await supabase
      .from('users')
      .update({ membership_status: 'free', membership_expires_at: null })
      .eq('auth_id', user.id);  // ← FIXED: use UUID, not bigint

    dbUser.membership_status = 'free';
    dbUser.membership_expires_at = null;

    await supabase.from('transactions').insert({
      user_id: dbUser.id,  // Keep bigint for transactions if that's the column type
      amount: 0,
      payment_status: 'completed',
      transaction_type: 'auto_expiry',
      reference: `EXP-${Date.now()}`
    }).catch(() => { });
  }

  // FIXED: req.user.id is now the Supabase UUID
  req.user = {
    id: user.id,  // ← FIXED: Supabase UUID
    email: user.email,
    role: dbUser.role,
    membership_status: dbUser.membership_status,
    membership_expires_at: dbUser.membership_expires_at
  };
  next();
};

module.exports = { authenticateToken };