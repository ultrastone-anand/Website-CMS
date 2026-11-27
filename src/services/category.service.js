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

// ================= GET ALL CATEGORIES - CMS ADMIN =================

export const getCategories = async () => {
  const response = await fetch(
    `${API_URL}/stones/admin/categories`,
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


// =====================================================
// CATEGORY RESOURCES APIs
// =====================================================

const RESOURCE_API = `${API_URL}/category-resources`;

const getResourceHeaders = () => {
  const token = sessionStorage.getItem('token');

  return {
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

const parseResourceResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  let data = null;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : {};
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed (${response.status})`
    );
  }

  return data;
};

// ================= GET ALL RESOURCES =================

export const getCategoryResources = async () => {
  const response = await fetch(RESOURCE_API, {
    method: 'GET',
    headers: getResourceHeaders(),
  });

  return parseResourceResponse(response);
};

// ================= GET RESOURCES BY CATEGORY =================

export const getResourcesByCategory = async (slug) => {
  const response = await fetch(
    `${RESOURCE_API}/category/${encodeURIComponent(slug)}`,
    {
      method: 'GET',
      headers: getResourceHeaders(),
    }
  );

  return parseResourceResponse(response);
};

// ================= GET SINGLE RESOURCE =================

export const getCategoryResource = async (id) => {
  const response = await fetch(
    `${RESOURCE_API}/${encodeURIComponent(id)}`,
    {
      method: 'GET',
      headers: getResourceHeaders(),
    }
  );

  return parseResourceResponse(response);
};

// ================= CREATE RESOURCE =================

export const createCategoryResource = async (payload) => {
  const response = await fetch(RESOURCE_API, {
    method: 'POST',
    headers: getResourceHeaders(),
    body: payload,
  });

  return parseResourceResponse(response);
};

// ================= UPDATE RESOURCE =================

export const updateCategoryResource = async (id, payload) => {
  const response = await fetch(
    `${RESOURCE_API}/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: getResourceHeaders(),
      body: payload,
    }
  );

  return parseResourceResponse(response);
};

// ================= UPDATE RESOURCE STATUS =================

export const updateCategoryResourceStatus = async (
  id,
  isActive
) => {
  const response = await fetch(
    `${RESOURCE_API}/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      headers: {
        ...getResourceHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_active: isActive,
      }),
    }
  );

  return parseResourceResponse(response);
};

// ================= DELETE RESOURCE =================

export const deleteCategoryResource = async (id) => {
  const response = await fetch(
    `${RESOURCE_API}/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: getResourceHeaders(),
    }
  );

  return parseResourceResponse(response);
};



//
// =====================================================
// CATEGORY SEO APIs
// =====================================================
//

const CATEGORY_SEO_API = `${API_URL}/category-seo`;

// =====================================================
// HELPERS
// =====================================================

const getCategorySeoHeaders = () => {
  const token = sessionStorage.getItem("token");

  return {
    "Content-Type": "application/json",

    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

const parseCategorySeoResponse = async (response) => {
  const contentType =
    response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    data = text
      ? { message: text }
      : {};
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Category SEO request failed (${response.status})`
    );
  }

  return data;
};

// =====================================================
// GET ALL CATEGORY SEO - ADMIN
// =====================================================

export const getAllCategorySeo = async (
  filters = {}
) => {
  const params = new URLSearchParams();

  if (
    filters.search !== undefined &&
    filters.search !== null &&
    filters.search !== ""
  ) {
    params.set("search", filters.search);
  }

  if (
    filters.is_active !== undefined &&
    filters.is_active !== null &&
    filters.is_active !== ""
  ) {
    params.set(
      "is_active",
      String(filters.is_active)
    );
  }

  const query = params.toString();

  const url = query
    ? `${CATEGORY_SEO_API}?${query}`
    : CATEGORY_SEO_API;

  const response = await fetch(url, {
    method: "GET",
    headers: getCategorySeoHeaders(),
  });

  return parseCategorySeoResponse(response);
};

// =====================================================
// GET CATEGORY SEO BY ID - ADMIN
// =====================================================

export const getCategorySeoById = async (id) => {
  const response = await fetch(
    `${CATEGORY_SEO_API}/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: getCategorySeoHeaders(),
    }
  );

  return parseCategorySeoResponse(response);
};

// =====================================================
// GET CATEGORY SEO BY SLUG - PUBLIC
// =====================================================

export const getPublicCategorySeo = async (slug) => {
  const response = await fetch(
    `${CATEGORY_SEO_API}/public/${encodeURIComponent(slug)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return parseCategorySeoResponse(response);
};

// =====================================================
// CREATE / SAVE CATEGORY SEO - ADMIN
// =====================================================

export const createCategorySeo = async (
  categoryId,
  payload
) => {
  const response = await fetch(
    `${CATEGORY_SEO_API}/${encodeURIComponent(categoryId)}`,
    {
      method: "POST",
      headers: getCategorySeoHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return parseCategorySeoResponse(response);
};

// =====================================================
// UPDATE CATEGORY SEO - ADMIN
// =====================================================

export const updateCategorySeo = async (
  categoryId,
  payload
) => {
  const response = await fetch(
    `${CATEGORY_SEO_API}/${encodeURIComponent(categoryId)}`,
    {
      method: "PUT",
      headers: getCategorySeoHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return parseCategorySeoResponse(response);
};

// =====================================================
// DELETE / CLEAR CATEGORY SEO - ADMIN
// =====================================================

export const deleteCategorySeo = async (
  categoryId
) => {
  const response = await fetch(
    `${CATEGORY_SEO_API}/${encodeURIComponent(categoryId)}`,
    {
      method: "DELETE",
      headers: getCategorySeoHeaders(),
    }
  );

  return parseCategorySeoResponse(response);
};
