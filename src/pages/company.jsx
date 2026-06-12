import { Helmet } from 'react-helmet-async';

import CompanyPage from 'src/sections/company_info/view/company-view';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Reports | Ultrastones </title>
      </Helmet>

      <CompanyPage />
    </>
  );
}
