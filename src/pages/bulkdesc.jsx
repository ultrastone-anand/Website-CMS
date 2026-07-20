import { Helmet } from 'react-helmet-async';

import BulkDesc from 'src/sections/products/view/BulkDesc';


// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Bulk Upload | Ultrastones </title>
      </Helmet>

      <BulkDesc/>
    </>
  );
}
