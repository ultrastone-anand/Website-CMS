import { Helmet } from 'react-helmet-async';

import ActivityView from 'src/sections/reports/activity-view';

// ----------------------------------------------------------------------

export default function BlogPage() {
  return (
    <>
      <Helmet>
        <title> Activity | Ultrastones </title>
      </Helmet>

      <ActivityView />
    </>
  );
}
