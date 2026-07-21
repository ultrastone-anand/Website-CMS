import {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import {
  getCareerJobs,
  createCareerJob,
  updateCareerJob,
  archiveCareerJob,
  getCareerJobById,
  getCareerJobStats,
  updateCareerJobStatus,
  getCareerApplications,
  deleteCareerApplication,
  getCareerApplicationById,
  getCareerApplicationStats,
  updateCareerApplicationNotes,
  updateCareerApplicationStatus,
} from 'src/services/carrer.service';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const JOB_STATUSES = [
  {
    value: 'DRAFT',
    label: 'Draft',
    color: 'default',
  },
  {
    value: 'PUBLISHED',
    label: 'Published',
    color: 'success',
  },
  {
    value: 'CLOSED',
    label: 'Closed',
    color: 'warning',
  },
  {
    value: 'ARCHIVED',
    label: 'Archived',
    color: 'error',
  },
];

const EMPLOYMENT_TYPES = [
  {
    value: 'FULL_TIME',
    label: 'Full Time',
  },
  {
    value: 'PART_TIME',
    label: 'Part Time',
  },
  {
    value: 'CONTRACT',
    label: 'Contract',
  },
  {
    value: 'INTERNSHIP',
    label: 'Internship',
  },
  {
    value: 'TEMPORARY',
    label: 'Temporary',
  },
];

const WORK_MODES = [
  {
    value: 'ONSITE',
    label: 'Onsite',
  },
  {
    value: 'REMOTE',
    label: 'Remote',
  },
  {
    value: 'HYBRID',
    label: 'Hybrid',
  },
];

const APPLICATION_STATUSES = [
  {
    value: 'NEW',
    label: 'New',
    color: 'info',
  },
  {
    value: 'REVIEWING',
    label: 'Reviewing',
    color: 'warning',
  },
  {
    value: 'SHORTLISTED',
    label: 'Shortlisted',
    color: 'primary',
  },
  {
    value: 'INTERVIEW',
    label: 'Interview',
    color: 'secondary',
  },
  {
    value: 'SELECTED',
    label: 'Selected',
    color: 'success',
  },
  {
    value: 'REJECTED',
    label: 'Rejected',
    color: 'error',
  },
  {
    value: 'WITHDRAWN',
    label: 'Withdrawn',
    color: 'default',
  },
];

const APPLICATION_TYPES = [
  {
    value: 'JOB_APPLICATION',
    label: 'Job Application',
  },
  {
    value: 'GENERAL_RESUME',
    label: 'General Resume',
  },
];

// ----------------------------------------------------------------------

const EMPTY_JOB_FORM = {
  title: '',
  slug: '',
  department: '',
  location: '',
  employment_type: 'FULL_TIME',
  work_mode: 'ONSITE',
  short_description: '',
  summary: '',
  responsibilities: '',
  qualifications: '',
  how_to_apply: '',
  contact_phone: '',
  contact_email: '',
  office_hours: '',
  salary_range: '',
  experience_required: '',
  vacancies: 1,
  education_required: '',
  skills_required: '',
  benefits: '',
  status: 'DRAFT',
  is_featured: false,
  display_order: 0,
  closing_date: '',
  meta_title: '',
  meta_description: '',
  canonical_url: '',
  robots_index: true,
  robots_follow: true,
};

const formatEnumLabel = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

const formatDate = (date) => {
  if (!date) {
    return '—';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }

  return parsedDate.toLocaleDateString();
};

const formatDateTime = (date) => {
  if (!date) {
    return '—';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }

  return parsedDate.toLocaleString();
};

const getStatusConfig = (
  status,
  configs
) =>
  configs.find(
    (item) => item.value === status
  ) || {
    value: status,
    label: formatEnumLabel(status),
    color: 'default',
  };

const arrayToMultiline = (value) =>
  Array.isArray(value)
    ? value.join('\n')
    : '';

const multilineToArray = (value) =>
  String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeDateInput = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date
    .toISOString()
    .slice(0, 10);
};

const generateSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ----------------------------------------------------------------------

