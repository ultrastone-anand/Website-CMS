import { Helmet } from 'react-helmet-async';

import { BlogView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Blogs | Ultrastones </title>
      </Helmet>

      <BlogView/>
    </>
  );
}
