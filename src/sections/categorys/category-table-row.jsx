import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogContent from '@mui/material/DialogContent';

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
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const handleOpenImagePreview = () => {
    if (row.thumbnail_url && !imageError) {
      setImagePreviewOpen(true);
    }
  };

  const handleCloseImagePreview = () => {
    setImagePreviewOpen(false);
  };

  const parentCategory = categories.find(
    (item) => Number(item.id) === Number(row.parent_id)
  );

  const apiUrl = import.meta.env.VITE_API_URL || '';

  const apiOrigin = apiUrl.replace(/\/api\/?$/, '');

  const getFileUrl = (url) => {
    if (!url) {
      return null;
    }

    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('blob:') ||
      url.startsWith('data:')
    ) {
      return url;
    }

    return `${apiOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const thumbnailUrl = getFileUrl(row.thumbnail_url);
  const silicaDatasheetUrl = getFileUrl(row.silica_datasheet_url);

  return (
    <>
      <TableRow hover tabIndex={-1}>
        {/* NAME AND THUMBNAIL */}
        <TableCell component="th" scope="row">
          <Stack direction="row" alignItems="center" spacing={2}>
            {thumbnailUrl && !imageError ? (
              <Box
                component="button"
                type="button"
                onClick={handleOpenImagePreview}
                sx={{
                  p: 0,
                  width: 56,
                  height: 56,
                  border: 0,
                  flexShrink: 0,
                  display: 'block',
                  cursor: 'zoom-in',
                  overflow: 'hidden',
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                }}
              >
                <Box
                  component="img"
                  src={thumbnailUrl}
                  alt={`${row.name} thumbnail`}
                  loading="lazy"
                  onError={() => setImageError(true)}
                  sx={{
                    width: 1,
                    height: 1,
                    display: 'block',
                    objectFit: 'cover',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.08)',
                    },
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  flexShrink: 0,
                  display: 'flex',
                  borderRadius: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.neutral',
                  color: 'text.disabled',
                }}
              >
                <Iconify
                  icon="solar:gallery-minimalistic-broken"
                  width={24}
                />
              </Box>
            )}

            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {row.name}
              </Typography>

              {thumbnailUrl && !imageError && (
                <Typography
                  variant="caption"
                  onClick={handleOpenImagePreview}
                  sx={{
                    cursor: 'pointer',
                    color: 'primary.main',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  View image
                </Typography>
              )}
            </Stack>
          </Stack>
        </TableCell>

        {/* SLUG */}
        <TableCell>{row.slug}</TableCell>

        {/* PARENT */}
        <TableCell>{parentCategory?.name || '-'}</TableCell>

        {/* TYPE */}
        <TableCell>
          <Label color={row.parent_id ? 'info' : 'secondary'}>
            {row.parent_id ? 'Child' : 'Parent'}
          </Label>
        </TableCell>

        {/* SILICA WARNING */}
        <TableCell>
          <Label color={row.silica_warning ? 'warning' : 'default'}>
            {row.silica_warning ? 'Enabled' : 'Disabled'}
          </Label>
        </TableCell>

        {/* SILICA PDF */}
        <TableCell>
          {silicaDatasheetUrl ? (
            <Typography
              component="a"
              href={silicaDatasheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              View PDF
            </Typography>
          ) : (
            '-'
          )}
        </TableCell>

        {/* STATUS */}
        <TableCell>
          <Label color={row.is_active ? 'success' : 'error'}>
            {row.is_active ? 'Active' : 'Inactive'}
          </Label>
        </TableCell>

        {/* ACTION */}
        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* ACTION MENU */}
      <Popover
        open={Boolean(open)}
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

          {row.is_active ? 'Deactivate' : 'Activate'}
        </MenuItem>
      </Popover>

      {/* IMAGE PREVIEW DIALOG */}
      <Dialog
        open={imagePreviewOpen}
        onClose={handleCloseImagePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            overflow: 'hidden',
            bgcolor: 'background.paper',
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 3,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              {row.name}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Category thumbnail
            </Typography>
          </Stack>

          <IconButton onClick={handleCloseImagePreview}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>

        <DialogContent
          sx={{
            p: 2,
            display: 'flex',
            minHeight: 300,
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.neutral',
          }}
        >
          {thumbnailUrl && (
            <Box
              component="img"
              src={thumbnailUrl}
              alt={row.name}
              onError={() => {
                setImageError(true);
                setImagePreviewOpen(false);
              }}
              sx={{
                width: '100%',
                maxWidth: 900,
                maxHeight: '75vh',
                display: 'block',
                objectFit: 'contain',
                borderRadius: 1,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

CategoryTableRow.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]).isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string,
    parent_id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    thumbnail_url: PropTypes.string,
    silica_warning: PropTypes.bool,
    silica_datasheet_url: PropTypes.string,
    is_active: PropTypes.bool,
  }).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  onEdit: PropTypes.func,
  onToggleStatus: PropTypes.func,
};