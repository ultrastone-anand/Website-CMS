  const user = JSON.parse(
    sessionStorage.getItem('user') || '{}'
  );

  export const canAddCategory = [1, 3, 4].includes(
    Number(user?.role_id)
  );

  export const canEditCategory = [1, 3, 4].includes(
    Number(user?.role_id)
  );