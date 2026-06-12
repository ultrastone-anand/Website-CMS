import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

const initialState = {
  id: null,
  platform: '',
  url: '',
  display_order: 0,
  is_active: true,
};

export default function SocialMediaQuickEdit({
  open,
  onClose,
  onSubmit,
  currentUser,
}) {
  const [formData, setFormData] =
    useState(initialState);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        id: currentUser.id,
        platform:
          currentUser.platform || '',
        url: currentUser.url || '',
        display_order:
          currentUser.display_order || 0,
        is_active:
          currentUser.is_active ?? true,
      });
    } else {
      setFormData(initialState);
    }
  }, [currentUser]);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'display_order'
          ? Number(value)
          : value,
    }));
  };

  const handleSwitchChange = (
    event
  ) => {
    const { name, checked } =
      event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {currentUser
          ? 'Edit Social Media'
          : 'Create Social Media'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            select
            label="Platform"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="youtube">
              YouTube
            </MenuItem>

            <MenuItem value="facebook">
              Facebook
            </MenuItem>

            <MenuItem value="instagram">
              Instagram
            </MenuItem>

            <MenuItem value="twitter">
              Twitter / X
            </MenuItem>

            <MenuItem value="pinterest">
              Pinterest
            </MenuItem>

            <MenuItem value="houzz">
              Houzz
            </MenuItem>
          </TextField>

          <TextField
            label="URL"
            name="url"
            value={formData.url}
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
                checked={
                  formData.is_active
                }
                onChange={
                  handleSwitchChange
                }
                name="is_active"
              />
            }
            label="Active"
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
            ? 'Update Social Media'
            : 'Create Social Media'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SocialMediaQuickEdit.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  currentUser: PropTypes.object,
};