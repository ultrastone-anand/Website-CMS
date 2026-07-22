import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import {
  useMemo,
  useState,
} from 'react';

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
    icon: 'solar:document-text-bold',
  },

  content: {
    label: 'Content',
    color: 'info',
    icon: 'solar:text-square-bold',
  },

  specifications: {
    label: 'Specifications',
    color: 'warning',
    icon: 'solar:settings-bold',
  },

  media: {
    label: 'Media',
    color: 'error',
    icon: 'solar:gallery-bold',
  },
};

const missingFilterOptions = [
  {
    value: 'all',
    label: 'All',
    color: 'default',
    icon: 'solar:list-bold',
  },
  {
    value: 'basic',
    label: 'Basic',
    color: 'default',
    icon: 'solar:document-text-bold',
  },
  {
    value: 'content',
    label: 'Content',
    color: 'info',
    icon: 'solar:text-square-bold',
  },
  {
    value: 'specifications',
    label: 'Specifications',
    color: 'warning',
    icon: 'solar:settings-bold',
  },
  {
    value: 'media',
    label: 'Media',
    color: 'error',
    icon: 'solar:gallery-bold',
  },
];

// ----------------------------------------------------------------------

const getCompletionColor = (
  percentage
) => {
  if (percentage < 40) {
    return 'error';
  }

  if (percentage < 75) {
    return 'warning';
  }

  return 'success';
};

const getMissingBadgeColors = (
  missingCount
) => {
  if (missingCount >= 8) {
    return {
      background:
        'error.lighter',

      text:
        'error.main',
    };
  }

  if (missingCount >= 4) {
    return {
      background:
        'warning.lighter',

      text:
        'warning.main',
    };
  }

  return {
    background:
      'info.lighter',

    text:
      'info.main',
  };
};

