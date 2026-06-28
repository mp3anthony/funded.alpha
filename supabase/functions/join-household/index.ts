import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase client with Service Role Key to bypass RLS for verification and insert
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 2. Authenticate the requesting user via Authorization token
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Parse input body
    const { code } = await req.json();
    if (!code) {
      return new Response(JSON.stringify({ error: "Missing join code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedCode = code.trim().toUpperCase();

    // 4. Retrieve household matching the join code
    const { data: household, error: hError } = await supabaseClient
      .from("households")
      .select("id, code_expires_at")
      .eq("join_code", sanitizedCode)
      .single();

    if (hError || !household) {
      return new Response(JSON.stringify({ error: "Invalid join code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Verify if the join code has expired
    if (new Date(household.code_expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Join code has expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Member";
    const userEmail = user.email || "";

    // 6. Check if user is already a member of this household
    const { data: existingMember } = await supabaseClient
      .from("household_members")
      .select("id")
      .eq("household_id", household.id)
      .eq("email", userEmail)
      .maybeSingle();

    if (existingMember) {
      return new Response(JSON.stringify({ error: "You are already a member of this household" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7. Insert the user into household_members as 'member'
    const { error: insertError } = await supabaseClient
      .from("household_members")
      .insert({
        household_id: household.id,
        name: userName,
        email: userEmail,
        role: "member",
        invitation_status: "accepted",
      });

    if (insertError) {
      return new Response(JSON.stringify({ error: "Failed to join household: " + insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, householdId: household.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
