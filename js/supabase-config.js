import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

/* Change SUPABASE_BUCKET if your Storage bucket has a different name. */
export const SUPABASE_URL = 'https://gwsrgyiigvrzbzalabxs.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_QtL8DStfvT1mV9afkllqwQ_jdcXbYyH';
export const SUPABASE_BUCKET = 'portfolio';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
