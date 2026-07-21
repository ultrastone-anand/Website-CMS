// src/utils/Mediahelper.js

const CDN_HOSTS = [
  'cdn.ultrastone.in',
];

const DEFAULT_PLACEHOLDER =
  '/assets/placeholder.png';

export const getOptimizedImageUrl = (
  imageUrl,
  {
    width = 600,
    quality = 80,
    fit = 'cover',
    format = 'auto',
  } = {}
) => {
  if (
    !imageUrl ||
    typeof imageUrl !== 'string'
  ) {
    return DEFAULT_PLACEHOLDER;
  }

  const trimmedUrl =
    imageUrl.trim();

  // Keep local images and placeholders unchanged.
  if (
    trimmedUrl.startsWith('/') &&
    !trimmedUrl.startsWith(
      '//'
    )
  ) {
    return trimmedUrl;
  }

  let parsedUrl;

  try {
    parsedUrl =
      new URL(trimmedUrl);
  } catch {
    return trimmedUrl;
  }

  // Only transform images served
  // through your Cloudflare CDN.
  if (
    !CDN_HOSTS.includes(
      parsedUrl.hostname
    )
  ) {
    return trimmedUrl;
  }

  // Prevent applying cdn-cgi twice.
  if (
    parsedUrl.pathname.includes(
      '/cdn-cgi/image/'
    )
  ) {
    return trimmedUrl;
  }

  const safeWidth =
    Math.max(
      Number(width) || 600,
      1
    );

  const safeQuality =
    Math.min(
      Math.max(
        Number(quality) || 80,
        1
      ),
      100
    );

  const options = [
    `width=${safeWidth}`,
    `quality=${safeQuality}`,
    `fit=${fit}`,
    `format=${format}`,
    'metadata=none',
  ].join(',');

  return `${parsedUrl.origin}/cdn-cgi/image/${options}${parsedUrl.pathname}${parsedUrl.search}`;
};

export const getProductCardImageUrl = (
  imageUrl
) =>
  getOptimizedImageUrl(
    imageUrl,
    {
      width: 700,
      quality: 82,
      fit: 'cover',
      format: 'auto',
    }
  );