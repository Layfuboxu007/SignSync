const { supabase } = require("../../config/db");

exports.testDbConnection = async () => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw error;
  return data;
};

exports.lookupEmail = async (username) => {
  const { data, error } = await supabase.from("users").select("email").eq("username", username).single();
  if (error || !data) throw new Error("Username not found");
  return data.email;
};

const ALLOWED_REGISTRATION_ROLES = ["learner", "instructor"];

exports.syncUser = async (userData) => {
  // CRITICAL: Never allow self-assignment to admin/privileged roles via registration
  const safeRole = ALLOWED_REGISTRATION_ROLES.includes(userData.role)
    ? userData.role
    : "learner";

  const { error } = await supabase.from("users").insert({
    first_name: userData.firstName,
    last_name: userData.lastName,
    username: userData.username,
    role: safeRole,
    email: userData.email,
    password_hash: "supabase-auth",
    membership_status: "free"
  });
  if (error) throw error;
  return true;
};

exports.getUserProfile = async (userId) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, username, email, role, membership_status, created_at")
    .eq("id", userId)
    .single();
  if (error || !user) throw new Error("User not found");
  return user;
};

exports.deleteUser = async (userId) => {
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw error;
  return true;
};

exports.toggleMembership = async (userId, newStatus) => {
  const { data, error } = await supabase
    .from("users")
    .update({ membership_status: newStatus })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};
