import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Button,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
  LinearProgress,
  TablePagination,
} from '@mui/material';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const priorityConfig = {
  high: {
    label: 'High',
    color: 'error',
  },

  medium: {
    label: 'Medium',
    color: 'warning',
  },

  low: {
    label: 'Low',
    color: 'info',
  },
};

const missingGroupConfig = {
  basic: {
    label: 'Basic',
    color: 'default',
  },

  content: {
    label: 'Content',
    color: 'info',
  },

  specifications: {
    label: 'Specifications',
    color: 'warning',
  },

  media: {
    label: 'Media',
    color: 'error',
  },
};

// ----------------------------------------------------------------------

const getCompletionColor = (percentage) => {
  if (percentage < 40) {
    return 'error';
  }

  if (percentage < 75) {
    return 'warning';
  }

  return 'success';
};

const getMissingBadgeColors = (missingCount) => {
  if (missingCount >= 8) {
    return {
      background: 'error.lighter',
      text: 'error.main',
    };
  }

  if (missingCount >= 4) {
    return {
      background: 'warning.lighter',
      text: 'warning.main',
    };
  }

  return {
    background: 'info.lighter',
    text: 'info.main',
  };
};

const formatFieldName = (field) =>
  String(field || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

const formatDate = (date) => {
  if (!date) {
    return '';
  }

  const parsedDate = new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return '';
  }

  return parsedDate.toLocaleDateString();
};

// Excel worksheet names:
// - Maximum 31 characters
// - Cannot contain: \ / ? * [ ] :
const sanitizeSheetName = (name) => {
  const sanitizedName = String(
    name || 'Uncategorized'
  )
    .replace(/[\\/?*[\]:]/g, ' ')
    .trim()
    .slice(0, 31);

  return sanitizedName || 'Uncategorized';
};

const createUniqueSheetName = (
  requestedName,
  usedNames
) => {
  const baseName =
    sanitizeSheetName(
      requestedName
    );

  let sheetName =
    baseName;

  let suffix = 2;

  while (
    usedNames.has(
      sheetName.toLowerCase()
    )
  ) {
    const suffixText =
      ` ${suffix}`;

    sheetName =
      `${baseName.slice(
        0,
        31 - suffixText.length
      )}${suffixText}`;

    suffix += 1;
  }

  usedNames.add(
    sheetName.toLowerCase()
  );

  return sheetName;
};

const getMissingLabels = (product) => {
  if (
    product.missingFieldLabels
      ?.length
  ) {
    return product
      .missingFieldLabels;
  }

  return (
    product.missingFields ||
    []
  ).map(formatFieldName);
};

const getExcelRow = (product) => {
  const missingLabels =
    getMissingLabels(product);

  const missingGroups =
    product.missingGroups ||
    {};

  const groupSummary =
    Object.entries(
      missingGroups
    )
      .map(
        ([groupName, fields]) =>
          `${formatFieldName(
            groupName
          )}: ${fields.length}`
      )
      .join(', ');

  return {
    'Product Name':
      product.name || '',

    Slug:
      product.slug || '',

    'Product ID':
      product.productId || '',

    Category:
      product.categoryName ||
      'Uncategorized',

    Priority:
      formatFieldName(
        product.priority || 'low'
      ),

    'Completion Percentage':
      Number(
        product.completionPercentage
      ) || 0,

    'Completed Fields':
      Number(
        product.completedCount
      ) || 0,

    'Required Fields':
      Number(
        product.totalRequiredFields
      ) || 0,

    'Missing Count':
      Number(
        product.missingCount
      ) || 0,

    'Missing Groups':
      groupSummary,

    'Missing Fields':
      missingLabels.join(', '),

    Status:
      product.isPublished
        ? 'Published'
        : 'Unpublished',

    'Last Updated':
      formatDate(
        product.updatedAt
      ),
  };
};

