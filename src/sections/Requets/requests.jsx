import PropTypes from 'prop-types';
import {
  useRef,
  useState,
} from 'react';

import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Alert,
  Button,
  Select,
  Dialog,
  Tooltip,
  MenuItem,
  TableRow,
  Container,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  Typography,
  InputLabel,
  FormControl,
  DialogTitle,
  DialogContent,
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
  getProductRegistrations,
  downloadProductRegistrations,
} from 'src/services/requests.service';

import Iconify from 'src/components/iconify';

/* =========================================================
   REPORT TYPES
========================================================= */

const REPORT_TYPES = [
  {
    value: 'ceu',
    label: 'CEU Requests',
    description: 'Continuing Education course requests',
    icon: 'solar:diploma-bold-duotone',
  },
  {
    value: 'display',
    label: 'Display Requests',
    description: 'Merchandising display requests',
    icon: 'solar:shop-2-bold-duotone',
  },
  {
    value: 'samples',
    label: 'Sample Requests',
    description: 'Product sample requests',
    icon: 'solar:box-bold-duotone',
  },
  {
    value: 'registrations',
    label: 'Product Registrations',
    description:
      'Customer product registration and installation records',
    icon: 'solar:clipboard-check-bold-duotone',
  },
];

/* =========================================================
   REPORT API CONFIGURATION
========================================================= */

