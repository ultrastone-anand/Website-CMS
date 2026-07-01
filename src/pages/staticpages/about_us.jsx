import { Helmet } from 'react-helmet-async';

import Aboutus from 'src/sections/staticpages/about_us/aboutus';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> About Us | Ultrastones </title>
      </Helmet>

      <Aboutus />
    </>
  );
}
