const { supabase } = require("../config/db");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access denied" });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(403).json({ error: "Invalid token" });
  }

  // Fetch the numeric ID and membership status from the public users table
  let { data: dbUser } = await supabase.from('users').select('id, role, membership_status').eq('email', user.email).single();

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
      membership_status: 'free'
    }).select('id, role, membership_status').maybeSingle();
    
    if (insertError) {
      console.error("Auto-create user failed:", insertError);
    }
    dbUser = newUser;
  }

  req.user = {
    id: dbUser ? dbUser.id : user.id,
    email: user.email,
    role: dbUser ? dbUser.role : (user.user_metadata?.role || "learner"),
    membership_status: dbUser ? dbUser.membership_status : "free"
  };
  next();
};

module.exports = { authenticateToken };
