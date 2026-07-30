const API_URL = import.meta.env.VITE_API_URL;

// ----------------------------------------------------------------------

const getHeaders = () => {
  const token = sessionStorage.getItem('token');

  return {
    'Content-Type': 'application/json',

    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

// ----------------------------------------------------------------------

const handleResponse = async (
  response,
  fallbackMessage
) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message || fallbackMessage
    );
  }

  return data;
};

// ----------------------------------------------------------------------
// Fetch product lots
// ----------------------------------------------------------------------

export const getProductLots = async (
  productId
) => {
  if (!productId) {
    throw new Error(
      'Product ID is required'
    );
  }

  const response = await fetch(
    `${API_URL}/lot-images/product/${productId}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to fetch product lots'
  );
};

// ----------------------------------------------------------------------
// Create presigned upload URLs
// ----------------------------------------------------------------------

export const createLotImageUploadUrls =
  async ({
    productId,
    lotName,
    files,
  }) => {
    if (!productId) {
      throw new Error(
        'Product ID is required'
      );
    }

    if (!lotName?.trim()) {
      throw new Error(
        'Lot name is required'
      );
    }

    if (
      !Array.isArray(files) ||
      files.length === 0
    ) {
      throw new Error(
        'Files are required'
      );
    }

    const response = await fetch(
      `${API_URL}/lot-images/presign`,
      {
        method: 'POST',
        headers: getHeaders(),

        body: JSON.stringify({
          product_id: productId,
          lot_name: lotName.trim(),
          files,
        }),
      }
    );

    return handleResponse(
      response,
      'Failed to create lot image upload URLs'
    );
  };

// ----------------------------------------------------------------------
// Upload file directly to R2
// ----------------------------------------------------------------------

export const uploadLotImageToR2 =
  async ({
    uploadUrl,
    file,
    contentType,
  }) => {
    if (!uploadUrl) {
      throw new Error(
        'Upload URL is required'
      );
    }

    if (!file) {
      throw new Error(
        'Image file is required'
      );
    }

    const response = await fetch(
      uploadUrl,
      {
        method: 'PUT',

        headers: {
          'Content-Type':
            contentType ||
            file.type ||
            'application/octet-stream',
        },

        body: file,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to upload ${
          file.name || 'image'
        }`
      );
    }

    return true;
  };

// ----------------------------------------------------------------------
// Save lot and image metadata
// ----------------------------------------------------------------------

