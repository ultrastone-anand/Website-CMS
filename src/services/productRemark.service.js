const API_URL =
  import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = sessionStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

// ================= GET PRODUCT REMARKS =================

export const getProductRemarks = async (
  productId
) => {

  const response = await fetch(
    `${API_URL}/products/${productId}/remarks`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to fetch remarks"
    );
  }

  return data;

};

// ================= CREATE REMARK =================

export const createRemark = async (
  productId,
  remark
) => {

  const response = await fetch(
    `${API_URL}/products/${productId}/remarks`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        remark,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to add remark"
    );
  }

  return data;

};

// ================= UPDATE REMARK =================

export const updateRemark = async (
  remarkId,
  remark
) => {

  const response = await fetch(
    `${API_URL}/remarks/${remarkId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        remark,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to update remark"
    );
  }

  return data;

};

// ================= DELETE REMARK =================

export const deleteRemark = async (
  remarkId
) => {

  const response = await fetch(
    `${API_URL}/remarks/${remarkId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to delete remark"
    );
  }

  return data;

};