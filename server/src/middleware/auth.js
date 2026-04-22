const { supabase } = require("../config/db");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access denied" });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(403).json({ error: "Invalid token" });
  }

  // Fetch the numeric ID from the public users table so relations like 'instructor_id' do not break
  const { data: dbUser } = await supabase.from('users').select('id, role').eq('email', user.email).single();

  req.user = {
    id: dbUser ? dbUser.id : user.id,
    email: user.email,
    role: dbUser ? dbUser.role : (user.user_metadata?.role || "learner")
  };
  next();
};

module.exports = { authenticateToken };
