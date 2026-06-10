import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import {
  Grid,
  Dialog,
  Button,
  Switch,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import {
  createLookupDetail,
  updateLookupDetail,
} from 'src/services/lookup.service';

export default function LookupDetailDialog({
  open,
  onClose,
  lookup,
  detail,
  refresh,
}) {
  const [form, setForm] =
    useState({
      value_code: '',
      value_name: '',
      description: '',
      display_order: 1,
      is_active: true,
    });

  useEffect(() => {
    if (detail) {
      setForm(detail);
    }
  }, [detail]);

  const handleSave = async () => {
    if (detail) {
      await updateLookupDetail(
        detail.id,
        form
      );
    } else {
      await createLookupDetail(
        lookup.id,
        form
      );
    }

    refresh();
    onClose();
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {detail
          ? 'Edit Detail'
          : 'Create Detail'}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Value Code"
              value={
                form.value_code
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  value_code:
                    e.target.value,
                })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Value Name"
              value={
                form.value_name
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  value_name:
                    e.target.value,
                })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={
                    form.is_active
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_active:
                        e.target
                          .checked,
                    })
                  }
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

LookupDetailDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  refresh: PropTypes.func,
  lookup: PropTypes.object,
  detail: PropTypes.object,
};