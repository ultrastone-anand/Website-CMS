const API_URL =
  import.meta.env.VITE_API_URL;

// ======================================================
// HEADERS
// ======================================================

const getHeaders = () => {
  const token =
    sessionStorage.getItem(
      'token'
    );

  return {
    'Content-Type':
      'application/json',

    ...(token && {
      Authorization:
        `Bearer ${token}`,
    }),
  };
};

const getMultipartHeaders = () => {
  const token =
    sessionStorage.getItem(
      'token'
    );

  return {
    ...(token && {
      Authorization:
        `Bearer ${token}`,
    }),
  };
};

// ======================================================
// RESPONSE HANDLER
// ======================================================

const handleResponse =
  async (
    response,
    fallbackMessage
  ) => {
    let data;

    try {
      data =
        await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          fallbackMessage
      );
    }

    return data;
  };

// ======================================================
// QUERY STRING HELPER
// ======================================================

const buildQueryString = (
  params = {}
) => {
  const query =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        query.append(
          key,
          String(value)
        );
      }
    }
  );

  const queryString =
    query.toString();

  return queryString
    ? `?${queryString}`
    : '';
};

// ======================================================
// PUBLIC CAREER JOBS
// ======================================================

export const getPublishedJobs =
  async ({
    page = 1,
    limit = 20,
    search = '',
    department = '',
    location = '',
    employmentType = '',
    workMode = '',
  } = {}) => {
    const queryString =
      buildQueryString({
        page,
        limit,
        search,
        department,
        location,

        employment_type:
          employmentType,

        work_mode:
          workMode,
      });

    const response =
      await fetch(
        `${API_URL}/careers/jobs${queryString}`,
        {
          method: 'GET',
          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response,
      'Failed to fetch career jobs'
    );
  };

// ======================================================
// PUBLIC CAREER FILTERS
// ======================================================

export const getCareerJobFilters =
  async () => {
    const response =
      await fetch(
        `${API_URL}/careers/jobs/filters`,
        {
          method: 'GET',
          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response,
      'Failed to fetch career filters'
    );
  };

// ======================================================
// PUBLIC JOB DETAIL
// ======================================================

export const getPublishedJobBySlug =
  async (slug) => {
    if (!slug) {
      throw new Error(
        'Job slug is required'
      );
    }

    const response =
      await fetch(
        `${API_URL}/careers/jobs/${encodeURIComponent(
          slug
        )}`,
        {
          method: 'GET',
          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response,
      'Failed to fetch job details'
    );
  };

// ======================================================
// SUBMIT APPLICATION
// Supports:
// - JOB_APPLICATION
// - GENERAL_RESUME
// ======================================================

export const submitCareerApplication =
  async (formData) => {
    if (
      !(
        formData instanceof
        FormData
      )
    ) {
      throw new Error(
        'Application data must be FormData'
      );
    }

    const response =
      await fetch(
        `${API_URL}/careers/applications`,
        {
          method: 'POST',
          headers:
            getMultipartHeaders(),
          body:
            formData,
        }
      );

    return handleResponse(
      response,
      'Failed to submit application'
    );
  };

// ======================================================
// CREATE APPLICATION FORM DATA
// ======================================================

export const buildCareerApplicationFormData =
  ({
    jobId,
    applicationType =
      'JOB_APPLICATION',

    firstName,
    lastName,
    email,
    phone,
    department,
    message,
    experienceLevel,
    yearsOfExperience,
    resume,
    coverLetter,
    sourcePage,
  }) => {
    const formData =
      new FormData();

    formData.append(
      'application_type',
      applicationType
    );

    if (jobId) {
      formData.append(
        'job_id',
        jobId
      );
    }

    formData.append(
      'first_name',
      firstName || ''
    );

    formData.append(
      'last_name',
      lastName || ''
    );

    formData.append(
      'email',
      email || ''
    );

    formData.append(
      'phone',
      phone || ''
    );

    formData.append(
      'department',
      department || ''
    );

    formData.append(
      'message',
      message || ''
    );

    if (experienceLevel) {
      formData.append(
        'experience_level',
        experienceLevel
      );
    }

    if (
      yearsOfExperience !==
        undefined &&
      yearsOfExperience !== null &&
      yearsOfExperience !== ''
    ) {
      formData.append(
        'years_of_experience',
        String(
          yearsOfExperience
        )
      );
    }

    if (
      resume instanceof File
    ) {
      formData.append(
        'resume',
        resume
      );
    }

    if (
      coverLetter instanceof
      File
    ) {
      formData.append(
        'cover_letter',
        coverLetter
      );
    }

    if (sourcePage) {
      formData.append(
        'source_page',
        sourcePage
      );
    }

    return formData;
  };

// ======================================================
// CMS: GET ALL JOBS
// ======================================================

export const getCareerJobs =
  async ({
    page = 1,
    limit = 20,
    search = '',
    status = '',
    department = '',
    location = '',
    employmentType = '',
    workMode = '',
  } = {}) => {
    const queryString =
      buildQueryString({
        page,
        limit,
        search,
        status,
        department,
        location,

        employment_type:
          employmentType,

        work_mode:
          workMode,
      });

    const response =
      await fetch(
        `${API_URL}/careers/admin/jobs${queryString}`,
        {
          method: 'GET',
          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response,
      'Failed to fetch career jobs'
    );
  };

// ======================================================
// CMS: GET JOB STATISTICS
// ======================================================

export const getCareerJobStats =
  async () => {
    const response =
      await fetch(
        `${API_URL}/careers/admin/jobs/stats`,
        {
          method: 'GET',
          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response,
      'Failed to fetch job statistics'
    );
  };

// ======================================================
// CMS: GET JOB BY ID
// ======================================================

export const getCareerJobById =
  async (jobId) => {
    if (!jobId) {
      throw new Error(
        'Job ID is required'
      );
    }

    const response =
      await fetch(
        `${API_URL}/careers/admin/jobs/${jobId}`,
        {
          method: 'GET',
          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response,
      'Failed to fetch career job'
    );
  };

// ======================================================
// CMS: CREATE JOB
// ======================================================

export const createCareerJob =
  async (payload) => {
    const response =
      await fetch(
        `${API_URL}/careers/admin/jobs`,
        {
          method: 'POST',
          headers:
            getHeaders(),

          body:
            JSON.stringify(
              payload
            ),
        }
      );

    return handleResponse(
      response,
      'Failed to create career job'
    );
  };

// ======================================================
// CMS: UPDATE JOB
// ======================================================

export const updateCareerJob =
  async (
    jobId,
    payload
  ) => {
    if (!jobId) {
      throw new Error(
        'Job ID is required'
      );
    }

    const response =
      await fetch(
        `${API_URL}/careers/admin/jobs/${jobId}`,
        {
          method: 'PUT',
          headers:
            getHeaders(),

          body:
            JSON.stringify(
              payload
            ),
        }
      );

    return handleResponse(
      response,
      'Failed to update career job'
    );
  };

// ======================================================
// CMS: PARTIAL UPDATE JOB
// ======================================================

export const patchCareerJob =
  async (
    jobId,
    payload
  ) => {
    if (!jobId) {
      throw new Error(
        'Job ID is required'
      );
    }

    const response =
      await fetch(
        `${API_URL}/careers/admin/jobs/${jobId}`,
        {
          method: 'PATCH',
          headers:
            getHeaders(),

          body:
            JSON.stringify(
              payload
            ),
        }
      );

    return handleResponse(
      response,
      'Failed to update career job'
    );
  };

// ======================================================
// CMS: UPDATE JOB STATUS
// ======================================================

export const updateCareerJobStatus =
  async (
    jobId,
    status
  ) => {
    if (!jobId) {
      throw new Error(
        'Job ID is required'
      );
    }

    const response =
      await fetch(
        `${API_URL}/careers/admin/jobs/${jobId}/status`,
        {
          method: 'PATCH',
          headers:
            getHeaders(),

          body:
            JSON.stringify({
              status,
            }),
        }
      );

    return handleResponse(
      response,
      'Failed to update job status'
    );
  };

// ======================================================
// CMS: ARCHIVE JOB
// ======================================================

export const archiveCareerJob =
  async (jobId) => {
    if (!jobId) {
      throw new Error(
        'Job ID is required'
      );
    }

    const response =
      await fetch(
        `${API_URL}/careers/admin/jobs/${jobId}`,
        {
          method:
            'DELETE',

          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response,
      'Failed to archive career job'
    );
  };

// ======================================================
// CMS: PUBLISH JOB
// ======================================================

export const publishCareerJob =
  async (jobId) =>
    updateCareerJobStatus(
      jobId,
      'PUBLISHED'
    );

// ======================================================
// CMS: MOVE JOB TO DRAFT
// ======================================================

export const draftCareerJob =
  async (jobId) =>
    updateCareerJobStatus(
      jobId,
      'DRAFT'
    );

// ======================================================
// CMS: CLOSE JOB
// ======================================================

export const closeCareerJob =
  async (jobId) =>
    updateCareerJobStatus(
      jobId,
      'CLOSED'
    );

// ======================================================
// CMS: RESTORE ARCHIVED JOB
// ======================================================

export const restoreCareerJob =
  async (jobId) =>
    updateCareerJobStatus(
      jobId,
      'DRAFT'
    );

// ======================================================
// CMS: GET APPLICATIONS
// ======================================================

export const getCareerApplications =
  async ({
    page = 1,
    limit = 20,
    search = '',
    status = '',
    applicationType = '',
    jobId = '',
    department = '',
  } = {}) => {
    const queryString =
      buildQueryString({
        page,
        limit,
        search,
        status,
        department,

        application_type:
          applicationType,

        job_id:
          jobId,
      });

    const response =
      await fetch(
        `${API_URL}/careers/admin/applications${queryString}`,
        {
          method: 'GET',
          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response,
      'Failed to fetch career applications'
    );
  };

// ======================================================
// CMS: GET APPLICATION STATISTICS
// ======================================================

export const getCareerApplicationStats =
  async () => {
    const response =
      await fetch(
        `${API_URL}/careers/admin/applications/stats`,
        {
          method: 'GET',
          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response,
      'Failed to fetch application statistics'
    );
  };

// ======================================================
// CMS: GET APPLICATION BY ID
// ======================================================

export const getCareerApplicationById =
  async (
    applicationId
  ) => {
    if (!applicationId) {
      throw new Error(
        'Application ID is required'
      );
    }

    const response =
      await fetch(
        `${API_URL}/careers/admin/applications/${applicationId}`,
        {
          method: 'GET',
          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response,
      'Failed to fetch application details'
    );
  };

// ======================================================
// CMS: UPDATE APPLICATION
// ======================================================

export const updateCareerApplication =
  async (
    applicationId,
    payload
  ) => {
    if (!applicationId) {
      throw new Error(
        'Application ID is required'
      );
    }

    const response =
      await fetch(
        `${API_URL}/careers/admin/applications/${applicationId}`,
        {
          method: 'PATCH',
          headers:
            getHeaders(),

          body:
            JSON.stringify(
              payload
            ),
        }
      );

    return handleResponse(
      response,
      'Failed to update application'
    );
  };

// ======================================================
// CMS: UPDATE APPLICATION STATUS
// ======================================================

export const updateCareerApplicationStatus =
  async (
    applicationId,
    status
  ) => {
    if (!applicationId) {
      throw new Error(
        'Application ID is required'
      );
    }

    const response =
      await fetch(
        `${API_URL}/careers/admin/applications/${applicationId}/status`,
        {
          method: 'PATCH',
          headers:
            getHeaders(),

          body:
            JSON.stringify({
              status,
            }),
        }
      );

    return handleResponse(
      response,
      'Failed to update application status'
    );
  };

// ======================================================
// CMS: UPDATE APPLICATION NOTES
// ======================================================

export const updateCareerApplicationNotes =
  async (
    applicationId,
    internalNotes
  ) => {
    if (!applicationId) {
      throw new Error(
        'Application ID is required'
      );
    }

    const response =
      await fetch(
        `${API_URL}/careers/admin/applications/${applicationId}/notes`,
        {
          method: 'PATCH',
          headers:
            getHeaders(),

          body:
            JSON.stringify({
              internal_notes:
                internalNotes,
            }),
        }
      );

    return handleResponse(
      response,
      'Failed to update application notes'
    );
  };

// ======================================================
// CMS: DELETE APPLICATION
// Deletes database record and associated R2 files.
// ======================================================

export const deleteCareerApplication =
  async (
    applicationId
  ) => {
    if (!applicationId) {
      throw new Error(
        'Application ID is required'
      );
    }

    const response =
      await fetch(
        `${API_URL}/careers/admin/applications/${applicationId}`,
        {
          method:
            'DELETE',

          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response,
      'Failed to delete application'
    );
  };

// ======================================================
// APPLICATION STATUS SHORTCUTS
// ======================================================

export const markCareerApplicationReviewing =
  async (
    applicationId
  ) =>
    updateCareerApplicationStatus(
      applicationId,
      'REVIEWING'
    );

export const shortlistCareerApplication =
  async (
    applicationId
  ) =>
    updateCareerApplicationStatus(
      applicationId,
      'SHORTLISTED'
    );

export const markCareerApplicationInterview =
  async (
    applicationId
  ) =>
    updateCareerApplicationStatus(
      applicationId,
      'INTERVIEW'
    );

export const selectCareerApplication =
  async (
    applicationId
  ) =>
    updateCareerApplicationStatus(
      applicationId,
      'SELECTED'
    );

export const rejectCareerApplication =
  async (
    applicationId
  ) =>
    updateCareerApplicationStatus(
      applicationId,
      'REJECTED'
    );

export const withdrawCareerApplication =
  async (
    applicationId
  ) =>
    updateCareerApplicationStatus(
      applicationId,
      'WITHDRAWN'
    );