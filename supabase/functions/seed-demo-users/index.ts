import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get clinic_id from existing admin user
    const { data: existingUser } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("email", "admin@miavet.com")
      .maybeSingle();

    if (!existingUser) {
      return new Response(
        JSON.stringify({ error: "No admin user found to get clinic_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const clinicId = existingUser.clinic_id;

    // Hash passwords
    const adminHash = bcrypt.hashSync("Admin@2026!", 10);
    const vetHash = bcrypt.hashSync("Vet@2026!", 10);
    const staffHash = bcrypt.hashSync("Staff@2026!", 10);

    // Update admin password
    const { error: e1 } = await supabase
      .from("users")
      .update({ password_hash: adminHash })
      .eq("email", "admin@miavet.com");

    // Update vet password
    const { error: e2 } = await supabase
      .from("users")
      .update({ password_hash: vetHash })
      .eq("email", "drsmith@miavet.com");

    // Upsert staff user (check if exists first)
    const { data: existingStaff } = await supabase
      .from("users")
      .select("id")
      .eq("email", "staff@miavet.com")
      .maybeSingle();

    let e3 = null;
    if (existingStaff) {
      const { error } = await supabase
        .from("users")
        .update({ password_hash: staffHash, name: "Anjali Patel", role: "staff", is_active: true, is_deleted: false })
        .eq("email", "staff@miavet.com");
      e3 = error;
    } else {
      const { error } = await supabase.from("users").insert({
        email: "staff@miavet.com",
        name: "Anjali Patel",
        role: "staff",
        password_hash: staffHash,
        clinic_id: clinicId,
        is_active: true,
        is_deleted: false,
      });
      e3 = error;
    }

    const errors = [e1, e2, e3].filter(Boolean);
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: "Some updates failed", details: errors }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demo users seeded successfully",
        credentials: [
          { role: "Admin", email: "admin@miavet.com", password: "Admin@2026!" },
          { role: "Veterinarian", email: "drsmith@miavet.com", password: "Vet@2026!" },
          { role: "Staff", email: "staff@miavet.com", password: "Staff@2026!" },
        ],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
