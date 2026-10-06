const API_URL =
  import.meta.env.VITE_API_URL;

/* =========================================================
   AUTH HEADERS
========================================================= */

const getHeaders = () => {
  const token =
    sessionStorage.getItem('token');

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

const buildDateQuery = ({
  fromDate,
  toDate,
} = {}) => {
  const params =
    new URLSearchParams();

  if (fromDate) {
    params.append(
      'fromDate',
      fromDate
    );
  }

  if (toDate) {
    params.append(
      'toDate',
      toDate
    );
  }

  const query =
    params.toString();

  return query
    ? `?${query}`
    : '';
};

/* =========================================================
   DOWNLOAD FILE HELPER
========================================================= */

const downloadFile = async ({
  url,
  fallbackFileName,
  errorMessage,
}) => {
  const token =
    sessionStorage.getItem(
      'token'
    );

  const response =
    await fetch(
      url,
      {
        method: 'GET',

        headers: {
          ...(token && {
            Authorization:
              `Bearer ${token}`,
          }),
        },
      }
    );

  if (!response.ok) {
    let message =
      errorMessage;

    try {
      const data =
        await response.json();

      message =
        data.message ||
        message;
    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(
      message
    );
  }

  const blob =
    await response.blob();

  const objectUrl =
    window.URL.createObjectURL(
      blob
    );

  const link =
    document.createElement('a');

  link.href =
    objectUrl;

  /* =====================================================
     GET FILENAME FROM BACKEND
  ===================================================== */

  const contentDisposition =
    response.headers.get(
      'content-disposition'
    );

  const fileNameMatch =
    contentDisposition?.match(
      /filename="?([^"]+)"?/i
    );

  link.download =
    fileNameMatch?.[1] ||
    fallbackFileName;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  window.URL.revokeObjectURL(
    objectUrl
  );
};

/* =========================================================
   CEU REQUESTS
========================================================= */

export const getCeuRequests = async (
  filters = {}
) => {
  const query =
    buildDateQuery(filters);

  const response =
    await fetch(
      `${API_URL}/ceu-request${query}`,
      {
        method: 'GET',

        headers:
          getHeaders(),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch CEU requests'
    );
  }

  return data;
};

/* =========================================================
   DOWNLOAD CEU REQUESTS EXCEL
========================================================= */

export const downloadCeuRequests = async (
  filters = {}
) => {
  const query =
    buildDateQuery(filters);

  await downloadFile({
    url:
      `${API_URL}/ceu-request/export${query}`,

    fallbackFileName:
      'ceu-requests.xlsx',

    errorMessage:
      'Failed to download CEU report',
  });
};

/* =========================================================
   DISPLAY REQUESTS
========================================================= */

export const getDisplayRequests = async (
  filters = {}
) => {
  const query =
    buildDateQuery(filters);

  const response =
    await fetch(
      `${API_URL}/display-request${query}`,
      {
        method: 'GET',

        headers:
          getHeaders(),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch display requests'
    );
  }

  return data;
};

/* =========================================================
   DOWNLOAD DISPLAY REQUESTS EXCEL
========================================================= */

export const downloadDisplayRequests =
  async (
    filters = {}
  ) => {
    const query =
      buildDateQuery(filters);

    await downloadFile({
      url:
        `${API_URL}/display-request/export${query}`,

      fallbackFileName:
        'display-requests.xlsx',

      errorMessage:
        'Failed to download Display Requests report',
    });
  };

/* =========================================================
   SAMPLE REQUESTS
========================================================= */

export const getSampleRequests = async (
  filters = {}
) => {
  const query =
    buildDateQuery(filters);

  const response =
    await fetch(
      `${API_URL}/sample-request${query}`,
      {
        method: 'GET',

        headers:
          getHeaders(),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch sample requests'
    );
  }

  return data;
};

/* =========================================================
   DOWNLOAD SAMPLE REQUESTS EXCEL
========================================================= */

export const downloadSampleRequests =
  async (
    filters = {}
  ) => {
    const query =
      buildDateQuery(filters);

    await downloadFile({
      url:
        `${API_URL}/sample-request/export${query}`,

      fallbackFileName:
        'sample-requests.xlsx',

      errorMessage:
        'Failed to download Sample Requests report',
    });
  };