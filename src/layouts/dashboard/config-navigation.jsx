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
 
    // Hide for role_id = 6
    ...(roleId !== 6
      ? [
          {
            title: 'Blogs',
            path: '/dashboard/blog',
            icon: icon('ic_blogs'),
          },
          {
            title: 'Socials',
            path: '/dashboard/socials',
            icon: icon('ic_socials'),
          },
          {
            title: 'Showrooms',
            path: '/dashboard/company',
            icon: icon('ic_company'),
          },
        ]
      : []),


    // Admin only
    ...(roleId === 1
      ? [
        {
          title: 'user',
          path: '/dashboard/user',
          icon: icon('ic_users'),
        },
        {
          title: 'Lookups',
          path: '/dashboard/lookup',
          icon: icon('ic_lookup'),
        },

        {
          title: 'Bulk Upload',
          path: '/dashboard/bulk',
          icon: icon('ic_bulk'),
        },

        {
          title: 'Lead Management',
          path: '/dashboard/lead',
          icon: icon('ic_lead'),
        },
        {
  title: 'Pages',
  path: '/dashboard/pages',
  icon: icon('ic_about'),
  children: [
    {
      title: 'About Us',
      path: '/dashboard/aboutus',
    },
    {
      title: 'Our Process',
      path: '/dashboard/process',
    },
    // {
    //   title: 'MEU',
    //   path: '/dashboard/meu',
    // },
    // {
    //   title: 'Merchandise Display',
    //   path: '/dashboard/merchandise',
    // },
    // {
    //   title: 'Videos',
    //   path: '/dashboard/videos',
    // },
  ],
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