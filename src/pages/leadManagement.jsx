import { Helmet } from 'react-helmet-async';

import { LeadManagement } from 'src/sections/Lead_Management/LeadManagement';


// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Leads | Ultrastones </title>
      </Helmet>

      <LeadManagement />
    </>
  );
}
