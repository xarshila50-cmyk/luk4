import { supabase } from '@/shared/lib/supabase';

type AdminStatsRow = {
  users: number;
  posts: number;
  openReports: number;
  reservations: number;
  expiredPosts: number;
  error?: string;
};

type AdminProfileRow = {
  id: string;
  display_name: string;
  location: string;
  role: 'member' | 'admin';
  created_at: string;
  posts: Array<{ id: string }> | null;
  reservations: Array<{ id: string }> | null;
};

type AdminPostRow = {
  id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  created_at: string;
  expires_at: string;
  profiles: {
    display_name: string;
  } | null;
  reports: Array<{ id: string }> | null;
};

type AdminReportRow = {
  id: string;
  subject: string;
  body: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
  profiles: {
    display_name: string;
  } | null;
  posts: {
    id: string;
    title: string;
  } | null;
};

export type AdminStats = Omit<AdminStatsRow, 'error'>;

export type AdminUser = {
  id: string;
  displayName: string;
  location: string;
  role: 'member' | 'admin';
  createdAt: string;
  postCount: number;
  reservationCount: number;
};

export type AdminPost = {
  id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  ownerName: string;
  createdAt: string;
  expiresAt: string;
  reportCount: number;
};

export type AdminReport = {
  id: string;
  subject: string;
  body: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: string;
  reporterName: string;
  post: {
    id: string;
    title: string;
  } | null;
};

export async function fetchAdminStatus(userId?: string) {
  if (!userId) {
    return false;
  }

  const { data, error } = await supabase.rpc('is_admin');

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('admin_dashboard_stats');

  if (error) {
    throw new Error(error.message);
  }

  const stats = data as AdminStatsRow;

  if (stats.error) {
    throw new Error(stats.error);
  }

  return {
    expiredPosts: Number(stats.expiredPosts ?? 0),
    openReports: Number(stats.openReports ?? 0),
    posts: Number(stats.posts ?? 0),
    reservations: Number(stats.reservations ?? 0),
    users: Number(stats.users ?? 0),
  };
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
        id,
        display_name,
        location,
        role,
        created_at,
        posts (
          id
        ),
        reservations!reservations_requester_id_fkey (
          id
        )
      `,
    )
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as AdminProfileRow[]).map((user) => ({
    id: user.id,
    displayName: user.display_name,
    location: user.location,
    role: user.role,
    createdAt: user.created_at,
    postCount: user.posts?.length ?? 0,
    reservationCount: user.reservations?.length ?? 0,
  }));
}

export async function fetchAdminPosts(): Promise<AdminPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
        id,
        title,
        category,
        location,
        status,
        created_at,
        expires_at,
        profiles (
          display_name
        ),
        reports (
          id
        )
      `,
    )
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as AdminPostRow[]).map((post) => ({
    id: post.id,
    title: post.title,
    category: post.category,
    location: post.location,
    status: post.status,
    createdAt: post.created_at,
    expiresAt: post.expires_at,
    ownerName: post.profiles?.display_name ?? 'Unknown member',
    reportCount: post.reports?.length ?? 0,
  }));
}

export async function fetchAdminReports(): Promise<AdminReport[]> {
  const { data, error } = await supabase
    .from('reports')
    .select(
      `
        id,
        subject,
        body,
        status,
        created_at,
        profiles (
          display_name
        ),
        posts (
          id,
          title
        )
      `,
    )
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as AdminReportRow[]).map((report) => ({
    id: report.id,
    subject: report.subject,
    body: report.body,
    status: report.status,
    createdAt: report.created_at,
    reporterName: report.profiles?.display_name ?? 'Unknown member',
    post: report.posts,
  }));
}

export async function deleteAdminPost(postId: string) {
  const { error } = await supabase.functions.invoke('admin-delete-post', {
    body: { postId },
    method: 'POST',
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateReportStatus(
  reportId: string,
  status: AdminReport['status'],
) {
  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', reportId);

  if (error) {
    throw new Error(error.message);
  }
}
