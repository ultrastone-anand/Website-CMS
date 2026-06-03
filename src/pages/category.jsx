import { Helmet } from 'react-helmet-async';

import { CategoryView } from 'src/sections/categorys/view';

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Category | Ultrastones </title>
      </Helmet>

      <CategoryView/>
    </>
  );
}
