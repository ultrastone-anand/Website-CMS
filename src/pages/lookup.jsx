import { Helmet } from 'react-helmet-async';

import LookupPage from 'src/sections/lookups/view/LookupPage';


// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Reports | Ultrastones </title>
      </Helmet>

      <LookupPage />
    </>
  );
}
