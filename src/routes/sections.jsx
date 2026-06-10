import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

import ProtectedRoute from './ProtectedRoute';

export const IndexPage = lazy(() => import('src/pages/app'));
export const ReportPage = lazy(() => import('src/pages/reports'));
export const ActivityPage = lazy(() => import('src/pages/activity'));
export const LookupPage = lazy(() => import('src/pages/lookup'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const CategorysPage = lazy(() => import('src/pages/category'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

export default function Router() {
  const token = sessionStorage.getItem('token');

  const routes = useRoutes([
    {
      path: '/',
      element: token ? (
        <Navigate to="/dashboard" replace />
      ) : (
        <Navigate to="/login" replace />
      ),
    },

    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <Suspense fallback={<div>Loading...</div>}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <IndexPage /> },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'categorys', element: <CategorysPage /> },
        { path: 'reports', element: <ReportPage /> },
        { path: 'activitys', element: <ActivityPage /> },
        { path: 'lookup', element: <LookupPage /> },
      ],
    },

    {
      path: '/login',
      element: token ? (
        <Navigate to="/dashboard" replace />
      ) : (
        <LoginPage />
      ),
    },

    {
      path: '/404',
      element: <Page404 />,
    },

    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}