const REPORT_API = {
  ceu: {
    fetch: getCeuRequests,
    download: downloadCeuRequests,
  },

  display: {
    fetch: getDisplayRequests,
    download: downloadDisplayRequests,
  },

  samples: {
    fetch: getSampleRequests,
    download: downloadSampleRequests,
  },

  registrations: {
    fetch: getProductRegistrations,
    download: downloadProductRegistrations,
  },
};

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  if (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(
      year,
      month - 1,
      day
    ).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  if (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T00:00:00(?:\.000)?Z$/.test(value)
  ) {
    return date.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
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
    return String(value);
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/* =========================================================
   FORMAT BOOLEAN
========================================================= */

const formatBoolean = (value) => {
  if (value === true || value === 'true') {
    return 'Yes';
  }

  if (value === false || value === 'false') {
    return 'No';
  }

  return '-';
};

/* =========================================================
   FORMAT INSTALLATION TYPE
========================================================= */

const formatInstallationType = (row) => {
  if (!row.installation_type) {
    return '-';
  }

  if (
    row.installation_type === 'Other' &&
    row.installation_type_other
  ) {
    return `Other: ${row.installation_type_other}`;
  }

  return row.installation_type;
};

/* =========================================================
   NORMALIZE INSTALLATION PHOTOS
========================================================= */

const normalizePhotos = (photos) => {
  if (!photos) {
    return [];
  }

  let parsedPhotos = photos;

  if (typeof photos === 'string') {
    try {
      parsedPhotos = JSON.parse(photos);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsedPhotos)) {
    return [];
  }

  return parsedPhotos
    .map((photo, index) => {
      if (typeof photo === 'string') {
        return {
          url: photo,
          filename: `Installation Photo ${index + 1}`,
        };
      }

      if (
        photo &&
        typeof photo === 'object'
      ) {
        return {
          url:
            photo.url ||
            photo.secure_url ||
            photo.file_url ||
            '',

          filename:
            photo.filename ||
            photo.name ||
            `Installation Photo ${index + 1}`,
        };
      }

      return null;
    })
    .filter((photo) => photo?.url);
};

/* =========================================================
   PHOTO COUNT
========================================================= */

const getPhotoCount = (photos) =>
  normalizePhotos(photos).length;

/* =========================================================
   STATUS COLOR
========================================================= */

const getStatusColor = (status) => {
  switch (String(status || '').toUpperCase()) {
    case 'VERIFIED':
    case 'APPROVED':
    case 'COMPLETED':
      return 'success';

    case 'REJECTED':
    case 'CANCELLED':
      return 'error';

    case 'UNDER_REVIEW':
    case 'IN_PROGRESS':
      return 'info';

    case 'PENDING':
      return 'warning';

    default:
      return 'default';
  }
};

/* =========================================================
   COLUMN CONFIGURATION
========================================================= */

const REPORT_COLUMNS = {
  /* =====================================================
     CEU REQUESTS
  ===================================================== */

  ceu: [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'course',
      label: 'Course',
      bold: true,
      minWidth: 180,
    },
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'company',
      label: 'Company',
    },
    {
      key: 'role',
      label: 'Role',
    },
    {
      key: 'preferred_date',
      label: 'Preferred Date',
      type: 'date',
    },
    {
      key: 'message',
      label: 'Message',
      minWidth: 220,
      wrap: true,
    },
    {
      key: 'created_at',
      label: 'Submitted',
      type: 'datetime',
    },
  ],

  /* =====================================================
     DISPLAY REQUESTS
  ===================================================== */

  display: [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'display',
      label: 'Display',
      bold: true,
      minWidth: 180,
    },
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'company',
      label: 'Company',
    },
    {
      key: 'concerned_person_name',
      label: 'Concerned Person',
    },
    {
      key: 'concerned_person_phone',
      label: 'Concerned Phone',
    },
    {
      key: 'street_address',
      label: 'Street Address',
      minWidth: 200,
      wrap: true,
    },
    {
      key: 'suite_number',
      label: 'Suite',
    },
    {
      key: 'city',
      label: 'City',
    },
    {
      key: 'county',
      label: 'County',
    },
    {
      key: 'state',
      label: 'State',
    },
    {
      key: 'zip_code',
      label: 'ZIP Code',
    },
    {
      key: 'message',
      label: 'Message',
      minWidth: 220,
      wrap: true,
    },
    {
      key: 'created_at',
      label: 'Submitted',
      type: 'datetime',
    },
  ],

  /* =====================================================
     SAMPLE REQUESTS
  ===================================================== */

  samples: [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'product_name',
      label: 'Product',
      bold: true,
      minWidth: 180,
    },
    {
      key: 'category_name',
      label: 'Category',
    },
    {
      key: 'customer_name',
      label: 'Customer',
      getValue: (row) =>
        [row.first_name, row.last_name]
          .filter(Boolean)
          .join(' '),
    },
    {
      key: 'company_name',
      label: 'Company',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'finish',
      label: 'Finish',
    },
    {
      key: 'quantity',
      label: 'Quantity',
      align: 'center',
    },
    {
      key: 'street_address',
      label: 'Street Address',
      minWidth: 200,
      wrap: true,
    },
    {
      key: 'suite_number',
      label: 'Suite',
    },
    {
      key: 'city',
      label: 'City',
    },
    {
      key: 'county',
      label: 'County',
    },
    {
      key: 'state',
      label: 'State',
    },
    {
      key: 'zip_code',
      label: 'ZIP Code',
    },
    {
      key: 'remarks',
      label: 'Remarks',
      minWidth: 220,
      wrap: true,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      fallback: 'NEW',
    },
    {
      key: 'created_at',
      label: 'Submitted',
      type: 'datetime',
    },
  ],

  /* =====================================================
     PRODUCT REGISTRATIONS
  ===================================================== */

  registrations: [
    {
      key: 'registration_number',
      label: 'Registration Number',
      bold: true,
      minWidth: 180,
    },
    {
      key: 'full_name',
      label: 'Customer Name',
      minWidth: 170,
    },
    {
      key: 'email',
      label: 'Email',
      minWidth: 200,
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'product_category',
      label: 'Product Category',
      minWidth: 180,
    },
    {
      key: 'product_name',
      label: 'Product Name',
      bold: true,
      minWidth: 180,
    },
    {
      key: 'invoice_order_number',
      label: 'Invoice / Order Number',
      minWidth: 170,
    },
    {
      key: 'purchase_date',
      label: 'Purchase Date',
      type: 'date',
    },
    {
      key: 'project_type',
      label: 'Project Type',
    },
    {
      key: 'installation_type',
      label: 'Installation Type',
      minWidth: 170,
      getValue: formatInstallationType,
    },
    {
      key: 'is_installed',
      label: 'Installed',
      type: 'installed',
    },
    {
      key: 'installation_date',
      label: 'Installation Date',
      type: 'date',
    },
    {
      key: 'installation_address',
      label: 'Installation Address',
      minWidth: 250,
      wrap: true,
    },
    {
      key: 'installation_photos',
      label: 'Installation Photos',
      type: 'photos',
      align: 'center',
      minWidth: 160,
    },
    {
      key: 'fabricator_installer_name',
      label: 'Fabricator / Installer',
      minWidth: 180,
    },
    {
      key: 'fabricator_installer_contact',
      label: 'Fabricator Contact',
      minWidth: 170,
    },
    {
      key: 'tentative_installation_date',
      label: 'Tentative Installation Date',
      type: 'date',
      minWidth: 180,
    },
    {
      key: 'purchase_invoice',
      label: 'Purchase Invoice',
      type: 'file',
      minWidth: 150,
    },
    {
      key: 'declaration_accepted',
      label: 'Declaration Accepted',
      type: 'boolean',
    },
    {
      key: 'created_at',
      label: 'Submitted',
      type: 'datetime',
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      type: 'datetime',
    },
  ],
};

