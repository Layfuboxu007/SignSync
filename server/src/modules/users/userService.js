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

  // Check if user already exists
  const { data: existing } = await supabase.from("users").select("id").eq("email", userData.email).maybeSingle();
  if (existing) return true;

  const { error } = await supabase.from("users").insert({
    first_name: userData.firstName,
    last_name: userData.lastName,
    username: userData.username,
    role: safeRole,
    email: userData.email,
    password_hash: "supabase-auth",
    membership_status: "free",
    membership_expires_at: null
  });
  if (error) throw error;
  return true;
};

exports.getUserProfile = async (userId) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, username, email, role, membership_status, membership_expires_at, created_at")
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

/**
 * Toggle membership status for a user.
 * When upgrading to 'member', sets a 30-day expiry.
 * When downgrading to 'free', clears the expiry.
 */
exports.toggleMembership = async (userId, newStatus) => {
  const updatePayload = { membership_status: newStatus };

  if (newStatus === 'member') {
    // Set expiry to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    updatePayload.membership_expires_at = expiresAt.toISOString();
  } else {
    // Downgrade: clear expiry
    updatePayload.membership_expires_at = null;
  }

  const { data, error } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("id", userId)
    .select("id, first_name, last_name, username, email, role, membership_status, membership_expires_at, created_at")
    .single();
  if (error) throw error;
  return data;
};

/**
 * Record a transaction in the audit log.
 * Used for membership upgrades, downgrades, admin overrides, and auto-expiries.
 */
exports.recordTransaction = async (userId, amount, transactionType, reference) => {
  const { error } = await supabase.from("transactions").insert({
    user_id: userId,
    amount: amount,
    payment_status: 'completed',
    transaction_type: transactionType,
    reference: reference
  });
  if (error) {
    // Non-blocking: log but don't crash the request
    console.error("[Transaction Audit] Failed to record:", error.message);
  }
};
