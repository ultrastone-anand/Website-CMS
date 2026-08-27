const RAW_API_URL =
  import.meta.env.VITE_API_URL;

/* =========================================================
   API BASE
========================================================= */

const normalizeBaseUrl = (
  value = ""
) => {
  const trimmed =
    String(value)
      .trim()
      .replace(/\/+$/, "");

  if (!trimmed) {
    throw new Error(
      "VITE_API_URL is not configured."
    );
  }

  if (
    trimmed.endsWith(
      "/api"
    )
  ) {
    return trimmed;
  }

  return `${trimmed}/api`;
};

const API_URL =
  normalizeBaseUrl(
    RAW_API_URL
  );

const HOME_HERO_URL =
  `${API_URL}/home-hero`;

/* =========================================================
   HEADERS
========================================================= */

const getHeaders = () => {
  const token =
    sessionStorage.getItem(
      "token"
    );

  return {
    "Content-Type":
      "application/json",

    ...(token && {
      Authorization:
        `Bearer ${token}`,
    }),
  };
};

/* =========================================================
   RESPONSE HANDLER
========================================================= */

const handleResponse = async (
  response,
  fallbackMessage
) => {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    !contentType.includes(
      "application/json"
    )
  ) {
    const responseText =
      await response.text();

    console.error(
      "Invalid Home Hero API response:",
      {
        url:
          response.url,

        status:
          response.status,

        contentType,

        preview:
          responseText.slice(
            0,
            500
          ),
      }
    );

    throw new Error(
      `Home Hero API returned a non-JSON response from ${response.url}. Check VITE_API_URL and /api/home-hero route registration.`
    );
  }

  let data;

  try {
    data =
      await response.json();
  } catch (error) {
    console.error(
      "Failed to parse Home Hero API response:",
      error
    );

    throw new Error(
      fallbackMessage
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        fallbackMessage
    );
  }

  return data;
};

/* =========================================================
   REQUEST HELPER
========================================================= */

const request = async (
  path,
  {
    method = "GET",
    body,
    cache = "no-store",
  } = {},
  fallbackMessage =
    "Request failed"
) => {
  const url =
    `${HOME_HERO_URL}${path}`;

  const options = {
    method,

    headers:
      getHeaders(),
  };

  if (
    method === "GET"
  ) {
    options.cache =
      cache;
  }

  if (
    body !== undefined
  ) {
    options.body =
      JSON.stringify(
        body
      );
  }

  const response =
    await fetch(
      url,
      options
    );

  return handleResponse(
    response,
    fallbackMessage
  );
};

/* =========================================================
   ACTIVE HERO
========================================================= */

export const getActiveHomeHero =
  async () =>
    request(
      "/active",
      {
        method:
          "GET",
      },
      "Failed to fetch active home hero"
    );

/* =========================================================
   DEFAULT HERO
========================================================= */

export const getDefaultHomeHero =
  async () =>
    request(
      "/default",
      {
        method:
          "GET",
      },
      "Failed to fetch default home hero"
    );

export const updateDefaultHomeHero =
  async (
    payload
  ) =>
    request(
      "/default",
      {
        method:
          "PUT",

        body:
          payload,
      },
      "Failed to update default home hero"
    );

/* =========================================================
   CAMPAIGNS
========================================================= */

export const getHomeHeroCampaigns =
  async ({
    status,
    isEnabled,
  } = {}) => {
    const query =
      new URLSearchParams();

    if (status) {
      query.set(
        "status",
        status
      );
    }

    if (
      isEnabled !==
        undefined &&
      isEnabled !==
        null &&
      isEnabled !==
        ""
    ) {
      query.set(
        "isEnabled",
        String(
          isEnabled
        )
      );
    }

    const queryString =
      query.toString();

    let path =
      "/campaigns";

    if (queryString) {
      path =
        `${path}?${queryString}`;
    }

    return request(
      path,
      {
        method:
          "GET",
      },
      "Failed to fetch home hero campaigns"
    );
  };

export const getHomeHeroCampaignById =
  async (
    campaignId
  ) => {
    if (!campaignId) {
      throw new Error(
        "Campaign ID is required"
      );
    }

    return request(
      `/campaigns/${campaignId}`,
      {
        method:
          "GET",
      },
      "Failed to fetch home hero campaign"
    );
  };

export const createHomeHeroCampaign =
  async (
    payload
  ) =>
    request(
      "/campaigns",
      {
        method:
          "POST",

        body:
          payload,
      },
      "Failed to create home hero campaign"
    );

