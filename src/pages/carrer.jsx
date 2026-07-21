import { Helmet } from 'react-helmet-async';

import Career from 'src/sections/career/view/career';

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Career | Ultrastones </title>
      </Helmet>

      <Career/>
    </>
  );
}
