import { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  Stack,
  Dialog,
  Button,
  Popover,
  Divider,
  MenuItem,
  Typography,
  IconButton,
  CardContent,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

export default function UserCardRow({
  row,
  onEdit,
  onDelete,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  const handleEditClick = () => {
    handleCloseMenu();
    onEdit?.(row);
  };

  const handleDeleteClick = () => {
    handleCloseMenu();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false);
    onDelete?.(row);
  };

  return (
    <>
      <Card>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Typography variant="subtitle1">
                {row.name}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {row.email}
              </Typography>
            </Stack>

            <IconButton onClick={handleOpenMenu}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Role
              </Typography>

              <Typography variant="body2">
                {row.roles?.name || '-'}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Status
              </Typography>

              <Label
                color={
                  row.status?.toLowerCase() === 'inactive'
                    ? 'error'
                    : 'success'
                }
              >
                {row.status || 'Active'}
              </Label>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Popover
        open={Boolean(openMenu)}
        anchorEl={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <Iconify
            icon="eva:edit-fill"
            sx={{ mr: 2 }}
          />
          Edit
        </MenuItem>

        <MenuItem
          onClick={handleDeleteClick}
          sx={{ color: 'error.main' }}
        >
          <Iconify
            icon="eva:trash-2-outline"
            sx={{ mr: 2 }}
          />
          Delete
        </MenuItem>
      </Popover>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>

        <DialogContent>
          Are you sure you want to delete{' '}
          <strong>{row.name}</strong>?
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDeleteDialogOpen(false)
            }
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

UserCardRow.propTypes = {
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};