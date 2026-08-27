import { Helmet } from 'react-helmet-async';

import HomeScreen from 'src/sections/staticpages/homescreen/homescreen';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Merchandise Display | Ultrastones </title>
      </Helmet>

      <HomeScreen />
    </>
  );
}
