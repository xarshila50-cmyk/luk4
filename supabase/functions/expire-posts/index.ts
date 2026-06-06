import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type ExpirePostsResponse = {
  archivedCount: number;
  cleanedPostCount: number;
  failedCleanupCount: number;
};

type ExpiredPostRow = {
  id: string;
  cleanup_attempts: number;
  post_images: Array<{
    storage_path: string;
  }> | null;
};

const MAX_CLEANUP_ATTEMPTS = 3;
const DEFAULT_BATCH_SIZE = 100;

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const configuredJobSecret = Deno.env.get('POST_EXPIRATION_JOB_SECRET');
  const requestJobSecret = request.headers.get('x-job-secret');

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { error: 'Supabase environment is not configured.' },
      { status: 500 },
    );
  }

  if (configuredJobSecret && requestJobSecret !== configuredJobSecret) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  const batchSize = await readBatchSize(request);
  const { data: archivedCount, error: archiveError } = await supabase.rpc(
    'mark_expired_posts',
    { batch_size: batchSize },
  );

  if (archiveError) {
    return Response.json({ error: archiveError.message }, { status: 500 });
  }

  const { data: expiredPosts, error: cleanupQueryError } = await supabase
    .from('posts')
    .select(
      `
        id,
        cleanup_attempts,
        post_images (
          storage_path
        )
      `,
    )
    .eq('status', 'archived')
    .not('expired_at', 'is', null)
    .is('storage_cleaned_at', null)
    .lt('cleanup_attempts', MAX_CLEANUP_ATTEMPTS)
    .order('expired_at', { ascending: true })
    .limit(batchSize);

  if (cleanupQueryError) {
    return Response.json({ error: cleanupQueryError.message }, { status: 500 });
  }

  let cleanedPostCount = 0;
  let failedCleanupCount = 0;

  for (const post of (expiredPosts ?? []) as ExpiredPostRow[]) {
    const storagePaths = (post.post_images ?? []).map(
      (image) => image.storage_path,
    );

    const result = await cleanupPostStorage(supabase, {
      attempt: post.cleanup_attempts + 1,
      postId: post.id,
      storagePaths,
    });

    if (result.ok) {
      cleanedPostCount += 1;
    } else {
      failedCleanupCount += 1;
    }
  }

  return Response.json({
    archivedCount: archivedCount ?? 0,
    cleanedPostCount,
    failedCleanupCount,
  } satisfies ExpirePostsResponse);
});

async function readBatchSize(request: Request) {
  try {
    const body = await request.json();
    const value = Number(body?.batchSize);

    if (Number.isInteger(value) && value >= 1 && value <= 500) {
      return value;
    }
  } catch {
    return DEFAULT_BATCH_SIZE;
  }

  return DEFAULT_BATCH_SIZE;
}

async function cleanupPostStorage(
  supabase: ReturnType<typeof createClient>,
  input: {
    attempt: number;
    postId: string;
    storagePaths: string[];
  },
) {
  if (input.storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('post-images')
      .remove(input.storagePaths);

    if (storageError) {
      await recordCleanupFailure(supabase, {
        ...input,
        message: storageError.message,
      });

      return { ok: false };
    }
  }

  const { error: imageDeleteError } = await supabase
    .from('post_images')
    .delete()
    .eq('post_id', input.postId);

  if (imageDeleteError) {
    await recordCleanupFailure(supabase, {
      ...input,
      message: imageDeleteError.message,
    });

    return { ok: false };
  }

  const { error: postUpdateError } = await supabase
    .from('posts')
    .update({
      cleanup_attempts: input.attempt,
      cleanup_error: null,
      storage_cleaned_at: new Date().toISOString(),
    })
    .eq('id', input.postId);

  if (postUpdateError) {
    await recordCleanupFailure(supabase, {
      ...input,
      message: postUpdateError.message,
    });

    return { ok: false };
  }

  await supabase.from('post_expiration_logs').insert({
    attempt: input.attempt,
    event: 'storage_cleanup_succeeded',
    image_count: input.storagePaths.length,
    message: 'Expired post storage cleanup completed.',
    post_id: input.postId,
  });

  return { ok: true };
}

async function recordCleanupFailure(
  supabase: ReturnType<typeof createClient>,
  input: {
    attempt: number;
    message: string;
    postId: string;
    storagePaths: string[];
  },
) {
  await supabase
    .from('posts')
    .update({
      cleanup_attempts: input.attempt,
      cleanup_error: input.message,
    })
    .eq('id', input.postId);

  await supabase.from('post_expiration_logs').insert({
    attempt: input.attempt,
    event: 'storage_cleanup_failed',
    image_count: input.storagePaths.length,
    message: input.message,
    post_id: input.postId,
  });

  if (input.attempt >= MAX_CLEANUP_ATTEMPTS) {
    await supabase.from('post_expiration_logs').insert({
      attempt: input.attempt,
      event: 'cleanup_skipped',
      image_count: input.storagePaths.length,
      message: 'Maximum automatic cleanup attempts reached.',
      post_id: input.postId,
    });
  }
}