export default function Career() {
  const [activeTab, setActiveTab] =
    useState('jobs');

  const [jobs, setJobs] =
    useState([]);

  const [
    applications,
    setApplications,
  ] = useState([]);

  const [jobStats, setJobStats] =
    useState(null);

  const [
    applicationStats,
    setApplicationStats,
  ] = useState(null);

  const [jobsLoading, setJobsLoading] =
    useState(false);

  const [
    applicationsLoading,
    setApplicationsLoading,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [jobPage, setJobPage] =
    useState(0);

  const [
    jobRowsPerPage,
    setJobRowsPerPage,
  ] = useState(10);

  const [
    jobPagination,
    setJobPagination,
  ] = useState({
    total: 0,
  });

  const [
    applicationPage,
    setApplicationPage,
  ] = useState(0);

  const [
    applicationRowsPerPage,
    setApplicationRowsPerPage,
  ] = useState(10);

  const [
    applicationPagination,
    setApplicationPagination,
  ] = useState({
    total: 0,
  });

  const [jobSearch, setJobSearch] =
    useState('');

  const [
    jobStatusFilter,
    setJobStatusFilter,
  ] = useState('');

  const [
    employmentTypeFilter,
    setEmploymentTypeFilter,
  ] = useState('');

  const [
    workModeFilter,
    setWorkModeFilter,
  ] = useState('');

  const [
    applicationSearch,
    setApplicationSearch,
  ] = useState('');

  const [
    applicationStatusFilter,
    setApplicationStatusFilter,
  ] = useState('');

  const [
    applicationTypeFilter,
    setApplicationTypeFilter,
  ] = useState('');

  const [
    jobDialogOpen,
    setJobDialogOpen,
  ] = useState(false);

  const [
    editingJob,
    setEditingJob,
  ] = useState(null);

  const [jobForm, setJobForm] =
    useState(EMPTY_JOB_FORM);

  const [
    applicationDialogOpen,
    setApplicationDialogOpen,
  ] = useState(false);

  const [
    currentApplication,
    setCurrentApplication,
  ] = useState(null);

  const [
    applicationNotes,
    setApplicationNotes,
  ] = useState('');

  const [
    applicationStatus,
    setApplicationStatus,
  ] = useState('NEW');

  const [
    notification,
    setNotification,
  ] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // --------------------------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------------------------

  const showNotification = useCallback(
    (
      message,
      severity = 'success'
    ) => {
      setNotification({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  const handleCloseNotification = () => {
    setNotification(
      (previous) => ({
        ...previous,
        open: false,
      })
    );
  };

  // --------------------------------------------------------------------
  // LOAD JOBS
  // --------------------------------------------------------------------

  const loadJobs = useCallback(
    async () => {
      try {
        setJobsLoading(true);

        const response =
          await getCareerJobs({
            page: jobPage + 1,
            limit: jobRowsPerPage,
            search: jobSearch.trim(),
            status: jobStatusFilter,
            employmentType:
              employmentTypeFilter,
            workMode: workModeFilter,
          });

        setJobs(
          response.data || []
        );

        setJobPagination(
          response.pagination || {
            total: 0,
          }
        );
      } catch (error) {
        console.error(
          'Load Career Jobs Error:',
          error
        );

        showNotification(
          error.message ||
            'Failed to load career jobs',
          'error'
        );
      } finally {
        setJobsLoading(false);
      }
    },
    [
      jobPage,
      jobRowsPerPage,
      jobSearch,
      jobStatusFilter,
      employmentTypeFilter,
      workModeFilter,
      showNotification,
    ]
  );

  const loadJobStats =
    useCallback(async () => {
      try {
        const response =
          await getCareerJobStats();

        setJobStats(
          response.data || null
        );
      } catch (error) {
        console.error(
          'Load Career Job Stats Error:',
          error
        );
      }
    }, []);

  // --------------------------------------------------------------------
  // LOAD APPLICATIONS
  // --------------------------------------------------------------------

  const loadApplications =
    useCallback(async () => {
      try {
        setApplicationsLoading(true);

        const response =
          await getCareerApplications({
            page:
              applicationPage + 1,

            limit:
              applicationRowsPerPage,

            search:
              applicationSearch.trim(),

            status:
              applicationStatusFilter,

            applicationType:
              applicationTypeFilter,
          });

        setApplications(
          response.data || []
        );

        setApplicationPagination(
          response.pagination || {
            total: 0,
          }
        );
      } catch (error) {
        console.error(
          'Load Applications Error:',
          error
        );

        showNotification(
          error.message ||
            'Failed to load applications',
          'error'
        );
      } finally {
        setApplicationsLoading(false);
      }
    }, [
      applicationPage,
      applicationRowsPerPage,
      applicationSearch,
      applicationStatusFilter,
      applicationTypeFilter,
      showNotification,
    ]);

  const loadApplicationStats =
    useCallback(async () => {
      try {
        const response =
          await getCareerApplicationStats();

        setApplicationStats(
          response.data || null
        );
      } catch (error) {
        console.error(
          'Load Application Stats Error:',
          error
        );
      }
    }, []);

  // --------------------------------------------------------------------
  // INITIAL / FILTER LOADS
  // --------------------------------------------------------------------

  useEffect(() => {
    if (activeTab !== 'jobs') {
      return undefined;
    }

    const timeoutId =
      window.setTimeout(() => {
        loadJobs();
      }, 350);

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, [
    activeTab,
    loadJobs,
  ]);

  useEffect(() => {
    if (
      activeTab !== 'applications'
    ) {
      return undefined;
    }

    const timeoutId =
      window.setTimeout(() => {
        loadApplications();
      }, 350);

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, [
    activeTab,
    loadApplications,
  ]);

  useEffect(() => {
    loadJobStats();
    loadApplicationStats();
  }, [
    loadJobStats,
    loadApplicationStats,
  ]);

  // --------------------------------------------------------------------
  // TAB
  // --------------------------------------------------------------------

  const handleTabChange = (
    event,
    value
  ) => {
    setActiveTab(value);
  };

  // --------------------------------------------------------------------
  // JOB FORM
  // --------------------------------------------------------------------

  const handleJobFormChange = (
    field
  ) => (event) => {
    const value =
      field === 'is_featured' ||
      field === 'robots_index' ||
      field === 'robots_follow'
        ? event.target.checked
        : event.target.value;

    setJobForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };

  const handleJobTitleChange = (
    event
  ) => {
    const title =
      event.target.value;

    setJobForm(
      (previous) => ({
        ...previous,
        title,
        slug:
          editingJob ||
          previous.slug
            ? previous.slug
            : generateSlug(title),
      })
    );
  };

  const handleOpenCreateJob = () => {
    setEditingJob(null);
    setJobForm(
      EMPTY_JOB_FORM
    );
    setJobDialogOpen(true);
  };

  const handleOpenEditJob =
    async (job) => {
      try {
        setSaving(true);

        const response =
          await getCareerJobById(
            job.id
          );

        const {data} = response;

        setEditingJob(data);

        setJobForm({
          title:
            data.title || '',

          slug:
            data.slug || '',

          department:
            data.department || '',

          location:
            data.location || '',

          employment_type:
            data.employment_type ||
            'FULL_TIME',

          work_mode:
            data.work_mode ||
            'ONSITE',

          short_description:
            data.short_description ||
            '',

          summary:
            data.summary || '',

          responsibilities:
            arrayToMultiline(
              data.responsibilities
            ),

          qualifications:
            arrayToMultiline(
              data.qualifications
            ),

          how_to_apply:
            data.how_to_apply ||
            '',

          contact_phone:
            data.contact_phone ||
            '',

          contact_email:
            data.contact_email ||
            '',

          office_hours:
            data.office_hours ||
            '',

          salary_range:
            data.salary_range ||
            '',

          experience_required:
            data.experience_required ||
            '',

          vacancies:
            data.vacancies || 1,

          education_required:
            data.education_required ||
            '',

          skills_required:
            arrayToMultiline(
              data.skills_required
            ),

          benefits:
            arrayToMultiline(
              data.benefits
            ),

          status:
            data.status ||
            'DRAFT',

          is_featured:
            Boolean(
              data.is_featured
            ),

          display_order:
            data.display_order ||
            0,

          closing_date:
            normalizeDateInput(
              data.closing_date
            ),

          meta_title:
            data.meta_title || '',

          meta_description:
            data.meta_description ||
            '',

          canonical_url:
            data.canonical_url ||
            '',

          robots_index:
            data.robots_index ??
            true,

          robots_follow:
            data.robots_follow ??
            true,
        });

        setJobDialogOpen(true);
      } catch (error) {
        console.error(
          'Load Job Detail Error:',
          error
        );

        showNotification(
          error.message ||
            'Failed to load job details',
          'error'
        );
      } finally {
        setSaving(false);
      }
    };

  const handleCloseJobDialog = () => {
    if (saving) {
      return;
    }

    setJobDialogOpen(false);
    setEditingJob(null);
    setJobForm(
      EMPTY_JOB_FORM
    );
  };

  const jobPayload = useMemo(
    () => ({
      ...jobForm,

      vacancies:
        Number(
          jobForm.vacancies
        ) || 1,

      display_order:
        Number(
          jobForm.display_order
        ) || 0,

      responsibilities:
        multilineToArray(
          jobForm.responsibilities
        ),

      qualifications:
        multilineToArray(
          jobForm.qualifications
        ),

      skills_required:
        multilineToArray(
          jobForm.skills_required
        ),

      benefits:
        multilineToArray(
          jobForm.benefits
        ),

      closing_date:
        jobForm.closing_date ||
        null,
    }),
    [jobForm]
  );

  const handleSaveJob =
    async () => {
      if (!jobForm.title.trim()) {
        showNotification(
          'Job title is required',
          'error'
        );
        return;
      }

      if (!jobForm.slug.trim()) {
        showNotification(
          'Job slug is required',
          'error'
        );
        return;
      }

      try {
        setSaving(true);

        if (editingJob?.id) {
          await updateCareerJob(
            editingJob.id,
            jobPayload
          );

          showNotification(
            'Career job updated successfully'
          );
        } else {
          await createCareerJob(
            jobPayload
          );

          showNotification(
            'Career job created successfully'
          );
        }

        handleCloseJobDialog();

        await Promise.all([
          loadJobs(),
          loadJobStats(),
        ]);
      } catch (error) {
        console.error(
          'Save Career Job Error:',
          error
        );

        showNotification(
          error.message ||
            'Failed to save career job',
          'error'
        );
      } finally {
        setSaving(false);
      }
    };

  // --------------------------------------------------------------------
  // JOB STATUS
  // --------------------------------------------------------------------

  const handleJobStatusChange =
    async (
      job,
      status
    ) => {
      try {
        await updateCareerJobStatus(
          job.id,
          status
        );

        showNotification(
          `Job moved to ${formatEnumLabel(
            status
          )}`
        );

        await Promise.all([
          loadJobs(),
          loadJobStats(),
        ]);
      } catch (error) {
        console.error(
          'Job Status Error:',
          error
        );

        showNotification(
          error.message ||
            'Failed to update job status',
          'error'
        );
      }
    };

  const handleArchiveJob =
    async (job) => {
      const confirmed =
        window.confirm(
          `Archive "${job.title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        await archiveCareerJob(
          job.id
        );

        showNotification(
          'Career job archived successfully'
        );

        await Promise.all([
          loadJobs(),
          loadJobStats(),
        ]);
      } catch (error) {
        console.error(
          'Archive Job Error:',
          error
        );

        showNotification(
          error.message ||
            'Failed to archive job',
          'error'
        );
      }
    };

  // --------------------------------------------------------------------
  // APPLICATION DETAILS
  // --------------------------------------------------------------------

  const handleOpenApplication =
    async (application) => {
      try {
        setSaving(true);

        const response =
          await getCareerApplicationById(
            application.id
          );

        const {data} = response;

        setCurrentApplication(
          data
        );

        setApplicationNotes(
          data.internal_notes ||
            ''
        );

        setApplicationStatus(
          data.status || 'NEW'
        );

        setApplicationDialogOpen(
          true
        );
      } catch (error) {
        console.error(
          'Load Application Error:',
          error
        );

        showNotification(
          error.message ||
            'Failed to load application details',
          'error'
        );
      } finally {
        setSaving(false);
      }
    };

  const handleCloseApplicationDialog =
    () => {
      if (saving) {
        return;
      }

      setApplicationDialogOpen(
        false
      );

      setCurrentApplication(
        null
      );

      setApplicationNotes('');
      setApplicationStatus('NEW');
    };

  const handleSaveApplication =
    async () => {
      if (
        !currentApplication?.id
      ) {
        return;
      }

      try {
        setSaving(true);

        await Promise.all([
          updateCareerApplicationStatus(
            currentApplication.id,
            applicationStatus
          ),

          updateCareerApplicationNotes(
            currentApplication.id,
            applicationNotes
          ),
        ]);

        showNotification(
          'Application updated successfully'
        );

        handleCloseApplicationDialog();

        await Promise.all([
          loadApplications(),
          loadApplicationStats(),
        ]);
      } catch (error) {
        console.error(
          'Update Application Error:',
          error
        );

        showNotification(
          error.message ||
            'Failed to update application',
          'error'
        );
      } finally {
        setSaving(false);
      }
    };

  const handleQuickApplicationStatus =
    async (
      application,
      status
    ) => {
      try {
        await updateCareerApplicationStatus(
          application.id,
          status
        );

        showNotification(
          `Application moved to ${formatEnumLabel(
            status
          )}`
        );

        await Promise.all([
          loadApplications(),
          loadApplicationStats(),
        ]);
      } catch (error) {
        console.error(
          'Application Status Error:',
          error
        );

        showNotification(
          error.message ||
            'Failed to update application status',
          'error'
        );
      }
    };

  const handleDeleteApplication =
    async (application) => {
      const applicantName =
        `${application.first_name || ''} ${
          application.last_name || ''
        }`.trim();

      const confirmed =
        window.confirm(
          `Delete the application from ${applicantName}? This will also delete the uploaded resume and cover letter.`
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteCareerApplication(
          application.id
        );

        showNotification(
          'Application deleted successfully'
        );

        await Promise.all([
          loadApplications(),
          loadApplicationStats(),
        ]);
      } catch (error) {
        console.error(
          'Delete Application Error:',
          error
        );

        showNotification(
          error.message ||
            'Failed to delete application',
          'error'
        );
      }
    };

  // --------------------------------------------------------------------
  // RENDER HELPERS
  // --------------------------------------------------------------------

  const renderStatCard = ({
    label,
    value,
    icon,
    color = 'primary.main',
  }) => (
    <Card
      sx={{
        minWidth: 160,
        flex: 1,
        p: 2.5,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {label}
          </Typography>

          <Typography
            variant="h4"
            sx={{ mt: 0.5 }}
          >
            {value || 0}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.neutral',
            color,
          }}
        >
          <Iconify
            icon={icon}
            width={24}
          />
        </Box>
      </Stack>
    </Card>
  );

  // --------------------------------------------------------------------
  // JOBS VIEW
  // --------------------------------------------------------------------

  const renderJobs = () => (
    <Stack spacing={3}>
      <Stack
        direction={{
          xs: 'column',
          md: 'row',
        }}
        spacing={2}
      >
        {renderStatCard({
          label: 'Total Jobs',
          value:
            jobStats?.total,
          icon:
            'solar:case-round-bold',
        })}

        {renderStatCard({
          label: 'Published',
          value:
            jobStats?.published,
          icon:
            'solar:check-circle-bold',
          color:
            'success.main',
        })}

        {renderStatCard({
          label: 'Draft',
          value:
            jobStats?.draft,
          icon:
            'solar:document-text-bold',
          color:
            'text.secondary',
        })}

        {renderStatCard({
          label: 'Closed',
          value:
            jobStats?.closed,
          icon:
            'solar:lock-keyhole-bold',
          color:
            'warning.main',
        })}

        {renderStatCard({
          label: 'Archived',
          value:
            jobStats?.archived,
          icon:
            'solar:archive-bold',
          color:
            'error.main',
        })}
      </Stack>

      <Card>
        <Stack
          direction={{
            xs: 'column',
            lg: 'row',
          }}
          spacing={2}
          sx={{
            p: 3,
          }}
        >
          <TextField
            fullWidth
            label="Search Jobs"
            value={jobSearch}
            onChange={(event) => {
              setJobPage(0);
              setJobSearch(
                event.target.value
              );
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            fullWidth
            label="Status"
            value={
              jobStatusFilter
            }
            onChange={(event) => {
              setJobPage(0);
              setJobStatusFilter(
                event.target.value
              );
            }}
          >
            <MenuItem value="">
              All Statuses
            </MenuItem>

            {JOB_STATUSES.map(
              (status) => (
                <MenuItem
                  key={
                    status.value
                  }
                  value={
                    status.value
                  }
                >
                  {status.label}
                </MenuItem>
              )
            )}
          </TextField>

          <TextField
            select
            fullWidth
            label="Employment Type"
            value={
              employmentTypeFilter
            }
            onChange={(event) => {
              setJobPage(0);
              setEmploymentTypeFilter(
                event.target.value
              );
            }}
          >
            <MenuItem value="">
              All Types
            </MenuItem>

            {EMPLOYMENT_TYPES.map(
              (type) => (
                <MenuItem
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </MenuItem>
              )
            )}
          </TextField>

          <TextField
            select
            fullWidth
            label="Work Mode"
            value={
              workModeFilter
            }
            onChange={(event) => {
              setJobPage(0);
              setWorkModeFilter(
                event.target.value
              );
            }}
          >
            <MenuItem value="">
              All Modes
            </MenuItem>

            {WORK_MODES.map(
              (mode) => (
                <MenuItem
                  key={mode.value}
                  value={mode.value}
                >
                  {mode.label}
                </MenuItem>
              )
            )}
          </TextField>
        </Stack>

        <Divider />

        {jobsLoading ? (
          <Box
            sx={{
              py: 10,
              display: 'flex',
              justifyContent:
                'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table
                sx={{
                  minWidth: 1200,
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Job
                    </TableCell>

                    <TableCell>
                      Department
                    </TableCell>

                    <TableCell>
                      Location
                    </TableCell>

                    <TableCell>
                      Type
                    </TableCell>

                    <TableCell>
                      Status
                    </TableCell>

                    <TableCell align="center">
                      Vacancies
                    </TableCell>

                    <TableCell align="center">
                      Applications
                    </TableCell>

                    <TableCell>
                      Closing Date
                    </TableCell>

                    <TableCell align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {jobs.map((job) => {
                    const statusConfig =
                      getStatusConfig(
                        job.status,
                        JOB_STATUSES
                      );

                    return (
                      <TableRow
                        key={job.id}
                        hover
                      >
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                              >
                                {job.title}
                              </Typography>

                              {job.is_featured && (
                                <Chip
                                  size="small"
                                  color="warning"
                                  variant="soft"
                                  label="Featured"
                                />
                              )}
                            </Stack>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              /careers/
                              {job.slug}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          {job.department ||
                            '—'}
                        </TableCell>

                        <TableCell>
                          {job.location ||
                            '—'}
                        </TableCell>

                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              {formatEnumLabel(
                                job.employment_type
                              )}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatEnumLabel(
                                job.work_mode
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={
                              job.status
                            }
                            onChange={(
                              event
                            ) =>
                              handleJobStatusChange(
                                job,
                                event.target
                                  .value
                              )
                            }
                            sx={{
                              minWidth:
                                135,
                            }}
                          >
                            {JOB_STATUSES.map(
                              (
                                status
                              ) => (
                                <MenuItem
                                  key={
                                    status.value
                                  }
                                  value={
                                    status.value
                                  }
                                >
                                  {
                                    status.label
                                  }
                                </MenuItem>
                              )
                            )}
                          </TextField>

                          <Chip
                            size="small"
                            color={
                              statusConfig.color
                            }
                            variant="soft"
                            label={
                              statusConfig.label
                            }
                            sx={{
                              mt: 1,
                            }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          {job.vacancies ||
                            1}
                        </TableCell>

                        <TableCell align="center">
                          {job._count
                            ?.career_applications ||
                            0}
                        </TableCell>

                        <TableCell>
                          {formatDate(
                            job.closing_date
                          )}
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                          >
                            <IconButton
                              onClick={() =>
                                handleOpenEditJob(
                                  job
                                )
                              }
                            >
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>

                            <IconButton
                              color="error"
                              disabled={
                                job.status ===
                                'ARCHIVED'
                              }
                              onClick={() =>
                                handleArchiveJob(
                                  job
                                )
                              }
                            >
                              <Iconify icon="solar:archive-bold" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {jobs.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        align="center"
                        sx={{
                          py: 8,
                        }}
                      >
                        <Typography
                          variant="h6"
                          color="text.secondary"
                        >
                          No career jobs found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={
                jobPagination.total ||
                0
              }
              page={jobPage}
              rowsPerPage={
                jobRowsPerPage
              }
              onPageChange={(
                event,
                newPage
              ) =>
                setJobPage(
                  newPage
                )
              }
              onRowsPerPageChange={(
                event
              ) => {
                setJobRowsPerPage(
                  Number.parseInt(
                    event.target
                      .value,
                    10
                  )
                );

                setJobPage(0);
              }}
              rowsPerPageOptions={[
                10,
                25,
                50,
                100,
              ]}
            />
          </>
        )}
      </Card>
    </Stack>
  );

  // --------------------------------------------------------------------
  // APPLICATIONS VIEW
  // --------------------------------------------------------------------

  const renderApplications = () => (
    <Stack spacing={3}>
      <Stack
        direction={{
          xs: 'column',
          md: 'row',
        }}
        spacing={2}
      >
        {renderStatCard({
          label: 'Applications',
          value:
            applicationStats?.total,
          icon:
            'solar:users-group-rounded-bold',
        })}

        {renderStatCard({
          label: 'New',
          value:
            applicationStats?.new,
          icon:
            'solar:letter-bold',
          color:
            'info.main',
        })}

        {renderStatCard({
          label: 'Shortlisted',
          value:
            applicationStats?.shortlisted,
          icon:
            'solar:star-bold',
          color:
            'primary.main',
        })}

        {renderStatCard({
          label: 'Interview',
          value:
            applicationStats?.interview,
          icon:
            'solar:calendar-bold',
          color:
            'secondary.main',
        })}

        {renderStatCard({
          label: 'Selected',
          value:
            applicationStats?.selected,
          icon:
            'solar:check-circle-bold',
          color:
            'success.main',
        })}
      </Stack>

      <Card>
        <Stack
          direction={{
            xs: 'column',
            lg: 'row',
          }}
          spacing={2}
          sx={{
            p: 3,
          }}
        >
          <TextField
            fullWidth
            label="Search Applicants"
            value={
              applicationSearch
            }
            onChange={(event) => {
              setApplicationPage(
                0
              );

              setApplicationSearch(
                event.target.value
              );
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            fullWidth
            label="Status"
            value={
              applicationStatusFilter
            }
            onChange={(event) => {
              setApplicationPage(
                0
              );

              setApplicationStatusFilter(
                event.target.value
              );
            }}
          >
            <MenuItem value="">
              All Statuses
            </MenuItem>

            {APPLICATION_STATUSES.map(
              (status) => (
                <MenuItem
                  key={
                    status.value
                  }
                  value={
                    status.value
                  }
                >
                  {status.label}
                </MenuItem>
              )
            )}
          </TextField>

          <TextField
            select
            fullWidth
            label="Application Type"
            value={
              applicationTypeFilter
            }
            onChange={(event) => {
              setApplicationPage(
                0
              );

              setApplicationTypeFilter(
                event.target.value
              );
            }}
          >
            <MenuItem value="">
              All Types
            </MenuItem>

            {APPLICATION_TYPES.map(
              (type) => (
                <MenuItem
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </MenuItem>
              )
            )}
          </TextField>
        </Stack>

        <Divider />

        {applicationsLoading ? (
          <Box
            sx={{
              py: 10,
              display: 'flex',
              justifyContent:
                'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table
                sx={{
                  minWidth: 1200,
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      Applicant
                    </TableCell>

                    <TableCell>
                      Applied For
                    </TableCell>

                    <TableCell>
                      Type
                    </TableCell>

                    <TableCell>
                      Contact
                    </TableCell>

                    <TableCell>
                      Experience
                    </TableCell>

                    <TableCell>
                      Status
                    </TableCell>

                    <TableCell>
                      Applied Date
                    </TableCell>

                    <TableCell align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {applications.map(
                    (application) => {
                      const statusConfig =
                        getStatusConfig(
                          application.status,
                          APPLICATION_STATUSES
                        );

                      const applicantName =
                        `${
                          application.first_name ||
                          ''
                        } ${
                          application.last_name ||
                          ''
                        }`.trim();

                      return (
                        <TableRow
                          key={
                            application.id
                          }
                          hover
                        >
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                              >
                                {applicantName ||
                                  'Unknown Applicant'}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {application.department ||
                                  'No department'}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            {application
                              .career_jobs
                              ?.title ||
                              'General Resume'}
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              variant="outlined"
                              label={formatEnumLabel(
                                application.application_type
                              )}
                            />
                          </TableCell>

                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                {application.email}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {application.phone ||
                                  'No phone'}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            {application.experience_level
                              ? formatEnumLabel(
                                  application.experience_level
                                )
                              : '—'}
                          </TableCell>

                          <TableCell>
                            <TextField
                              select
                              size="small"
                              value={
                                application.status
                              }
                              onChange={(
                                event
                              ) =>
                                handleQuickApplicationStatus(
                                  application,
                                  event.target
                                    .value
                                )
                              }
                              sx={{
                                minWidth:
                                  140,
                              }}
                            >
                              {APPLICATION_STATUSES.map(
                                (
                                  status
                                ) => (
                                  <MenuItem
                                    key={
                                      status.value
                                    }
                                    value={
                                      status.value
                                    }
                                  >
                                    {
                                      status.label
                                    }
                                  </MenuItem>
                                )
                              )}
                            </TextField>

                            <Chip
                              size="small"
                              color={
                                statusConfig.color
                              }
                              variant="soft"
                              label={
                                statusConfig.label
                              }
                              sx={{
                                mt: 1,
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            {formatDateTime(
                              application.created_at
                            )}
                          </TableCell>

                          <TableCell align="right">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              justifyContent="flex-end"
                            >
                              <IconButton
                                onClick={() =>
                                  handleOpenApplication(
                                    application
                                  )
                                }
                              >
                                <Iconify icon="solar:eye-bold" />
                              </IconButton>

                              <IconButton
                                color="error"
                                onClick={() =>
                                  handleDeleteApplication(
                                    application
                                  )
                                }
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}

                  {applications.length ===
                    0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{
                          py: 8,
                        }}
                      >
                        <Typography
                          variant="h6"
                          color="text.secondary"
                        >
                          No applications found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={
                applicationPagination.total ||
                0
              }
              page={
                applicationPage
              }
              rowsPerPage={
                applicationRowsPerPage
              }
              onPageChange={(
                event,
                newPage
              ) =>
                setApplicationPage(
                  newPage
                )
              }
              onRowsPerPageChange={(
                event
              ) => {
                setApplicationRowsPerPage(
                  Number.parseInt(
                    event.target
                      .value,
                    10
                  )
                );

                setApplicationPage(
                  0
                );
              }}
              rowsPerPageOptions={[
                10,
                25,
                50,
                100,
              ]}
            />
          </>
        )}
      </Card>
    </Stack>
  );

  // --------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------

  return (
    <Container maxWidth={false}>
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
        spacing={2}
        sx={{
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4">
            Career Management
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage job openings,
            applicants, resumes, and
            hiring progress.
          </Typography>
        </Box>

        {activeTab === 'jobs' && (
          <Button
            variant="contained"
            startIcon={
              <Iconify icon="eva:plus-fill" />
            }
            onClick={
              handleOpenCreateJob
            }
          >
            New Job
          </Button>
        )}
      </Stack>

      <Card
        sx={{
          mb: 3,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={
            handleTabChange
          }
          sx={{
            px: 2,
          }}
        >
          <Tab
            value="jobs"
            icon={
              <Iconify icon="solar:case-round-bold" />
            }
            iconPosition="start"
            label="Career Jobs"
          />

          <Tab
            value="applications"
            icon={
              <Iconify icon="solar:users-group-rounded-bold" />
            }
            iconPosition="start"
            label="Applications"
          />
        </Tabs>
      </Card>

      {activeTab === 'jobs'
        ? renderJobs()
        : renderApplications()}

      {/* ==================================================
          JOB CREATE / EDIT DIALOG
      ================================================== */}

      <Dialog
        open={jobDialogOpen}
        onClose={
          handleCloseJobDialog
        }
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          {editingJob
            ? 'Edit Career Job'
            : 'Create Career Job'}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={4}>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{
                  mb: 2,
                }}
              >
                Basic Information
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(2, 1fr)',
                  },
                  gap: 2,
                }}
              >
                <TextField
                  required
                  label="Job Title"
                  value={jobForm.title}
                  onChange={
                    handleJobTitleChange
                  }
                />

                <TextField
                  required
                  label="Slug"
                  value={jobForm.slug}
                  onChange={
                    handleJobFormChange(
                      'slug'
                    )
                  }
                />

                <TextField
                  label="Department"
                  value={
                    jobForm.department
                  }
                  onChange={
                    handleJobFormChange(
                      'department'
                    )
                  }
                />

                <TextField
                  label="Location"
                  value={
                    jobForm.location
                  }
                  onChange={
                    handleJobFormChange(
                      'location'
                    )
                  }
                />

                <TextField
                  select
                  label="Employment Type"
                  value={
                    jobForm.employment_type
                  }
                  onChange={
                    handleJobFormChange(
                      'employment_type'
                    )
                  }
                >
                  {EMPLOYMENT_TYPES.map(
                    (type) => (
                      <MenuItem
                        key={
                          type.value
                        }
                        value={
                          type.value
                        }
                      >
                        {type.label}
                      </MenuItem>
                    )
                  )}
                </TextField>

                <TextField
                  select
                  label="Work Mode"
                  value={
                    jobForm.work_mode
                  }
                  onChange={
                    handleJobFormChange(
                      'work_mode'
                    )
                  }
                >
                  {WORK_MODES.map(
                    (mode) => (
                      <MenuItem
                        key={
                          mode.value
                        }
                        value={
                          mode.value
                        }
                      >
                        {mode.label}
                      </MenuItem>
                    )
                  )}
                </TextField>

                <TextField
                  label="Experience Required"
                  placeholder="Example: 2–4 years"
                  value={
                    jobForm.experience_required
                  }
                  onChange={
                    handleJobFormChange(
                      'experience_required'
                    )
                  }
                />

                <TextField
                  label="Education Required"
                  value={
                    jobForm.education_required
                  }
                  onChange={
                    handleJobFormChange(
                      'education_required'
                    )
                  }
                />

                <TextField
                  type="number"
                  label="Vacancies"
                  value={
                    jobForm.vacancies
                  }
                  inputProps={{
                    min: 1,
                  }}
                  onChange={
                    handleJobFormChange(
                      'vacancies'
                    )
                  }
                />

                <TextField
                  label="Salary Range"
                  value={
                    jobForm.salary_range
                  }
                  onChange={
                    handleJobFormChange(
                      'salary_range'
                    )
                  }
                />

                <TextField
                  select
                  label="Status"
                  value={
                    jobForm.status
                  }
                  onChange={
                    handleJobFormChange(
                      'status'
                    )
                  }
                >
                  {JOB_STATUSES.map(
                    (status) => (
                      <MenuItem
                        key={
                          status.value
                        }
                        value={
                          status.value
                        }
                      >
                        {
                          status.label
                        }
                      </MenuItem>
                    )
                  )}
                </TextField>

                <TextField
                  type="number"
                  label="Display Order"
                  value={
                    jobForm.display_order
                  }
                  onChange={
                    handleJobFormChange(
                      'display_order'
                    )
                  }
                />

                <TextField
                  type="date"
                  label="Closing Date"
                  value={
                    jobForm.closing_date
                  }
                  onChange={
                    handleJobFormChange(
                      'closing_date'
                    )
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        jobForm.is_featured
                      }
                      onChange={
                        handleJobFormChange(
                          'is_featured'
                        )
                      }
                    />
                  }
                  label="Featured Job"
                />
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{
                  mb: 2,
                }}
              >
                Job Content
              </Typography>

              <Stack spacing={2}>
                <TextField
                  multiline
                  minRows={2}
                  label="Short Description"
                  value={
                    jobForm.short_description
                  }
                  onChange={
                    handleJobFormChange(
                      'short_description'
                    )
                  }
                />

                <TextField
                  multiline
                  minRows={4}
                  label="Job Summary"
                  value={
                    jobForm.summary
                  }
                  onChange={
                    handleJobFormChange(
                      'summary'
                    )
                  }
                />

                <TextField
                  multiline
                  minRows={6}
                  label="Responsibilities"
                  helperText="Write one responsibility per line."
                  value={
                    jobForm.responsibilities
                  }
                  onChange={
                    handleJobFormChange(
                      'responsibilities'
                    )
                  }
                />

                <TextField
                  multiline
                  minRows={6}
                  label="Qualifications"
                  helperText="Write one qualification per line."
                  value={
                    jobForm.qualifications
                  }
                  onChange={
                    handleJobFormChange(
                      'qualifications'
                    )
                  }
                />

                <TextField
                  multiline
                  minRows={4}
                  label="Required Skills"
                  helperText="Write one skill per line."
                  value={
                    jobForm.skills_required
                  }
                  onChange={
                    handleJobFormChange(
                      'skills_required'
                    )
                  }
                />

                <TextField
                  multiline
                  minRows={4}
                  label="Benefits"
                  helperText="Write one benefit per line."
                  value={
                    jobForm.benefits
                  }
                  onChange={
                    handleJobFormChange(
                      'benefits'
                    )
                  }
                />
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{
                  mb: 2,
                }}
              >
                Contact and Application
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'repeat(2, 1fr)',
                  },
                  gap: 2,
                }}
              >
                <TextField
                  label="Contact Phone"
                  value={
                    jobForm.contact_phone
                  }
                  onChange={
                    handleJobFormChange(
                      'contact_phone'
                    )
                  }
                />

                <TextField
                  label="Contact Email"
                  value={
                    jobForm.contact_email
                  }
                  onChange={
                    handleJobFormChange(
                      'contact_email'
                    )
                  }
                />

                <TextField
                  multiline
                  minRows={3}
                  label="Office Hours"
                  value={
                    jobForm.office_hours
                  }
                  onChange={
                    handleJobFormChange(
                      'office_hours'
                    )
                  }
                />

                <TextField
                  multiline
                  minRows={3}
                  label="How to Apply"
                  value={
                    jobForm.how_to_apply
                  }
                  onChange={
                    handleJobFormChange(
                      'how_to_apply'
                    )
                  }
                />
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{
                  mb: 2,
                }}
              >
                SEO
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="Meta Title"
                  value={
                    jobForm.meta_title
                  }
                  onChange={
                    handleJobFormChange(
                      'meta_title'
                    )
                  }
                />

                <TextField
                  multiline
                  minRows={3}
                  label="Meta Description"
                  value={
                    jobForm.meta_description
                  }
                  onChange={
                    handleJobFormChange(
                      'meta_description'
                    )
                  }
                />

                <TextField
                  label="Canonical URL"
                  value={
                    jobForm.canonical_url
                  }
                  onChange={
                    handleJobFormChange(
                      'canonical_url'
                    )
                  }
                />

                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          jobForm.robots_index
                        }
                        onChange={
                          handleJobFormChange(
                            'robots_index'
                          )
                        }
                      />
                    }
                    label="Robots Index"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          jobForm.robots_follow
                        }
                        onChange={
                          handleJobFormChange(
                            'robots_follow'
                          )
                        }
                      />
                    }
                    label="Robots Follow"
                  />
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Button
            color="inherit"
            onClick={
              handleCloseJobDialog
            }
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSaveJob
            }
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <Iconify icon="solar:diskette-bold" />
              )
            }
          >
            {editingJob
              ? 'Update Job'
              : 'Create Job'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================================================
          APPLICATION DETAILS DIALOG
      ================================================== */}

      <Dialog
        open={
          applicationDialogOpen
        }
        onClose={
          handleCloseApplicationDialog
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Application Details
        </DialogTitle>

        <DialogContent dividers>
          {currentApplication && (
            <Stack spacing={3}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                  },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Applicant
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                  >
                    {
                      currentApplication.first_name
                    }{' '}
                    {
                      currentApplication.last_name
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Applied For
                  </Typography>

                  <Typography variant="subtitle1">
                    {currentApplication
                      .career_jobs
                      ?.title ||
                      'General Resume'}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Email
                  </Typography>

                  <Typography variant="body1">
                    {
                      currentApplication.email
                    }
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Phone
                  </Typography>

                  <Typography variant="body1">
                    {currentApplication.phone ||
                      '—'}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Department
                  </Typography>

                  <Typography variant="body1">
                    {currentApplication.department ||
                      currentApplication
                        .career_jobs
                        ?.department ||
                      '—'}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Experience
                  </Typography>

                  <Typography variant="body1">
                    {currentApplication.experience_level
                      ? formatEnumLabel(
                          currentApplication.experience_level
                        )
                      : '—'}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Application Type
                  </Typography>

                  <Typography variant="body1">
                    {formatEnumLabel(
                      currentApplication.application_type
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Submitted
                  </Typography>

                  <Typography variant="body1">
                    {formatDateTime(
                      currentApplication.created_at
                    )}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                  }}
                >
                  Message
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    whiteSpace:
                      'pre-line',
                  }}
                >
                  {currentApplication.message ||
                    'No message provided.'}
                </Typography>
              </Box>

              <Divider />

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={2}
              >
                {currentApplication.resume_url && (
                  <Button
                    component="a"
                    href={
                      currentApplication.resume_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    startIcon={
                      <Iconify icon="solar:document-bold" />
                    }
                  >
                    Open Resume
                  </Button>
                )}

                {currentApplication.cover_letter_url && (
                  <Button
                    component="a"
                    href={
                      currentApplication.cover_letter_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    startIcon={
                      <Iconify icon="solar:letter-bold" />
                    }
                  >
                    Open Cover Letter
                  </Button>
                )}
              </Stack>

              <Divider />

              <TextField
                select
                fullWidth
                label="Application Status"
                value={
                  applicationStatus
                }
                onChange={(event) =>
                  setApplicationStatus(
                    event.target.value
                  )
                }
              >
                {APPLICATION_STATUSES.map(
                  (status) => (
                    <MenuItem
                      key={
                        status.value
                      }
                      value={
                        status.value
                      }
                    >
                      {status.label}
                    </MenuItem>
                  )
                )}
              </TextField>

              <TextField
                fullWidth
                multiline
                minRows={5}
                label="Internal Notes"
                placeholder="Add private notes for the hiring team..."
                value={
                  applicationNotes
                }
                onChange={(event) =>
                  setApplicationNotes(
                    event.target.value
                  )
                }
              />

              {currentApplication.users && (
                <Alert severity="info">
                  Last reviewed by{' '}
                  {[
                    currentApplication
                      .users
                      .first_name,

                    currentApplication
                      .users
                      .last_name,
                  ]
                    .filter(Boolean)
                    .join(' ') ||
                    currentApplication
                      .users.email}
                  .
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Button
            color="inherit"
            onClick={
              handleCloseApplicationDialog
            }
            disabled={saving}
          >
            Close
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSaveApplication
            }
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <Iconify icon="solar:diskette-bold" />
              )
            }
          >
            Save Application
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={
          handleCloseNotification
        }
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={
            handleCloseNotification
          }
          severity={
            notification.severity
          }
          variant="filled"
          sx={{
            width: '100%',
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}