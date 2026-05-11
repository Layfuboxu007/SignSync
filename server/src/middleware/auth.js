const { supabase } = require("../config/db");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: "Access denied" });
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ error: "Invalid token" });
    }

    // Fetch the user from our public users table.
    let { data: dbUser } = await supabase
      .from('users')
      .select('id, role, membership_status, membership_expires_at')
      .eq('email', user.email)
      .maybeSingle();

    // If the user exists in Supabase Auth but not in our public users table,
    // auto-create the row so login doesn't break.
    if (!dbUser) {
      const meta = user.user_metadata || {};
      const baseUsername = meta.username || user.email.split('@')[0];

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          first_name: meta.first_name || meta.firstName || '',
          last_name: meta.last_name || meta.lastName || '',
          username: baseUsername,
          role: meta.role || 'learner',
          email: user.email,
          password_hash: 'supabase-auth',
          membership_status: 'free'
        })
        .select('id, role, membership_status, membership_expires_at')
        .maybeSingle();
      
      if (insertError) {
        // Could be a unique constraint on username or email.
        // First, try fetching again (maybe the user exists with this email but was missed).
        const { data: retryUser } = await supabase
          .from('users')
          .select('id, role, membership_status, membership_expires_at')
          .eq('email', user.email)
          .maybeSingle();
        
        if (retryUser) {
          dbUser = retryUser;
        } else {
          // User doesn't exist by email — insert failed due to USERNAME conflict.
          // Retry with a unique username suffix.
          const uniqueUsername = `${baseUsername}_${Date.now().toString(36).slice(-4)}`;
          const { data: retryNew } = await supabase
            .from('users')
            .insert({
              first_name: meta.first_name || meta.firstName || '',
              last_name: meta.last_name || meta.lastName || '',
              username: uniqueUsername,
              role: meta.role || 'learner',
              email: user.email,
              password_hash: 'supabase-auth',
              membership_status: 'free'
            })
            .select('id, role, membership_status, membership_expires_at')
            .maybeSingle();
          dbUser = retryNew;
        }
      } else {
        dbUser = newUser;
      }
    }

    // ── Auto-expiry enforcement ──────────────────────────────
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

        await supabase.from('transactions').insert({
          user_id: dbUser.id,
          amount: 0,
          payment_status: 'completed',
          transaction_type: 'auto_expiry',
          reference: `EXP-${Date.now()}`
        }).catch(() => {});
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
  } catch (err) {
    console.error("[Auth Middleware] Unhandled crash:", err);
    return res.status(500).json({ error: "Authentication failed" });
  }
};

module.exports = { authenticateToken };
