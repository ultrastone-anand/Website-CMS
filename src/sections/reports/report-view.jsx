import { useState, useEffect } from 'react';

import {
  Box,
  Card,
  Grid,
  Stack,
  Table,
  Button,
  Select,
  MenuItem,
  TableRow,
  Container,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  InputLabel,
  FormControl,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { getCategories } from 'src/services/category.service';
import {
  getProductAuditReport,
  getCategoryProductsReport,
} from 'src/services/report.service';

export default function ReportView() {
  const [categories, setCategories] = useState([]);
  const [categorySlug, setCategorySlug] =
    useState('');
  const [reportType, setReportType] =
    useState('product-audit');

  const [loading, setLoading] =
    useState(false);

  const [reportData, setReportData] =
    useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response =
        await getCategories();

      const activeCategories = (
        response?.data || []
      ).filter((cat) => cat.is_active);

      setCategories(activeCategories);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShowReport =
    async () => {
      if (!categorySlug) {
        alert('Please select category');
        return;
      }

      try {
        setLoading(true);

        let response;

        if (
          reportType ===
          'product-audit'
        ) {
          response =
            await getProductAuditReport(
              categorySlug
            );
        } else {
          response =
            await getCategoryProductsReport(
              categorySlug
            );
        }

        setReportData(response);
      } catch (error) {
        console.error(error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

  return (
    <Container maxWidth={false}>
      <Card sx={{ p: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          mb={1}
        >
          Reports
        </Typography>

        <Typography
          color="text.secondary"
          mb={4}
        >
          Generate category reports
        </Typography>

        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>
              Category
            </InputLabel>

            <Select
              value={categorySlug}
              label="Category"
              onChange={(e) =>
                setCategorySlug(
                  e.target.value
                )
              }
            >
              {categories.map(
                (category) => (
                  <MenuItem
                    key={category.id}
                    value={
                      category.slug
                    }
                  >
                    {category.name}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>
              Report Type
            </InputLabel>

            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) =>
                setReportType(
                  e.target.value
                )
              }
            >
              <MenuItem value="product-audit">
                Product Audit Report
              </MenuItem>

              <MenuItem value="category-products">
                Category Products Report
              </MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Button
              variant="contained"
              onClick={
                handleShowReport
              }
              disabled={loading}
            >
              {loading ? (
                <CircularProgress
                  size={22}
                />
              ) : (
                'Generate Report'
              )}
            </Button>
          </Box>
        </Stack>
      </Card>

      {/* PRODUCT AUDIT REPORT */}
      {reportType ===
        'product-audit' &&
        reportData?.data && (
          <>
            <Grid
              container
              spacing={2}
              sx={{ mt: 3 }}
            >
              {Object.entries(
                reportData.data.summary
              ).map(
                ([key, value]) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                    key={key}
                  >
                    <Card
                      sx={{
                        p: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {key
                          .replaceAll(
                            '_',
                            ' '
                          )
                          .toUpperCase()}
                      </Typography>

                      <Typography
                        variant="h5"
                        fontWeight={
                          700
                        }
                      >
                        {value}
                      </Typography>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>

            <Card
              sx={{
                mt: 3,
                p: 2,
              }}
            >
              <Typography
                variant="h6"
                mb={2}
              >
                Product Audit
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Product
                      </TableCell>

                      <TableCell>
                        Slug
                      </TableCell>

                      <TableCell>
                        Completion %
                      </TableCell>

                      <TableCell>
                        Missing Fields
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {reportData.data.products.map(
                      (
                        product
                      ) => (
                        <TableRow
                          key={
                            product.product_id
                          }
                        >
                          <TableCell>
                            {
                              product.name
                            }
                          </TableCell>

                          <TableCell>
                            {
                              product.slug
                            }
                          </TableCell>

                          <TableCell>
                            {
                              product.completion_percentage
                            }
                            %
                          </TableCell>

                          <TableCell>
                            {product.missing_fields.join(
                              ', '
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </>
        )}

      {/* CATEGORY PRODUCTS REPORT */}
      {reportType ===
        'category-products' &&
        reportData?.products && (
          <Card
            sx={{
              mt: 3,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              mb={2}
            >
              Products (
              {
                reportData.total_products
              }
              )
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Name
                    </TableCell>

                    <TableCell>
                      Country
                    </TableCell>

                    <TableCell>
                      Stone Group
                    </TableCell>

                    <TableCell>
                      Featured
                    </TableCell>

                    <TableCell>
                      New
                    </TableCell>

                    <TableCell>
                      Trending
                    </TableCell>

                    <TableCell>
                      Images
                    </TableCell>

                    <TableCell>
                      Videos
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {reportData.products.map(
                    (
                      product
                    ) => (
                      <TableRow
                        key={
                          product.product_id
                        }
                      >
                        <TableCell>
                          {
                            product.name
                          }
                        </TableCell>

                        <TableCell>
                          {product.origin_country ||
                            '-'}
                        </TableCell>

                        <TableCell>
                          {
                            product.stone_group
                          }
                        </TableCell>

                        <TableCell>
                          {product.is_featured
                            ? 'Yes'
                            : 'No'}
                        </TableCell>

                        <TableCell>
                          {product.is_new_arrival
                            ? 'Yes'
                            : 'No'}
                        </TableCell>

                        <TableCell>
                          {product.is_trending
                            ? 'Yes'
                            : 'No'}
                        </TableCell>

                        <TableCell>
                          {
                            product.gallery_image_count
                          }
                        </TableCell>

                        <TableCell>
                          {
                            product.video_count
                          }
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
    </Container>
  );
}