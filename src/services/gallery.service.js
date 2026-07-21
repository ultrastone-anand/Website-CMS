const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = sessionStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

const handleResponse = async (response, fallbackMessage) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

/* Categories */

export const getGalleryCategories = async () => {
  const response = await fetch(
    `${API_URL}/inspiration-gallery/categories`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to fetch gallery categories'
  );
};

export const createGalleryCategory = async (payload) => {
  const response = await fetch(
    `${API_URL}/inspiration-gallery/categories`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse(
    response,
    'Failed to create gallery category'
  );
};

export const updateGalleryCategory = async (
  categoryId,
  payload
) => {
  const response = await fetch(
    `${API_URL}/inspiration-gallery/categories/${categoryId}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse(
    response,
    'Failed to update gallery category'
  );
};

export const deleteGalleryCategory = async (categoryId) => {
  const response = await fetch(
    `${API_URL}/inspiration-gallery/categories/${categoryId}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to delete gallery category'
  );
};

/* Images */

export const getGalleryImages = async ({
  categoryId,
  limit = 50,
} = {}) => {
  const query = new URLSearchParams({
    limit: String(limit),
  });

  if (categoryId) {
    query.set('categoryId', String(categoryId));
  }

  const response = await fetch(
    `${API_URL}/inspiration-gallery/images?${query.toString()}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to fetch gallery images'
  );
};

export const createGalleryUploadUrls = async ({
  categoryId,
  files,
}) => {
  const response = await fetch(
    `${API_URL}/inspiration-gallery/images/presign`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        category_id: categoryId,
        files,
      }),
    }
  );

  return handleResponse(
    response,
    'Failed to create image upload URLs'
  );
};

export const uploadGalleryImageToR2 = async ({
  uploadUrl,
  file,
  contentType,
}) => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type':
        contentType ||
        file.type ||
        'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload ${file.name}`);
  }

  return true;
};

export const saveGalleryImages = async ({
  categoryId,
  images,
}) => {
  const response = await fetch(
    `${API_URL}/inspiration-gallery/images/save`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        category_id: categoryId,
        images,
      }),
    }
  );

  return handleResponse(
    response,
    'Failed to save gallery images'
  );
};

export const deleteGalleryImage = async (imageId) => {
  const response = await fetch(
    `${API_URL}/inspiration-gallery/images/${imageId}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to delete gallery image'
  );
};

export const updateGalleryImageAlt = async (
  imageId,
  imageAlt
) => {
  const response = await fetch(
    `${API_URL}/inspiration-gallery/images/${imageId}/alt`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        image_alt: imageAlt,
      }),
    }
  );

  return handleResponse(
    response,
    'Failed to update image alt text'
  );
};