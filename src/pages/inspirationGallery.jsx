import { Helmet } from 'react-helmet-async';

import InspirationGallery from 'src/sections/Inspiration_Gallery/InspirationGallery';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Gallery | Ultrastones </title>
      </Helmet>

      <InspirationGallery />
    </>
  );
}
