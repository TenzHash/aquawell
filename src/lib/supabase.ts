import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://pwhcunqlijunipispiep.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aGN1bnFsaWp1bmlwaXNwaWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNDM0ODMsImV4cCI6MjEwNjcxOTQ4M30.srItJHziRxyxWfN2WSP45Uu3DRl-aJ-xWkB205-VkTA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
