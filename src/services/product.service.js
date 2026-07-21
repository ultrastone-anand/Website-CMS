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

const getMultipartHeaders = () => {
  const token = sessionStorage.getItem('token');

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

export const createProduct = async (
  formData
) => {

  const response = await fetch(
    `${API_URL}/stones/product`,
    {
      method: "POST",
      headers:
        getMultipartHeaders(),

      body: formData,
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to create product"
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
  console.log(id);
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

 // ================= BULK UPLOAD PRODUCT ================= 

export const bulkuploadProduct = async (products) => {
  const response = await fetch(
    `${API_URL}/stones/bulkupload`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        products,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Bulk upload failed"
    );
  }

  return data;
};

// ================= BULK DELETE PRODUCTS =================

export const bulkdeleteProduct = async (
  ids
) => {

  const response = await fetch(
    `${API_URL}/stones/bulk-delete`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        ids,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Bulk delete failed"
    );
  }

  return data;
};

// ================ ACTIVE/DEACTIVE PRODUCTS =================

export const updateProductStatus = async (
  id,
  is_active
) => {

  const response = await fetch(
    `${API_URL}/stones/product/${id}/status`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        is_active,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to update product status"
    );
  }

  return data;
};

// ================= BULK ACTIVE/DEACTIVE PRODUCTS =================

export const bulkupdateProductStatus = async (
  ids,
  is_active = true
) => {

  const response = await fetch(
    `${API_URL}/stones/bulk-deactive`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        ids,
        is_active,
      }),
    }
  );

  const data = await response.json(); 

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Bulk update failed"
    );
  }

  return data;
};


// ================= PUBLISH/UNPUBLISH PRODUCTS =================

export const updatePublishStatus = async (
  id,
  is_publish
) => {
  const response = await fetch(
    `${API_URL}/stones/product/${id}/publish`,
    {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        is_publish,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to update publish status"
    );
  }

  return data;
};


// ================= DELETE PRODUCT MEDIA =================

export const deleteProductMedia = async (
  mediaId
) => {

  const response = await fetch(
    `${API_URL}/stones/media/${mediaId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to delete media"
    );
  }

  return data;
};

// ================= GET R2 VIDEO UPLOAD URL =================

export const getVideoUploadUrl = async (fileName) => {
  const response = await fetch(
    `${API_URL}/stones/r2/video-upload-url`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        fileName,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to create video upload URL"
    );
  }

  return data.data;
};

// ================= UPLOAD VIDEO DIRECTLY TO R2 =================

export const uploadVideoDirectToR2 = async (file) => {
  const {
    uploadUrl,
    secure_url,
    public_id,
    contentType,
  } = await getVideoUploadUrl(file.name);

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(
      "Failed to upload video directly to R2"
    );
  }

  return {
    media_type: "FEATURED_VIDEO",
    media_url: secure_url,
    public_id,
    alt_text: "",
  };
};

// ================= SEARCH PRODUCTS =================

export const searchProducts = async ({
  query,
  categoryId = null,
  status = 'active',
  page = 1,
  limit = 24,
}) => {
  const params = new URLSearchParams();

  params.set('q', query);
  params.set('status', status);
  params.set('page', String(page));
  params.set('limit', String(limit));

  if (categoryId) {
    params.set(
      'category_id',
      String(categoryId)
    );
  }

  const response = await fetch(
    `${API_URL}/stones/search/products?${params.toString()}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Failed to search products'
    );
  }

  return data;
};