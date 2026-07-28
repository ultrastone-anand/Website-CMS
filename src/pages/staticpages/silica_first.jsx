import { Helmet } from 'react-helmet-async';

import SilicaFirst from 'src/sections/staticpages/silica_first/SilicaFirst';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Silica First | Ultrastones </title>
      </Helmet>

      <SilicaFirst />
    </>
  );
}
