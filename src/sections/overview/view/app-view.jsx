import {
  useState,
  useEffect,
} from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Dialog,
  Button,
  Container,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import {
  useRouter,
} from 'src/routes/hooks';

import {
  updateUser,
} from 'src/services/user.service';
import {
  getDashboard,
} from 'src/services/dashboard.service';

import Iconify from 'src/components/iconify';

import AppCurrentVisits from '../app-current-visits';
import AppWidgetSummary from '../app-widget-summary';
import AppOrderTimeline from '../app-order-timeline';
import AppAttentionRequiredProducts from '../app-attention-required-products';

const roleMap = {
  1: 'admin',
  2: 'admin',
  3: 'designer',
  4: 'seo',
  5: 'blog',
};

export default function AppView() {
  const router = useRouter();

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

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

  const user = JSON.parse(
    sessionStorage.getItem('user') ||
      '{}'
  );

  const role =
    roleMap[user?.role_id] ||
    'admin';

  useEffect(() => {
    if (
      user.must_change_password
    ) {
      setOpenPasswordModal(true);
    }
  }, [user.must_change_password]);

  useEffect(() => {
    const fetchDashboard =
      async () => {
        try {
          setLoading(true);

          const response =
            await getDashboard(
              role
            );

          setDashboard(
            response.data
          );
        } catch (error) {
          console.error(
            'Dashboard Error:',
            error
          );
        } finally {
          setLoading(false);
        }
      };

    fetchDashboard();
  }, [role]);

  const handlePasswordChange =
    async () => {
      try {
        await updateUser(
          user.user_id,
          {
            password:
              newPassword,
          }
        );

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
      }
    };

  const handleLogout = () => {
    sessionStorage.clear();

    router.replace('/login');
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '70vh',
          display: 'flex',
          justifyContent:
            'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const summaryCards =
    dashboard?.summaryCards ||
    {};

  return (
    <Container maxWidth={false}>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
        }}
      >
        Dashboard
      </Typography>

      <Grid
        container
        spacing={3}
      >
        {/* SUMMARY CARDS */}

        {Object.entries(
          summaryCards
        ).map(([title, total]) => (
          <Grid
            key={title}
            xs={12}
            sm={6}
            md={3}
          >
            <AppWidgetSummary
              title={title
                .replace(
                  /([A-Z])/g,
                  ' $1'
                )
                .replace(
                  /^./,
                  (text) =>
                    text.toUpperCase()
                )}
              total={total}
            />
          </Grid>
        ))}

        {/* MISSING REPORT */}

        {dashboard?.missingReports && (
          <Grid
            xs={12}
            lg={4}
          >
            <AppCurrentVisits
              title="Missing Content Report"
              chart={{
                series: [
                  {
                    label:
                      'Featured Images',

                    value:
                      dashboard
                        .missingReports
                        .missingFeaturedImages ||
                      0,
                  },
                  {
                    label:
                      'Gallery Images',

                    value:
                      dashboard
                        .missingReports
                        .missingGalleryImages ||
                      0,
                  },
                  {
                    label:
                      'Videos',

                    value:
                      dashboard
                        .missingReports
                        .missingVideos ||
                      0,
                  },
                  {
                    label:
                      'Descriptions',

                    value:
                      dashboard
                        .missingReports
                        .missingLongDescriptions ||
                      0,
                  },
                  {
                    label:
                      'Origin Country',

                    value:
                      dashboard
                        .missingReports
                        .missingOriginCountry ||
                      0,
                  },
                ],
              }}
            />
          </Grid>
        )}

        {/* DAILY ACTIVITY */}

        {dashboard
          ?.dailyActivities
          ?.length > 0 && (
          <Grid
            xs={12}
            lg={8}
          >
            <AppOrderTimeline
              title="Top 5 Recent Activities"
              list={dashboard.dailyActivities.map(
                (
                  item,
                  index
                ) => ({
                  id:
                    item.id ||
                    index,

                  title: `${
                    item.created_by_name ||
                    'System'
                  } - ${
                    item.description ||
                    item.action ||
                    'Activity'
                  }`,

                  type: `order${
                    (index % 5) +
                    1
                  }`,

                  time:
                    item.created_at,
                })
              )}
            />
          </Grid>
        )}

        {/* ATTENTION REQUIRED PRODUCTS */}

        {dashboard
          ?.attentionRequiredProducts && (
          <Grid xs={12}>
            <AppAttentionRequiredProducts
              products={
                dashboard
                  .attentionRequiredProducts
              }
              totalCount={
                dashboard
                  .summaryCards
                  ?.productsRequiringAttention ||
                0
              }
            />
          </Grid>
        )}
      </Grid>

      {/* PASSWORD CHANGE DIALOG */}

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
            value={newPassword}
            onChange={(
              event
            ) =>
              setNewPassword(
                event.target.value
              )
            }
            onKeyDown={(
              event
            ) => {
              if (
                event.key ===
                  'Enter' &&
                newPassword
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
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
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
    </Container>
  );
}