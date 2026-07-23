import { Helmet } from 'react-helmet-async';

import PrivacyPolicyCMS from 'src/sections/staticpages/privacy_policy/privacyPolicy';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Privacy Policy | Ultrastones </title>
      </Helmet>

      <PrivacyPolicyCMS />
    </>
  );
}
