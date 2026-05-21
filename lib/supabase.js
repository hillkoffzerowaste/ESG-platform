import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "");
const defaultPublishableKey = "sb_publishable_pgiW0Z4B_4vbfhen9R9omQ_zIBtopGF";
const envSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = /^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(envSupabaseKey || "")
  ? envSupabaseKey
  : defaultPublishableKey;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  }
);
