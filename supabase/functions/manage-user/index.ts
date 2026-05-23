// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- 1. Verify the caller is a signed-in admin ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized: no auth header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use anon key to validate the caller's JWT session
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- 2. Create admin client with service_role key (safe here, server-side only) ---
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // --- 3. Handle actions ---
    const { action, email, role, redirectTo, targetUserId } = await req.json();

    // Verify caller is admin before allowing role management
    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    const isAdmin = callerRole?.role === 'admin';

    if (action === 'invite') {
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Store role to be set after user accepts invite (via trigger)
      const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { role: role ?? 'teacher' },
        redirectTo: redirectTo ?? Deno.env.get('SITE_URL') ?? '',
      });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, message: 'Invitation sent. User will be created with role after they accept.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- 4. Admin-only actions ---
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'updateRole') {
      if (!targetUserId || !role) {
        return new Response(JSON.stringify({ error: 'targetUserId and role are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabaseAdmin
        .from('user_roles')
        .upsert({ 
          user_id: targetUserId, 
          role: role,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'listUsers') {
      const { data, error } = await supabaseAdmin
        .from('user_roles')
        .select(`
          role,
          user_id,
          created_at,
          auth:user_id(email)
        `);

      if (error) throw error;

      return new Response(JSON.stringify({ users: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getUserRole') {
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: 'targetUserId is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabaseAdmin
        .from('user_roles')
        .select('role, user_id, created_at')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return new Response(JSON.stringify({ role: data?.role || 'teacher', userId: targetUserId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[manage-user] Error:', err.message);
    return new Response(JSON.stringify({ error: err.message ?? 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
