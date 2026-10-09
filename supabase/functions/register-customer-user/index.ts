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

const clean = (value: unknown) => String(value ?? "").trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceRoleKey) return json({ success: false, error: "Supabase server configuration is incomplete." }, 500);

    const admin = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json();
    const email = clean(body.email).toLowerCase();
    const firstName = clean(body.first_name);
    const middleName = clean(body.middle_name);
    const lastName = clean(body.last_name);
    const suffix = clean(body.suffix);
    const phone = clean(body.phone);
    const address = clean(body.address);
    const barangay = clean(body.barangay);
    const landmark = clean(body.landmark);
    const password = String(body.password ?? "");

    if (!email || !firstName || !middleName || !lastName || !phone || !address || !barangay || !password) {
      return json({ success: false, error: "First name, middle name, last name, email, contact number, address, barangay, and password are required." }, 400);
    }
    if (password.length < 8) return json({ success: false, error: "Password must be at least 8 characters." }, 400);

    const { data: customer } = await admin.from("customers").select("customer_id").ilike("email", email).maybeSingle();
    if (customer) return json({ success: false, code: "EMAIL_EXISTS", error: "This email is already registered. Please log in instead or use a different email." }, 409);

    const { data: staff } = await admin.from("staff").select("staff_id").ilike("email", email).maybeSingle();
    if (staff) return json({ success: false, code: "EMAIL_EXISTS", error: "This email is already associated with a staff account. Please use a different email." }, 409);

    const { data: profile } = await admin.from("profiles").select("id, role").ilike("email", email).maybeSingle();
    if (profile) return json({ success: false, code: "EMAIL_EXISTS", error: "This email is already associated with an AquaWell account. Please log in instead or use a different email." }, 409);

    // Check Auth as well. We intentionally do not reuse an orphaned Auth identity
    // during public registration because doing so could let someone who knows an
    // existing email claim an account without proving ownership of that email.
    let existingAuth: any = null;
    let page = 1;
    const perPage = 1000;
    while (!existingAuth) {
      const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({ page, perPage });
      if (usersError) throw usersError;
      existingAuth = usersData.users.find((u) => (u.email || "").toLowerCase() === email) || null;
      if (usersData.users.length < perPage) break;
      page += 1;
    }
    if (existingAuth) return json({ success: false, code: "EMAIL_EXISTS", error: "This email is already registered. Please log in instead or use a different email." }, 409);

    const fullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(" ");
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix,
        phone,
        address,
        barangay,
        landmark: landmark || null,
        role: "customer",
      },
    });
    if (createError || !created.user) throw createError || new Error("The Auth account could not be created.");

    const userId = created.user.id;
    const { error: profileError } = await admin.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      email,
      phone,
      address,
      barangay,
      landmark: landmark || null,
      role: "customer",
    }, { onConflict: "id" });
    if (profileError) {
      await admin.auth.admin.deleteUser(userId);
      throw profileError;
    }

    const { error: customerError } = await admin.from("customers").insert({
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      suffix: suffix || null,
      address,
      contact_number: phone,
      email,
      profile_id: userId,
    });
    if (customerError) {
      await admin.from("profiles").delete().eq("id", userId);
      await admin.auth.admin.deleteUser(userId);
      throw customerError;
    }

    return json({ success: true, user_id: userId, email, role: "customer" });
  } catch (error: any) {
    return json({ success: false, error: error?.message || "Failed to create customer account." }, 400);
  }
});
