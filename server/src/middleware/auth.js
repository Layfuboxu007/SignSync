const { supabase } = require("../config/db");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access denied" });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(403).json({ error: "Invalid token" });
  }

  // Fetch the numeric ID, membership status, and expiry from the public users table.
  // Try with membership_expires_at first; fall back without it if the column doesn't exist yet.
  let dbUser = null;
  let { data: fullUser, error: selectError } = await supabase
    .from('users')
    .select('id, role, membership_status, membership_expires_at')
    .eq('email', user.email)
    .single();

  if (selectError && selectError.message && selectError.message.includes('membership_expires_at')) {
    // Column doesn't exist yet — fall back to the base columns
    const { data: baseUser } = await supabase
      .from('users')
      .select('id, role, membership_status')
      .eq('email', user.email)
      .single();
    dbUser = baseUser ? { ...baseUser, membership_expires_at: null } : null;
  } else {
    dbUser = fullUser;
  }

  // If the user exists in Supabase Auth but not in our public users table,
  // auto-create the row so login doesn't break.
  if (!dbUser) {
    const meta = user.user_metadata || {};
    const insertPayload = {
      first_name: meta.first_name || meta.firstName || '',
      last_name: meta.last_name || meta.lastName || '',
      username: meta.username || user.email.split('@')[0],
      role: meta.role || 'learner',
      email: user.email,
      password_hash: 'supabase-auth',
      membership_status: 'free'
    };

    // Only include membership_expires_at if the column exists
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert(insertPayload)
      .select('id, role, membership_status')
      .maybeSingle();
    
    if (insertError) {
      console.error("Auto-create user failed:", insertError);
      // Last-resort: try to fetch with base columns in case it was a column issue on insert
      const { data: retryUser } = await supabase
        .from('users')
        .select('id, role, membership_status')
        .eq('email', user.email)
        .single();
      dbUser = retryUser ? { ...retryUser, membership_expires_at: null } : null;
    } else {
      dbUser = newUser ? { ...newUser, membership_expires_at: null } : null;
    }
  }

  // ── Auto-expiry enforcement ──────────────────────────────
  // If the user is marked as 'member' but their membership has expired,
  // auto-downgrade to 'free' on the fly so downstream middleware
  // (verifyEnrollment, courseService) sees the correct status.
  if (
    dbUser &&
    dbUser.membership_status === 'member' &&
    dbUser.membership_expires_at &&
    new Date(dbUser.membership_expires_at) < new Date()
  ) {
    const { error: downgradeError } = await supabase
      .from('users')
      .update({ membership_status: 'free', membership_expires_at: null })
      .eq('id', dbUser.id);

    if (!downgradeError) {
      dbUser.membership_status = 'free';
      dbUser.membership_expires_at = null;

      // Record the auto-expiry as a transaction for audit trail
      await supabase.from('transactions').insert({
        user_id: dbUser.id,
        amount: 0,
        payment_status: 'completed',
        transaction_type: 'auto_expiry',
        reference: `EXP-${Date.now()}`
      }).catch(() => {}); // Non-blocking audit log
    }
  }

  req.user = {
    id: dbUser ? dbUser.id : user.id,
    email: user.email,
    role: dbUser ? dbUser.role : (user.user_metadata?.role || "learner"),
    membership_status: dbUser ? dbUser.membership_status : "free",
    membership_expires_at: dbUser ? dbUser.membership_expires_at : null
  };
  next();
};

module.exports = { authenticateToken };
