import PropTypes from 'prop-types';
import {
  useState,
  useEffect,
} from 'react';

import Box from '@mui/material/Box';

import {
  useRouter,
} from 'src/routes/hooks';

import Nav from './nav';
import Main from './main';
import Header from './header';

// ----------------------------------------------------------------------

export default function DashboardLayout({
  children,
}) {
  const [openNav, setOpenNav] =
    useState(false);

  const router = useRouter();

  /* =========================================================
     AUTO LOGOUT ON TOKEN EXPIRY
  ========================================================= */

useEffect(() => {
  const token =
    sessionStorage.getItem('token');

  if (!token) {
    sessionStorage.clear();
    router.replace('/login');

    return undefined;
  }

  // Auto logout after 25 minutes
  const logoutTimer = setTimeout(() => {
    sessionStorage.clear();

    router.replace('/login');
  }, 25 * 60 * 1000);

  return () => {
    clearTimeout(logoutTimer);
  };
}, [router]);

  /* =========================================================
     LAYOUT
  ========================================================= */

  return (
    <>
      <Header
        onOpenNav={() =>
          setOpenNav(true)
        }
      />

      <Box
        sx={{
          minHeight: 1,

          display: 'flex',

          flexDirection: {
            xs: 'column',
            lg: 'row',
          },
        }}
      >
        <Nav
          openNav={openNav}
          onCloseNav={() =>
            setOpenNav(false)
          }
        />

        <Main>
          {children}
        </Main>
      </Box>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};