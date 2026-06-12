import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function CompanyQuickEdit({
open,
onClose,
onSubmit,
currentUser,
}) {
const [formData, setFormData] = useState({
id : null,
name: '',
slug: '',
address: '',
city: '',
state: '',
zip_code: '',
country: '',
primary_phone: '',
secondary_phone: '',
company_phone: '',
email: '',
google_maps_url: '',
short_description: '',
business_hours_mon_fri: '',
business_hours_saturday: '',
business_hours_sunday: '',
display_order: 0,
is_active: true,
is_featured: false,
});

useEffect(() => {
if (currentUser) {
setFormData({
id: currentUser.id,
name: currentUser.name || '',
slug: currentUser.slug || '',
address: currentUser.address || '',
city: currentUser.city || '',
state: currentUser.state || '',
zip_code: currentUser.zip_code || '',
country: currentUser.country || '',
primary_phone: currentUser.primary_phone || '',
secondary_phone: currentUser.secondary_phone || '',
company_phone: currentUser.company_phone || '',
email: currentUser.email || '',
google_maps_url:
currentUser.google_maps_url || '',
short_description:
currentUser.short_description || '',
business_hours_mon_fri:
currentUser.business_hours_mon_fri || '',
business_hours_saturday:
currentUser.business_hours_saturday || '',
business_hours_sunday:
currentUser.business_hours_sunday || '',
display_order:
currentUser.display_order || 0,
is_active:
currentUser.is_active ?? true,
is_featured:
currentUser.is_featured ?? false,
});
} else {
setFormData({
id: null,
name: '',
slug: '',
address: '',
city: '',
state: '',
zip_code: '',
country: '',
primary_phone: '',
secondary_phone: '',
company_phone: '',
email: '',
google_maps_url: '',
short_description: '',
business_hours_mon_fri: '',
business_hours_saturday: '',
business_hours_sunday: '',
display_order: 0,
is_active: true,
is_featured: false,
});
}
}, [currentUser]);

const handleChange = (event) => {
const { name, value } = event.target;

setFormData((prev) => ({
  ...prev,
  [name]: value,
}));

};

const handleSwitchChange = (event) => {
const { name, checked } = event.target;

setFormData((prev) => ({
  ...prev,
  [name]: checked,
}));

};

const handleSubmit = () => {
onSubmit(formData);
};

return ( <Dialog
   open={open}
   onClose={onClose}
   fullWidth
   maxWidth="md"
 > <DialogTitle>
{currentUser
? 'Edit Showroom'
: 'Create Showroom'} </DialogTitle>

```
  <DialogContent>
    <Stack spacing={2} sx={{ mt: 2 }}>
      <TextField
        label="Showroom Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        label="Slug"
        name="slug"
        value={formData.slug}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
        fullWidth
      />

      <Stack direction="row" spacing={2}>
        <TextField
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="State"
          name="state"
          value={formData.state}
          onChange={handleChange}
          fullWidth
        />
      </Stack>

      <Stack direction="row" spacing={2}>
        <TextField
          label="Zip Code"
          name="zip_code"
          value={formData.zip_code}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          fullWidth
        />
      </Stack>

      <Stack direction="row" spacing={2}>
        <TextField
          label="Primary Phone"
          name="primary_phone"
          value={formData.primary_phone}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Secondary Phone"
          name="secondary_phone"
          value={formData.secondary_phone}
          onChange={handleChange}
          fullWidth
        />
      </Stack>

      <TextField
        label="Company Phone"
        name="company_phone"
        value={formData.company_phone}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        label="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        label="Google Maps URL"
        name="google_maps_url"
        value={formData.google_maps_url}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        label="Short Description"
        name="short_description"
        value={formData.short_description}
        onChange={handleChange}
        fullWidth
        multiline
        rows={3}
      />

      <TextField
        label="Mon - Fri Hours"
        name="business_hours_mon_fri"
        value={formData.business_hours_mon_fri}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        label="Saturday Hours"
        name="business_hours_saturday"
        value={formData.business_hours_saturday}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        label="Sunday Hours"
        name="business_hours_sunday"
        value={formData.business_hours_sunday}
        onChange={handleChange}
        fullWidth
      />

      <TextField
        label="Display Order"
        name="display_order"
        type="number"
        value={formData.display_order}
        onChange={handleChange}
        fullWidth
      />

      <FormControlLabel
        control={
          <Switch
            checked={formData.is_active}
            onChange={handleSwitchChange}
            name="is_active"
          />
        }
        label="Active"
      />

      <FormControlLabel
        control={
          <Switch
            checked={formData.is_featured}
            onChange={handleSwitchChange}
            name="is_featured"
          />
        }
        label="Featured"
      />
    </Stack>
  </DialogContent>

  <DialogActions>
    <Button
      variant="outlined"
      onClick={onClose}
    >
      Cancel
    </Button>

    <Button
      variant="contained"
      onClick={handleSubmit}
    >
      {currentUser
        ? 'Update Showroom'
        : 'Create Showroom'}
    </Button>
  </DialogActions>
</Dialog>

);
}

CompanyQuickEdit.propTypes = {
open: PropTypes.bool,
onClose: PropTypes.func,
onSubmit: PropTypes.func,
currentUser: PropTypes.object,
};
