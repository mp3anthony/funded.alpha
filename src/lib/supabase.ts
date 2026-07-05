import { createClient } from "@supabase/supabase-js";

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
if (!supabaseUrl || supabaseUrl === "undefined" || (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://"))) {
  supabaseUrl = "https://placeholder-please-set-env-vars.supabase.co";
}

let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
if (!supabaseAnonKey || supabaseAnonKey === "undefined") {
  supabaseAnonKey = "placeholder-key";
}

const hasRealEnvVars = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "undefined" && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "undefined";

if (!hasRealEnvVars && typeof window !== "undefined") {
  console.error(
    "Missing or invalid Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined in your environment."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",
    detectSessionInUrl: true,
  },
});
