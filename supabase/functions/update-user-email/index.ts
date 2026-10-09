import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL"), key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return json({ error: "Supabase server configuration is incomplete" }, 500);
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const h = req.headers.get("Authorization");
  if (!h?.startsWith("Bearer ")) return json({ error: "Missing authorization token" }, 401);
  const { data: caller } = await admin.auth.getUser(h.slice(7));
  if (!caller.user) return json({ error: "Invalid or expired session" }, 401);
  const { data: cp } = await admin.from("profiles").select("role").eq("id", caller.user.id).maybeSingle();
  if (cp?.role?.toLowerCase() !== "admin") return json({ error: "Only administrators can update login email addresses" }, 403);
  const body = await req.json().catch(() => null);
  const userId = String(body?.user_id || "").trim();
  const email = String(body?.email || "").trim().toLowerCase();
  if (!userId || !email) return json({ error: "user_id and email are required" }, 400);
  const { error } = await admin.auth.admin.updateUserById(userId, { email, email_confirm: true });
  if (error) return json({ error: error.message }, 400);
  return json({ success: true, user_id: userId, email });
});
