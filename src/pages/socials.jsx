import { Helmet } from 'react-helmet-async';

import SocialsPage from 'src/sections/Social Media/view/Social-view';

// ----------------------------------------------------------------------

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title> Socials | Ultrastones </title>
      </Helmet>

      <SocialsPage/>
    </>
  );
}
