import { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Card,
  Stack,
  Dialog,
  Divider,
  Popover,
  MenuItem,
  Typography,
  IconButton,
  CardContent,
  DialogContent,
} from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import { canEditCategory } from './category-access';

// ----------------------------------------------------------------------

export default function CategoryCardRow({
  row,
  onEdit,
  onToggleStatus,
  categories = [],
}) {
  const [open, setOpen] = useState(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const handleOpenImagePreview = () => {
    if (thumbnailUrl && !imageError) {
      setImagePreviewOpen(true);
    }
  };

  const handleCloseImagePreview = () => {
    setImagePreviewOpen(false);
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* CATEGORY IMAGE */}
        {thumbnailUrl && !imageError ? (
          <Box
            component="button"
            type="button"
            onClick={handleOpenImagePreview}
            sx={{
              p: 0,
              m: 0,
              width: '100%',
              height: 180,
              border: 0,
              display: 'block',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'zoom-in',
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
                width: '100%',
                height: '100%',
                display: 'block',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />

            <Box
              sx={{
                right: 12,
                bottom: 12,
                width: 34,
                height: 34,
                display: 'flex',
                borderRadius: '50%',
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'common.white',
                bgcolor: 'rgba(0, 0, 0, 0.55)',
              }}
            >
              <Iconify
                icon="solar:magnifer-zoom-in-linear"
                width={20}
              />
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: 180,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: 'background.neutral',
              color: 'text.disabled',
            }}
          >
            <Iconify
              icon="solar:gallery-minimalistic-broken"
              width={42}
            />

            <Typography
              variant="caption"
              sx={{ mt: 1 }}
            >
              No thumbnail
            </Typography>
          </Box>
        )}

        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Stack
              spacing={0.5}
              sx={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <Typography
                variant="subtitle1"
                noWrap
              >
                {row.name}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
              >
                {row.slug}
              </Typography>
            </Stack>

            {canEditCategory && (
              <IconButton
                onClick={handleOpenMenu}
                sx={{ ml: 1 }}
              >
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            {/* PARENT */}
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={2}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Parent
              </Typography>

              <Typography
                variant="body2"
                textAlign="right"
              >
                {parentCategory?.name || '-'}
              </Typography>
            </Stack>

            {/* TYPE */}
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

            {/* SILICA WARNING */}
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

            {/* DATASHEET */}
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
                <Typography variant="body2">
                  -
                </Typography>
              )}
            </Stack>

            {/* STATUS */}
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

      {/* ACTION MENU */}
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

      {/* IMAGE PREVIEW */}
      <Dialog
        open={imagePreviewOpen}
        onClose={handleCloseImagePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            overflow: 'hidden',
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
            <Typography
              variant="h6"
              noWrap
            >
              {row.name}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
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
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.neutral',
          }}
        >
          {thumbnailUrl && !imageError && (
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

CategoryCardRow.propTypes = {
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