const formatFieldName = (
  field
) =>
  String(field || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

const formatDate = (
  date
) => {
  if (!date) {
    return '';
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return '';
  }

  return parsedDate.toLocaleDateString();
};

const formatDateTime = (
  date
) => {
  if (!date) {
    return '';
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return '';
  }

  return parsedDate.toLocaleString();
};

const productHasMissingGroup = (
  product,
  groupName
) => {
  if (groupName === 'all') {
    return true;
  }

  const groupFields =
    product.missingGroups?.[
      groupName
    ];

  return (
    Array.isArray(groupFields) &&
    groupFields.length > 0
  );
};

// ----------------------------------------------------------------------
// EXCEL HELPERS
// ----------------------------------------------------------------------

const sanitizeSheetName = (
  name
) => {
  const sanitizedName =
    String(
      name ||
        'Uncategorized'
    )
      .replace(
        /[\\/?*[\]:]/g,
        ' '
      )
      .trim()
      .slice(0, 31);

  return (
    sanitizedName ||
    'Uncategorized'
  );
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
        31 -
          suffixText.length
      )}${suffixText}`;

    suffix += 1;
  }

  usedNames.add(
    sheetName.toLowerCase()
  );

  return sheetName;
};

const getMissingLabels = (
  product
) => {
  if (
    product
      .missingFieldLabels
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

const getRemarks = (
  product
) =>
  Array.isArray(
    product.remarks
  )
    ? product.remarks
    : [];

const getAllRemarksText = (
  product
) => {
  const remarks =
    getRemarks(product);

  return remarks
    .map((remark, index) => {
      const author =
        remark.user?.name ||
        remark.user?.email ||
        'Unknown User';

      const date =
        formatDateTime(
          remark.createdAt
        );

      const edited =
        remark.isEdited
          ? ' (Edited)'
          : '';

      return `${index + 1}. ${remark.remark || ''} — ${author}${date ? ` — ${date}` : ''}${edited}`;
    })
    .join('\n');
};

const getExcelRow = (
  product
) => {
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
        ([
          groupName,
          fields,
        ]) =>
          `${formatFieldName(
            groupName
          )}: ${
            Array.isArray(fields)
              ? fields.length
              : 0
          }`
      )
      .join(', ');

  const latestRemark =
    product.latestRemark ||
    null;

  const remarks =
    getRemarks(product);

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
        product.priority ||
          'low'
      ),

    'Completion Percentage':
      Number(
        product
          .completionPercentage
      ) || 0,

    'Completed Fields':
      Number(
        product.completedCount
      ) || 0,

    'Required Fields':
      Number(
        product
          .totalRequiredFields
      ) || 0,

    'Missing Count':
      Number(
        product.missingCount
      ) || 0,

    'Missing Groups':
      groupSummary,

    'Missing Fields':
      missingLabels.join(', '),

    'Remarks Count':
      Number(
        product.remarksCount
      ) || remarks.length,

    'Latest Remark':
      latestRemark?.remark ||
      '',

    'Latest Remark By':
      latestRemark?.user
        ?.name ||
      latestRemark?.user
        ?.email ||
      '',

    'Latest Remark Date':
      formatDateTime(
        latestRemark?.createdAt
      ),

    'All Remarks':
      getAllRemarksText(
        product
      ),

    Status:
      product.isPublished
        ? 'Published'
        : 'Unpublished',

    'Last Product Update':
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
    { wch: 65 },
    { wch: 24 },
    { wch: 22 },
    { wch: 100 },
    { wch: 15 },
    { wch: 20 },
  ];

  if (
    worksheet['!ref']
  ) {
    worksheet[
      '!autofilter'
    ] = {
      ref:
        worksheet[
          '!ref'
        ],
    };
  }
};

// ----------------------------------------------------------------------

export default function AppAttentionRequiredProducts({
  products,
  totalCount,
}) {
  const [
    page,
    setPage,
  ] = useState(0);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(10);

  const [
    selectedMissingGroup,
    setSelectedMissingGroup,
  ] = useState('all');

  const filterCounts =
    useMemo(() => {
      const counts = {
        all:
          products?.length ||
          0,

        basic: 0,
        content: 0,
        specifications: 0,
        media: 0,
      };

      (
        products || []
      ).forEach((product) => {
        Object.keys(
          missingGroupConfig
        ).forEach(
          (groupName) => {
            if (
              productHasMissingGroup(
                product,
                groupName
              )
            ) {
              counts[
                groupName
              ] += 1;
            }
          }
        );
      });

      return counts;
    }, [products]);

  const filteredProducts =
    useMemo(
      () =>
        (
          products || []
        ).filter((product) =>
          productHasMissingGroup(
            product,
            selectedMissingGroup
          )
        ),
      [
        products,
        selectedMissingGroup,
      ]
    );

  const sortedProducts =
    useMemo(
      () =>
        [
          ...filteredProducts,
        ].sort((a, b) => {
          const missingDifference =
            (b.missingCount ||
              0) -
            (a.missingCount ||
              0);

          if (
            missingDifference !==
            0
          ) {
            return missingDifference;
          }

          const remarkDifference =
            (b.remarksCount ||
              0) -
            (a.remarksCount ||
              0);

          if (
            remarkDifference !==
            0
          ) {
            return remarkDifference;
          }

          return (
            (a.completionPercentage ||
              0) -
            (b.completionPercentage ||
              0)
          );
        }),
      [filteredProducts]
    );

  const visibleProducts =
    useMemo(() => {
      const start =
        page *
        rowsPerPage;

      return sortedProducts.slice(
        start,
        start +
          rowsPerPage
      );
    }, [
      page,
      rowsPerPage,
      sortedProducts,
    ]);

  const selectedFilter =
    missingFilterOptions.find(
      (option) =>
        option.value ===
        selectedMissingGroup
    ) ||
    missingFilterOptions[0];

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

  const handleMissingGroupFilter = (
    groupName
  ) => {
    setSelectedMissingGroup(
      groupName
    );

    setPage(0);
  };

  const handleExportExcel =
    () => {
      try {
        if (
          sortedProducts.length ===
          0
        ) {
          return;
        }

        const workbook =
          XLSX.utils.book_new();

        const usedSheetNames =
          new Set();

        // ==========================
        // FILTER INFORMATION SHEET
        // ==========================

        const filterInformationRows =
          [
            {
              Field:
                'Selected Missing Section',

              Value:
                selectedFilter.label,
            },
            {
              Field:
                'Exported Products',

              Value:
                sortedProducts.length,
            },
            {
              Field:
                'Export Date',

              Value:
                formatDateTime(
                  new Date()
                ),
            },
          ];

        const filterWorksheet =
          XLSX.utils.json_to_sheet(
            filterInformationRows
          );

        filterWorksheet[
          '!cols'
        ] = [
          { wch: 30 },
          { wch: 40 },
        ];

        XLSX.utils.book_append_sheet(
          workbook,
          filterWorksheet,
          'Export Information'
        );

        usedSheetNames.add(
          'export information'
        );

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

                  'Products With Remarks':
                    0,

                  'Total Remarks':
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

            const remarksCount =
              Number(
                product.remarksCount
              ) ||
              getRemarks(
                product
              ).length;

            summary[
              'Total Remarks'
            ] +=
              remarksCount;

            if (
              remarksCount > 0
            ) {
              summary[
                'Products With Remarks'
              ] += 1;
            }

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

        summaryWorksheet[
          '!cols'
        ] = [
          { wch: 24 },
          { wch: 30 },
          { wch: 24 },
          { wch: 24 },
          { wch: 18 },
          { wch: 18 },
          { wch: 18 },
          { wch: 18 },
        ];

        if (
          summaryWorksheet[
            '!ref'
          ]
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
            (
              groups,
              product
            ) => {
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
            ([
              categoryA,
            ], [
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

        // ==========================
        // ALL REMARKS SHEET
        // ==========================

        const allRemarkRows =
          [];

        sortedProducts.forEach(
          (product) => {
            const remarks =
              getRemarks(
                product
              );

            remarks.forEach(
              (remark) => {
                allRemarkRows.push({
                  'Product Name':
                    product.name ||
                    '',

                  Slug:
                    product.slug ||
                    '',

                  Category:
                    product.categoryName ||
                    'Uncategorized',

                  Remark:
                    remark.remark ||
                    '',

                  'Remark By':
                    remark.user
                      ?.name ||
                    remark.user
                      ?.email ||
                    'Unknown User',

                  Email:
                    remark.user
                      ?.email ||
                    '',

                  Edited:
                    remark.isEdited
                      ? 'Yes'
                      : 'No',

                  'Created At':
                    formatDateTime(
                      remark.createdAt
                    ),

                  'Updated At':
                    formatDateTime(
                      remark.updatedAt
                    ),
                });
              }
            );
          }
        );

        if (
          allRemarkRows.length >
          0
        ) {
          const remarksWorksheet =
            XLSX.utils.json_to_sheet(
              allRemarkRows
            );

          remarksWorksheet[
            '!cols'
          ] = [
            { wch: 28 },
            { wch: 28 },
            { wch: 20 },
            { wch: 90 },
            { wch: 24 },
            { wch: 30 },
            { wch: 12 },
            { wch: 24 },
            { wch: 24 },
          ];

          if (
            remarksWorksheet[
              '!ref'
            ]
          ) {
            remarksWorksheet[
              '!autofilter'
            ] = {
              ref:
                remarksWorksheet[
                  '!ref'
                ],
            };
          }

          XLSX.utils.book_append_sheet(
            workbook,
            remarksWorksheet,
            'All Remarks'
          );
        }

        const date =
          new Date()
            .toISOString()
            .slice(0, 10);

        const filterFileName =
          selectedMissingGroup ===
          'all'
            ? 'all'
            : selectedMissingGroup;

        XLSX.writeFile(
          workbook,
          `attention-required-${filterFileName}-${date}.xlsx`
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
          textAlign:
            'center',
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
        spacing={2}
        sx={{
          px: 3,
          py: 2.5,

          borderBottom:
            (theme) =>
              `1px solid ${theme.palette.divider}`,
        }}
      >
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
                  selectedMissingGroup ===
                  'all'
                    ? totalCount ??
                      products.length
                    : sortedProducts.length
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
              specifications, media,
              content, or pending
              remarks.
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
              disabled={
                sortedProducts.length ===
                0
              }
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

        {/* MISSING SECTION FILTERS */}

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mb: 1,
              fontWeight: 600,
            }}
          >
            Filter by missing section
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            {missingFilterOptions.map(
              (option) => {
                const isSelected =
                  selectedMissingGroup ===
                  option.value;

                const count =
                  filterCounts[
                    option.value
                  ] || 0;

                return (
                  <Chip
                    key={
                      option.value
                    }
                    clickable
                    icon={
                      <Iconify
                        icon={
                          option.icon
                        }
                        width={18}
                      />
                    }
                    label={`${option.label} (${count})`}
                    color={
                      isSelected
                        ? option.color
                        : 'default'
                    }
                    variant={
                      isSelected
                        ? 'filled'
                        : 'outlined'
                    }
                    onClick={() =>
                      handleMissingGroupFilter(
                        option.value
                      )
                    }
                    sx={{
                      fontWeight:
                        isSelected
                          ? 700
                          : 500,

                      ...(isSelected &&
                      option.value ===
                        'all'
                        ? {
                            bgcolor:
                              'text.primary',

                            color:
                              'background.paper',

                            '& .MuiChip-icon':
                              {
                                color:
                                  'inherit',
                              },
                          }
                        : {}),
                    }}
                  />
                );
              }
            )}
          </Stack>
        </Box>
      </Stack>

      {/* ACTIVE FILTER INFORMATION */}

      {selectedMissingGroup !==
        'all' && (
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          alignItems={{
            xs: 'flex-start',
            sm: 'center',
          }}
          justifyContent="space-between"
          spacing={1}
          sx={{
            px: 3,
            py: 1.5,
            bgcolor:
              'background.neutral',

            borderBottom:
              (theme) =>
                `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Iconify
              icon={
                selectedFilter.icon
              }
              width={20}
              sx={{
                color: `${selectedFilter.color}.main`,
              }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Showing products with
              missing{' '}
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                  color:
                    'text.primary',
                }}
              >
                {selectedFilter.label}
              </Box>{' '}
              fields.
            </Typography>

            <Chip
              size="small"
              color={
                selectedFilter.color
              }
              variant="soft"
              label={`${sortedProducts.length} products`}
            />
          </Stack>

          <Button
            size="small"
            color="inherit"
            startIcon={
              <Iconify icon="solar:close-circle-outline" />
            }
            onClick={() =>
              handleMissingGroupFilter(
                'all'
              )
            }
          >
            Clear filter
          </Button>
        </Stack>
      )}

      {/* TABLE */}

      {sortedProducts.length >
      0 ? (
        <>
          <TableContainer>
            <Table
              sx={{
                minWidth: 1350,
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

                  <TableCell
                    sx={{
                      minWidth: 280,
                    }}
                  >
                    Latest Remark
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

                    const remarks =
                      getRemarks(
                        product
                      );

                    const latestRemark =
                      product.latestRemark ||
                      remarks[0] ||
                      null;

                    const remarksCount =
                      Number(
                        product.remarksCount
                      ) ||
                      remarks.length;

                    return (
                      <TableRow
                        key={
                          product.id
                        }
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

                              fontWeight:
                                700,
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
                            ).length >
                              0 && (
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

                                    const isActiveGroup =
                                      selectedMissingGroup ===
                                      groupName;

                                    return (
                                      <Chip
                                        key={
                                          groupName
                                        }
                                        size="small"
                                        variant={
                                          isActiveGroup
                                            ? 'filled'
                                            : 'soft'
                                        }
                                        color={
                                          config.color
                                        }
                                        label={`${config.label}: ${
                                          Array.isArray(
                                            fields
                                          )
                                            ? fields.length
                                            : 0
                                        }`}
                                        sx={{
                                          fontWeight:
                                            isActiveGroup
                                              ? 700
                                              : 500,
                                        }}
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

                        {/* REMARKS */}

                        <TableCell>
                          {latestRemark ? (
                            <Tooltip
                              placement="top-start"
                              title={
                                <Box
                                  sx={{
                                    whiteSpace:
                                      'pre-line',
                                    maxWidth:
                                      450,
                                  }}
                                >
                                  {getAllRemarksText(
                                    product
                                  )}
                                </Box>
                              }
                            >
                              <Stack spacing={0.75}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    overflow:
                                      'hidden',

                                    display:
                                      '-webkit-box',

                                    WebkitBoxOrient:
                                      'vertical',

                                    WebkitLineClamp:
                                      2,
                                  }}
                                >
                                  {
                                    latestRemark.remark
                                  }
                                </Typography>

                                <Stack
                                  direction="row"
                                  spacing={0.75}
                                  flexWrap="wrap"
                                  alignItems="center"
                                  useFlexGap
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {latestRemark
                                      .user
                                      ?.name ||
                                      latestRemark
                                        .user
                                        ?.email ||
                                      'Unknown User'}
                                  </Typography>

                                  {remarksCount >
                                    1 && (
                                    <Chip
                                      size="small"
                                      variant="outlined"
                                      label={`${remarksCount} remarks`}
                                    />
                                  )}

                                  {latestRemark.isEdited && (
                                    <Chip
                                      size="small"
                                      color="info"
                                      variant="soft"
                                      label="Edited"
                                    />
                                  )}
                                </Stack>

                                {latestRemark.createdAt && (
                                  <Typography
                                    variant="caption"
                                    color="text.disabled"
                                  >
                                    {formatDateTime(
                                      latestRemark.createdAt
                                    )}
                                  </Typography>
                                )}
                              </Stack>
                            </Tooltip>
                          ) : (
                            <Stack
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                            >
                              <Iconify
                                icon="solar:chat-round-line-outline"
                                width={18}
                                sx={{
                                  color:
                                    'text.disabled',
                                }}
                              />

                              <Typography
                                variant="body2"
                                color="text.disabled"
                              >
                                No remarks
                              </Typography>
                            </Stack>
                          )}
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
              borderTop:
                (theme) =>
                  `1px solid ${theme.palette.divider}`,
            }}
          />
        </>
      ) : (
        <Stack
          spacing={1.5}
          alignItems="center"
          justifyContent="center"
          sx={{
            minHeight: 300,
            px: 3,
            py: 6,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',

              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'center',

              bgcolor:
                'background.neutral',
            }}
          >
            <Iconify
              icon={
                selectedFilter.icon
              }
              width={32}
              sx={{
                color:
                  'text.secondary',
              }}
            />
          </Box>

          <Typography variant="h6">
            No products found
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 420,
            }}
          >
            No products currently have
            missing{' '}
            {selectedFilter.label.toLowerCase()}{' '}
            information.
          </Typography>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={
              <Iconify icon="solar:list-bold" />
            }
            onClick={() =>
              handleMissingGroupFilter(
                'all'
              )
            }
          >
            Show all products
          </Button>
        </Stack>
      )}
    </Card>
  );
}

