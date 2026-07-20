import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

import ProtectedRoute from './ProtectedRoute';

export const IndexPage = lazy(() => import('src/pages/app'));
export const UserPage = lazy(() => import('src/pages/user'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const LookupPage = lazy(() => import('src/pages/lookup'));
export const ReportPage = lazy(() => import('src/pages/reports'));
export const SocialsPage = lazy(() => import('src/pages/socials'));
export const CompanyPage = lazy(() => import('src/pages/company'));
export const ActivityPage = lazy(() => import('src/pages/activity'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const CategorysPage = lazy(() => import('src/pages/category'));
export const LeadPage = lazy(() => import('src/pages/leadManagement'));
export const BulkUploadPage = lazy(() => import('src/pages/bulkupload'));
export const BulkDescPage = lazy(() => import('src/pages/bulkdesc'));
export const GalleryPage = lazy(() => import('src/pages/inspirationGallery'));
export const AboutusPage = lazy(() => import('src/pages/staticpages/about_us'));
export const ProcessPage = lazy(() => import('src/pages/staticpages/our_process'));
// export const MeuPage = lazy(() => import('src/pages/staticpages/meu'));
// export const VideoPage = lazy(() => import('src/pages/staticpages/video'));
// export const MerchandisePage = lazy(() => import('src/pages/staticpages/merchandise'));

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
        { path: 'company', element: <CompanyPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'socials', element: <SocialsPage /> },
        { path: 'bulk', element: <BulkUploadPage /> },
        { path: 'bulkdesc', element: <BulkDescPage /> },
        { path: 'lead', element: <LeadPage /> },
        { path: 'aboutus', element: <AboutusPage /> },
        { path: 'process', element: <ProcessPage /> },
        { path: 'gallery', element: <GalleryPage /> },
        // { path: 'meu', element: <MeuPage /> },
        // { path: 'videos', element: <VideoPage /> },
        // { path: 'merchandise ', element: <MerchandisePage /> },
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