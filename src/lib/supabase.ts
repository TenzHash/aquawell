import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase Project URL and Anon/Public API Key
const SUPABASE_URL = 'https://moijhikldalpmvcmemcm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vaWpoaWtsZGFscG12Y21lbWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MDc5ODgsImV4cCI6MjEwNjQ4Mzk4OH0.h9a9maRA-W571dm_SI3uCRdma1CPzg8uLur9ThbM_8I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);