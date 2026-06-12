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

// ================================
// SHOWROOM / COMPANY
// ================================

export const getCompanies = async () => {
  const response = await fetch(
    `${API_URL}/company`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch showrooms'
    );
  }

  return data;
};

export const getCompanyById = async (
  id
) => {
  const response = await fetch(
    `${API_URL}/company/${id}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to fetch showroom'
    );
  }

  return data;
};

export const createCompany = async (
  payload
) => {
  const response = await fetch(
    `${API_URL}/company`,
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
        'Failed to create showroom'
    );
  }

  return data;
};

export const updateCompany = async (
  id,
  payload
) => {
  const response = await fetch(
    `${API_URL}/company/${id}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to update showroom'
    );
  }

  return data;
};

export const deleteCompany = async (
  id
) => {
  const response = await fetch(
    `${API_URL}/company/${id}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to delete showroom'
    );
  }

  return data;
};