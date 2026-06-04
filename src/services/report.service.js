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

// ================= PRODUCT AUDIT REPORT =================

export const getProductAuditReport = async (
  slug
) => {
  const response = await fetch(
    `${API_URL}/reports/product-audit/${slug}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch product audit report'
    );
  }

  return data;
};

// ================= CATEGORY PRODUCTS REPORT =================

export const getCategoryProductsReport =
  async (slug) => {
    const response = await fetch(
      `${API_URL}/reports/category-products/${slug}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Failed to fetch category products report'
      );
    }

    return data;
  };