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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch page"
    );
  }

  return data;
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to create page"
    );
  }

  return data;
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update page"
    );
  }

  return data;
};

export const deletePage = async (id) => {
  const response = await fetch(
    `${API_URL}/pages/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to delete page"
    );
  }

  return data;
};

export const uploadPageImage = async (file) => {
  const token = sessionStorage.getItem("token");

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(
    `${API_URL}/pages/upload-image`,
    {
      method: "POST",
      headers: {
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to upload page image"
    );
  }

  return data;
};