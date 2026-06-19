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

export default function CategoryTableRow({
  row,
  onEdit,
  onToggleStatus,
  categories = [],
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

  const handleStatusClick = () => {
    handleCloseMenu();

    if (onToggleStatus) {
      onToggleStatus(row);
    }
  };

  const parentCategory = categories.find(
    (item) => item.id === row.parent_id
  );

  return (
    <>
      <TableRow hover tabIndex={-1}>
        {/* NAME */}
        <TableCell component="th" scope="row">
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >
            <Typography
              variant="subtitle2"
              noWrap
            >
              {row.name}
            </Typography>
          </Stack>
        </TableCell>

        {/* SLUG */}
        <TableCell>
          {row.slug}
        </TableCell>

        {/* PARENT */}
        <TableCell>
          {parentCategory?.name || '-'}
        </TableCell>

        {/* TYPE */}
        <TableCell>
          <Label
            color={
              row.parent_id
                ? 'info'
                : 'secondary'
            }
          >
            {row.parent_id
              ? 'Child'
              : 'Parent'}
          </Label>
        </TableCell>

        <TableCell>
  <Label
    color={
      row.silica_warning
        ? 'warning'
        : 'default'
    }
  >
    {row.silica_warning
      ? 'Enabled'
      : 'Disabled'}
  </Label>
</TableCell>

<TableCell>
  {
    row.silica_datasheet_url ? (
      <a
        href={`${import.meta.env.VITE_API_URL.replace('/api','')}${row.silica_datasheet_url}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ cursor: 'pointer' }}
      >
       View PDF
      </a>
    ) : (
      '-'
    )
  }
</TableCell>

        {/* STATUS */}
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

        {/* ACTION */}
        <TableCell align="right">
          <IconButton
            onClick={handleOpenMenu}
          >
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
          sx: { width: 180 },
        }}
      >
        <MenuItem
          onClick={handleEditClick}
        >
          <Iconify
            icon="eva:edit-fill"
            sx={{ mr: 2 }}
          />
          Edit
        </MenuItem>

        <MenuItem
          
          onClick={handleStatusClick}
          sx={{
            color: row.is_active
              ? 'error.main'
              : 'success.main',
          }}
        >
          <Iconify
            icon={
              row.is_active
                ? 'eva:close-circle-fill'
                : 'eva:checkmark-circle-2-fill'
            }
            sx={{ mr: 2 }}
          />

          {row.is_active
            ? 'Deactivate'
            : 'Activate'}
        </MenuItem>
      </Popover>
    </>
  );
}

CategoryTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  categories: PropTypes.array,
  onEdit: PropTypes.func,
  onToggleStatus: PropTypes.func,
};