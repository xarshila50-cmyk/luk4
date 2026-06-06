import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from '@/shared/layouts/app-layout';
import { RouteLoading } from '@/shared/components/route-loading';
import { ProtectedRoute } from '@/features/auth/routes/protected-route';
import { NotFoundPage } from '@/features/not-found/pages/not-found-page';

const AccountPage = lazy(() =>
  import('@/features/account/pages/account-page').then((module) => ({
    default: module.AccountPage,
  })),
);
const AdminDashboardPage = lazy(() =>
  import('@/features/admin/pages/admin-dashboard-page').then((module) => ({
    default: module.AdminDashboardPage,
  })),
);
const CreatePostPage = lazy(() =>
  import('@/features/posts/pages/create-post-page').then((module) => ({
    default: module.CreatePostPage,
  })),
);
const HomePage = lazy(() =>
  import('@/features/home/pages/home-page').then((module) => ({
    default: module.HomePage,
  })),
);
const LoginPage = lazy(() =>
  import('@/features/auth/pages/login-page').then((module) => ({
    default: module.LoginPage,
  })),
);
const PostDetailsPage = lazy(() =>
  import('@/features/posts/pages/post-details-page').then((module) => ({
    default: module.PostDetailsPage,
  })),
);
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/register-page').then((module) => ({
    default: module.RegisterPage,
  })),
);

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteLoading />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to="/ge" />,
  },
  {
    path: '/homepage',
    element: <Navigate replace to="/ge/homepage" />,
  },
  {
    path: '/login',
    element: <Navigate replace to="/ge/login" />,
  },
  {
    path: '/register',
    element: <Navigate replace to="/ge/register" />,
  },
  {
    path: '/create',
    element: <Navigate replace to="/ge/create" />,
  },
  {
    path: '/profile',
    element: <Navigate replace to="/ge/profile" />,
  },
  {
    path: '/admin',
    element: <Navigate replace to="/ge/admin" />,
  },
  {
    path: '/posts/:postId',
    element: <Navigate replace to="/ge" />,
  },
  {
    path: '/:lang',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: withSuspense(<HomePage />),
      },
      {
        path: 'homepage',
        element: withSuspense(<HomePage />),
      },
      {
        path: 'login',
        element: withSuspense(<LoginPage />),
      },
      {
        path: 'register',
        element: withSuspense(<RegisterPage />),
      },
      {
        path: 'create',
        element: withSuspense(
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: 'posts/:postId',
        element: withSuspense(<PostDetailsPage />),
      },
      {
        path: 'profile',
        element: withSuspense(
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: 'admin',
        element: withSuspense(
          <ProtectedRoute requireAdmin>
            <AdminDashboardPage />
          </ProtectedRoute>,
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
