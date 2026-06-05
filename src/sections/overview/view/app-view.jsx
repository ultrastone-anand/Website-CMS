import { useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Container,
  Typography,
  CircularProgress,
} from '@mui/material';

import { getDashboard } from 'src/services/dashboard.service';

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

  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const role = roleMap[user?.role_id] || 'admin';


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
    </Container>
  );
}