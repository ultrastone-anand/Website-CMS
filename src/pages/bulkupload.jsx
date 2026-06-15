import { Helmet } from 'react-helmet-async';

import BulkUpload from 'src/sections/products/view/BulkUpload';

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Bulk Upload | Ultrastones </title>
      </Helmet>

      <BulkUpload/>
    </>
  );
}
