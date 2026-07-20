import PropTypes from 'prop-types';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { getCategories } from 'src/services/category.service';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

// ----------------------------------------------------------------------

export default function CategoryQuickEdit({
  open,
  onClose,
  onSubmit,
  currentCategory,
}) {
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',

    thumbnail_url: '',
    thumbnail_file: null,

    silica_warning: false,
    silica_warning_message: '',
    silica_datasheet_url: '',
    silica_datasheet_file: null,
  });

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const apiOrigin = apiUrl.replace(/\/api\/?$/, '');

  const getFileUrl = (url) => {
    if (!url) {
      return '';
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

  const selectedImagePreview = useMemo(() => {
    if (!formData.thumbnail_file) {
      return '';
    }

    return URL.createObjectURL(formData.thumbnail_file);
  }, [formData.thumbnail_file]);

  const currentThumbnailUrl = getFileUrl(
    formData.thumbnail_url
  );

  const displayedThumbnail =
    selectedImagePreview || currentThumbnailUrl;

  const silicaDatasheetUrl = getFileUrl(
    formData.silica_datasheet_url
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (currentCategory) {
      setFormData({
        name: currentCategory.name || '',
        slug: currentCategory.slug || '',
        description:
          currentCategory.description || '',

        parent_id:
          currentCategory.parent_id != null
            ? String(currentCategory.parent_id)
            : '',

        thumbnail_url:
          currentCategory.thumbnail_url || '',

        thumbnail_file: null,

        silica_warning: Boolean(
          currentCategory.silica_warning
        ),

        silica_warning_message:
          currentCategory.silica_warning_message ||
          '',

        silica_datasheet_url:
          currentCategory.silica_datasheet_url ||
          '',

        silica_datasheet_file: null,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parent_id: '',

        thumbnail_url: '',
        thumbnail_file: null,

        silica_warning: false,
        silica_warning_message: '',
        silica_datasheet_url: '',
        silica_datasheet_file: null,
      });
    }

    setIsSubmitting(false);
    setImagePreviewOpen(false);
  }, [currentCategory, open]);

  useEffect(
    () => () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    },
    [selectedImagePreview]
  );

  const fetchCategories = async () => {
    try {
      const response = await getCategories();

      setCategories(response.data || []);
    } catch (error) {
      console.error(
        'Failed to load categories:',
        error
      );
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleThumbnailChange = (event) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert(
        'Only JPG, JPEG, PNG, WEBP, and AVIF images are allowed.'
      );

      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert('Image size must be less than 20 MB.');

      return;
    }

    setFormData((prev) => ({
      ...prev,
      thumbnail_file: file,
    }));
  };

  const handleRemoveSelectedThumbnail = () => {
    setFormData((prev) => ({
      ...prev,
      thumbnail_file: null,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!formData.name.trim()) {
      alert('Category name is required.');
      return;
    }

    if (!formData.slug.trim()) {
      alert('Category slug is required.');
      return;
    }

    if (formData.silica_warning) {
      if (
        !formData.silica_warning_message.trim()
      ) {
        alert(
          'Silica warning message is required.'
        );

        return;
      }

      if (
        !formData.silica_datasheet_url &&
        !formData.silica_datasheet_file
      ) {
        alert(
          'Silica datasheet PDF is required.'
        );

        return;
      }
    }

    const payload = new FormData();

    payload.append(
      'name',
      formData.name.trim()
    );

    payload.append(
      'slug',
      formData.slug.trim()
    );

    payload.append(
      'description',
      formData.description.trim()
    );

    payload.append(
      'parent_id',
      formData.parent_id === ''
        ? ''
        : String(Number(formData.parent_id))
    );

    payload.append(
      'silica_warning',
      String(formData.silica_warning)
    );

    if (formData.thumbnail_file) {
      payload.append(
        'thumbnail',
        formData.thumbnail_file
      );
    }

    if (formData.silica_warning) {
      payload.append(
        'silica_warning_message',
        formData.silica_warning_message.trim()
      );

      if (formData.silica_datasheet_file) {
        payload.append(
          'silica_datasheet',
          formData.silica_datasheet_file
        );
      }
    } else {
      payload.append(
        'silica_warning_message',
        ''
      );
    }

    try {
      setIsSubmitting(true);

      await onSubmit?.(payload);
    } catch (error) {
      console.error(
        'Failed to save category:',
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSilicaToggle = (event) => {
    const {checked} = event.target;

    setFormData((prev) => ({
      ...prev,
      silica_warning: checked,

      ...(checked
        ? {}
        : {
            silica_warning_message: '',
            silica_datasheet_url: '',
            silica_datasheet_file: null,
          }),
    }));
  };

  const handleSilicaFileChange = (event) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      silica_datasheet_file: file,
    }));
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setImagePreviewOpen(false);
    onClose?.();
  };

  let submitButtonText = 'Create Category';

if (currentCategory) {
  submitButtonText = 'Update Category';
}

if (isSubmitting) {
  submitButtonText = currentCategory
    ? 'Updating...'
    : 'Creating...';
}

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        disableEscapeKeyDown={isSubmitting}
      >
        <DialogTitle>
          {currentCategory
            ? 'Edit Category'
            : 'Add Category'}
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              required
              disabled={isSubmitting}
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              required
              disabled={isSubmitting}
              label="Slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              disabled={isSubmitting}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />

            <TextField
              select
              fullWidth
              disabled={isSubmitting}
              label="Parent Category"
              name="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
            >
              <MenuItem value="">
                No Parent Category
              </MenuItem>

              {categories
                .filter(
                  (item) =>
                    item.parent_id === null &&
                    Number(item.id) !==
                      Number(currentCategory?.id) &&
                    (item.is_active ||
                      Number(item.id) ===
                        Number(
                          currentCategory?.parent_id
                        ))
                )
                .map((category) => (
                  <MenuItem
                    key={category.id}
                    value={String(category.id)}
                  >
                    {category.name}
                    {!category.is_active &&
                      ' (Inactive)'}
                  </MenuItem>
                ))}
            </TextField>

            {/* CATEGORY THUMBNAIL */}
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">
                Category Thumbnail
              </Typography>

              {displayedThumbnail ? (
                <Box
                  onClick={() => {
                    if (!isSubmitting) {
                      setImagePreviewOpen(true);
                    }
                  }}
                  sx={{
                    height: 210,
                    width: '100%',
                    overflow: 'hidden',
                    borderRadius: 1.5,
                    cursor: isSubmitting
                      ? 'default'
                      : 'zoom-in',
                    position: 'relative',
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.neutral',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  <Box
                    component="img"
                    src={displayedThumbnail}
                    alt={
                      formData.name ||
                      'Category thumbnail'
                    }
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      objectFit: 'cover',
                    }}
                  />

                  {!isSubmitting && (
                    <Box
                      sx={{
                        right: 12,
                        bottom: 12,
                        width: 36,
                        height: 36,
                        display: 'flex',
                        borderRadius: '50%',
                        position: 'absolute',
                        alignItems: 'center',
                        color: 'common.white',
                        justifyContent: 'center',
                        bgcolor:
                          'rgba(0, 0, 0, 0.55)',
                      }}
                    >
                      <Iconify
                        icon="solar:magnifer-zoom-in-linear"
                        width={20}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 180,
                    width: '100%',
                    display: 'flex',
                    borderRadius: 1.5,
                    alignItems: 'center',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    border: 1,
                    borderStyle: 'dashed',
                    borderColor: 'divider',
                    bgcolor: 'background.neutral',
                    color: 'text.disabled',
                  }}
                >
                  <Iconify
                    icon="solar:gallery-minimalistic-broken"
                    width={42}
                  />

                  <Typography
                    variant="body2"
                    sx={{ mt: 1 }}
                  >
                    No category thumbnail
                  </Typography>
                </Box>
              )}

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={1}
              >
                <Button
                  component="label"
                  variant="outlined"
                  disabled={isSubmitting}
                  startIcon={
                    <Iconify icon="solar:upload-minimalistic-linear" />
                  }
                >
                  {displayedThumbnail
                    ? 'Change Image'
                    : 'Upload Image'}

                  <input
                    hidden
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleThumbnailChange}
                  />
                </Button>

                {formData.thumbnail_file && (
                  <Button
                    color="error"
                    variant="outlined"
                    disabled={isSubmitting}
                    onClick={
                      handleRemoveSelectedThumbnail
                    }
                    startIcon={
                      <Iconify icon="solar:trash-bin-trash-linear" />
                    }
                  >
                    Remove Selected
                  </Button>
                )}
              </Stack>

              {formData.thumbnail_file && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Selected:{' '}
                  {formData.thumbnail_file.name}
                </Typography>
              )}

              <Typography
                variant="caption"
                color="text.secondary"
              >
                JPG, PNG, WEBP or AVIF. Maximum size:
                20 MB.
              </Typography>
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  disabled={isSubmitting}
                  checked={formData.silica_warning}
                  onChange={handleSilicaToggle}
                />
              }
              label="Enable Silica Warning"
            />

            {formData.silica_warning && (
              <>
                <TextField
                  fullWidth
                  required
                  multiline
                  minRows={3}
                  disabled={isSubmitting}
                  label="Silica Warning Message"
                  name="silica_warning_message"
                  value={
                    formData.silica_warning_message
                  }
                  onChange={handleChange}
                />

                <Button
                  variant="outlined"
                  component="label"
                  disabled={isSubmitting}
                  startIcon={
                    <Iconify icon="solar:upload-minimalistic-linear" />
                  }
                >
                  {formData.silica_datasheet_file
                    ? 'Change PDF'
                    : 'Upload Silica Datasheet PDF'}

                  <input
                    hidden
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleSilicaFileChange}
                  />
                </Button>

                {!formData.silica_datasheet_file &&
                  silicaDatasheetUrl && (
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        Current PDF:
                      </Typography>

                      <Typography
                        component="a"
                        href={silicaDatasheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        sx={{
                          width: 'fit-content',
                          color: 'primary.main',
                          textDecoration: 'none',
                          pointerEvents: isSubmitting
                            ? 'none'
                            : 'auto',
                          opacity: isSubmitting
                            ? 0.6
                            : 1,
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        View Current Datasheet
                      </Typography>
                    </Stack>
                  )}

                {formData.silica_datasheet_file && (
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Selected:{' '}
                      {
                        formData
                          .silica_datasheet_file.name
                      }
                    </Typography>

                    <Button
                      size="small"
                      color="error"
                      disabled={isSubmitting}
                      sx={{ width: 'fit-content' }}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          silica_datasheet_file:
                            null,
                        }))
                      }
                    >
                      Remove Selected PDF
                    </Button>
                  </Stack>
                )}
              </>
            )}

            {isSubmitting && (
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                justifyContent="center"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                }}
              >
                <CircularProgress size={22} />

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {formData.thumbnail_file ||
                  formData.silica_datasheet_file
                    ? 'Uploading files and saving category...'
                    : 'Saving category...'}
                </Typography>
              </Stack>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            variant="outlined"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
  variant="contained"
  disabled={isSubmitting}
  onClick={handleSubmit}
  startIcon={
    isSubmitting ? (
      <CircularProgress
        size={18}
        color="inherit"
      />
    ) : null
  }
>
  {submitButtonText}
</Button>
        </DialogActions>
      </Dialog>

      {/* LARGE IMAGE PREVIEW */}
      <Dialog
        open={imagePreviewOpen}
        onClose={() =>
          setImagePreviewOpen(false)
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">
              {formData.name ||
                'Category Thumbnail'}
            </Typography>

            <IconButton
              onClick={() =>
                setImagePreviewOpen(false)
              }
            >
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>

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
          {displayedThumbnail && (
            <Box
              component="img"
              src={displayedThumbnail}
              alt={
                formData.name ||
                'Category thumbnail'
              }
              sx={{
                width: '100%',
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

CategoryQuickEdit.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  currentCategory: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    name: PropTypes.string,
    slug: PropTypes.string,
    description: PropTypes.string,
    parent_id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    thumbnail_url: PropTypes.string,
    silica_warning: PropTypes.bool,
    silica_warning_message: PropTypes.string,
    silica_datasheet_url: PropTypes.string,
  }),
};