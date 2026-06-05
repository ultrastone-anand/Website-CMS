const user = JSON.parse(sessionStorage.getItem('user') || '{}');

export const roleId = Number(user?.role_id);

// Identity Section
export const canEditIdentity = [1, 3].includes(roleId);

// Description Section
export const canEditDescription = [1, 5].includes(roleId);

// Stone Details Section
export const canEditStoneDetails = [1, 3, 4].includes(roleId);

// Media
export const canEditMedia = [1, 3].includes(roleId);

// Applications
export const canEditApplications = [1, 3, 4].includes(roleId);

// Specifications
export const canEditSpecifications = [1, 3, 4].includes(roleId);

export const canView = [2].includes(roleId);