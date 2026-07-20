// src/services/blog.service.js

const API_URL = import.meta.env.VITE_API_URL;

// ========================================================
// HEADERS
// ========================================================

const getHeaders = () => {
  const token = sessionStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

// ========================================================
// RESPONSE HANDLER
// ========================================================

const handleResponse = async (response, fallbackMessage) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

// ========================================================
// QUERY STRING HELPER
// ========================================================

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      query.append(key, value);
    }
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
};

// ========================================================
// GET ALL BLOG POSTS
// ========================================================

export const getBlogs = async (filters = {}) => {
  const queryString = buildQueryString({
    status: filters.status,
    search: filters.search,
    tag: filters.tag,
    page: filters.page,
    limit: filters.limit,
  });

  const response = await fetch(
    `${API_URL}/blog${queryString}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to fetch blog posts'
  );
};

// ========================================================
// GET BLOG BY ID
// ========================================================

export const getBlogById = async (blogId) => {
  if (!blogId) {
    throw new Error('Blog ID is required');
  }

  const response = await fetch(
    `${API_URL}/blog/${blogId}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to fetch blog post'
  );
};

// ========================================================
// CREATE BLOG POST
// ========================================================

export const createBlog = async (payload) => {
  const response = await fetch(
    `${API_URL}/blog`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse(
    response,
    'Failed to create blog post'
  );
};

// ========================================================
// UPDATE BLOG POST
// ========================================================

export const updateBlog = async (
  blogId,
  payload
) => {
  if (!blogId) {
    throw new Error('Blog ID is required');
  }

  const response = await fetch(
    `${API_URL}/blog/${blogId}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse(
    response,
    'Failed to update blog post'
  );
};

// ========================================================
// PARTIALLY UPDATE BLOG POST
// ========================================================

export const patchBlog = async (
  blogId,
  payload
) => {
  if (!blogId) {
    throw new Error('Blog ID is required');
  }

  const response = await fetch(
    `${API_URL}/blog/${blogId}`,
    {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse(
    response,
    'Failed to update blog post'
  );
};

// ========================================================
// DELETE BLOG POST
// Soft delete
// ========================================================

export const deleteBlog = async (blogId) => {
  if (!blogId) {
    throw new Error('Blog ID is required');
  }

  const response = await fetch(
    `${API_URL}/blog/${blogId}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to delete blog post'
  );
};

// ========================================================
// PUBLISH BLOG POST
// ========================================================

export const publishBlog = async (blogId) => {
  if (!blogId) {
    throw new Error('Blog ID is required');
  }

  const response = await fetch(
    `${API_URL}/blog/${blogId}/publish`,
    {
      method: 'PATCH',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to publish blog post'
  );
};

// ========================================================
// MOVE BLOG POST TO DRAFT
// ========================================================

export const draftBlog = async (blogId) => {
  if (!blogId) {
    throw new Error('Blog ID is required');
  }

  const response = await fetch(
    `${API_URL}/blog/${blogId}/draft`,
    {
      method: 'PATCH',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to move blog post to draft'
  );
};

// ========================================================
// ARCHIVE BLOG POST
// ========================================================

export const archiveBlog = async (blogId) => {
  if (!blogId) {
    throw new Error('Blog ID is required');
  }

  const response = await fetch(
    `${API_URL}/blog/${blogId}/archive`,
    {
      method: 'PATCH',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to archive blog post'
  );
};

// ========================================================
// GET ALL TAGS
// ========================================================

export const getBlogTags = async () => {
  const response = await fetch(
    `${API_URL}/blog/tags`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  return handleResponse(
    response,
    'Failed to fetch blog tags'
  );
};

// ========================================================
// CREATE TAG
// ========================================================

export const createBlogTag = async (payload) => {
  const response = await fetch(
    `${API_URL}/blog/tags`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return handleResponse(
    response,
    'Failed to create blog tag'
  );
};

// ========================================================
// GENERATE R2 PRESIGNED UPLOAD URL
// ========================================================

export const generateBlogUploadUrl = async ({
  filename,
  mediaType,
  folder,
}) => {
  if (!filename) {
    throw new Error('Filename is required');
  }

  const response = await fetch(
    `${API_URL}/blog/upload-url`,
    {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        filename,
        mediaType,
        folder,
      }),
    }
  );

  return handleResponse(
    response,
    'Failed to generate upload URL'
  );
};

// ========================================================
// UPLOAD FILE DIRECTLY TO R2
// ========================================================

export const uploadFileToR2 = async ({
  uploadUrl,
  file,
  contentType,
  onProgress,
}) => {
  if (!uploadUrl) {
    throw new Error('Upload URL is required');
  }

  if (!file) {
    throw new Error('File is required');
  }

  const resolvedContentType =
    contentType ||
    file.type ||
    'application/octet-stream';

  if (onProgress) {
    return uploadFileToR2WithProgress({
      uploadUrl,
      file,
      contentType: resolvedContentType,
      onProgress,
    });
  }

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': resolvedContentType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file to R2');
  }

  return true;
};

// ========================================================
// UPLOAD FILE TO R2 WITH PROGRESS
// ========================================================

const uploadFileToR2WithProgress = ({
  uploadUrl,
  file,
  contentType,
  onProgress,
}) =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open('PUT', uploadUrl);

    request.setRequestHeader(
      'Content-Type',
      contentType
    );

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const percentage = Math.round(
        (event.loaded / event.total) * 100
      );

      onProgress(percentage);
    };

    request.onload = () => {
      if (
        request.status >= 200 &&
        request.status < 300
      ) {
        resolve(true);
        return;
      }

      reject(
        new Error('Failed to upload file to R2')
      );
    };

    request.onerror = () => {
      reject(
        new Error('Failed to upload file to R2')
      );
    };

    request.send(file);
  });

// ========================================================
// COMPLETE BLOG IMAGE UPLOAD
// Generates URL, uploads file, returns media object
// ========================================================

export const uploadBlogImage = async ({
  file,
  mediaType = 'CONTENT',
  folder,
  altText = '',
  caption = '',
  sortOrder = 0,
  onProgress,
}) => {
  if (!file) {
    throw new Error('Image file is required');
  }

  const uploadResponse =
    await generateBlogUploadUrl({
      filename: file.name,
      mediaType,
      folder,
    });

  const uploadData = uploadResponse.data;

  await uploadFileToR2({
    uploadUrl: uploadData.uploadUrl,
    file,
    contentType: uploadData.contentType,
    onProgress,
  });

  return {
    secure_url: uploadData.secure_url,
    public_id: uploadData.public_id,

    url:
      uploadData.publicUrl ||
      uploadData.secure_url,

    objectKey:
      uploadData.objectKey ||
      uploadData.public_id,

    filename: file.name,

    contentType:
      uploadData.contentType ||
      file.type,

    mimeType:
      uploadData.contentType ||
      file.type,

    sizeBytes:
      file.size,

    altText,

    caption,

    sortOrder,
  };
};