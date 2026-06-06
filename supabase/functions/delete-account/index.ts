import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type DeleteAccountResponse = {
  deletedImageCount: number;
  deletedPostCount: number;
};

const corsHeaders = {
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed.' },
      { headers: corsHeaders, status: 405 },
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return Response.json(
      { error: 'Supabase environment is not configured.' },
      { headers: corsHeaders, status: 500 },
    );
  }

  const authorization = request.headers.get('Authorization');

  if (!authorization) {
    return Response.json(
      { error: 'Missing authorization header.' },
      { headers: corsHeaders, status: 401 },
    );
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authorization } },
  });

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();

  if (authError || !user) {
    return Response.json(
      { error: authError?.message ?? 'Invalid session.' },
      { headers: corsHeaders, status: 401 },
    );
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: posts, error: postsError } = await adminClient
    .from('posts')
    .select('id')
    .eq('owner_id', user.id);

  if (postsError) {
    return Response.json(
      { error: postsError.message },
      { headers: corsHeaders, status: 500 },
    );
  }

  const postIds = (posts ?? []).map((post) => post.id);
  let storagePaths: string[] = [];

  if (postIds.length > 0) {
    const { data: images, error: imagesError } = await adminClient
      .from('post_images')
      .select('storage_path')
      .in('post_id', postIds);

    if (imagesError) {
      return Response.json(
        { error: imagesError.message },
        { headers: corsHeaders, status: 500 },
      );
    }

    storagePaths = (images ?? []).map((image) => image.storage_path);
  }

  if (storagePaths.length > 0) {
    const { error: storageError } = await adminClient.storage
      .from('post-images')
      .remove(storagePaths);

    if (storageError) {
      return Response.json(
        { error: storageError.message },
        { headers: corsHeaders, status: 500 },
      );
    }
  }

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
    user.id,
  );

  if (deleteUserError) {
    return Response.json(
      { error: deleteUserError.message },
      { headers: corsHeaders, status: 500 },
    );
  }

  return Response.json(
    {
      deletedImageCount: storagePaths.length,
      deletedPostCount: postIds.length,
    } satisfies DeleteAccountResponse,
    { headers: corsHeaders },
  );
});