/* =========================================================
   REPORT CELL COMPONENT
========================================================= */

function ReportCell({
  row,
  column,
  onViewPhotos,
  onViewInvoice,
}) {
  const value = column.getValue
    ? column.getValue(row)
    : row[column.key];

  const cellSx = {
    minWidth: column.minWidth,
    whiteSpace: column.wrap ? 'normal' : 'nowrap',
    wordBreak: column.wrap ? 'break-word' : 'normal',
    verticalAlign: 'middle',
  };

  /* =====================================================
     STATUS
  ===================================================== */

  if (column.type === 'status') {
    const status = value || column.fallback || 'NEW';

    return (
      <TableCell sx={cellSx}>
        <Chip
          size="small"
          variant="outlined"
          color={getStatusColor(status)}
          label={String(status).replace(/_/g, ' ').toUpperCase()}
        />
      </TableCell>
    );
  }

  /* =====================================================
     INSTALLED
  ===================================================== */

  if (column.type === 'installed') {
    const installed =
      value === true ||
      value === 'true';

    return (
      <TableCell sx={cellSx}>
        <Chip
          size="small"
          color={installed ? 'success' : 'warning'}
          variant="outlined"
          label={installed ? 'Installed' : 'Not Installed'}
        />
      </TableCell>
    );
  }

  /* =====================================================
     INSTALLATION PHOTOS - VIEW BUTTON
  ===================================================== */

  if (column.type === 'photos') {
    const count = getPhotoCount(value);

    return (
      <TableCell
        align={column.align || 'left'}
        sx={cellSx}
      >
        {count > 0 ? (
          <Button
            size="small"
            variant="outlined"
            color="info"
            startIcon={
              <Iconify
                icon="solar:gallery-linear"
                width={17}
              />
            }
            onClick={() => onViewPhotos(value)}
            sx={{
              whiteSpace: 'nowrap',
              textTransform: 'none',
            }}
          >
            View Photos ({count})
          </Button>
        ) : (
          <Chip
            size="small"
            variant="outlined"
            label="No Photos"
          />
        )}
      </TableCell>
    );
  }

  /* =====================================================
     PURCHASE INVOICE - VIEW BUTTON
  ===================================================== */

  if (column.type === 'file') {
    const hasFile =
      typeof value === 'string' &&
      value.trim().length > 0;

    return (
      <TableCell sx={cellSx}>
        {hasFile ? (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            startIcon={
              <Iconify
                icon="solar:document-text-linear"
                width={17}
              />
            }
            onClick={() => onViewInvoice(value)}
            sx={{
              whiteSpace: 'nowrap',
              textTransform: 'none',
            }}
          >
            View Invoice
          </Button>
        ) : (
          <Chip
            size="small"
            variant="outlined"
            label="Not Available"
          />
        )}
      </TableCell>
    );
  }

  /* =====================================================
     BOOLEAN
  ===================================================== */

  if (column.type === 'boolean') {
    const accepted =
      value === true ||
      value === 'true';

    return (
      <TableCell sx={cellSx}>
        <Chip
          size="small"
          variant="outlined"
          color={accepted ? 'success' : 'error'}
          label={formatBoolean(value)}
        />
      </TableCell>
    );
  }

  /* =====================================================
     DATE
  ===================================================== */

  if (column.type === 'date') {
    return (
      <TableCell sx={cellSx}>
        {formatDate(value)}
      </TableCell>
    );
  }

  /* =====================================================
     DATE TIME
  ===================================================== */

  if (column.type === 'datetime') {
    return (
      <TableCell sx={cellSx}>
        {formatDateTime(value)}
      </TableCell>
    );
  }

  /* =====================================================
     DEFAULT TEXT
  ===================================================== */

  const displayValue =
    value === null ||
    value === undefined ||
    value === ''
      ? '-'
      : String(value);

  return (
    <TableCell
      align={column.align || 'left'}
      sx={cellSx}
    >
      <Typography
        variant="body2"
        fontWeight={column.bold ? 600 : 400}
        sx={{
          whiteSpace: column.wrap ? 'normal' : 'nowrap',
          wordBreak: column.wrap ? 'break-word' : 'normal',
        }}
      >
        {displayValue}
      </Typography>
    </TableCell>
  );
}

