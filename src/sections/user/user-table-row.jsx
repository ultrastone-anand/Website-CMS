import { useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UserTableRow({
  row,
  onEdit,
}) {
  const [open, setOpen] = useState(null);

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

  return (
    <>
      <TableRow hover tabIndex={-1}>
        <TableCell component="th" scope="row">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" noWrap>
              {row.name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{row.email}</TableCell>

        <TableCell>{row.roles?.name || '-'}</TableCell>

        <TableCell>
          <Label
            color={
              row.status?.toLowerCase() === 'inactive'
                ? 'error'
                : 'success'
            }
          >
            {row.status || 'Active'}
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
          <Iconify
            icon="eva:edit-fill"
            sx={{ mr: 2 }}
          />
          Edit
        </MenuItem>

        <MenuItem
          onClick={handleCloseMenu}
          sx={{ color: 'error.main' }}
        >
          <Iconify
            icon="eva:trash-2-outline"
            sx={{ mr: 2 }}
          />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

UserTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
};