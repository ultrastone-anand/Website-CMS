const API_URL =
  import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

// ================= GET ALL CATEGORIES =================

export const getCategories = async () => {
  const response = await fetch(
    `${API_URL}/stones/`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to fetch categories'
    );
  }

  return data;
};

// ================= CREATE CATEGORY =================

export const createCategory = async (
  payload
) => {
  const response = await fetch(
    `${API_URL}/stones/category`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to create category'
    );
  }

  return data;
};

// ================= UPDATE CATEGORY =================

export const updateCategory = async (
  id,
  payload
) => {
  const response = await fetch(
    `${API_URL}/stones/category/${id}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to update category'
    );
  }

  return data;
};

// ================= DEACTIVATE CATEGORY =================

export const deactivateCategory = async (
  item
) => {
  const payload = {
    name: item.name,
    slug: item.slug,
    description: item.description,
    parent_id:
      item.parent_id === null
        ? null
        : Number(item.parent_id),
    is_active: false,
  };

  return updateCategory(
    item.id,
    payload
  );
};

// ================= ACTIVATE CATEGORY =================

export const activateCategory = async (
  item
) => {
  const payload = {
    name: item.name,
    slug: item.slug,
    description: item.description,
    parent_id:
      item.parent_id === null
        ? null
        : Number(item.parent_id),
    is_active: true,
  };

  return updateCategory(
    item.id,
    payload
  );
};