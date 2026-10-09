import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ success: false, error: "Missing authorization token" }, 401);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceRoleKey) return json({ success: false, error: "Supabase server configuration is incomplete" }, 500);

    const admin = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: callerData, error: callerError } = await admin.auth.getUser(authHeader.slice(7).trim());
    if (callerError || !callerData.user) return json({ success: false, error: "Invalid or expired session" }, 401);

    const { data: callerProfile, error: callerProfileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", callerData.user.id)
      .maybeSingle();
    if (callerProfileError || String(callerProfile?.role || "").toLowerCase() !== "admin") {
      return json({ success: false, error: "Only administrators can permanently delete accounts" }, 403);
    }

    const body = await req.json();
    let targetUserId = String(body.user_id || "").trim() || null;
    const customerId = body.customer_id == null ? null : Number(body.customer_id);
    const staffId = body.staff_id == null ? null : Number(body.staff_id);

    if (!targetUserId && customerId) {
      const { data, error } = await admin.from("customers").select("profile_id").eq("customer_id", customerId).maybeSingle();
      if (error) return json({ success: false, error: `Customer lookup failed: ${error.message}` }, 500);
      targetUserId = data?.profile_id || null;
    }
    if (!targetUserId && staffId) {
      const { data, error } = await admin.from("staff").select("profile_id").eq("staff_id", staffId).maybeSingle();
      if (error) return json({ success: false, error: `Staff lookup failed: ${error.message}` }, 500);
      targetUserId = data?.profile_id || null;
    }

    if (!targetUserId) return json({ success: false, error: "The selected account has no linked Supabase Auth profile. The record was not deleted." }, 409);
    if (targetUserId === callerData.user.id) return json({ success: false, error: "You cannot delete the currently signed-in administrator account" }, 400);

    const { data: targetUserData, error: targetUserError } = await admin.auth.admin.getUserById(targetUserId);
    if (targetUserError || !targetUserData.user) return json({ success: false, error: "Authentication user was not found" }, 404);

    const { data: targetProfile, error: targetProfileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", targetUserId)
      .maybeSingle();
    if (targetProfileError) return json({ success: false, error: `Target profile lookup failed: ${targetProfileError.message}` }, 500);
    if (String(targetProfile?.role || "").toLowerCase() === "admin") {
      return json({ success: false, error: "Administrator accounts cannot be deleted from this screen" }, 403);
    }

    const cleanupErrors: string[] = [];

    // Preserve business history. Customer ownership and rider assignments are
    // detached, but orders, order_items, payments, and sales remain.
    const { error: customerOrdersError } = await admin.from("orders").update({ customer_id: null }).eq("customer_id", targetUserId);
    if (customerOrdersError) cleanupErrors.push(`orders customer detach: ${customerOrdersError.message}`);

    const { data: linkedStaffRows, error: linkedStaffError } = await admin.from("staff").select("staff_id").eq("profile_id", targetUserId);
    if (linkedStaffError) cleanupErrors.push(`staff lookup: ${linkedStaffError.message}`);
    for (const row of linkedStaffRows || []) {
      const { error } = await admin.from("orders").update({ rider_id: null }).eq("rider_id", row.staff_id);
      if (error) cleanupErrors.push(`orders rider detach: ${error.message}`);
    }

    // Delete only the application's identity rows. Audit history is intentionally
    // preserved; its user_id FK becomes NULL when the profile is removed.
    const { error: customerDeleteError } = await admin.from("customers").delete().eq("profile_id", targetUserId);
    if (customerDeleteError) cleanupErrors.push(`customers: ${customerDeleteError.message}`);
    const { error: staffDeleteError } = await admin.from("staff").delete().eq("profile_id", targetUserId);
    if (staffDeleteError) cleanupErrors.push(`staff: ${staffDeleteError.message}`);
    const { error: profileDeleteError } = await admin.from("profiles").delete().eq("id", targetUserId);
    if (profileDeleteError) cleanupErrors.push(`profiles: ${profileDeleteError.message}`);

    if (cleanupErrors.length) {
      return json({ success: false, error: "Account cleanup could not be completed. The Auth account was not deleted.", cleanupErrors }, 500);
    }

    // Deleting the Auth user invalidates refresh tokens and, with the existing
    // profiles FK, also protects against the account being recreated as an active profile.
    const { error: deleteAuthError } = await admin.auth.admin.deleteUser(targetUserId, false);
    if (deleteAuthError) {
      return json({ success: false, error: `Application records were removed, but the Supabase Auth account could not be deleted: ${deleteAuthError.message}` }, 500);
    }

    return json({
      success: true,
      user_id: targetUserId,
      auth_deleted: true,
      profile_deleted: true,
      historical_business_data_preserved: true,
    });
  } catch (error: any) {
    return json({ success: false, error: error?.message || "Failed to delete account." }, 500);
  }
});
