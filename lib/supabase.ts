import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Explizit statt den Defaults überlassen (N-6 aus dem Security-Review):
// persistSession/autoRefreshToken werden gebraucht, damit die Sitzung einen
// Reload übersteht; detectSessionInUrl ist Pflicht für den Passwort-Reset-
// Link (app/passwort-zuruecksetzen/), der die Session aus der URL liest.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
