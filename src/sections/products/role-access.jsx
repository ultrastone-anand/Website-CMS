export const getRoleId = () => {
    const user = JSON.parse(
        sessionStorage.getItem('user') || '{}'
    );

    return Number(user?.role_id);
};

export const Admin = () => [1].includes(getRoleId());

export const canEditIdentity = () =>
    [1, 3 ,4].includes(getRoleId());

export const canEditDescription = () =>
    [1, 5].includes(getRoleId());

export const canEditStoneDetails = () =>
    [1, 3, 4].includes(getRoleId());

export const canEditMedia = () =>
    [1, 3 ,6].includes(getRoleId());

export const canEditSEO = () =>
    [1, 6].includes(getRoleId());

export const canEditApplications = () =>
    [1, 3, 4].includes(getRoleId());

export const canEditSpecifications = () =>
    [1, 3, 4].includes(getRoleId());

export const canView = () =>
    [2].includes(getRoleId());
