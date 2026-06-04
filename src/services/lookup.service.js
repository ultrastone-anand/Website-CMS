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
// LOOKUP MASTER
// ================================

export const getLookups = async () => {
    const response = await fetch(`${API_URL}/lookups`, {
        method: 'GET',
        headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || 'Failed to fetch lookups'
        );
    }

    return data;
};

export const getLookupById = async (id) => {
    const response = await fetch(
        `${API_URL}/lookups/${id}`,
        {
            method: 'GET',
            headers: getHeaders(),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || 'Failed to fetch lookup'
        );
    }

    return data;
};

export const createLookup = async (
    payload
) => {
    const response = await fetch(
        `${API_URL}/lookups`,
        {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || 'Failed to create lookup'
        );
    }

    return data;
};

export const updateLookup = async (
    id,
    payload
) => {
    const response = await fetch(
        `${API_URL}/lookups/${id}`,
        {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || 'Failed to update lookup'
        );
    }

    return data;
};

export const deleteLookup = async (id) => {
    const response = await fetch(
        `${API_URL}/lookups/${id}`,
        {
            method: 'DELETE',
            headers: getHeaders(),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || 'Failed to delete lookup'
        );
    }

    return data;
};

// ================================
// LOOKUP DETAILS
// ================================

export const getLookupDetails = async (lookupId) => {
    const response = await fetch(
        `${API_URL}/lookups/${lookupId}/details`,
        {
            method: 'GET',
            headers: getHeaders(),
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            'Failed to fetch lookup details'
        );
    }

    return data;
};

export const createLookupDetail = async (
    lookupId,
    payload
) => {
    const response = await fetch(
        `${API_URL}/lookups/${lookupId}/details`,
        {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(
                payload
            ),
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            'Failed to create lookup detail'
        );
    }

    return data;
};

export const updateLookupDetail = async (
    id,
    payload
) => {
    const response = await fetch(
        `${API_URL}/lookups/details/${id}`,
        {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(
                payload
            ),
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            'Failed to update lookup detail'
        );
    }

    return data;
};

export const deleteLookupDetail = async (id) => {
    const response = await fetch(
        `${API_URL}/lookups/details/${id}`,
        {
            method: 'DELETE',
            headers: getHeaders(),
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            'Failed to delete lookup detail'
        );
    }

    return data;
};