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

// Column set for profile queries — uses star to avoid hard-coding column names
// that may not exist in all environments (e.g. membership_expires_at before migration).
const PROFILE_COLUMNS = "id, first_name, last_name, username, email, role, membership_status, created_at";

/**
 * Safely select profile columns, including membership_expires_at if it exists.
 * Falls back to base columns if the new column hasn't been migrated yet.
 */
const selectProfile = async (query) => {
  // Try with the full column set first
  const { data, error } = await query.select(`${PROFILE_COLUMNS}, membership_expires_at`).single();
  if (error && error.message && error.message.includes('membership_expires_at')) {
    // Column doesn't exist yet — retry without it
    const { data: fallback, error: fallbackErr } = await query.select(PROFILE_COLUMNS).single();
    if (fallbackErr) throw fallbackErr;
    return { ...fallback, membership_expires_at: null };
  }
  if (error) throw error;
  return data;
};

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
    membership_status: "free"
  });
  if (error) throw error;
  return true;
};

exports.getUserProfile = async (userId) => {
  // Try full column set, fall back if membership_expires_at doesn't exist
  const { data: user, error } = await supabase
    .from("users")
    .select(`${PROFILE_COLUMNS}, membership_expires_at`)
    .eq("id", userId)
    .single();

  if (error && error.message && error.message.includes('membership_expires_at')) {
    const { data: fallback, error: fallbackErr } = await supabase
      .from("users")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .single();
    if (fallbackErr || !fallback) throw new Error("User not found");
    return { ...fallback, membership_expires_at: null };
  }
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
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    updatePayload.membership_expires_at = expiresAt.toISOString();
  } else {
    updatePayload.membership_expires_at = null;
  }

  // Try update with expires_at first
  let { data, error } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("id", userId)
    .select(`${PROFILE_COLUMNS}, membership_expires_at`)
    .single();

  // If membership_expires_at column doesn't exist yet, retry without it
  if (error && error.message && error.message.includes('membership_expires_at')) {
    const { data: fallback, error: fallbackErr } = await supabase
      .from("users")
      .update({ membership_status: newStatus })
      .eq("id", userId)
      .select(PROFILE_COLUMNS)
      .single();
    if (fallbackErr) throw fallbackErr;
    return { ...fallback, membership_expires_at: null };
  }

  if (error) throw error;
  return data;
};

/**
 * Record a transaction in the audit log.
 * Used for membership upgrades, downgrades, admin overrides, and auto-expiries.
 */
exports.recordTransaction = async (userId, amount, transactionType, reference) => {
  // Try with the full audit columns first
  let { error } = await supabase.from("transactions").insert({
    user_id: userId,
    amount: amount,
    payment_status: 'completed',
    transaction_type: transactionType,
    reference: reference
  });

  // If audit columns don't exist, insert with base columns only
  if (error && (error.message?.includes('transaction_type') || error.message?.includes('reference'))) {
    const { error: fallbackErr } = await supabase.from("transactions").insert({
      user_id: userId,
      amount: amount,
      payment_status: 'completed'
    });
    if (fallbackErr) {
      console.error("[Transaction Audit] Fallback also failed:", fallbackErr.message);
    }
  } else if (error) {
    console.error("[Transaction Audit] Failed to record:", error.message);
  }
};
