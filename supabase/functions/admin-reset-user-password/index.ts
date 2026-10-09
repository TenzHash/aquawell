import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const generatePassword = () => `AquaWell@${Math.floor(1000 + Math.random() * 9000)}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return json({ error: "Supabase server configuration is incomplete" }, 500);
    const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
    const h = req.headers.get("Authorization");
    if (!h?.startsWith("Bearer ")) return json({ error: "Missing authorization token" }, 401);
    const { data: caller } = await admin.auth.getUser(h.slice(7));
    if (!caller.user) return json({ error: "Invalid or expired session" }, 401);
    const { data: cp } = await admin.from("profiles").select("role").eq("id", caller.user.id).maybeSingle();
    if (cp?.role?.toLowerCase() !== "admin") return json({ error: "Only administrators can reset account passwords" }, 403);
    const body = await req.json().catch(() => null);
    const email = String(body?.email || "").trim().toLowerCase();
    if (!email) return json({ error: "Email is required" }, 400);

    let authUser: any = null;
    let page = 1;
    while (!authUser) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) return json({ error: error.message }, 400);
      authUser = data.users.find((u) => (u.email || "").toLowerCase() === email) || null;
      if (data.users.length < 1000) break;
      page += 1;
    }
    if (!authUser) return json({ error: "No login account exists for this email. Create the account first." }, 404);

    const temporaryPassword = generatePassword();
    const { error: updateError } = await admin.auth.admin.updateUserById(authUser.id, {
      password: temporaryPassword,
      email_confirm: true,
    });
    if (updateError) return json({ error: updateError.message }, 400);
    return json({ success: true, email, temporary_password: temporaryPassword });
  } catch (error: any) {
    return json({ error: error?.message || "Failed to reset password" }, 500);
  }
});
