import { Helmet } from 'react-helmet-async';

import CEU from 'src/sections/staticpages/ceu/ceu';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> CEU | Ultrastones </title>
      </Helmet>

      <CEU/>
    </>
  );
}
