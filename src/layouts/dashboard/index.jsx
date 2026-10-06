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
  const [openNav, setOpenNav] =
    useState(false);

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
     AUTO LOGOUT
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
    const logoutTimer =
      setTimeout(() => {
        sessionStorage.clear();

        router.replace('/login');
      }, 25 * 60 * 1000);

    return () => {
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

        setOpenPasswordModal(
          false
        );

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

    router.replace('/login');
  };

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

      {/* =====================================================
          FORCE PASSWORD CHANGE DIALOG
      ===================================================== */}

      <Dialog
        open={
          openPasswordModal
        }
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
            value={
              newPassword
            }
            onChange={(
              event
            ) => {
              setNewPassword(
                event.target.value
              );
            }}
            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                  'Enter' &&
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
            onClick={
              handlePasswordChange
            }
            disabled={
              !newPassword.trim()
            }
          >
            Update Password
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={
              handleLogout
            }
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};