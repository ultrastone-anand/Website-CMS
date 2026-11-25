import { Helmet } from 'react-helmet-async';

import PageSeoManagement from 'src/sections/staticpages/seo/PageSeoManagement';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> SEO | Ultrastones </title>
      </Helmet>

      <PageSeoManagement />
    </>
  );
}
