import { useState } from 'react';

import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Alert,
  Button,
  Select,
  MenuItem,
  TableRow,
  Container,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import {
  getCeuRequests,
  getSampleRequests,
  getDisplayRequests,
  downloadCeuRequests,
  downloadSampleRequests,
  downloadDisplayRequests,
} from 'src/services/requests.service';

import Iconify from 'src/components/iconify';

/* =========================================================
   REPORT TYPES
========================================================= */

const REPORT_TYPES = [
  {
    value: 'ceu',
    label: 'CEU Requests',
    description:
      'Continuing Education course requests',
    icon: 'solar:diploma-bold-duotone',
  },
  {
    value: 'display',
    label: 'Display Requests',
    description:
      'Merchandising display requests',
    icon: 'solar:shop-2-bold-duotone',
  },
  {
    value: 'samples',
    label: 'Sample Requests',
    description:
      'Product sample requests',
    icon: 'solar:box-bold-duotone',
  },
];

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );
};

/* =========================================================
   FORMAT DATE TIME
========================================================= */

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }
  );
};

/* =========================================================
   REQUESTS VIEW
========================================================= */

export default function RequestsView() {
  const [reportType, setReportType] =
    useState('ceu');

  const [fromDate, setFromDate] =
    useState('');

  const [toDate, setToDate] =
    useState('');

  const [reportData, setReportData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [
    downloading,
    setDownloading,
  ] = useState(false);

  const [error, setError] =
    useState('');

  /* =======================================================
     CURRENT REPORT
  ======================================================= */

  const currentReport =
    REPORT_TYPES.find(
      (item) =>
        item.value === reportType
    );

  /* =======================================================
     NORMALIZE ROWS
  ======================================================= */

  let rows = [];

  if (
    Array.isArray(
      reportData?.data
    )
  ) {
    rows =
      reportData.data;
  } else if (
    Array.isArray(reportData)
  ) {
    rows =
      reportData;
  }

  /* =======================================================
     VALIDATE DATE
  ======================================================= */

  const validateDates = () => {
    if (
      fromDate &&
      toDate &&
      fromDate > toDate
    ) {
      setError(
        'From date cannot be after To date.'
      );

      return false;
    }

    return true;
  };

  /* =======================================================
     SHOW REPORT
  ======================================================= */

  const handleShowReport =
    async () => {
      if (!validateDates()) {
        return;
      }

      try {
        setLoading(true);
        setError('');
        setReportData(null);

        const filters = {
          fromDate,
          toDate,
        };

        /* ===============================
           CEU
        =============================== */

        if (
          reportType === 'ceu'
        ) {
          const response =
            await getCeuRequests(
              filters
            );

          setReportData(
            response
          );

          return;
        }

        /* ===============================
           DISPLAY
        =============================== */

        if (
          reportType ===
          'display'
        ) {
          const response =
            await getDisplayRequests(
              filters
            );

          setReportData(
            response
          );

          return;
        }

        /* ===============================
           SAMPLES
        =============================== */

        if (
          reportType ===
          'samples'
        ) {
          const response =
            await getSampleRequests(
              filters
            );

          setReportData(
            response
          );
        }
      } catch (err) {
        console.error(
          'Report error:',
          err
        );

        setError(
          err.message ||
            'Failed to load report.'
        );
      } finally {
        setLoading(false);
      }
    };

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  const handleDownload =
    async () => {
      if (!validateDates()) {
        return;
      }

      try {
        setDownloading(true);
        setError('');

        const filters = {
          fromDate,
          toDate,
        };

        /* ===============================
           CEU
        =============================== */

        if (
          reportType === 'ceu'
        ) {
          await downloadCeuRequests(
            filters
          );

          return;
        }

        /* ===============================
           DISPLAY
        =============================== */

        if (
          reportType ===
          'display'
        ) {
          await downloadDisplayRequests(
            filters
          );

          return;
        }

        /* ===============================
           SAMPLES
        =============================== */

        if (
          reportType ===
          'samples'
        ) {
          await downloadSampleRequests(
            filters
          );
        }
      } catch (err) {
        console.error(
          'Download error:',
          err
        );

        setError(
          err.message ||
            'Failed to download report.'
        );
      } finally {
        setDownloading(false);
      }
    };

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setReportData(null);
    setError('');
  };

  /* =======================================================
     CHANGE REPORT TYPE
  ======================================================= */

  const handleReportTypeChange = (
    event
  ) => {
    setReportType(
      event.target.value
    );

    setReportData(null);
    setError('');
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        py: 3,
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            display: 'flex',
            borderRadius: 1.5,
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.selected',
          }}
        >
          <Iconify
            icon="solar:chart-2-bold-duotone"
            width={28}
          />
        </Box>

        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Request Reports
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            View, filter and export
            website request data
          </Typography>
        </Box>
      </Stack>

      {/* ===================================================
          FILTERS
      =================================================== */}

      <Card
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
        >
          Report Filters
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            mb: 3,
          }}
        >
          Select the request type and
          optionally filter requests by
          submission date.
        </Typography>

        <Stack
          direction={{
            xs: 'column',
            lg: 'row',
          }}
          spacing={2}
          alignItems={{
            xs: 'stretch',
            lg: 'flex-start',
          }}
        >
          {/* REPORT TYPE */}

          <FormControl
            sx={{
              minWidth: {
                xs: '100%',
                lg: 280,
              },
            }}
          >
            <InputLabel>
              Report Type
            </InputLabel>

            <Select
              value={reportType}
              label="Report Type"
              onChange={
                handleReportTypeChange
              }
            >
              {REPORT_TYPES.map(
                (report) => (
                  <MenuItem
                    key={
                      report.value
                    }
                    value={
                      report.value
                    }
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                    >
                      <Iconify
                        icon={
                          report.icon
                        }
                        width={22}
                      />

                      <span>
                        {
                          report.label
                        }
                      </span>
                    </Stack>
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>

          {/* FROM DATE */}

          <TextField
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(event) =>
              setFromDate(
                event.target.value
              )
            }
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              max:
                toDate ||
                undefined,
            }}
            sx={{
              minWidth: {
                xs: '100%',
                lg: 190,
              },
            }}
          />

          {/* TO DATE */}

          <TextField
            label="To Date"
            type="date"
            value={toDate}
            onChange={(event) =>
              setToDate(
                event.target.value
              )
            }
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min:
                fromDate ||
                undefined,
            }}
            sx={{
              minWidth: {
                xs: '100%',
                lg: 190,
              },
            }}
          />

          {/* SHOW REPORT */}

          <Button
            variant="contained"
            startIcon={
              !loading && (
                <Iconify
                  icon="solar:magnifer-linear"
                  width={20}
                />
              )
            }
            onClick={
              handleShowReport
            }
            disabled={loading}
            sx={{
              px: 3,
              minHeight: 56,
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              'Show Report'
            )}
          </Button>

          {/* RESET */}

          <Button
            variant="outlined"
            startIcon={
              <Iconify
                icon="solar:restart-linear"
                width={20}
              />
            }
            onClick={handleReset}
            disabled={
              loading ||
              downloading
            }
            sx={{
              px: 2.5,
              minHeight: 56,
              whiteSpace: 'nowrap',
            }}
          >
            Reset
          </Button>
        </Stack>
      </Card>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <Alert
          severity="error"
          onClose={() =>
            setError('')
          }
          sx={{
            mt: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {/* ===================================================
          LOADING
      =================================================== */}

      {loading && (
        <Card
          sx={{
            mt: 3,
            py: 8,
          }}
        >
          <Stack
            spacing={2}
            alignItems="center"
          >
            <CircularProgress />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Loading report...
            </Typography>
          </Stack>
        </Card>
      )}

      {/* ===================================================
          REPORT DATA
      =================================================== */}

      {!loading &&
        reportData && (
          <Card
            sx={{
              mt: 3,
              overflow: 'hidden',
            }}
          >
            {/* =============================================
                REPORT HEADER
            ============================================= */}

            <Box
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
                borderBottom: 1,
                borderColor:
                  'divider',
              }}
            >
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={2}
                alignItems={{
                  xs: 'flex-start',
                  sm: 'center',
                }}
                justifyContent="space-between"
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      display:
                        'flex',
                      borderRadius:
                        1.5,
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      bgcolor:
                        'action.selected',
                    }}
                  >
                    <Iconify
                      icon={
                        currentReport?.icon ||
                        'solar:document-bold-duotone'
                      }
                      width={25}
                    />
                  </Box>

                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Typography
                        variant="h6"
                        fontWeight={
                          600
                        }
                      >
                        {
                          currentReport?.label
                        }
                      </Typography>

                      <Chip
                        size="small"
                        label={`${rows.length} Requests`}
                      />
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.25,
                      }}
                    >
                      {
                        currentReport?.description
                      }
                    </Typography>
                  </Box>
                </Stack>

                {/* DOWNLOAD */}

                <Button
                  variant="contained"
                  startIcon={
                    !downloading && (
                      <Iconify
                        icon="solar:download-minimalistic-linear"
                        width={20}
                      />
                    )
                  }
                  onClick={
                    handleDownload
                  }
                  disabled={
                    downloading ||
                    rows.length ===
                      0
                  }
                >
                  {downloading ? (
                    <CircularProgress
                      size={21}
                      color="inherit"
                    />
                  ) : (
                    'Download Excel'
                  )}
                </Button>
              </Stack>

              {/* DATE FILTER CHIPS */}

              {(fromDate ||
                toDate) && (
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{
                    mt: 2,
                  }}
                >
                  {fromDate && (
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={
                        <Iconify
                          icon="solar:calendar-linear"
                          width={16}
                        />
                      }
                      label={`From: ${formatDate(
                        fromDate
                      )}`}
                    />
                  )}

                  {toDate && (
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={
                        <Iconify
                          icon="solar:calendar-linear"
                          width={16}
                        />
                      }
                      label={`To: ${formatDate(
                        toDate
                      )}`}
                    />
                  )}
                </Stack>
              )}
            </Box>

            {/* =============================================
                NO DATA
            ============================================= */}

            {rows.length === 0 && (
              <Box
                sx={{
                  py: 9,
                  px: 3,
                  textAlign:
                    'center',
                }}
              >
                <Iconify
                  icon="solar:document-text-linear"
                  width={52}
                  sx={{
                    color:
                      'text.disabled',
                  }}
                />

                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    mt: 2,
                  }}
                >
                  No requests found
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  No requests match
                  the selected date
                  range.
                </Typography>
              </Box>
            )}

            {/* =============================================
                CEU TABLE
            ============================================= */}

            {reportType ===
              'ceu' &&
              rows.length > 0 && (
                <TableContainer
                  sx={{
                    maxHeight: 650,
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          ID
                        </TableCell>

                        <TableCell>
                          Course
                        </TableCell>

                        <TableCell>
                          Name
                        </TableCell>

                        <TableCell>
                          Email
                        </TableCell>

                        <TableCell>
                          Phone
                        </TableCell>

                        <TableCell>
                          Company
                        </TableCell>

                        <TableCell>
                          Role
                        </TableCell>

                        <TableCell>
                          Preferred Date
                        </TableCell>

                        <TableCell
                          sx={{
                            minWidth:
                              220,
                          }}
                        >
                          Message
                        </TableCell>

                        <TableCell
                          sx={{
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          Submitted
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {rows.map(
                        (
                          request,
                          index
                        ) => (
                          <TableRow
                            hover
                            key={
                              request.id ??
                              index
                            }
                          >
                            <TableCell>
                              {String(
                                request.id ??
                                  '-'
                              )}
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={
                                  600
                                }
                                sx={{
                                  minWidth:
                                    180,
                                }}
                              >
                                {request.course ||
                                  '-'}
                              </Typography>
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {request.name ||
                                '-'}
                            </TableCell>

                            <TableCell>
                              {request.email ||
                                '-'}
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {request.phone ||
                                '-'}
                            </TableCell>

                            <TableCell>
                              {request.company ||
                                '-'}
                            </TableCell>

                            <TableCell>
                              {request.role ||
                                '-'}
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {formatDate(
                                request.preferred_date
                              )}
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth:
                                    300,
                                  whiteSpace:
                                    'normal',
                                  wordBreak:
                                    'break-word',
                                }}
                              >
                                {request.message ||
                                  '-'}
                              </Typography>
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {formatDateTime(
                                request.created_at
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

            {/* =============================================
                DISPLAY REQUEST TABLE
            ============================================= */}

            {reportType ===
              'display' &&
              rows.length > 0 && (
                <TableContainer
                  sx={{
                    maxHeight: 650,
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          ID
                        </TableCell>

                        <TableCell>
                          Display
                        </TableCell>

                        <TableCell>
                          Name
                        </TableCell>

                        <TableCell>
                          Email
                        </TableCell>

                        <TableCell>
                          Phone
                        </TableCell>

                        <TableCell>
                          Company
                        </TableCell>

                        <TableCell>
                          Concerned Person
                        </TableCell>

                        <TableCell>
                          Concerned Phone
                        </TableCell>

                        <TableCell>
                          Street Address
                        </TableCell>

                        <TableCell>
                          Suite
                        </TableCell>

                        <TableCell>
                          City
                        </TableCell>

                        <TableCell>
                          County
                        </TableCell>

                        <TableCell>
                          State
                        </TableCell>

                        <TableCell>
                          ZIP Code
                        </TableCell>

                        <TableCell
                          sx={{
                            minWidth:
                              220,
                          }}
                        >
                          Message
                        </TableCell>

                        <TableCell
                          sx={{
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          Submitted
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {rows.map(
                        (
                          request,
                          index
                        ) => (
                          <TableRow
                            hover
                            key={
                              request.id ??
                              index
                            }
                          >
                            <TableCell>
                              {String(
                                request.id ??
                                  '-'
                              )}
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={
                                  600
                                }
                                sx={{
                                  minWidth:
                                    180,
                                }}
                              >
                                {request.display ||
                                  '-'}
                              </Typography>
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {request.name ||
                                '-'}
                            </TableCell>

                            <TableCell>
                              {request.email ||
                                '-'}
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {request.phone ||
                                '-'}
                            </TableCell>

                            <TableCell>
                              {request.company ||
                                '-'}
                            </TableCell>

                            <TableCell>
                              {request.concerned_person_name ||
                                '-'}
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {request.concerned_person_phone ||
                                '-'}
                            </TableCell>

                            <TableCell
                              sx={{
                                minWidth:
                                  200,
                              }}
                            >
                              {request.street_address ||
                                '-'}
                            </TableCell>

                            <TableCell>
                              {request.suite_number ||
                                '-'}
                            </TableCell>

                            <TableCell>
                              {request.city ||
                                '-'}
                            </TableCell>

                            <TableCell>
                              {request.county ||
                                '-'}
                            </TableCell>

                            <TableCell>
                              {request.state ||
                                '-'}
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {request.zip_code ||
                                '-'}
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth:
                                    300,
                                  whiteSpace:
                                    'normal',
                                  wordBreak:
                                    'break-word',
                                }}
                              >
                                {request.message ||
                                  '-'}
                              </Typography>
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {formatDateTime(
                                request.created_at
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

            {/* =============================================
                SAMPLE REQUEST TABLE
            ============================================= */}

            {reportType ===
              'samples' &&
              rows.length > 0 && (
                <TableContainer
                  sx={{
                    maxHeight: 650,
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          ID
                        </TableCell>

                        <TableCell>
                          Product
                        </TableCell>

                        <TableCell>
                          Category
                        </TableCell>

                        <TableCell>
                          Customer
                        </TableCell>

                        <TableCell>
                          Company
                        </TableCell>

                        <TableCell>
                          Email
                        </TableCell>

                        <TableCell>
                          Phone
                        </TableCell>

                        <TableCell>
                          Finish
                        </TableCell>

                        <TableCell>
                          Quantity
                        </TableCell>

                        <TableCell>
                          Street Address
                        </TableCell>

                        <TableCell>
                          Suite
                        </TableCell>

                        <TableCell>
                          City
                        </TableCell>

                        <TableCell>
                          County
                        </TableCell>

                        <TableCell>
                          State
                        </TableCell>

                        <TableCell>
                          ZIP Code
                        </TableCell>

                        <TableCell
                          sx={{
                            minWidth:
                              220,
                          }}
                        >
                          Remarks
                        </TableCell>

                        <TableCell>
                          Status
                        </TableCell>

                        <TableCell
                          sx={{
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          Submitted
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {rows.map(
                        (
                          request,
                          index
                        ) => (
                          <TableRow
                            hover
                            key={
                              request.id ??
                              index
                            }
                          >
                            {/* ID */}

                            <TableCell>
                              {String(
                                request.id ??
                                  '-'
                              )}
                            </TableCell>

                            {/* PRODUCT */}

                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={
                                  600
                                }
                                sx={{
                                  minWidth:
                                    180,
                                }}
                              >
                                {request.product_name ||
                                  '-'}
                              </Typography>
                            </TableCell>

                            {/* CATEGORY */}

                            <TableCell>
                              {request.category_name ||
                                '-'}
                            </TableCell>

                            {/* CUSTOMER */}

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {[
                                request.first_name,
                                request.last_name,
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(
                                  ' '
                                ) ||
                                '-'}
                            </TableCell>

                            {/* COMPANY */}

                            <TableCell>
                              {request.company_name ||
                                '-'}
                            </TableCell>

                            {/* EMAIL */}

                            <TableCell>
                              {request.email ||
                                '-'}
                            </TableCell>

                            {/* PHONE */}

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {request.phone ||
                                '-'}
                            </TableCell>

                            {/* FINISH */}

                            <TableCell>
                              {request.finish ||
                                '-'}
                            </TableCell>

                            {/* QUANTITY */}

                            <TableCell
                              align="center"
                            >
                              {request.quantity ??
                                '-'}
                            </TableCell>

                            {/* STREET */}

                            <TableCell
                              sx={{
                                minWidth:
                                  200,
                              }}
                            >
                              {request.street_address ||
                                '-'}
                            </TableCell>

                            {/* SUITE */}

                            <TableCell>
                              {request.suite_number ||
                                '-'}
                            </TableCell>

                            {/* CITY */}

                            <TableCell>
                              {request.city ||
                                '-'}
                            </TableCell>

                            {/* COUNTY */}

                            <TableCell>
                              {request.county ||
                                '-'}
                            </TableCell>

                            {/* STATE */}

                            <TableCell>
                              {request.state ||
                                '-'}
                            </TableCell>

                            {/* ZIP */}

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {request.zip_code ||
                                '-'}
                            </TableCell>

                            {/* REMARKS */}

                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth:
                                    300,
                                  whiteSpace:
                                    'normal',
                                  wordBreak:
                                    'break-word',
                                }}
                              >
                                {request.remarks ||
                                  '-'}
                              </Typography>
                            </TableCell>

                            {/* STATUS */}

                            <TableCell>
                              <Chip
                                size="small"
                                variant="outlined"
                                label={
                                  request.status ||
                                  'NEW'
                                }
                              />
                            </TableCell>

                            {/* SUBMITTED */}

                            <TableCell
                              sx={{
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {formatDateTime(
                                request.created_at
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
          </Card>
        )}

      {/* ===================================================
          INITIAL EMPTY STATE
      =================================================== */}

      {!loading &&
        !reportData &&
        !error && (
          <Card
            sx={{
              mt: 3,
              py: 8,
              px: 3,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                display: 'flex',
                borderRadius: 2,
                alignItems:
                  'center',
                justifyContent:
                  'center',
                bgcolor:
                  'action.selected',
              }}
            >
              <Iconify
                icon={
                  currentReport?.icon ||
                  'solar:document-bold-duotone'
                }
                width={34}
              />
            </Box>

            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                mt: 2,
              }}
            >
              Select your report
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.75,
                mx: 'auto',
                maxWidth: 480,
              }}
            >
              Select the request
              report and date range
              above, then click Show
              Report to view the
              results.
            </Typography>
          </Card>
        )}
    </Container>
  );
}