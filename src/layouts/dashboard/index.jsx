import PropTypes from 'prop-types';
import {
  useState,
  useEffect,
} from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';

import {
  useRouter,
} from 'src/routes/hooks';

import {
  updateUser,
} from 'src/services/user.service';

import Iconify from 'src/components/iconify';

import Nav from './nav';
import Main from './main';
import Header from './header';

// ----------------------------------------------------------------------

export default function DashboardLayout({
  children,
}) {
  /* =========================================================
     STATES
  ========================================================= */

  const [
    openNav,
    setOpenNav,
  ] = useState(false);

  const [
    openPasswordModal,
    setOpenPasswordModal,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    newPassword,
    setNewPassword,
  ] = useState('');

  const [
    openSessionWarning,
    setOpenSessionWarning,
  ] = useState(false);

  const router = useRouter();

  /* =========================================================
     GET LOGGED-IN USER
  ========================================================= */

  const user = JSON.parse(
    sessionStorage.getItem('user') ||
      '{}'
  );

  /* =========================================================
     FORCE PASSWORD CHANGE
  ========================================================= */

  useEffect(() => {
    if (
      user?.must_change_password ===
      true
    ) {
      setOpenPasswordModal(true);
    }
  }, [user?.must_change_password]);

  /* =========================================================
     AUTO LOGOUT + SESSION EXPIRATION WARNING
  ========================================================= */

  useEffect(() => {
    const token =
      sessionStorage.getItem('token');

    if (!token) {
      sessionStorage.clear();

      router.replace('/login');

      return undefined;
    }

    /* ===============================================
       SESSION CONFIGURATION
    =============================================== */

    // Total session duration: 25 minutes
    const SESSION_DURATION =
      25 * 60 * 1000;

    // Warning before expiration: 3 minutes
    const WARNING_BEFORE =
      3 * 60 * 1000;

    /* ===============================================
       SESSION WARNING TIMER
    =============================================== */

    // Show warning after 22 minutes
    const warningTimer = setTimeout(() => {
      setOpenSessionWarning(true);
    }, SESSION_DURATION - WARNING_BEFORE);

    /* ===============================================
       AUTOMATIC LOGOUT TIMER
    =============================================== */

    // Automatically logout after 25 minutes
    const logoutTimer = setTimeout(() => {
      sessionStorage.clear();

      setOpenSessionWarning(false);

      router.replace('/login');
    }, SESSION_DURATION);

    /* ===============================================
       CLEANUP TIMERS
    =============================================== */

    return () => {
      clearTimeout(warningTimer);

      clearTimeout(logoutTimer);
    };
  }, [router]);

  /* =========================================================
     CHANGE PASSWORD
  ========================================================= */

  const handlePasswordChange =
    async () => {
      try {
        const password =
          newPassword.trim();

        if (!password) {
          return;
        }

        await updateUser(
          user.user_id,
          {
            password,
          }
        );

        /* ===============================================
           UPDATE SESSION USER
        =============================================== */

        const updatedUser = {
          ...user,

          must_change_password:
            false,
        };

        sessionStorage.setItem(
          'user',
          JSON.stringify(
            updatedUser
          )
        );

        setOpenPasswordModal(false);

        setNewPassword('');

        alert(
          'Password changed successfully'
        );
      } catch (error) {
        console.error(
          'Password Update Error:',
          error
        );

        alert(
          error?.message ||
            'Failed to update password'
        );
      }
    };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    sessionStorage.clear();

    setOpenSessionWarning(false);

    router.replace('/login');
  };

  /* =========================================================
     LAYOUT
  ========================================================= */

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header
        onOpenNav={() =>
          setOpenNav(true)
        }
      />

      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

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

      {/* =====================================================
          FORCE PASSWORD CHANGE DIALOG
      ===================================================== */}

      <Dialog
        open={openPasswordModal}
        disableEscapeKeyDown
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Change Password
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            margin="normal"
            label="New Password"
            type={
              showPassword
                ? 'text'
                : 'password'
            }
            value={newPassword}
            onChange={(event) => {
              setNewPassword(
                event.target.value
              );
            }}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                newPassword.trim()
              ) {
                handlePasswordChange();
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    onClick={() => {
                      setShowPassword(
                        (previous) =>
                          !previous
                      );
                    }}
                  >
                    <Iconify
                      icon={
                        showPassword
                          ? 'eva:eye-fill'
                          : 'eva:eye-off-fill'
                      }
                    />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={
              !newPassword.trim()
            }
          >
            Update Password
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* =====================================================
          SESSION EXPIRATION WARNING DIALOG
      ===================================================== */}

      <Dialog
        open={openSessionWarning}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Iconify
            icon="eva:alert-triangle-fill"
            sx={{
              color: 'warning.main',
              width: 26,
              height: 26,
            }}
          />

          Session Expiring Soon
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              color: 'text.secondary',
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Your session will expire in
            approximately 3 minutes due
            to token expiration.

            <br />
            <br />

            Please log in again to
            continue working without
            interruption.
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            gap: 1,
          }}
        >
          {/* ===============================================
              DISMISS WARNING
          =============================================== */}

          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              setOpenSessionWarning(false);
            }}
          >
            Okay
          </Button>

          {/* ===============================================
              RELOGIN
          =============================================== */}

          <Button
            variant="contained"
            color="primary"
            onClick={handleLogout}
            startIcon={
              <Iconify icon="eva:log-in-fill" />
            }
          >
            Relogin
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};