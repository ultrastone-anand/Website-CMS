import { Helmet } from 'react-helmet-async';

import OurProcess from 'src/sections/staticpages/our_process/ourprocess';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Our Process | Ultrastones </title>
      </Helmet>

      <OurProcess />
    </>
  );
}