AppAttentionRequiredProducts.propTypes = {
  products:
    PropTypes.arrayOf(
      PropTypes.shape({
        id:
          PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
          ]).isRequired,

        productId:
          PropTypes.string,

        name:
          PropTypes.string
            .isRequired,

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
          PropTypes.objectOf(
            PropTypes.arrayOf(
              PropTypes.string
            )
          ),

        isPublished:
          PropTypes.bool,

        updatedAt:
          PropTypes.string,

        remarksCount:
          PropTypes.number,

        latestRemark:
          PropTypes.shape({
            id:
              PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
              ]),

            remark:
              PropTypes.string,

            isEdited:
              PropTypes.bool,

            createdAt:
              PropTypes.string,

            updatedAt:
              PropTypes.string,

            user:
              PropTypes.shape({
                id:
                  PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.number,
                  ]),

                name:
                  PropTypes.string,

                email:
                  PropTypes.string,
              }),
          }),

        remarks:
          PropTypes.arrayOf(
            PropTypes.shape({
              id:
                PropTypes.oneOfType([
                  PropTypes.string,
                  PropTypes.number,
                ]),

              remark:
                PropTypes.string,

              isEdited:
                PropTypes.bool,

              createdAt:
                PropTypes.string,

              updatedAt:
                PropTypes.string,

              user:
                PropTypes.shape({
                  id:
                    PropTypes.oneOfType([
                      PropTypes.string,
                      PropTypes.number,
                    ]),

                  name:
                    PropTypes.string,

                  email:
                    PropTypes.string,
                }),
            })
          ),
      })
    ),

  totalCount:
    PropTypes.number,
};

AppAttentionRequiredProducts.defaultProps = {
  products: [],
  totalCount: 0,
};