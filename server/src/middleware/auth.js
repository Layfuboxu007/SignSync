const { supabase } = require("../config/db");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access denied" });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(403).json({ error: "Invalid token" });
  }

  // Fetch the numeric ID, membership status, and expiry from the public users table
  let { data: dbUser } = await supabase.from('users').select('id, role, membership_status, membership_expires_at').eq('email', user.email).single();

  // If the user exists in Supabase Auth but not in our public users table,
  // auto-create the row so login doesn't break.
  if (!dbUser) {
    const meta = user.user_metadata || {};
    const { data: newUser, error: insertError } = await supabase.from('users').insert({
      first_name: meta.first_name || meta.firstName || '',
      last_name: meta.last_name || meta.lastName || '',
      username: meta.username || user.email.split('@')[0],
      role: meta.role || 'learner',
      email: user.email,
      password_hash: 'supabase-auth',
      membership_status: 'free',
      membership_expires_at: null
    }).select('id, role, membership_status, membership_expires_at').maybeSingle();
    
    if (insertError) {
      console.error("Auto-create user failed:", insertError);
    }
    dbUser = newUser;
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