export const updateHomeHeroCampaign =
  async (
    campaignId,
    payload
  ) => {
    if (!campaignId) {
      throw new Error(
        "Campaign ID is required"
      );
    }

    return request(
      `/campaigns/${campaignId}`,
      {
        method:
          "PUT",

        body:
          payload,
      },
      "Failed to update home hero campaign"
    );
  };

export const toggleHomeHeroCampaign =
  async (
    campaignId,
    isEnabled
  ) => {
    if (!campaignId) {
      throw new Error(
        "Campaign ID is required"
      );
    }

    return request(
      `/campaigns/${campaignId}/toggle`,
      {
        method:
          "PATCH",

        body: {
          is_enabled:
            isEnabled,
        },
      },
      "Failed to update campaign status"
    );
  };

export const deleteHomeHeroCampaign =
  async (
    campaignId
  ) => {
    if (!campaignId) {
      throw new Error(
        "Campaign ID is required"
      );
    }

    return request(
      `/campaigns/${campaignId}`,
      {
        method:
          "DELETE",
      },
      "Failed to delete home hero campaign"
    );
  };

/* =========================================================
   HOLIDAYS
========================================================= */

export const getHomeHeroHolidays =
  async () =>
    request(
      "/holidays",
      {
        method:
          "GET",
      },
      "Failed to fetch holiday heroes"
    );

export const getHomeHeroHolidayById =
  async (
    holidayId
  ) => {
    if (!holidayId) {
      throw new Error(
        "Holiday ID is required"
      );
    }

    return request(
      `/holidays/${holidayId}`,
      {
        method:
          "GET",
      },
      "Failed to fetch holiday hero"
    );
  };

export const updateHomeHeroHoliday =
  async (
    holidayId,
    payload
  ) => {
    if (!holidayId) {
      throw new Error(
        "Holiday ID is required"
      );
    }

    return request(
      `/holidays/${holidayId}`,
      {
        method:
          "PUT",

        body:
          payload,
      },
      "Failed to update holiday hero"
    );
  };

export const toggleHomeHeroHoliday =
  async (
    holidayId,
    isEnabled
  ) => {
    if (!holidayId) {
      throw new Error(
        "Holiday ID is required"
      );
    }

    return request(
      `/holidays/${holidayId}/toggle`,
      {
        method:
          "PATCH",

        body: {
          is_enabled:
            isEnabled,
        },
      },
      "Failed to update holiday hero status"
    );
  };

  /* =========================================================
   FORCE HOLIDAY
========================================================= */

export const forceHomeHeroHoliday =
  async (
    holidayId,
    forceActive
  ) => {
    if (!holidayId) {
      throw new Error(
        "Holiday ID is required"
      );
    }

    return request(
      `/holidays/${holidayId}/force`,
      {
        method:
          "PATCH",

        body: {
          force_active:
            forceActive,
        },
      },
      "Failed to update holiday force status"
    );
  };

/* =========================================================
   MEDIA PRESIGN
========================================================= */

export const createHomeHeroUploadUrls =
  async ({
    type = "campaign",
    files = [],
  }) => {
    if (
      !Array.isArray(
        files
      ) ||
      files.length ===
        0
    ) {
      throw new Error(
        "At least one file is required"
      );
    }

    const allowedTypes = [
      "default",
      "campaign",
      "holiday",
    ];

    if (
      !allowedTypes.includes(
        type
      )
    ) {
      throw new Error(
        "Invalid home hero upload type"
      );
    }

    return request(
      "/media/presign",
      {
        method:
          "POST",

        body: {
          type,
          files,
        },
      },
      "Failed to create home hero upload URLs"
    );
  };

/* =========================================================
   DIRECT R2 UPLOAD
========================================================= */

export const uploadHomeHeroMediaToR2 =
  async ({
    uploadUrl,
    file,
    contentType,
  }) => {
    if (!uploadUrl) {
      throw new Error(
        "Upload URL is required"
      );
    }

    if (!file) {
      throw new Error(
        "File is required"
      );
    }

    const response =
      await fetch(
        uploadUrl,
        {
          method:
            "PUT",

          headers: {
            "Content-Type":
              contentType ||
              file.type ||
              "application/octet-stream",
          },

          body:
            file,
        }
      );

    if (!response.ok) {
      throw new Error(
        `Failed to upload ${file.name}`
      );
    }

    return true;
  };

/* =========================================================
   DELETE R2 MEDIA
========================================================= */

export const deleteHomeHeroMedia =
  async (
    url
  ) => {
    if (!url) {
      throw new Error(
        "Media URL is required"
      );
    }

    return request(
      "/media",
      {
        method:
          "DELETE",

        body: {
          url,
        },
      },
      "Failed to delete home hero media"
    );
  };