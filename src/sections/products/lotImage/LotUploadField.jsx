import PropTypes from 'prop-types';
import {
  useRef,
  useState,
} from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function LotUploadField({
  rowId,
  lotId,
  index,
  lotName,
  images,
  disabled,
  deletingLot,
  deletingImageId,
  onLotNameChange,
  onFilesSelected,
  onRemoveImage,
  onAddRow,
  onRemoveRow,
  canRemoveRow,
}) {
  const inputRef = useRef(null);

  const [
    previewImage,
    setPreviewImage,
  ] = useState(null);

  const [
    isDragging,
    setIsDragging,
  ] = useState(false);

  // --------------------------------------------------------------------

  const handleFileChange = (
    event
  ) => {
    const selectedFiles =
      Array.from(
        event.target.files || []
      );

    event.target.value = '';

    if (
      disabled ||
      deletingLot ||
      !selectedFiles.length
    ) {
      return;
    }

    onFilesSelected(
      rowId,
      selectedFiles
    );
  };

  // --------------------------------------------------------------------

  const handleDrop = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    if (
      disabled ||
      deletingLot
    ) {
      return;
    }

    const selectedFiles =
      Array.from(
        event.dataTransfer.files ||
          []
      );

    if (!selectedFiles.length) {
      return;
    }

    onFilesSelected(
      rowId,
      selectedFiles
    );
  };

  // --------------------------------------------------------------------

  const handleDragOver = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      disabled ||
      deletingLot
    ) {
      return;
    }

    event.dataTransfer.dropEffect =
      'copy';

    setIsDragging(true);
  };

  // --------------------------------------------------------------------

  const handleDragEnter = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      disabled ||
      deletingLot
    ) {
      return;
    }

    setIsDragging(true);
  };

  // --------------------------------------------------------------------

  const handleDragLeave = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      event.currentTarget.contains(
        event.relatedTarget
      )
    ) {
      return;
    }

    setIsDragging(false);
  };

  // --------------------------------------------------------------------

  const handleBrowseClick = (
    event
  ) => {
    event?.stopPropagation();

    if (
      disabled ||
      deletingLot
    ) {
      return;
    }

    inputRef.current?.click();
  };

  // --------------------------------------------------------------------

  let uploadStatusText =
    'Browse or drop images here';

  if (isDragging) {
    uploadStatusText =
      'Drop images into this lot';
  } else if (
    images.length > 0
  ) {
    const imageLabel =
      images.length === 1
        ? 'image'
        : 'images';

    uploadStatusText =
      `${images.length} ${imageLabel} selected`;
  }

  // --------------------------------------------------------------------

  let removeLotTooltip =
    'At least one lot is required';

  if (canRemoveRow) {
    removeLotTooltip = lotId
      ? 'Delete this lot'
      : 'Remove this lot';
  }

  // --------------------------------------------------------------------

  return (
    <>
      {index === 0 && (
        <Grid
          container
          spacing={1.5}
          sx={{
            mb: 1,

            display: {
              xs: 'none',
              md: 'flex',
            },
          }}
        >
          <Grid item md={3}>
            <Typography
              variant="caption"
              fontWeight={700}
            >
              Lot Name
            </Typography>
          </Grid>

          <Grid item md={7}>
            <Typography
              variant="caption"
              fontWeight={700}
            >
              Lot Images
            </Typography>
          </Grid>

          <Grid item md={2}>
            <Typography
              variant="caption"
              fontWeight={700}
              align="right"
            >
              Action
            </Typography>
          </Grid>
        </Grid>
      )}

      <Box
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: 1.5,
          border: '1px solid',

          borderColor:
            isDragging
              ? 'primary.main'
              : 'divider',

          bgcolor:
            isDragging
              ? 'primary.lighter'
              : 'background.default',

          opacity:
            deletingLot
              ? 0.7
              : 1,

          transition:
            'border-color 0.2s ease, background-color 0.2s ease',
        }}
      >
        <Grid
          container
          spacing={1.5}
          alignItems="center"
        >
          <Grid
            item
            xs={12}
            md={3}
          >
            <TextField
              fullWidth
              size="small"
              disabled={
                disabled ||
                deletingLot
              }
              label={`Lot ${
                index + 1
              } Name`}
              value={lotName}
              placeholder="Example: Lot 1001"
              onChange={(event) =>
                onLotNameChange(
                  rowId,
                  event.target.value
                )
              }
              helperText={
                lotId
                  ? `Saved Lot ID: ${lotId}`
                  : 'New unsaved lot'
              }
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={7}
          >
            <Box
              onDrop={handleDrop}
              onDragOver={
                handleDragOver
              }
              onDragEnter={
                handleDragEnter
              }
              onDragLeave={
                handleDragLeave
              }
              onClick={
                handleBrowseClick
              }
              sx={{
                minHeight: 46,
                px: 1,
                border: '1px dashed',

                borderColor:
                  isDragging
                    ? 'primary.main'
                    : 'divider',

                borderRadius: 1.25,
                display: 'flex',
                alignItems:
                  'center',
                gap: 1,

                cursor:
                  disabled ||
                  deletingLot
                    ? 'not-allowed'
                    : 'pointer',

                bgcolor:
                  isDragging
                    ? 'primary.lighter'
                    : 'background.paper',

                transition:
                  'all 0.2s ease',

                '&:hover': {
                  borderColor:
                    disabled ||
                    deletingLot
                      ? 'divider'
                      : 'primary.main',

                  bgcolor:
                    disabled ||
                    deletingLot
                      ? 'background.paper'
                      : 'action.hover',
                },
              }}
            >
              <Button
                component="span"
                variant="outlined"
                disabled={
                  disabled ||
                  deletingLot
                }
                startIcon={
                  <Iconify
                    icon="solar:gallery-add-bold-duotone"
                    width={18}
                  />
                }
                onClick={
                  handleBrowseClick
                }
              >
                Browse Images
              </Button>

              <Typography
                variant="body2"
                noWrap
                color={
                  images.length
                    ? 'text.primary'
                    : 'text.secondary'
                }
              >
                {uploadStatusText}
              </Typography>

              <input
                ref={inputRef}
                hidden
                multiple
                disabled={
                  disabled ||
                  deletingLot
                }
                type="file"
                accept="image/*"
                onChange={
                  handleFileChange
                }
              />
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={2}
          >
            <Stack
              direction="row"
              spacing={1}
              justifyContent={{
                xs: 'flex-start',
                md: 'flex-end',
              }}
            >
              <Tooltip title="Add another lot">
                <span>
                  <IconButton
                    disabled={
                      disabled ||
                      deletingLot
                    }
                    onClick={
                      onAddRow
                    }
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 1.25,
                      bgcolor:
                        'primary.main',
                      color:
                        'common.white',

                      '&:hover': {
                        bgcolor:
                          'primary.dark',
                      },
                    }}
                  >
                    <Iconify
                      icon="mdi:plus"
                      width={22}
                    />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip
                title={
                  removeLotTooltip
                }
              >
                <span>
                  <IconButton
                    disabled={
                      disabled ||
                      deletingLot ||
                      !canRemoveRow
                    }
                    onClick={() =>
                      onRemoveRow(
                        rowId
                      )
                    }
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 1.25,
                      border:
                        '1px solid',

                      borderColor:
                        canRemoveRow
                          ? 'error.main'
                          : 'divider',

                      color:
                        canRemoveRow
                          ? 'error.main'
                          : 'text.disabled',

                      '&:hover': {
                        bgcolor:
                          'error.lighter',
                      },
                    }}
                  >
                    {deletingLot ? (
                      <CircularProgress
                        size={20}
                        color="inherit"
                      />
                    ) : (
                      <Iconify
                        icon={
                          lotId
                            ? 'mdi:delete-outline'
                            : 'mdi:minus'
                        }
                        width={22}
                      />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>

        {images.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
            >
              {images.length}{' '}
              {images.length === 1
                ? 'IMAGE'
                : 'IMAGES'}
            </Typography>

            <Grid
              container
              spacing={1.5}
              sx={{ mt: 0.25 }}
            >
              {images.map(
                (image) => {
                  const isDeleting =
                    Boolean(
                      image.imageId
                    ) &&
                    String(
                      deletingImageId
                    ) ===
                      String(
                        image.imageId
                      );

                  const imageSource =
                    image.previewUrl ||
                    image.imageUrl;

                  return (
                    <Grid
                      item
                      xs={6}
                      sm={4}
                      md={3}
                      lg={2}
                      key={image.id}
                    >
                      <Box
                        sx={{
                          position:
                            'relative',
                          overflow:
                            'hidden',
                          borderRadius:
                            1.5,
                          border:
                            '1px solid',

                          borderColor:
                            image.isNew
                              ? 'primary.main'
                              : 'divider',

                          opacity:
                            isDeleting
                              ? 0.6
                              : 1,
                        }}
                      >
                        <Box
                          component="img"
                          src={
                            imageSource
                          }
                          alt={
                            image.fileName ||
                            lotName
                          }
                          onClick={() =>
                            setPreviewImage(
                              image
                            )
                          }
                          sx={{
                            width: '100%',
                            height: 120,
                            display:
                              'block',
                            objectFit:
                              'cover',
                            cursor:
                              'pointer',
                          }}
                        />

                        <Tooltip title="Remove image">
                          <span>
                            <IconButton
                              size="small"
                              disabled={
                                disabled ||
                                deletingLot ||
                                isDeleting
                              }
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                onRemoveImage(
                                  rowId,
                                  image.id
                                );
                              }}
                              sx={{
                                position:
                                  'absolute',
                                top: 6,
                                right: 6,
                                width: 28,
                                height: 28,
                                bgcolor:
                                  'error.main',
                                color:
                                  'common.white',

                                '&:hover': {
                                  bgcolor:
                                    'error.dark',
                                },
                              }}
                            >
                              {isDeleting ? (
                                <CircularProgress
                                  size={14}
                                  color="inherit"
                                />
                              ) : (
                                <Iconify
                                  icon="mdi:close"
                                  width={16}
                                />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Typography
                          variant="caption"
                          title={
                            image.fileName
                          }
                          sx={{
                            p: 0.75,
                            display:
                              'block',
                            overflow:
                              'hidden',
                            whiteSpace:
                              'nowrap',
                            textOverflow:
                              'ellipsis',
                          }}
                        >
                          {image.fileName}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                }
              )}
            </Grid>
          </Box>
        )}
      </Box>

      <Dialog
        open={Boolean(
          previewImage
        )}
        onClose={() =>
          setPreviewImage(null)
        }
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="subtitle1">
                {lotName}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {
                  previewImage?.fileName
                }
              </Typography>
            </Box>

            <IconButton
              onClick={() =>
                setPreviewImage(
                  null
                )
              }
            >
              <Iconify
                icon="mdi:close"
                width={22}
              />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {previewImage && (
            <Box
              component="img"
              src={
                previewImage.previewUrl ||
                previewImage.imageUrl
              }
              alt={
                previewImage.fileName ||
                'Lot image'
              }
              sx={{
                width: '100%',
                maxHeight: 650,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

LotUploadField.propTypes = {
  rowId:
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,

  lotId:
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),

  index:
    PropTypes.number.isRequired,

  lotName:
    PropTypes.string.isRequired,

  images:
    PropTypes.array.isRequired,

  disabled:
    PropTypes.bool,

  deletingLot:
    PropTypes.bool,

  deletingImageId:
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),

  onLotNameChange:
    PropTypes.func.isRequired,

  onFilesSelected:
    PropTypes.func.isRequired,

  onRemoveImage:
    PropTypes.func.isRequired,

  onAddRow:
    PropTypes.func.isRequired,

  onRemoveRow:
    PropTypes.func.isRequired,

  canRemoveRow:
    PropTypes.bool.isRequired,
};

// ----------------------------------------------------------------------

LotUploadField.defaultProps = {
  lotId: null,
  disabled: false,
  deletingLot: false,
  deletingImageId: null,
};