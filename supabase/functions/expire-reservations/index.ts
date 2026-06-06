import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type ExpireResponse = {
  expiredCount: number;
};

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { error: 'Supabase environment is not configured.' },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const { data, error } = await supabase.rpc('expire_reservations');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ expiredCount: data ?? 0 } satisfies ExpireResponse);
});
