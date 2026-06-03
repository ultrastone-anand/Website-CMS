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

const getMultipartHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

// ================= GET PRODUCTS BY CATEGORY =================

export const getProductsByCategory =async (slug) => {
    const response = await fetch(
      `${API_URL}/stones/${slug}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to fetch products'
      );
    }

    return data;
  };

// ================= GET PRODUCT DETAIL =================

export const getProductDetail =async (slug) => {
    const response = await fetch(
      `${API_URL}/stones/productdetail/${slug}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to fetch product'
      );
    }

    return data;
  };

// ================= CREATE PRODUCT =================

export const createProduct =async (payload) => {
    const response = await fetch(
      `${API_URL}/stones/product`,
      {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to create product'
      );
    }

    return data;
  };

// ================= UPDATE PRODUCT =================

export const updateProduct = async (id, formData) => {
    const response = await fetch(
      `${API_URL}/stones/product/${id}`,
      {
        method: 'PUT',
        headers:
          getMultipartHeaders(),
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to update product'
      );
    }

    return data;
  };

// ================= DELETE PRODUCT =================

export const deleteProduct =async (id) => {
    const response = await fetch(
      `${API_URL}/stones/product/${id}`,
      {
        method: 'DELETE',
        headers: getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to delete product'
      );
    }

    return data;
  };