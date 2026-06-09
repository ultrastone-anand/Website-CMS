import SvgColor from 'src/components/svg-color';

const icon = (name) => (
  <SvgColor
    src={`/assets/icons/navbar/${name}.svg`}
    sx={{ width: 1, height: 1 }}
  />
);

export const getNavConfig = () => {
  const user = JSON.parse(
    sessionStorage.getItem('user') || '{}'
  );

  const roleId = Number(user?.role_id);

  return [
    {
      title: 'dashboard',
      path: '/dashboard',
      icon: icon('ic_dashboard'),
    },
    {
      title: 'Categorys',
      path: '/dashboard/categorys',
      icon: icon('ic_category'),
    },
    {
      title: 'product',
      path: '/dashboard/products',
      icon: icon('ic_products'),
    },

    // Admin only
    ...(roleId === 1
      ? [
          {
            title: 'user',
            path: '/dashboard/user',
            icon: icon('ic_users'),
          },
        ]
      : []),

    // Admin + Viewer
    ...([1, 2].includes(roleId)
      ? [
          {
            title: 'Reports',
            path: '/dashboard/reports',
            icon: icon('ic_reports'),
          },
          {
            title: 'Activitys',
            path: '/dashboard/activitys',
            icon: icon('ic_activity'),
          },
        ]
      : []),
  ];
};