import { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  Stack,
  Divider,
  Popover,
  MenuItem,
  Typography,
  IconButton,
  CardContent,
} from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import { canEditCategory } from './category-access';

export default function CategoryCardRow({
  row,
  onEdit,
  onToggleStatus,
  categories = [],
}) {
  const [open, setOpen] = useState(null);

  const parentCategory = categories.find(
    (item) => item.id === row.parent_id
  );

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleEditClick = () => {
    handleCloseMenu();
    onEdit?.(row);
  };

  const handleStatusClick = () => {
    handleCloseMenu();
    onToggleStatus?.(row);
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
                {row.slug}
              </Typography>
            </Stack>

            {canEditCategory && (
              <IconButton onClick={handleOpenMenu}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            )}
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
                Parent
              </Typography>

              <Typography variant="body2">
                {parentCategory?.name || '-'}
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
                Type
              </Typography>

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
    Silica Warning
  </Typography>

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
    Datasheet
  </Typography>

  {
    row.silica_datasheet_url ? (
      <Typography
        component="a"
        href={`${import.meta.env.VITE_API_URL.replace('/api','')}${row.silica_datasheet_url}`}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          color: 'primary.main',
          textDecoration: 'none',
          fontSize: 14,
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        View PDF
      </Typography>
    ) : (
      <Typography variant="body2">
        -
      </Typography>
    )
  }
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
                  row.is_active
                    ? 'success'
                    : 'error'
                }
              >
                {row.is_active
                  ? 'Active'
                  : 'Inactive'}
              </Label>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {canEditCategory && (
        <Popover
          open={Boolean(open)}
          anchorEl={open}
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
            sx: { width: 180 },
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
      )}
    </>
  );
}

CategoryCardRow.propTypes = {
  row: PropTypes.object.isRequired,
  categories: PropTypes.array,
  onEdit: PropTypes.func,
  onToggleStatus: PropTypes.func,
};