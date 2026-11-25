
const API_URL = import.meta.env.VITE_API_URL;

// ============================================================
// HEADERS
// ============================================================

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

// ============================================================
// RESPONSE HANDLER
// ============================================================

const parseResponse = async (
  response,
  fallbackMessage
) => {
  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message || fallbackMessage
    );
  }

  return data;
};

// ============================================================
// SEO MODE HELPER
// ============================================================

const getSeoModeQuery = (mode = "page") => {
  if (!["page", "record"].includes(mode)) {
    throw new Error("Invalid SEO mode.");
  }

  return mode === "record"
    ? "?mode=record"
    : "";
};

// ============================================================
// CMS PAGES - GET BY SLUG
// ============================================================

export const getPageBySlug = async (slug) => {
  const response = await fetch(
    `${API_URL}/pages/${encodeURIComponent(slug)}`,
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

// ============================================================
// CMS PAGES - CREATE
// ============================================================

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

// ============================================================
// CMS PAGES - UPDATE
// ============================================================

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

// ============================================================
// CMS PAGES - DELETE
// ============================================================

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

// ============================================================
// PAGE SEO - GET ALL
// ============================================================

export const getAllPageSeo = async (
  mode = "page"
) => {
  const response = await fetch(
    `${API_URL}/pages/seo${getSeoModeQuery(mode)}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return parseResponse(
    response,
    "Failed to fetch all page SEO records"
  );
};

// ============================================================
// PAGE SEO - GET BY PAGE ID OR SEO RECORD ID
// ============================================================

export const getPageSeoById = async (
  id,
  mode = "page"
) => {
  const response = await fetch(
    `${API_URL}/pages/seo/${encodeURIComponent(id)}${getSeoModeQuery(mode)}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return parseResponse(
    response,
    "Failed to fetch page SEO details"
  );
};

// ============================================================
// PAGE SEO - GET PUBLIC BY SLUG
// ============================================================

export const getPublicPageSeo = async (slug) => {
  const response = await fetch(
    `${API_URL}/pages/seo/public/${encodeURIComponent(slug)}`,
    {
      method: "GET",
    }
  );

  return parseResponse(
    response,
    "Failed to fetch public page SEO"
  );
};

// ============================================================
// PAGE SEO - CREATE
// ============================================================

export const createPageSeo = async (
  payload,
  mode = "page"
) => {
  const response = await fetch(
    `${API_URL}/pages/seo${getSeoModeQuery(mode)}`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return parseResponse(
    response,
    "Failed to create page SEO"
  );
};

// ============================================================
// PAGE SEO - UPDATE OR CREATE
// ============================================================

export const updatePageSeo = async (
  id,
  payload,
  mode = "page"
) => {
  const response = await fetch(
    `${API_URL}/pages/seo/${encodeURIComponent(id)}${getSeoModeQuery(mode)}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return parseResponse(
    response,
    "Failed to save page SEO"
  );
};

// ============================================================
// PAGE SEO - DELETE
// ============================================================

export const deletePageSeo = async (
  id,
  mode = "page"
) => {
  const response = await fetch(
    `${API_URL}/pages/seo/${encodeURIComponent(id)}${getSeoModeQuery(mode)}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return parseResponse(
    response,
    "Failed to delete page SEO"
  );
};

// ============================================================
// CENTRALIZED SEO MANAGEMENT HELPERS
// ============================================================

// GET ALL SEO RECORDS
// Includes CMS-managed and standalone pages.

export const getAllSeoRecords = async () =>
  getAllPageSeo("record");

// GET SEO RECORD BY page_seo.id

export const getSeoRecordById = async (seoId) =>
  getPageSeoById(seoId, "record");

// CREATE SEO RECORD

export const createSeoRecord = async (payload) =>
  createPageSeo(payload, "record");

// UPDATE SEO RECORD

export const updateSeoRecord = async (seoId, payload) =>
  updatePageSeo(seoId, payload, "record");

// DELETE SEO RECORD

export const deleteSeoRecord = async (seoId) =>
  deletePageSeo(seoId, "record");

// ============================================================
// UPLOAD PAGE IMAGE TO R2
// ============================================================

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

// ============================================================
// UPLOAD PAGE PDF TO BACKEND
// ============================================================

export const uploadPagePdf = async (file) => {
  const formData = new FormData();

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
