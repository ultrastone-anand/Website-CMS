import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';

import ProtectedRoute from './ProtectedRoute';

export const IndexPage = lazy(() => import('src/pages/app'));
export const UserPage = lazy(() => import('src/pages/user'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const LookupPage = lazy(() => import('src/pages/lookup'));
export const CareerPage = lazy(() => import('src/pages/carrer'));
export const ReportPage = lazy(() => import('src/pages/reports'));
export const SocialsPage = lazy(() => import('src/pages/socials'));
export const CompanyPage = lazy(() => import('src/pages/company'));
export const BulkDescPage = lazy(() => import('src/pages/bulkdesc'));
export const ActivityPage = lazy(() => import('src/pages/activity'));
export const RequestsPage = lazy(() => import('src/pages/requests'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const CategorysPage = lazy(() => import('src/pages/category'));
export const CeuPage = lazy(() => import('src/pages/staticpages/ceu'));
export const LeadPage = lazy(() => import('src/pages/leadManagement'));
export const BulkUploadPage = lazy(() => import('src/pages/bulkupload'));
export const GalleryPage = lazy(() => import('src/pages/inspirationGallery'));
export const AboutusPage = lazy(() => import('src/pages/staticpages/about_us'));
export const ProcessPage = lazy(() => import('src/pages/staticpages/our_process'));
export const HomescreenPage = lazy(() => import('src/pages/staticpages/homescreen'));
export const SilicaFirstPage = lazy(() => import('src/pages/staticpages/silica_first'));
export const PrivacyPolicyPage = lazy(() => import('src/pages/staticpages/privacy_policy'));
export const MerchandisePage = lazy(() => import('src/pages/staticpages/merchandise_display'));

export default function Router() {
  const token =
    sessionStorage.getItem('token');

  const user = JSON.parse(
    sessionStorage.getItem('user') || '{}'
  );

  const roleId =
    Number(user?.role_id);

  /* =======================================================
     DEFAULT DASHBOARD PATH

     Role 8 = Requests only
  ======================================================= */

  const defaultDashboardPath =
    roleId === 8
      ? '/dashboard/requests'
      : '/dashboard';

  const routes = useRoutes([
    /* =====================================================
       ROOT
    ===================================================== */

    {
      path: '/',
      element: token ? (
        <Navigate
          to={defaultDashboardPath}
          replace
        />
      ) : (
        <Navigate
          to="/login"
          replace
        />
      ),
    },

    /* =====================================================
       DASHBOARD
    ===================================================== */

    {
      path: '/dashboard',

      element: (
        <ProtectedRoute>
          <DashboardLayout>
            <Suspense
              fallback={
                <div>
                  Loading...
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </ProtectedRoute>
      ),

      children: [
        /* ===============================================
           DEFAULT DASHBOARD PAGE
        =============================================== */

        {
          index: true,

          element:
            roleId === 8 ? (
              <Navigate
                to="/dashboard/requests"
                replace
              />
            ) : (
              <IndexPage />
            ),
        },

        /* ===============================================
           DASHBOARD ROUTES
        =============================================== */

        {
          path: 'user',
          element: <UserPage />,
        },

        {
          path: 'products',
          element: <ProductsPage />,
        },

        {
          path: 'categorys',
          element: <CategorysPage />,
        },

        {
          path: 'reports',
          element: <ReportPage />,
        },

        {
          path: 'activitys',
          element: <ActivityPage />,
        },

        {
          path: 'lookup',
          element: <LookupPage />,
        },

        {
          path: 'company',
          element: <CompanyPage />,
        },

        {
          path: 'blog',
          element: <BlogPage />,
        },

        {
          path: 'socials',
          element: <SocialsPage />,
        },

        {
          path: 'bulk',
          element: <BulkUploadPage />,
        },

        {
          path: 'bulkdesc',
          element: <BulkDescPage />,
        },

        {
          path: 'lead',
          element: <LeadPage />,
        },

        {
          path: 'aboutus',
          element: <AboutusPage />,
        },

        {
          path: 'process',
          element: <ProcessPage />,
        },

        {
          path: 'gallery',
          element: <GalleryPage />,
        },

        {
          path: 'career',
          element: <CareerPage />,
        },

        {
          path: 'merchandise',
          element: <MerchandisePage />,
        },

        {
          path: 'privacypolicy',
          element: <PrivacyPolicyPage />,
        },

        {
          path: 'silicafirst',
          element: <SilicaFirstPage />,
        },

        {
          path: 'ceu',
          element: <CeuPage />,
        },

        {
          path: 'homescreen',
          element: <HomescreenPage />,
        },

        {
          path: 'requests',
          element: <RequestsPage />,
        },
      ],
    },

    /* =====================================================
       LOGIN
    ===================================================== */

    {
      path: '/login',

      element: token ? (
        <Navigate
          to={defaultDashboardPath}
          replace
        />
      ) : (
        <LoginPage />
      ),
    },

    /* =====================================================
       404
    ===================================================== */

    {
      path: '/404',
      element: <Page404 />,
    },

    {
      path: '*',
      element: (
        <Navigate
          to="/404"
          replace
        />
      ),
    },
  ]);

  return routes;
}