import { useState } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

export default function CompanyTableRow({
  row,
  onEdit,
  onDelete,
}) {
  const [open, setOpen] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  console.log(row,"ROW")

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleEditClick = () => {
    handleCloseMenu();

    if (onEdit) {
      onEdit(row);
    }
  };

  const handleDeleteClick = () => {
    handleCloseMenu();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false);

    if (onDelete) {
      onDelete(row.user_id);
    }
  };

  return (
    <>
<TableRow hover tabIndex={-1}>
  <TableCell component="th" scope="row">
    <Typography variant="subtitle2">
      {row.name}
    </Typography>
  </TableCell>

  <TableCell>
    {row.city || '-'}
  </TableCell>

  <TableCell>
    {row.state || '-'}
  </TableCell>

  <TableCell>
    {row.primary_phone || '-'}
  </TableCell>

  <TableCell>
    {row.email || '-'}
  </TableCell>

  <TableCell>
    {row.business_hours_mon_fri || '-'}
  </TableCell>

  <TableCell>
    <Label
      color={
        row.is_active
          ? 'success'
          : 'error'
      }
    >
      {row.is_active
        ? 'Active'
        : 'Inactive'}
    </Label>
  </TableCell>

  <TableCell align="right">
    <IconButton onClick={handleOpenMenu}>
      <Iconify icon="eva:more-vertical-fill" />
    </IconButton>
  </TableCell>
</TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
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
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
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
        <DialogTitle>Delete Showroom</DialogTitle>

        <DialogContent>
          Are you sure you want to delete <b>{row.name}</b>?
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
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

CompanyTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};