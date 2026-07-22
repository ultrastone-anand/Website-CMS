const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = sessionStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

const getUploadHeaders = () => {
  const token = sessionStorage.getItem("token");

  return {
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

const parseResponse = async (
  response,
  fallbackMessage
) => {
  let data;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message || fallbackMessage
    );
  }

  return data;
};

// ================================
// CMS PAGES
// ================================

export const getPageBySlug = async (slug) => {
  const response = await fetch(
    `${API_URL}/pages/${slug}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return parseResponse(
    response,
    "Failed to fetch page"
  );
};

export const createPage = async (payload) => {
  const response = await fetch(
    `${API_URL}/pages`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return parseResponse(
    response,
    "Failed to create page"
  );
};

export const updatePage = async (
  id,
  payload
) => {
  const response = await fetch(
    `${API_URL}/pages/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return parseResponse(
    response,
    "Failed to update page"
  );
};

export const deletePage = async (id) => {
  const response = await fetch(
    `${API_URL}/pages/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return parseResponse(
    response,
    "Failed to delete page"
  );
};

// ================================
// UPLOAD PAGE IMAGE TO R2
// ================================

export const uploadPageImage = async (file) => {
  const formData = new FormData();

  formData.append("image", file);

  const response = await fetch(
    `${API_URL}/pages/upload-image`,
    {
      method: "POST",
      headers: getUploadHeaders(),
      body: formData,
    }
  );

  return parseResponse(
    response,
    "Failed to upload page image"
  );
};

// ================================
// UPLOAD PAGE PDF TO BACKEND
// ================================

export const uploadPagePdf = async (file) => {
  const formData = new FormData();

  /*
   * Must match:
   * upload.single("pdf")
   * in the backend route.
   */
  formData.append("pdf", file);

  const response = await fetch(
    `${API_URL}/pages/upload-pdf`,
    {
      method: "POST",
      headers: getUploadHeaders(),
      body: formData,
    }
  );

  return parseResponse(
    response,
    "Failed to upload page PDF"
  );
};