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
  createLookup,
  updateLookup,
} from 'src/services/lookup.service';

export default function LookupDialog({
  open,
  onClose,
  lookup,
  refresh,
}) {
  const [form, setForm] = useState({
    lookup_code: '',
    lookup_name: '',
    description: '',
    display_order: 1,
    is_active: true,
  });

  useEffect(() => {
    if (lookup) {
      setForm(lookup);
    }
  }, [lookup]);

  const handleSave = async () => {
    if (lookup) {
      await updateLookup(
        lookup.id,
        form
      );
    } else {
      await createLookup(form);
    }

    refresh();
    onClose();
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {lookup
          ? 'Edit Lookup'
          : 'Create Lookup'}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Code"
              value={
                form.lookup_code
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  lookup_code:
                    e.target.value,
                })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              value={
                form.lookup_name
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  lookup_name:
                    e.target.value,
                })
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={
                form.description
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
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

LookupDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  refresh: PropTypes.func,
  lookup: PropTypes.object,
};