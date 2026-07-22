import { Helmet } from 'react-helmet-async';

import MerchandisingDisplays from 'src/sections/staticpages/merchandis_display/merchandisDisplay';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Merchandise Display | Ultrastones </title>
      </Helmet>

      <MerchandisingDisplays />
    </>
  );
}
