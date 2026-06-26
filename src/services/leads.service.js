const API_URL =
  import.meta.env.VITE_API_URL;

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

const handleResponse =
  async (response) => {

    const data =
      await response.json();

    if (!response.ok) {

      throw new Error(
        data.message ||
        "Something went wrong"
      );

    }

    return data;

  };

/* ==========================================
   CONTACT ENQUIRIES
========================================== */

export const getAllEnquiries =
  async () => {

    const response =
      await fetch(
        `${API_URL}/contact`,
        {
          method: "GET",
          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response
    );

  };

export const updateEnquiryStatus =
  async (
    id,
    status
  ) => {

    const response =
      await fetch(
        `${API_URL}/contact/${id}/status`,
        {
          method: "PATCH",

          headers:
            getHeaders(),

          body:
            JSON.stringify({
              status,
            }),
        }
      );

    return handleResponse(
      response
    );

  };

/* ==========================================
   NEWSLETTER SUBSCRIBERS
========================================== */

export const getAllSubscribers =
  async () => {

    const response =
      await fetch(
        `${API_URL}/newsletter`,
        {
          method: "GET",
          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response
    );

  };

export const deleteSubscriber =
  async (id) => {

    const response =
      await fetch(
        `${API_URL}/newsletter/${id}`,
        {
          method: "DELETE",
          headers:
            getHeaders(),
        }
      );

    return handleResponse(
      response
    );

  };