const setWorksheetWidths = (
  worksheet
) => {
  worksheet['!cols'] = [
    { wch: 28 },
    { wch: 28 },
    { wch: 38 },
    { wch: 20 },
    { wch: 12 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
    { wch: 35 },
    { wch: 75 },
    { wch: 15 },
    { wch: 15 },
  ];

  worksheet['!autofilter'] = {
    ref: worksheet['!ref'],
  };
};

// ----------------------------------------------------------------------

export default function AppAttentionRequiredProducts({
  products,
  totalCount,
}) {
  const [page, setPage] =
    useState(0);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(10);

  const sortedProducts =
    useMemo(
      () =>
        [...(products || [])].sort(
          (a, b) => {
            const missingDifference =
              (b.missingCount || 0) -
              (a.missingCount || 0);

            if (
              missingDifference !== 0
            ) {
              return missingDifference;
            }

            return (
              (a.completionPercentage ||
                0) -
              (b.completionPercentage ||
                0)
            );
          }
        ),
      [products]
    );

  const visibleProducts =
    useMemo(() => {
      const start =
        page * rowsPerPage;

      return sortedProducts.slice(
        start,
        start + rowsPerPage
      );
    }, [
      page,
      rowsPerPage,
      sortedProducts,
    ]);

  const handleChangePage = (
    event,
    newPage
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event
  ) => {
    setRowsPerPage(
      Number.parseInt(
        event.target.value,
        10
      )
    );

    setPage(0);
  };

  const handleExportExcel = () => {
    try {
      const workbook =
        XLSX.utils.book_new();

      const usedSheetNames =
        new Set();

      // ==========================
      // SUMMARY SHEET
      // ==========================

      const categorySummaryMap =
        new Map();

      sortedProducts.forEach(
        (product) => {
          const categoryName =
            product.categoryName ||
            'Uncategorized';

          if (
            !categorySummaryMap.has(
              categoryName
            )
          ) {
            categorySummaryMap.set(
              categoryName,
              {
                Category:
                  categoryName,

                'Products Requiring Attention':
                  0,

                'Total Missing Fields':
                  0,

                'High Priority':
                  0,

                'Medium Priority':
                  0,

                'Low Priority':
                  0,
              }
            );
          }

          const summary =
            categorySummaryMap.get(
              categoryName
            );

          summary[
            'Products Requiring Attention'
          ] += 1;

          summary[
            'Total Missing Fields'
          ] +=
            Number(
              product.missingCount
            ) || 0;

          if (
            product.priority ===
            'high'
          ) {
            summary[
              'High Priority'
            ] += 1;
          } else if (
            product.priority ===
            'medium'
          ) {
            summary[
              'Medium Priority'
            ] += 1;
          } else {
            summary[
              'Low Priority'
            ] += 1;
          }
        }
      );

      const summaryRows =
        Array.from(
          categorySummaryMap.values()
        ).sort((a, b) =>
          a.Category.localeCompare(
            b.Category
          )
        );

      const summaryWorksheet =
        XLSX.utils.json_to_sheet(
          summaryRows
        );

      summaryWorksheet['!cols'] = [
        { wch: 24 },
        { wch: 30 },
        { wch: 24 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
      ];

      if (
        summaryWorksheet['!ref']
      ) {
        summaryWorksheet[
          '!autofilter'
        ] = {
          ref:
            summaryWorksheet[
              '!ref'
            ],
        };
      }

      XLSX.utils.book_append_sheet(
        workbook,
        summaryWorksheet,
        'Summary'
      );

      usedSheetNames.add(
        'summary'
      );

      // ==========================
      // CATEGORY-WISE SHEETS
      // ==========================

      const productsByCategory =
        sortedProducts.reduce(
          (groups, product) => {
            const categoryName =
              product.categoryName ||
              'Uncategorized';

            if (
              !groups[
                categoryName
              ]
            ) {
              groups[
                categoryName
              ] = [];
            }

            groups[
              categoryName
            ].push(product);

            return groups;
          },
          {}
        );

      Object.entries(
        productsByCategory
      )
        .sort(
          ([categoryA], [
            categoryB,
          ]) =>
            categoryA.localeCompare(
              categoryB
            )
        )
        .forEach(
          ([
            categoryName,
            categoryProducts,
          ]) => {
            const rows =
              categoryProducts.map(
                getExcelRow
              );

            const worksheet =
              XLSX.utils.json_to_sheet(
                rows
              );

            setWorksheetWidths(
              worksheet
            );

            const sheetName =
              createUniqueSheetName(
                categoryName,
                usedSheetNames
              );

            XLSX.utils.book_append_sheet(
              workbook,
              worksheet,
              sheetName
            );
          }
        );

      const date =
        new Date()
          .toISOString()
          .slice(0, 10);

      XLSX.writeFile(
        workbook,
        `attention-required-products-${date}.xlsx`
      );
    } catch (error) {
      console.error(
        'Excel Export Error:',
        error
      );
    }
  };

  if (!products?.length) {
    return (
      <Card
        sx={{
          p: 4,
          textAlign: 'center',
        }}
      >
        <Iconify
          icon="solar:check-circle-bold"
          width={48}
          sx={{
            mb: 2,
            color:
              'success.main',
          }}
        />

        <Typography variant="h6">
          All products are complete
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          No active products currently
          require attention.
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        overflow: 'hidden',
      }}
    >
      {/* HEADER */}

      <Stack
        direction={{
          xs: 'column',
          md: 'row',
        }}
        alignItems={{
          xs: 'flex-start',
          md: 'center',
        }}
        justifyContent="space-between"
        spacing={2}
        sx={{
          px: 3,
          py: 2.5,

          borderBottom: (theme) =>
            `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Typography variant="h6">
              Attention Required Products
            </Typography>

            <Chip
              size="small"
              color="warning"
              label={
                totalCount ??
                products.length
              }
            />
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Products with missing
            information,
            specifications, or media.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={1}
          alignItems={{
            xs: 'stretch',
            sm: 'center',
          }}
          sx={{
            width: {
              xs: '100%',
              md: 'auto',
            },
          }}
        >
          <Chip
            size="small"
            variant="outlined"
            icon={
              <Iconify icon="solar:danger-triangle-bold" />
            }
            label="Highest priority first"
          />

          <Button
            variant="contained"
            color="success"
            startIcon={
              <Iconify icon="vscode-icons:file-type-excel" />
            }
            onClick={
              handleExportExcel
            }
          >
            Export Excel
          </Button>
        </Stack>
      </Stack>

      {/* TABLE */}

      <TableContainer>
        <Table
          sx={{
            minWidth: 1050,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                Product
              </TableCell>

              <TableCell>
                Category
              </TableCell>

              <TableCell>
                Priority
              </TableCell>

              <TableCell
                sx={{
                  minWidth: 180,
                }}
              >
                Completion
              </TableCell>

              <TableCell align="center">
                Missing
              </TableCell>

              <TableCell>
                Missing Details
              </TableCell>

              <TableCell align="center">
                Status
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleProducts.map(
              (product) => {
                const priority =
                  priorityConfig[
                    product.priority
                  ] ||
                  priorityConfig.low;

                const completion =
                  Number(
                    product
                      .completionPercentage
                  ) || 0;

                const missingGroups =
                  product.missingGroups ||
                  {};

                const missingLabels =
                  getMissingLabels(
                    product
                  );

                const missingBadgeColors =
                  getMissingBadgeColors(
                    product.missingCount ||
                      0
                  );

                return (
                  <TableRow
                    key={product.id}
                    hover
                    sx={{
                      '&:last-of-type td':
                        {
                          borderBottom:
                            'none',
                        },
                    }}
                  >
                    {/* PRODUCT */}

                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                        >
                          {product.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {product.slug}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* CATEGORY */}

                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={
                          product.categoryName ||
                          'Uncategorized'
                        }
                      />
                    </TableCell>

                    {/* PRIORITY */}

                    <TableCell>
                      <Chip
                        size="small"
                        color={
                          priority.color
                        }
                        label={
                          priority.label
                        }
                        icon={
                          product.priority ===
                          'high' ? (
                            <Iconify icon="solar:danger-triangle-bold" />
                          ) : undefined
                        }
                      />
                    </TableCell>

                    {/* COMPLETION */}

                    <TableCell>
                      <Stack spacing={0.75}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Typography
                            variant="body2"
                            fontWeight={600}
                          >
                            {completion}%
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {product.completedCount ||
                              0}
                            /
                            {product.totalRequiredFields ||
                              0}
                          </Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={
                            completion
                          }
                          color={getCompletionColor(
                            completion
                          )}
                          sx={{
                            height: 7,
                            borderRadius: 1,
                          }}
                        />
                      </Stack>
                    </TableCell>

                    {/* MISSING COUNT */}

                    <TableCell align="center">
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          mx: 'auto',

                          display:
                            'flex',

                          alignItems:
                            'center',

                          justifyContent:
                            'center',

                          borderRadius:
                            '50%',

                          bgcolor:
                            missingBadgeColors.background,

                          color:
                            missingBadgeColors.text,

                          fontWeight: 700,
                        }}
                      >
                        {product.missingCount ||
                          0}
                      </Box>
                    </TableCell>

                    {/* MISSING DETAILS */}

                    <TableCell
                      sx={{
                        maxWidth: 430,
                      }}
                    >
                      <Stack spacing={1}>
                        {Object.keys(
                          missingGroups
                        ).length > 0 && (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            {Object.entries(
                              missingGroups
                            ).map(
                              ([
                                groupName,
                                fields,
                              ]) => {
                                const config =
                                  missingGroupConfig[
                                    groupName
                                  ] ||
                                  missingGroupConfig.basic;

                                return (
                                  <Chip
                                    key={
                                      groupName
                                    }
                                    size="small"
                                    variant="soft"
                                    color={
                                      config.color
                                    }
                                    label={`${config.label}: ${fields.length}`}
                                  />
                                );
                              }
                            )}
                          </Stack>
                        )}

                        <Tooltip
                          placement="top-start"
                          title={
                            missingLabels.join(
                              ', '
                            ) ||
                            'No missing fields'
                          }
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow:
                                'hidden',

                              display:
                                '-webkit-box',

                              WebkitBoxOrient:
                                'vertical',

                              WebkitLineClamp: 2,
                            }}
                          >
                            {missingLabels.join(
                              ', '
                            )}
                          </Typography>
                        </Tooltip>
                      </Stack>
                    </TableCell>

                    {/* STATUS */}

                    <TableCell align="center">
                      <Stack
                        spacing={0.75}
                        alignItems="center"
                      >
                        <Chip
                          size="small"
                          color={
                            product.isPublished
                              ? 'success'
                              : 'default'
                          }
                          variant={
                            product.isPublished
                              ? 'soft'
                              : 'outlined'
                          }
                          icon={
                            <Iconify
                              icon={
                                product.isPublished
                                  ? 'mdi:web-check'
                                  : 'mdi:web-off'
                              }
                            />
                          }
                          label={
                            product.isPublished
                              ? 'Published'
                              : 'Unpublished'
                          }
                        />

                        {product.updatedAt && (
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            noWrap
                          >
                            Updated{' '}
                            {formatDate(
                              product.updatedAt
                            )}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}

      <TablePagination
        component="div"
        count={
          sortedProducts.length
        }
        page={page}
        onPageChange={
          handleChangePage
        }
        rowsPerPage={
          rowsPerPage
        }
        onRowsPerPageChange={
          handleChangeRowsPerPage
        }
        rowsPerPageOptions={[
          10,
          25,
          50,
          100,
        ]}
        labelRowsPerPage="Products per page:"
        showFirstButton
        showLastButton
        sx={{
          borderTop: (theme) =>
            `1px solid ${theme.palette.divider}`,
        }}
      />
    </Card>
  );
}

AppAttentionRequiredProducts.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,

      productId:
        PropTypes.string,

      name:
        PropTypes.string.isRequired,

      slug:
        PropTypes.string,

      categoryName:
        PropTypes.string,

      priority:
        PropTypes.oneOf([
          'high',
          'medium',
          'low',
        ]),

      completionPercentage:
        PropTypes.number,

      completedCount:
        PropTypes.number,

      totalRequiredFields:
        PropTypes.number,

      missingCount:
        PropTypes.number,

      missingFields:
        PropTypes.arrayOf(
          PropTypes.string
        ),

      missingFieldLabels:
        PropTypes.arrayOf(
          PropTypes.string
        ),

      missingGroups:
        PropTypes.object,

      isPublished:
        PropTypes.bool,

      updatedAt:
        PropTypes.string,
    })
  ),

  totalCount:
    PropTypes.number,
};

AppAttentionRequiredProducts.defaultProps = {
  products: [],
  totalCount: 0,
};