/* =========================================================
   PROP TYPES
========================================================= */

ReportCell.propTypes = {
  row: PropTypes.object.isRequired,

  column: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    minWidth: PropTypes.number,
    wrap: PropTypes.bool,
    bold: PropTypes.bool,
    align: PropTypes.oneOf([
      'left',
      'center',
      'right',
    ]),
    fallback: PropTypes.string,
    getValue: PropTypes.func,
  }).isRequired,

  onViewPhotos: PropTypes.func.isRequired,

  onViewInvoice: PropTypes.func.isRequired,
};

/* =========================================================
   REQUESTS VIEW
========================================================= */

export default function RequestsView() {
  /* =======================================================
     STATES
  ======================================================= */

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

  const [downloading, setDownloading] =
    useState(false);

  const [error, setError] =
    useState('');

  /* =======================================================
     PHOTO VIEWER STATES
  ======================================================= */

  const [photoDialogOpen, setPhotoDialogOpen] =
    useState(false);

  const [selectedPhotos, setSelectedPhotos] =
    useState([]);

  const [activePhotoIndex, setActivePhotoIndex] =
    useState(0);

  /* =======================================================
     INVOICE VIEWER STATES
  ======================================================= */

  const [invoiceDialogOpen, setInvoiceDialogOpen] =
    useState(false);

  const [selectedInvoice, setSelectedInvoice] =
    useState('');

  const requestIdRef = useRef(0);

  /* =======================================================
     CURRENT REPORT
  ======================================================= */

  const currentReport = REPORT_TYPES.find(
    (item) => item.value === reportType
  );

  const columns =
    REPORT_COLUMNS[reportType] || [];

  /* =======================================================
     NORMALIZE ROWS
  ======================================================= */

  let rows = [];

  if (Array.isArray(reportData?.data)) {
    rows = reportData.data;
  } else if (Array.isArray(reportData)) {
    rows = reportData;
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

  const handleShowReport = async () => {
    if (!validateDates()) {
      return;
    }

    requestIdRef.current += 1;

    const requestId =
      requestIdRef.current;

    try {
      setLoading(true);
      setError('');
      setReportData(null);

      const filters = {
        fromDate,
        toDate,
      };

      const reportConfig =
        REPORT_API[reportType];

      if (!reportConfig) {
        throw new Error(
          'Invalid report type selected.'
        );
      }

      const response =
        await reportConfig.fetch(filters);

      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      if (
        response?.success === false
      ) {
        throw new Error(
          response.message ||
            'Failed to load report.'
        );
      }

      setReportData(response);
    } catch (err) {
      if (
        requestId !==
        requestIdRef.current
      ) {
        return;
      }

      console.error(
        'Report error:',
        err
      );

      setError(
        err.message ||
          'Failed to load report.'
      );
    } finally {
      if (
        requestId ===
        requestIdRef.current
      ) {
        setLoading(false);
      }
    }
  };

  /* =======================================================
     DOWNLOAD REPORT
  ======================================================= */

  const handleDownload = async () => {
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

      const reportConfig =
        REPORT_API[reportType];

      if (!reportConfig) {
        throw new Error(
          'Invalid report type selected.'
        );
      }

      await reportConfig.download(filters);
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
    requestIdRef.current += 1;

    setFromDate('');
    setToDate('');
    setReportData(null);
    setLoading(false);
    setError('');
  };

  /* =======================================================
     CHANGE REPORT TYPE
  ======================================================= */

  const handleReportTypeChange = (event) => {
    requestIdRef.current += 1;

    setReportType(
      event.target.value
    );

    setReportData(null);
    setLoading(false);
    setError('');
  };

  /* =======================================================
     OPEN INSTALLATION PHOTOS
  ======================================================= */

  const handleViewPhotos = (photos) => {
    const normalizedPhotos =
      normalizePhotos(photos);

    if (
      normalizedPhotos.length === 0
    ) {
      return;
    }

    setSelectedPhotos(
      normalizedPhotos
    );

    setActivePhotoIndex(0);

    setPhotoDialogOpen(true);
  };

  /* =======================================================
     CLOSE INSTALLATION PHOTOS
  ======================================================= */

  const handleClosePhotos = () => {
    setPhotoDialogOpen(false);

    setSelectedPhotos([]);

    setActivePhotoIndex(0);
  };

  /* =======================================================
     PREVIOUS PHOTO
  ======================================================= */

  const handlePreviousPhoto = () => {
    setActivePhotoIndex(
      (previous) =>
        previous === 0
          ? selectedPhotos.length - 1
          : previous - 1
    );
  };

  /* =======================================================
     NEXT PHOTO
  ======================================================= */

  const handleNextPhoto = () => {
    setActivePhotoIndex(
      (previous) =>
        previous ===
        selectedPhotos.length - 1
          ? 0
          : previous + 1
    );
  };

  /* =======================================================
     OPEN INVOICE
  ======================================================= */

  const handleViewInvoice = (invoiceUrl) => {
    if (!invoiceUrl) {
      return;
    }

    setSelectedInvoice(invoiceUrl);

    setInvoiceDialogOpen(true);
  };

  /* =======================================================
     CLOSE INVOICE
  ======================================================= */

  const handleCloseInvoice = () => {
    setInvoiceDialogOpen(false);

    setSelectedInvoice('');
  };

  /* =======================================================
     DETECT PDF INVOICE
  ======================================================= */

  const isPdfInvoice =
    selectedInvoice
      .split('?')[0]
      .toLowerCase()
      .endsWith('.pdf');

  /* =======================================================
     ACTIVE PHOTO
  ======================================================= */

  const activePhoto =
    selectedPhotos[activePhotoIndex];

  /* =======================================================
     RENDER
  ======================================================= */

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
            View, filter and export website request
            and product registration data
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
          Select the report type and optionally
          filter records by submission date.
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
              onChange={handleReportTypeChange}
              disabled={downloading}
            >
              {REPORT_TYPES.map((report) => (
                <MenuItem
                  key={report.value}
                  value={report.value}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                  >
                    <Iconify
                      icon={report.icon}
                      width={22}
                    />

                    <span>
                      {report.label}
                    </span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* FROM DATE */}

          <TextField
            label="From Date"
            type="date"
            value={fromDate}
            onChange={(event) =>
              setFromDate(event.target.value)
            }
            disabled={loading || downloading}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              max: toDate || undefined,
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
              setToDate(event.target.value)
            }
            disabled={loading || downloading}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: fromDate || undefined,
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
            onClick={handleShowReport}
            disabled={loading || downloading}
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
            disabled={loading || downloading}
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
          onClose={() => setError('')}
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

      {!loading && reportData && (
        <Card
          sx={{
            mt: 3,
            overflow: 'hidden',
          }}
        >
          {/* REPORT HEADER */}

          <Box
            sx={{
              p: {
                xs: 2,
                md: 3,
              },
              borderBottom: 1,
              borderColor: 'divider',
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
                    display: 'flex',
                    borderRadius: 1.5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.selected',
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
                    useFlexGap
                    flexWrap="wrap"
                  >
                    <Typography
                      variant="h6"
                      fontWeight={600}
                    >
                      {currentReport?.label}
                    </Typography>

                    <Chip
                      size="small"
                      label={`${rows.length} ${
                        reportType === 'registrations'
                          ? 'Registrations'
                          : 'Requests'
                      }`}
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.25,
                    }}
                  >
                    {currentReport?.description}
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
                onClick={handleDownload}
                disabled={
                  downloading ||
                  rows.length === 0
                }
                sx={{
                  whiteSpace: 'nowrap',
                }}
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

            {(fromDate || toDate) && (
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
                    label={`From: ${formatDate(fromDate)}`}
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
                    label={`To: ${formatDate(toDate)}`}
                  />
                )}
              </Stack>
            )}
          </Box>

          {/* NO DATA */}

          {rows.length === 0 && (
            <Box
              sx={{
                py: 9,
                px: 3,
                textAlign: 'center',
              }}
            >
              <Iconify
                icon="solar:document-text-linear"
                width={52}
                sx={{
                  color: 'text.disabled',
                }}
              />

              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  mt: 2,
                }}
              >
                No records found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                No records match the selected
                report and date range.
              </Typography>
            </Box>
          )}

          {/* DYNAMIC REPORT TABLE */}

          {rows.length > 0 && (
            <TableContainer
              sx={{
                maxHeight: 650,
              }}
            >
              <Table
                stickyHeader
                size="medium"
                sx={{
                  minWidth: 1000,
                }}
              >
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        align={
                          column.align ||
                          'left'
                        }
                        sx={{
                          minWidth:
                            column.minWidth,

                          whiteSpace:
                            'nowrap',

                          fontWeight:
                            700,
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow
                      hover
                      key={
                        row.id ??
                        row.registration_number ??
                        index
                      }
                    >
                      {columns.map((column) => (
                        <ReportCell
                          key={column.key}
                          row={row}
                          column={column}
                          onViewPhotos={
                            handleViewPhotos
                          }
                          onViewInvoice={
                            handleViewInvoice
                          }
                        />
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* REPORT FOOTER */}

          {rows.length > 0 && (
            <Box
              sx={{
                px: 3,
                py: 2,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.neutral',
              }}
            >
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{
                  xs: 'flex-start',
                  sm: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Showing {rows.length} records
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Scroll horizontally to view
                  additional columns
                </Typography>
              </Stack>
            </Box>
          )}
        </Card>
      )}

      {/* ===================================================
          INITIAL EMPTY STATE
      =================================================== */}

      {!loading && !reportData && !error && (
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
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.selected',
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
            Select the request report or Product
            Registration report and date range
            above, then click Show Report to
            view the results.
          </Typography>
        </Card>
      )}

      {/* ===================================================
          INSTALLATION PHOTO VIEWER
      =================================================== */}

      <Dialog
        open={photoDialogOpen}
        onClose={handleClosePhotos}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={600}
            >
              Installation Photos
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {selectedPhotos.length > 0
                ? `Photo ${activePhotoIndex + 1} of ${selectedPhotos.length}`
                : 'No photos available'}
            </Typography>
          </Box>

          <IconButton
            onClick={handleClosePhotos}
          >
            <Iconify
              icon="solar:close-circle-linear"
              width={25}
            />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
          }}
        >
          {activePhoto && (
            <>
              {/* MAIN IMAGE */}

              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: {
                    xs: 320,
                    md: 520,
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  src={activePhoto.url}
                  alt={activePhoto.filename}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />

                {/* PREVIOUS */}

                {selectedPhotos.length > 1 && (
                  <Tooltip title="Previous Photo">
                    <IconButton
                      onClick={handlePreviousPhoto}
                      sx={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.85)',
                        },
                      }}
                    >
                      <Iconify
                        icon="solar:alt-arrow-left-linear"
                        width={24}
                      />
                    </IconButton>
                  </Tooltip>
                )}

                {/* NEXT */}

                {selectedPhotos.length > 1 && (
                  <Tooltip title="Next Photo">
                    <IconButton
                      onClick={handleNextPhoto}
                      sx={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.85)',
                        },
                      }}
                    >
                      <Iconify
                        icon="solar:alt-arrow-right-linear"
                        width={24}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* IMAGE DETAILS */}

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
                sx={{
                  mt: 2,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{
                    wordBreak: 'break-word',
                  }}
                >
                  {activePhoto.filename}
                </Typography>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={
                    <Iconify
                      icon="solar:arrow-right-up-linear"
                      width={18}
                    />
                  }
                  component="a"
                  href={activePhoto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Original
                </Button>
              </Stack>

              {/* THUMBNAILS */}

              {selectedPhotos.length > 1 && (
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    mt: 3,
                    overflowX: 'auto',
                    pb: 1,
                  }}
                >
                  {selectedPhotos.map((photo, index) => (
                    <Box
                      key={`${photo.url}-${index}`}
                      component="button"
                      type="button"
                      onClick={() =>
                        setActivePhotoIndex(index)
                      }
                      sx={{
                        width: 85,
                        height: 85,
                        flexShrink: 0,
                        p: 0,
                        border:
                          activePhotoIndex === index
                            ? '2px solid #1976d2'
                            : '2px solid transparent',
                        borderRadius: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        bgcolor: '#f5f5f5',
                      }}
                    >
                      <Box
                        component="img"
                        src={photo.url}
                        alt={photo.filename}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ===================================================
          PURCHASE INVOICE VIEWER
      =================================================== */}

      <Dialog
        open={invoiceDialogOpen}
        onClose={handleCloseInvoice}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            height: '85vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Iconify
              icon="solar:document-text-bold-duotone"
              width={26}
            />

            <Typography
              variant="h6"
              fontWeight={600}
            >
              Purchase Invoice
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            {selectedInvoice && (
              <Tooltip title="Open Original Invoice">
                <IconButton
                  component="a"
                  href={selectedInvoice}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Iconify
                    icon="solar:arrow-right-up-linear"
                    width={23}
                  />
                </IconButton>
              </Tooltip>
            )}

            <IconButton
              onClick={handleCloseInvoice}
            >
              <Iconify
                icon="solar:close-circle-linear"
                width={25}
              />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f5f5',
          }}
        >
          {selectedInvoice && (
            isPdfInvoice ? (
              <Box
                component="iframe"
                src={selectedInvoice}
                title="Purchase Invoice PDF"
                sx={{
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
              />
            ) : (
              <Box
                component="img"
                src={selectedInvoice}
                alt="Purchase Invoice"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}