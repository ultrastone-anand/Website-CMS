import { Helmet } from 'react-helmet-async';

import Reportview from 'src/sections/reports/report-view';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Reports | Ultrastones </title>
      </Helmet>

      <Reportview />
    </>
  );
}
