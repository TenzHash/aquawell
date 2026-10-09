import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) return json({ error: "Supabase server configuration is incomplete" }, 500);
  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Missing authorization token" }, 401);

  const { data: caller, error: callerError } = await admin.auth.getUser(authHeader.slice(7));
  if (callerError || !caller.user) return json({ error: "Invalid or expired session" }, 401);
  const { data: callerProfile } = await admin.from("profiles").select("role").eq("id", caller.user.id).maybeSingle();
  if (callerProfile?.role?.toLowerCase() !== "admin") return json({ error: "Only administrators can create staff accounts" }, 403);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON request body" }, 400); }
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const firstName = String(body.first_name || "").trim();
  const middleName = String(body.middle_name || "").trim();
  const lastName = String(body.last_name || "").trim();
  const suffix = String(body.suffix || "").trim();
  const role = String(body.role || "Delivery").trim();
  const contact = String(body.contact_number || "").trim();
  if (!email || !password || password.length < 8 || !firstName || !lastName || !contact) return json({ error: "Complete staff details and an 8+ character password are required" }, 400);
  if (!["Admin", "Staff", "Delivery"].includes(role)) return json({ error: "Invalid staff role" }, 400);

  const { data: existingStaff } = await admin.from("staff").select("staff_id, profile_id, role").ilike("email", email).maybeSingle();
  if (existingStaff) return json({ error: "A staff account with this email already exists. Edit the existing staff record or use another email." }, 409);
  const { data: existingCustomer } = await admin.from("customers").select("customer_id, profile_id").ilike("email", email).maybeSingle();
  if (existingCustomer) return json({ error: "This email is already being used by a customer account. Use another email for the staff account." }, 409);

  let authUser: any = null;
  let createdAuthUser = false;
  let page = 1;
  while (!authUser) {
    const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (usersError) return json({ error: usersError.message }, 400);
    authUser = usersData.users.find((u) => (u.email || "").toLowerCase() === email) || null;
    if (usersData.users.length < 1000) break;
    page += 1;
  }

  if (authUser) {
    const { data: updatedAuth, error: updateAuthError } = await admin.auth.admin.updateUserById(authUser.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(authUser.user_metadata || {}),
        full_name: [firstName, middleName, lastName, suffix].filter(Boolean).join(" "),
        phone: contact,
        role: role.toLowerCase(),
      },
    });
    if (updateAuthError) return json({ error: updateAuthError.message }, 400);
    authUser = updatedAuth.user;
  } else {
    const { data: created, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: [firstName, middleName, lastName, suffix].filter(Boolean).join(" "),
        phone: contact,
        role: role.toLowerCase(),
      },
    });
    if (authError || !created.user) return json({ error: authError?.message || "Failed to create Auth user" }, 400);
    authUser = created.user;
    createdAuthUser = true;
  }

  const userId = authUser.id;
  const fullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(" ");
  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    email,
    phone: contact,
    address: "",
    barangay: "",
    landmark: null,
    role: role.toLowerCase(),
  }, { onConflict: "id" });
  if (profileError) {
    if (createdAuthUser) await admin.auth.admin.deleteUser(userId);
    return json({ error: `Failed to create staff profile: ${profileError.message}` }, 500);
  }

  const { error: staffError } = await admin.from("staff").insert({
    first_name: firstName,
    last_name: lastName,
    middle_name: middleName,
    suffix,
    role,
    contact_number: contact,
    email,
    profile_id: userId,
  });
  if (staffError) {
    if (createdAuthUser) {
      await admin.from("profiles").delete().eq("id", userId);
      await admin.auth.admin.deleteUser(userId);
    }
    return json({ error: `Failed to create staff record: ${staffError.message}` }, 500);
  }

  return json({ success: true, user_id: userId, email, role, temporary_password: password, reused_existing_auth: !createdAuthUser });
});
