/* =========================================================
   CONFIGURATION
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL || ''
).replace(/\/$/, '');

/* =========================================================
   AUTH HEADERS
========================================================= */

const getHeaders = () => {
  const token = sessionStorage.getItem('token');

  return {
    'Content-Type': 'application/json',

    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

/* =========================================================
   BUILD DATE FILTER QUERY
========================================================= */

const buildDateQuery = ({ fromDate, toDate } = {}) => {
  const params = new URLSearchParams();

  if (fromDate) {
    params.append('fromDate', fromDate);
  }

  if (toDate) {
    params.append('toDate', toDate);
  }

  const query = params.toString();

  return query ? `?${query}` : '';
};

/* =========================================================
   COMMON API ERROR HANDLER
========================================================= */

const getApiError = async (response, fallbackMessage) => {
  try {
    const data = await response.json();

    return new Error(data.message || fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
};

/* =========================================================
   FETCH REPORT HELPER
========================================================= */

const fetchReport = async ({
  endpoint,
  filters = {},
  errorMessage,
}) => {
  const query = buildDateQuery(filters);

  const response = await fetch(
    `${API_URL}/${endpoint}${query}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw await getApiError(response, errorMessage);
  }

  return response.json();
};

/* =========================================================
   DOWNLOAD FILE HELPER
========================================================= */

const downloadFile = async ({
  url,
  fallbackFileName,
  errorMessage,
}) => {
  const token = sessionStorage.getItem('token');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
  });

  if (!response.ok) {
    throw await getApiError(response, errorMessage);
  }

  const blob = await response.blob();

  const objectUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = objectUrl;

  const contentDisposition = response.headers.get(
    'content-disposition'
  );

  let fileName = fallbackFileName;

  if (contentDisposition) {
    const utf8Match = contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/i
    );

    const normalMatch = contentDisposition.match(
      /filename="?([^";]+)"?/i
    );

    if (utf8Match?.[1]) {
      try {
        fileName = decodeURIComponent(utf8Match[1]);
      } catch {
        fileName = fallbackFileName;
      }
    } else if (normalMatch?.[1]) {
      fileName = normalMatch[1];
    }
  }

  link.download = fileName;

  document.body.appendChild(link);

  link.click();

  link.remove();

  setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 1000);
};

/* =========================================================
   DOWNLOAD REPORT HELPER
========================================================= */

const downloadReport = async ({
  endpoint,
  filters = {},
  fallbackFileName,
  errorMessage,
}) => {
  const query = buildDateQuery(filters);

  await downloadFile({
    url: `${API_URL}/${endpoint}/export${query}`,
    fallbackFileName,
    errorMessage,
  });
};

/* =========================================================
   CEU REQUESTS
========================================================= */

export const getCeuRequests = async (filters = {}) =>
  fetchReport({
    endpoint: 'ceu-request',
    filters,
    errorMessage: 'Failed to fetch CEU requests',
  });

export const downloadCeuRequests = async (filters = {}) =>
  downloadReport({
    endpoint: 'ceu-request',
    filters,
    fallbackFileName: 'ceu-requests.xlsx',
    errorMessage: 'Failed to download CEU report',
  });

/* =========================================================
   DISPLAY REQUESTS
========================================================= */

export const getDisplayRequests = async (filters = {}) =>
  fetchReport({
    endpoint: 'display-request',
    filters,
    errorMessage: 'Failed to fetch display requests',
  });

export const downloadDisplayRequests = async (filters = {}) =>
  downloadReport({
    endpoint: 'display-request',
    filters,
    fallbackFileName: 'display-requests.xlsx',
    errorMessage: 'Failed to download Display Requests report',
  });

/* =========================================================
   SAMPLE REQUESTS
========================================================= */

export const getSampleRequests = async (filters = {}) =>
  fetchReport({
    endpoint: 'sample-requests',
    filters,
    errorMessage: 'Failed to fetch sample requests',
  });

export const downloadSampleRequests = async (filters = {}) =>
  downloadReport({
    endpoint: 'sample-requests',
    filters,
    fallbackFileName: 'sample-requests.xlsx',
    errorMessage: 'Failed to download Sample Requests report',
  });

/* =========================================================
   PRODUCT REGISTRATIONS
========================================================= */

export const getProductRegistrations = async (filters = {}) =>
  fetchReport({
    endpoint: 'product-registrations',
    filters,
    errorMessage: 'Failed to fetch product registrations',
  });

export const downloadProductRegistrations = async (filters = {}) =>
  downloadReport({
    endpoint: 'product-registrations',
    filters,
    fallbackFileName: 'product-registrations.xlsx',
    errorMessage: 'Failed to download Product Registration report',
  });