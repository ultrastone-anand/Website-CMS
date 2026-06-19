const API_URL =
  import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = sessionStorage.getItem('token');

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

  const token =
    sessionStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/stones/category`,
    {
      method: "POST",

      headers: {
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      },

      body: payload,
    }
  );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      data.message ||
      "Failed to create category"
    );

  }

  return data;
};
// ================= UPDATE CATEGORY =================

export const updateCategory = async (
  id,
  payload
) => {

  const token =
    sessionStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/stones/category/${id}`,
    {
      method: "PUT",

      headers: {
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      },

      body: payload,
    }
  );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      data.message ||
      "Failed to update category"
    );

  }

  return data;
};


// ================= DEACTIVATE CATEGORY =================

export const deactivateCategory = async (
  item
) => {

  const payload = new FormData();

  payload.append(
    "name",
    item.name
  );

  payload.append(
    "slug",
    item.slug
  );

  payload.append(
    "description",
    item.description || ""
  );

  payload.append(
    "parent_id",
    item.parent_id ?? ""
  );

  payload.append(
    "is_active",
    "false"
  );


  payload.append(
    "silica_warning",
    String(item.silica_warning || false)
  );


  payload.append(
    "silica_warning_message",
    item.silica_warning_message || ""
  );


  return updateCategory(
    item.id,
    payload
  );
};



// ================= ACTIVATE CATEGORY =================

export const activateCategory = async (
  item
) => {

  const payload = new FormData();

  payload.append(
    "name",
    item.name
  );

  payload.append(
    "slug",
    item.slug
  );

  payload.append(
    "description",
    item.description || ""
  );

  payload.append(
    "parent_id",
    item.parent_id ?? ""
  );

  payload.append(
    "is_active",
    "true"
  );


  payload.append(
    "silica_warning",
    String(item.silica_warning || false)
  );


  payload.append(
    "silica_warning_message",
    item.silica_warning_message || ""
  );


  return updateCategory(
    item.id,
    payload
  );
};