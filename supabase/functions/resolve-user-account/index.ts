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
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceRoleKey) return json({ error: "Supabase server configuration is incomplete" }, 500);

    const admin = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Missing authorization token" }, 401);

    const { data: caller, error: callerError } = await admin.auth.getUser(authHeader.slice(7));
    if (callerError || !caller.user) return json({ error: "Invalid or expired session" }, 401);

    const user = caller.user;
    const email = (user.email || "").trim().toLowerCase();
    const metadata = user.user_metadata || {};
    const fullName = String(metadata.full_name || "").trim();
    const firstName = String(metadata.first_name || "").trim();
    const middleName = String(metadata.middle_name || "").trim();
    const lastName = String(metadata.last_name || "").trim();
    const suffix = String(metadata.suffix || "").trim();
    const phone = String(metadata.phone || "").trim();
    const address = String(metadata.address || "").trim();
    const barangay = String(metadata.barangay || "").trim();
    const landmark = metadata.landmark ? String(metadata.landmark).trim() : null;

    const [profileResult, staffProfileResult, staffEmailResult, customerProfileResult, customerEmailResult] = await Promise.all([
      admin.from("profiles").select("id, full_name, email, phone, address, barangay, landmark, role").eq("id", user.id).maybeSingle(),
      admin.from("staff").select("staff_id, role, profile_id, email").eq("profile_id", user.id).maybeSingle(),
      email ? admin.from("staff").select("staff_id, role, profile_id, email, first_name, middle_name, last_name, suffix, contact_number").ilike("email", email).maybeSingle() : Promise.resolve({ data: null, error: null }),
      admin.from("customers").select("customer_id, profile_id, email, first_name, middle_name, last_name, suffix, contact_number, address").eq("profile_id", user.id).maybeSingle(),
      email ? admin.from("customers").select("customer_id, profile_id, email, first_name, middle_name, last_name, suffix, contact_number, address").ilike("email", email).maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);

    const dbError = [profileResult, staffProfileResult, staffEmailResult, customerProfileResult, customerEmailResult].find((r: any) => r.error);
    if (dbError) {
      return json({ error: "Your account could not be synchronized with the application database. Please contact the administrator." }, 500);
    }

    const profile = profileResult.data;
    const staff = staffProfileResult.data || staffEmailResult.data;
    const customer = customerProfileResult.data || customerEmailResult.data;

    let role = String(profile?.role || "").toLowerCase();
    if (staff?.role) role = String(staff.role).toLowerCase();
    else if (customer && !role) role = "customer";
    if (!role) role = String(metadata.role || "customer").toLowerCase();
    if (!["admin", "staff", "delivery", "customer"].includes(role)) role = "customer";

    // A staff record is authoritative for staff/delivery routing. Repair its profile linkage.
    if (staff) {
      const staffFirst = String(staff.first_name || "").trim();
      const staffLast = String(staff.last_name || "").trim();
      const staffFullName = [staffFirst, staff.middle_name, staffLast, staff.suffix].filter(Boolean).join(" ").trim() || fullName;
      const staffPhone = String(staff.contact_number || phone).trim();
      const { error: profileUpsertError } = await admin.from("profiles").upsert({
        id: user.id,
        full_name: staffFullName,
        email,
        phone: staffPhone,
        address: profile?.address || "",
        barangay: profile?.barangay || "",
        landmark: profile?.landmark || null,
        role: String(staff.role || role).toLowerCase(),
      }, { onConflict: "id" });
      if (profileUpsertError) return json({ error: "Your staff profile could not be repaired. Please contact the administrator." }, 500);

      if (staff.profile_id !== user.id) {
        const { error: staffUpdateError } = await admin.from("staff").update({ profile_id: user.id }).eq("staff_id", staff.staff_id);
        if (staffUpdateError) return json({ error: "Your staff account exists but could not be linked to your login. Please contact the administrator." }, 500);
      }

      return json({ success: true, repaired: !profile || staff.profile_id !== user.id, role: String(staff.role || role).toLowerCase(), user_id: user.id });
    }

    // A customer record is authoritative when present, including legacy records whose profile_id is missing.
    if (customer) {
      const customerFullName = [customer.first_name, customer.middle_name, customer.last_name, customer.suffix].filter(Boolean).join(" ").trim() || fullName;
      const customerPhone = String(customer.contact_number || phone).trim();
      const customerAddress = String(customer.address || address).trim();
      const { error: profileUpsertError } = await admin.from("profiles").upsert({
        id: user.id,
        full_name: customerFullName,
        email,
        phone: customerPhone,
        address: customerAddress,
        barangay: profile?.barangay || barangay,
        landmark: profile?.landmark || landmark,
        role: "customer",
      }, { onConflict: "id" });
      if (profileUpsertError) return json({ error: "Your customer profile could not be repaired. Please contact the administrator." }, 500);

      if (customer.profile_id !== user.id) {
        const { error: customerUpdateError } = await admin.from("customers").update({ profile_id: user.id }).eq("customer_id", customer.customer_id);
        if (customerUpdateError) return json({ error: "Your customer account exists but could not be linked to your login. Please contact the administrator." }, 500);
      }

      return json({ success: true, repaired: !profile || customer.profile_id !== user.id, role: "customer", user_id: user.id });
    }

    // A customer profile without a customer row is incomplete. Provision the
    // missing customer row from the explicit Auth metadata captured at signup.
    // Do not invent names, addresses, or barangays.
    if (profile && role === "customer") {
      if (!firstName || !middleName || !lastName || !phone || !address || !barangay) {
        return json({
          success: false,
          code: "ACCOUNT_SETUP_INCOMPLETE",
          error: "Your customer account is missing required registration information. Please contact the administrator.",
        }, 409);
      }

      const repairedFullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(" ");
      const { error: profileUpdateError } = await admin.from("profiles").update({
        full_name: repairedFullName,
        email,
        phone,
        address,
        barangay,
        landmark,
        role: "customer",
      }).eq("id", user.id);
      if (profileUpdateError) return json({ error: "Your customer profile could not be completed. Please contact the administrator." }, 500);

      const { error: customerInsertError } = await admin.from("customers").insert({
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix: suffix || null,
        address,
        contact_number: phone,
        email,
        profile_id: user.id,
      });
      if (customerInsertError) return json({ error: "Your login exists, but your customer record could not be created. Please contact the administrator." }, 500);

      return json({ success: true, repaired: true, role: "customer", user_id: user.id });
    }

    // Completely orphaned Auth user: only provision it when the required
    // registration metadata is present. Never fall back to placeholder data.
    if (!firstName || !middleName || !lastName || !phone || !address || !barangay) {
      return json({
        success: false,
        code: "ACCOUNT_SETUP_INCOMPLETE",
        error: "Your login exists, but the account setup information is incomplete. Please contact the administrator.",
      }, 409);
    }

    const repairedFullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(" ");
    const { error: profileInsertError } = await admin.from("profiles").insert({
      id: user.id,
      full_name: repairedFullName,
      email,
      phone,
      address,
      barangay,
      landmark,
      role: "customer",
    });
    if (profileInsertError) return json({ error: "Your login exists, but AquaWell could not create your application profile. Please contact the administrator." }, 500);

    const { error: customerInsertError } = await admin.from("customers").insert({
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      suffix: suffix || null,
      address,
      contact_number: phone,
      email,
      profile_id: user.id,
    });
    if (customerInsertError) {
      await admin.from("profiles").delete().eq("id", user.id);
      return json({ error: "Your login exists, but your customer record could not be created. Please contact the administrator." }, 500);
    }

    return json({ success: true, repaired: true, role: "customer", user_id: user.id });
  } catch (error: any) {
    return json({ error: error?.message || "Account synchronization failed" }, 500);
  }
});
