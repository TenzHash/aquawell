import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Missing authorization token.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: callerData, error: callerError } = await admin.auth.getUser(token);
    if (callerError || !callerData.user) throw new Error("Invalid authentication token.");

    const { data: callerProfile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", callerData.user.id)
      .maybeSingle();

    if (profileError || callerProfile?.role !== "admin") {
      return new Response(JSON.stringify({ success: false, error: "Admin access required." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const firstName = String(body.first_name || "").trim();
    const middleName = body.middle_name ? String(body.middle_name).trim() : null;
    const lastName = String(body.last_name || "").trim();
    const suffix = body.suffix ? String(body.suffix).trim() : null;
    const phone = String(body.contact_number || "").trim();
    const address = String(body.address || "").trim();
    const barangay = String(body.barangay || "").trim();
    const password = String(body.password || "");

    if (!email || !firstName || !middleName || !lastName || !phone || !address || !barangay || !password) {
      throw new Error("First name, middle name, last name, email, contact number, address, barangay, and password are required.");
    }
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, role")
      .ilike("email", email)
      .maybeSingle();

    if (existingProfile && existingProfile.role && existingProfile.role.toLowerCase() !== "customer") {
      return new Response(JSON.stringify({
        success: false,
        code: "ROLE_CONFLICT",
        error: "This email is already associated with a non-customer AquaWell account. Use another email or repair the existing account.",
      }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check the application table first. This avoids attempting Auth creation
    // when the email is already a real AquaWell customer.
    const { data: existingCustomer } = await admin
      .from("customers")
      .select("customer_id, profile_id")
      .ilike("email", email)
      .maybeSingle();

    if (existingCustomer) {
      return new Response(JSON.stringify({
        success: false,
        code: "CUSTOMER_EMAIL_EXISTS",
        error: "A customer account with this email already exists. Use a different email or edit the existing customer.",
      }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingStaff } = await admin
      .from("staff")
      .select("staff_id, profile_id")
      .ilike("email", email)
      .maybeSingle();

    if (existingStaff) {
      return new Response(JSON.stringify({
        success: false,
        code: "STAFF_EMAIL_EXISTS",
        error: "This email is already being used by a staff account. Use a different email for the customer.",
      }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Supabase Auth may already contain this email even when the application's
    // profiles/customers rows are missing. Reuse that Auth identity instead of
    // trying to create a duplicate user_email entry.
    let authUser: any = null;
    let createdAuthUser = false;
    let page = 1;
    const perPage = 1000;

    while (!authUser) {
      const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({ page, perPage });
      if (usersError) throw usersError;
      authUser = usersData.users.find((u) => (u.email || "").toLowerCase() === email) || null;
      if (usersData.users.length < perPage) break;
      page += 1;
    }

    if (authUser) {
      // This is an orphaned/partial account. Make it usable for the newly
      // registered customer and confirm the email so login is immediately possible.
      const { data: updatedAuth, error: updateAuthError } = await admin.auth.admin.updateUserById(
        authUser.id,
        { password, email_confirm: true, user_metadata: {
          full_name: `${firstName} ${middleName} ${lastName}${suffix ? ` ${suffix}` : ""}`.trim(),
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          suffix: suffix || "",
          phone,
          address,
          barangay,
          role: "customer",
        } },
      );
      if (updateAuthError) throw updateAuthError;
      authUser = updatedAuth.user;
    } else {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: `${firstName} ${middleName} ${lastName}${suffix ? ` ${suffix}` : ""}`.trim(),
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          suffix: suffix || "",
          phone,
          address,
          barangay,
          role: "customer",
        },
      });
      if (createError) throw createError;
      authUser = created.user;
      createdAuthUser = true;
    }

    const fullName = `${firstName}${middleName ? ` ${middleName}` : ""} ${lastName}${suffix ? ` ${suffix}` : ""}`.trim();

    const { error: profileUpsertError } = await admin.from("profiles").upsert({
      id: authUser.id,
      full_name: fullName,
      email,
      phone,
      address,
      barangay,
      role: "customer",
    }, { onConflict: "id" });

    if (profileUpsertError) {
      if (createdAuthUser) await admin.auth.admin.deleteUser(authUser.id);
      throw profileUpsertError;
    }

    const { error: customerInsertError } = await admin.from("customers").insert({
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      suffix,
      address,
      contact_number: phone,
      email,
      profile_id: authUser.id,
    });

    if (customerInsertError) {
      if (createdAuthUser) {
        await admin.from("profiles").delete().eq("id", authUser.id);
        await admin.auth.admin.deleteUser(authUser.id);
      }
      throw customerInsertError;
    }

    return new Response(JSON.stringify({
      success: true,
      user_id: authUser.id,
      email,
      temporary_password: password,
      reused_existing_auth: !createdAuthUser,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error?.message || "Failed to create customer account." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
