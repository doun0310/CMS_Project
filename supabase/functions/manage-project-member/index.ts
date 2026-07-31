import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type ProjectRole = 'viewer' | 'project_member' | 'project_manager' | 'project_owner';
const roles = new Set<ProjectRole>(['viewer', 'project_member', 'project_manager', 'project_owner']);
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error('Authentication required');

    const url = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const callerClient = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) throw new Error('Authentication required');

    const { projectId, userId, role } = await request.json() as { projectId?: string; userId?: string; role?: ProjectRole };
    if (!projectId || !userId || !role || !roles.has(role)) throw new Error('Invalid member update request');

    const admin = createClient(url, serviceRoleKey);
    const { data: callerMembership, error: membershipError } = await admin
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (membershipError || callerMembership?.role !== 'project_owner') throw new Error('Only a Project Owner can change roles');

    const { error: updateError } = await admin
      .from('project_members')
      .upsert({ project_id: projectId, user_id: userId, role }, { onConflict: 'project_id,user_id' });
    if (updateError) throw updateError;

    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return Response.json({ error: message }, { status: 403, headers: corsHeaders });
  }
});
