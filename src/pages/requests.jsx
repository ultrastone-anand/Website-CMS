
import { Helmet } from 'react-helmet-async';

import RequestsView from 'src/sections/Requets/requests';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Reports | Ultrastones </title>
      </Helmet>

      <RequestsView />
    </>
  );
}
