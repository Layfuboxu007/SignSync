const { supabase, supabaseAuth } = require("../config/db");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

  if (error || !user) {
    return res.status(403).json({ error: "Invalid token" });
  }

  // Lookup by auth_id first (canonical link), fall back to email for legacy rows.
  let { data: dbUser } = await supabase
    .from('users')
    .select('id, auth_id, role, membership_status, membership_expires_at')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (!dbUser) {
    const { data: emailMatch } = await supabase
      .from('users')
      .select('id, auth_id, role, membership_status, membership_expires_at')
      .eq('email', user.email)
      .maybeSingle();
    if (emailMatch) {
      // Backfill auth_id if a legacy row exists without one
      if (!emailMatch.auth_id) {
        await supabase.from('users').update({ auth_id: user.id }).eq('id', emailMatch.id);
        emailMatch.auth_id = user.id;
      }
      dbUser = emailMatch;
    }
  }

  // Auto-create user if not exists
  if (!dbUser) {
    const meta = user.user_metadata || {};
    const baseUsername = (meta.username || user.email.split('@')[0] || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, '')
      .slice(0, 24) || 'user';

    const buildUsername = (attempt) => {
      if (attempt === 0) return baseUsername;
      const suffix = `${Date.now().toString(36).slice(-3)}${Math.floor(Math.random() * 1000)}`;
      return `${baseUsername.slice(0, 24 - suffix.length - 1)}_${suffix}`;
    };

    for (let attempt = 0; attempt < 4 && !dbUser; attempt++) {
      const { data: newUser, error: insertError } = await supabase.from('users').insert({
        first_name: meta.first_name || meta.firstName || '',
        last_name: meta.last_name || meta.lastName || '',
        username: buildUsername(attempt),
        role: meta.role || 'learner',
        email: user.email,
        auth_id: user.id,
        password_hash: 'supabase-auth',
        membership_status: 'free'
      }).select('id, auth_id, role, membership_status, membership_expires_at').maybeSingle();

      if (newUser) {
        dbUser = newUser;
        break;
      }

      if (insertError && insertError.code === '23505') {
        // Unique violation — could be on auth_id/email (race) or on username.
        // Re-check whether the row now exists for this auth user before retrying.
        const { data: raceMatch } = await supabase
          .from('users')
          .select('id, auth_id, role, membership_status, membership_expires_at')
          .or(`auth_id.eq.${user.id},email.eq.${user.email}`)
          .maybeSingle();
        if (raceMatch) {
          if (!raceMatch.auth_id) {
            await supabase.from('users').update({ auth_id: user.id }).eq('id', raceMatch.id);
            raceMatch.auth_id = user.id;
          }
          dbUser = raceMatch;
          break;
        }
        // Otherwise it was a username collision — loop to try a new suffix.
        continue;
      }

      // Non-retryable error
      console.error('Auto-create user failed:', insertError);
      break;
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