export const saveLotImages = async ({
  productId,
  lotId = null,
  lotName,
  images = [],
}) => {
  if (!productId) {
    throw new Error(
      'Product ID is required'
    );
  }

  if (!lotName?.trim()) {
    throw new Error(
      'Lot name is required'
    );
  }

  const payload = {
    product_id: productId,
    lot_name: lotName.trim(),
    images,
  };

  if (lotId) {
    payload.lot_id = lotId;
  }

  const response = await fetch(
    `${API_URL}/lot-images/save`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse(
    response,
    'Failed to save lot images'
  );
};

// ----------------------------------------------------------------------
// Update lot
// ----------------------------------------------------------------------

export const updateLot = async (
  lotId,
  payload
) => {
  if (!lotId) {
    throw new Error(
      'Lot ID is required'
    );
  }

  const response = await fetch(
    `${API_URL}/lot-images/lots/${lotId}`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse(
    response,
    'Failed to update lot'
  );
};

// ----------------------------------------------------------------------

export const updateLotName = async (
  lotId,
  lotName
) => {
  if (!lotName?.trim()) {
    throw new Error(
      'Lot name is required'
    );
  }

  return updateLot(lotId, {
    lot_name: lotName.trim(),
  });
};

// ----------------------------------------------------------------------
// Delete complete lot
// ----------------------------------------------------------------------

export const deleteLot = async (
  lotId
) => {
  if (!lotId) {
    throw new Error(
      'Lot ID is required'
    );
  }

  const response = await fetch(
    `${API_URL}/lot-images/lots/${lotId}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to delete lot'
  );
};

// ----------------------------------------------------------------------
// Update one image
// ----------------------------------------------------------------------

export const updateLotImage = async (
  imageId,
  payload
) => {
  if (!imageId) {
    throw new Error(
      'Image ID is required'
    );
  }

  const response = await fetch(
    `${API_URL}/lot-images/images/${imageId}`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse(
    response,
    'Failed to update lot image'
  );
};

// ----------------------------------------------------------------------

export const updateLotImageAlt = async (
  imageId,
  altText
) =>
  updateLotImage(imageId, {
    alt_text: altText?.trim() || '',
  });

// ----------------------------------------------------------------------

export const updateLotImageOrder = async (
  imageId,
  displayOrder
) =>
  updateLotImage(imageId, {
    display_order: displayOrder,
  });

// ----------------------------------------------------------------------

export const setPrimaryLotImage = async (
  imageId
) =>
  updateLotImage(imageId, {
    is_primary: true,
  });

// ----------------------------------------------------------------------
// Delete one image
// ----------------------------------------------------------------------

export const deleteLotImage = async (
  imageId
) => {
  if (!imageId) {
    throw new Error(
      'Image ID is required'
    );
  }

  const response = await fetch(
    `${API_URL}/lot-images/images/${imageId}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to delete lot image'
  );
};

// ----------------------------------------------------------------------
// Helpers for R2 response
// ----------------------------------------------------------------------

const getUploadUrl = (item) =>
  item?.uploadUrl ||
  item?.upload_url ||
  item?.signedUrl ||
  item?.signed_url ||
  null;

// ----------------------------------------------------------------------

const getPublicUrl = (item) =>
  item?.secure_url ||
  item?.publicUrl ||
  item?.public_url ||
  item?.image_url ||
  item?.fileUrl ||
  item?.file_url ||
  null;

// ----------------------------------------------------------------------

const getObjectKey = (item) =>
  item?.objectKey ||
  item?.object_key ||
  item?.key ||
  item?.public_id ||
  null;

// ----------------------------------------------------------------------
// Presign → R2 upload → database save
// ----------------------------------------------------------------------

export const uploadAndSaveLotImages =
  async ({
    productId,
    lotId = null,
    lotName,
    files = [],
  }) => {
    if (!productId) {
      throw new Error(
        'Product ID is required'
      );
    }

    if (!lotName?.trim()) {
      throw new Error(
        'Lot name is required'
      );
    }

    /*
     * Allows creating a lot even if
     * no images were selected.
     */
    if (
      !Array.isArray(files) ||
      files.length === 0
    ) {
      return saveLotImages({
        productId,
        lotId,
        lotName,
        images: [],
      });
    }

    const presignResponse =
      await createLotImageUploadUrls({
        productId,
        lotName,

        files: files.map((file) => ({
          fileName: file.name,

          contentType:
            file.type ||
            'application/octet-stream',

          size: file.size,
        })),
      });

    const uploadItems =
      presignResponse?.data || [];

    if (
      uploadItems.length !==
      files.length
    ) {
      throw new Error(
        'Upload URL count does not match selected image count'
      );
    }

    await Promise.all(
      uploadItems.map(
        (uploadItem, index) =>
          uploadLotImageToR2({
            uploadUrl:
              getUploadUrl(
                uploadItem
              ),

            file: files[index],

            contentType:
              files[index].type,
          })
      )
    );

    const images =
      uploadItems.map(
        (uploadItem, index) => {
          const publicUrl =
            getPublicUrl(
              uploadItem
            );

          if (!publicUrl) {
            throw new Error(
              `Public URL is missing for ${files[index].name}`
            );
          }

          const objectKey =
            getObjectKey(
              uploadItem
            );

          return {
            secure_url:
              publicUrl,

            object_key:
              objectKey,

            public_id:
              objectKey,

            file_name:
              files[index].name,

            mime_type:
              files[index].type ||
              'application/octet-stream',

            file_size:
              files[index].size,
          };
        }
      );

    return saveLotImages({
      productId,
      lotId,
      lotName,
      images,
    });
  };