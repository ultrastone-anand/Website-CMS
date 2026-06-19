import { useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Card,
  Table,
  Dialog,
  Button,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
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

import { useRouter } from 'src/routes/hooks';

import { updateUser } from 'src/services/user.service';
import { getDashboard } from 'src/services/dashboard.service';

import Iconify from 'src/components/iconify';

import AppCurrentVisits from '../app-current-visits';
import AppWidgetSummary from '../app-widget-summary';
import AppOrderTimeline from '../app-order-timeline';

  const roleMap = {
    1: 'admin',
    2: 'admin',
    3: 'designer',
    4: 'seo',
    5: 'blog',
  };
export default function AppView() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openPasswordModal, setOpenPasswordModal] =useState(false);
  const [showPassword, setShowPassword] =useState(false);
  const [newPassword, setNewPassword] =useState('');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const role = roleMap[user?.role_id] || 'admin';

  const router = useRouter();

  useEffect(() => {
    if (user.must_change_password) {
      setOpenPasswordModal(true);
    }
  }, [user.must_change_password]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboard(role);
        setDashboard(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [role]);

  if (loading) {
    return (
      <Box
        sx={{
          height: '70vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const summaryCards = dashboard?.summaryCards || {};


const handlePasswordChange = async () => {
  try {
    await updateUser(
      user.user_id,
      {
        password: newPassword,
      }
    );

    const updatedUser = {
      ...user,
      must_change_password: false,
    };

    sessionStorage.setItem(
      'user',
      JSON.stringify(updatedUser)
    );

    setOpenPasswordModal(false);

    alert(
      'Password changed successfully'
    );
  } catch (error) {
    console.error(error);
  }
};

const handleLogout = () => {
  sessionStorage.clear();


  router.replace('/login');
};

  return (
    <Container maxWidth={false}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* SUMMARY CARDS */}

        {Object.entries(summaryCards).map(([title, total]) => (
          <Grid key={title} xs={12} sm={6} md={3}>
            <AppWidgetSummary
              title={title
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())}
              total={total}
            />
          </Grid>
        ))}

        {/* MISSING REPORTS */}

        {dashboard?.missingReports && (
          <Grid xs={12} lg={4}>
            <AppCurrentVisits
              title="Missing Content Report"
              chart={{
                series: [
                  {
                    label: 'Featured Images',
                    value:
                      dashboard.missingReports
                        .missingFeaturedImages,
                  },
                  {
                    label: 'Gallery Images',
                    value:
                      dashboard.missingReports
                        .missingGalleryImages,
                  },
                  {
                    label: 'Videos',
                    value:
                      dashboard.missingReports
                        .missingVideos,
                  },
                  {
                    label: 'Descriptions',
                    value:
                      dashboard.missingReports
                        .missingLongDescriptions,
                  },
                  {
                    label: 'Origin Country',
                    value:
                      dashboard.missingReports
                        .missingOriginCountry,
                  },
                ],
              }}
            />
          </Grid>
        )}

        {/* DAILY ACTIVITY */}

        {dashboard?.dailyActivities?.length > 0 && (
          <Grid xs={12} lg={8}>
            <AppOrderTimeline
              title="Top 5 Recent Activities"
              list={dashboard.dailyActivities.map(
                (item, index) => ({
                  id: item.id || index,
                  title: `${item.created_by_name || 'System'} - ${
                    item.description ||
                    item.action ||
                    'Activity'
                  }`,
                  type: `order${(index % 5) + 1}`,
                  time: item.created_at,
                })
              )}
            />
          </Grid>
        )}

        {/* ATTENTION REQUIRED PRODUCTS */}

        {dashboard?.attentionRequiredProducts?.length > 0 && (
          <Grid xs={12}>
            <Card sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ mb: 3 }}
              >
                Attention Required Products
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Product Name
                    </TableCell>

                    <TableCell align="center">
                      Missing Count
                    </TableCell>

                    <TableCell>
                      Missing Fields
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {dashboard.attentionRequiredProducts.map(
                    (product) => (
                      <TableRow
                        key={product.id}
                        hover
                      >
                        <TableCell>
                          {product.name}
                        </TableCell>

                        <TableCell align="center">
                          <Typography
                            color={
                              product.missingCount >= 5
                                ? 'error.main'
                                : 'warning.main'
                            }
                            fontWeight={700}
                          >
                            {product.missingCount}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {product.missingFields.join(
                            ', '
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </Card>
          </Grid>
        )}
      </Grid>

      <Dialog
  open={openPasswordModal}
  disableEscapeKeyDown
>
  <DialogTitle>
    Change Password
  </DialogTitle>

  <DialogContent>
<TextField
  fullWidth
  margin="normal"
  label="New Password"
  type={
    showPassword
      ? 'text'
      : 'password'
  }
  value={newPassword}
  onChange={(e) =>
    setNewPassword(
      e.target.value
    )
  }
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={() =>
            setShowPassword(
              !showPassword
            )
          }
          edge="end"
        >
          {showPassword ? (
            <Iconify icon="eva:eye-fill" />
          ) : (
            <Iconify icon="eva:eye-off-fill" />
          )}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>
  </DialogContent>

  <DialogActions>
    <Button
      variant="contained"
      onClick={
        handlePasswordChange
      }
      disabled={!newPassword}
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