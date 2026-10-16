import PropTypes from 'prop-types';
import {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import {
  getCategoryResources,
  createCategoryResource,
  updateCategoryResource,
  deleteCategoryResource,
  updateCategoryResourceStatus,
} from 'src/services/category.service';

import Iconify from 'src/components/iconify';

// =====================================================
// CONSTANTS
// =====================================================

const MAX_PDF_SIZE = 100 * 1024 * 1024;


const INITIAL_FORM = {
  title: '',
  slug: '',
  description: '',
  resource_type: 'PDF',
  content: '',
  file: null,
  display_order: 0,
  is_active: true,
};

const makeSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getErrorMessage = (error) =>
  error?.message || 'Something went wrong.';

// =====================================================
// RICH TEXT EDITOR
// =====================================================

function RichTextEditor({
  value,
  onChange,
  disabled,
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (
      editorRef.current &&
      editorRef.current.innerHTML !== (value || '')
    ) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const executeCommand = (command, argument) => {
    if (disabled) return;

    editorRef.current?.focus();

    document.execCommand(command, false, argument);

    onChange(editorRef.current?.innerHTML || '');
  };

  const toolbar = [
    {
      icon: 'eva:bold-fill',
      command: 'bold',
      title: 'Bold',
    },
    {
      icon: 'eva:italic-fill',
      command: 'italic',
      title: 'Italic',
    },
    {
      icon: 'eva:underline-fill',
      command: 'underline',
      title: 'Underline',
    },
    {
      icon: 'solar:list-bold',
      command: 'insertUnorderedList',
      title: 'Bullet list',
    },
    {
      icon: 'solar:list-check-bold',
      command: 'insertOrderedList',
      title: 'Numbered list',
    },
  ];

  const handleLink = () => {
    const url = window.prompt('Enter link URL');

    if (!url) return;

    let parsedUrl;

    try {
      parsedUrl = new URL(url);
    } catch {
      alert('Enter a valid URL.');
      return;
    }

    if (
      !['http:', 'https:'].includes(parsedUrl.protocol)
    ) {
      alert('Only HTTP and HTTPS links are allowed.');
      return;
    }

    executeCommand('createLink', parsedUrl.href);
  };

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">
        Rich Text Content *
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          overflow: 'hidden',
          borderRadius: 1.5,
        }}
      >
        <Stack
          direction="row"
          flexWrap="wrap"
          alignItems="center"
          sx={{
            p: 0.5,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.neutral',
          }}
        >
          {toolbar.map((item) => (
            <IconButton
              key={item.command}
              size="small"
              title={item.title}
              disabled={disabled}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={() =>
                executeCommand(item.command)
              }
            >
              <Iconify
                icon={item.icon}
                width={20}
              />
            </IconButton>
          ))}

          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 0.5 }}
          />

          <IconButton
            size="small"
            title="Insert Link"
            disabled={disabled}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={handleLink}
          >
            <Iconify
              icon="solar:link-bold"
              width={20}
            />
          </IconButton>

          <IconButton
            size="small"
            title="Remove Formatting"
            disabled={disabled}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() =>
              executeCommand('removeFormat')
            }
          >
            <Iconify
              icon="solar:eraser-bold"
              width={20}
            />
          </IconButton>
        </Stack>

        <Box
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={(event) => {
            onChange(event.currentTarget.innerHTML);
          }}
          sx={{
            p: 2,
            minHeight: 200,
            maxHeight: 400,
            overflowY: 'auto',
            outline: 'none',
            typography: 'body2',
            '& ul, & ol': {
              pl: 3,
            },
            '& a': {
              color: 'primary.main',
            },
            '&:empty:before': {
              content: '"Enter resource content..."',
              color: 'text.disabled',
            },
          }}
        />
      </Paper>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        Supports formatted text, lists, and links.
      </Typography>
    </Stack>
  );
}

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function CategoryResources({
  open,
  onClose,
  category,
}) {
  const [resources, setResources] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);

  const [editingResource, setEditingResource] =
    useState(null);

  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [slugEdited, setSlugEdited] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [statusUpdatingId, setStatusUpdatingId] =
    useState(null);

  // =====================================================
  // FETCH RESOURCES
  // =====================================================

const fetchResources = useCallback(async () => {
  if (!category?.id) return;

  try {
    setLoading(true);
    setError('');

    const response = await getCategoryResources();

    console.log('Category Resources API Response:', response);

    const candidates = [
      response,
      response?.data,
      response?.resources,
      response?.data?.resources,
      response?.data?.data,
      response?.data?.data?.resources,
      response?.items,
      response?.data?.items,
    ];

    const rawData = candidates.find((item) =>
      Array.isArray(item)
    );

    if (!rawData) {
      console.error(
        'Unexpected Category Resources API Response:',
        response
      );

      throw new Error(
        'Unexpected resources API response format.'
      );
    }

    const filtered = rawData
      .filter(
        (item) =>
          String(item.category_id) === String(category.id)
      )
      .sort(
        (a, b) =>
          Number(a.display_order || 0) -
          Number(b.display_order || 0)
      );

    setResources(filtered);
  } catch (err) {
    console.error('Resource fetch error:', err);

    setError(getErrorMessage(err));
    setResources([]);
  } finally {
    setLoading(false);
  }
}, [category?.id]);
  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    if (open && category?.id) {
      fetchResources();
    }
  }, [open, category?.id, fetchResources]);

  // =====================================================
  // RESET ON CLOSE
  // =====================================================

  useEffect(() => {
    if (!open) {
      setResources([]);
      setShowForm(false);
      setEditingResource(null);
      setFormData(INITIAL_FORM);
      setError('');
      setSuccess('');
      setSlugEdited(false);
    }
  }, [open]);

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'title') {
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: slugEdited
          ? prev.slug
          : makeSlug(value),
      }));

      return;
    }

    if (name === 'slug') {
      setSlugEdited(true);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // RESOURCE TYPE
  // =====================================================

  const handleResourceTypeChange = (event) => {
    const { value } = event.target;

    setFormData((prev) => ({
      ...prev,
      resource_type: value,
      file: null,
      content: '',
    }));
  };

  // =====================================================
  // PDF UPLOAD
  // =====================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) return;

    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      setError('Only PDF files are allowed.');
      return;
    }

    if (file.size > MAX_PDF_SIZE) {
      setError(
        'PDF size must be less than 20 MB.'
      );
      return;
    }

    setError('');

    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  // =====================================================
  // ADD NEW RESOURCE
  // =====================================================

  const handleAddNew = () => {
    setEditingResource(null);

    setFormData({
      ...INITIAL_FORM,
      display_order: resources.length,
    });

    setSlugEdited(false);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  // =====================================================
  // EDIT RESOURCE
  // =====================================================

  const handleEdit = (resource) => {
    setEditingResource(resource);

    setFormData({
      title: resource.title || '',
      slug: resource.slug || '',
      description: resource.description || '',
      resource_type:
        resource.resource_type || 'PDF',
      content: resource.content || '',
      file: null,
      display_order: Number(
        resource.display_order || 0
      ),
      is_active: Boolean(resource.is_active),
    });

    setSlugEdited(true);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  // =====================================================
  // CANCEL FORM
  // =====================================================

  const handleCancelForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingResource(null);
    setFormData(INITIAL_FORM);
    setError('');
  };

  // =====================================================
  // CREATE / UPDATE RESOURCE
  // =====================================================

  const handleSubmit = async () => {
    if (saving || !category?.id) return;

    if (!formData.title.trim()) {
      setError(
        'Resource title is required.'
      );
      return;
    }

    if (!formData.slug.trim()) {
      setError(
        'Resource slug is required.'
      );
      return;
    }

    const hasExistingPdf =
      editingResource &&
      editingResource.resource_type === 'PDF' &&
      editingResource.file_url;

    if (
      formData.resource_type === 'PDF' &&
      !formData.file &&
      !hasExistingPdf
    ) {
      setError(
        'Please upload a PDF file.'
      );
      return;
    }

    if (
      formData.resource_type === 'TEXT' &&
      !formData.content
        .replace(/<[^>]*>/g, '')
        .trim()
    ) {
      setError(
        'Rich text content is required.'
      );
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = new FormData();

      payload.append(
        'category_id',
        String(category.id)
      );

      payload.append(
        'title',
        formData.title.trim()
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
        'resource_type',
        formData.resource_type
      );

      payload.append(
        'display_order',
        String(formData.display_order)
      );

      payload.append(
        'is_active',
        String(formData.is_active)
      );

      if (
        formData.resource_type === 'TEXT'
      ) {
        payload.append(
          'content',
          formData.content
        );
      }

      if (
  formData.resource_type === 'PDF' &&
  formData.file
) {
  payload.append(
    'pdf',
    formData.file
  );
}

      const isEditing =
        Boolean(editingResource);

      if (isEditing) {
        await updateCategoryResource(
          editingResource.id,
          payload
        );
      } else {
        await createCategoryResource(
          payload
        );
      }

      await fetchResources();

      setShowForm(false);
      setEditingResource(null);
      setFormData(INITIAL_FORM);

      setSuccess(
        isEditing
          ? 'Resource updated successfully.'
          : 'Resource created successfully.'
      );
    } catch (err) {
      console.error(
        'Resource save error:',
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleToggleStatus = async (resource) => {
    if (statusUpdatingId !== null) return;

    try {
      setStatusUpdatingId(resource.id);
      setError('');
      setSuccess('');

      await updateCategoryResourceStatus(
        resource.id,
        !resource.is_active
      );

      await fetchResources();

      setSuccess(
        'Resource status updated.'
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // =====================================================
  // DELETE RESOURCE
  // =====================================================

  const handleDelete = async (resource) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${resource.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(resource.id);
      setError('');
      setSuccess('');

      await deleteCategoryResource(
        resource.id
      );

      await fetchResources();

      setSuccess(
        'Resource deleted successfully.'
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // FILE URL
  // =====================================================

  const apiUrl =
    import.meta.env.VITE_API_URL || '';

  const apiOrigin =
    apiUrl.replace(/\/api\/?$/, '');

  const getFileUrl = (url) => {
    if (!url) return '';

    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('blob:')
    ) {
      return url;
    }

    return `${apiOrigin}${
      url.startsWith('/') ? '' : '/'
    }${url}`;
  };

  // =====================================================
  // CLOSE DIALOG
  // =====================================================

  const handleClose = () => {
    if (
      saving ||
      deletingId !== null ||
      statusUpdatingId !== null
    ) {
      return;
    }

    onClose?.();
  };

  // =====================================================
  // SUBMIT BUTTON TEXT
  // =====================================================

  let submitButtonText =
    'Create Resource';

  if (editingResource) {
    submitButtonText =
      'Update Resource';
  }

  if (saving) {
    submitButtonText = 'Saving...';
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      disableEscapeKeyDown={
        saving ||
        deletingId !== null ||
        statusUpdatingId !== null
      }
    >
      {/* HEADER */}

      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack spacing={0.5}>
            <Typography variant="h6">
              Category Resources
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {category?.name || 'Category'}
            </Typography>
          </Stack>

          <IconButton
            onClick={handleClose}
            disabled={
              saving ||
              deletingId !== null ||
              statusUpdatingId !== null
            }
          >
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* CONTENT */}

      <DialogContent
        sx={{
          p: 3,
          minHeight: 350,
        }}
      >
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* NOTIFICATIONS */}

          {error && (
            <Alert
              severity="error"
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}

          {/* RESOURCE LIST */}

          {!showForm && (
            <>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle1">
                  Resources ({resources.length})
                </Typography>

                <Button
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    <Iconify icon="eva:plus-fill" />
                  }
                  onClick={handleAddNew}
                >
                  Add Resource
                </Button>
              </Stack>

              {/* LOADING STATE */}

              {loading && (
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{ py: 8 }}
                >
                  <CircularProgress />
                </Stack>
              )}

              {/* EMPTY STATE */}

              {!loading &&
                resources.length === 0 && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 5,
                      textAlign: 'center',
                      borderStyle: 'dashed',
                    }}
                  >
                    <Iconify
                      icon="solar:document-text-linear"
                      width={48}
                      sx={{
                        color: 'text.disabled',
                        mb: 2,
                      }}
                    />

                    <Typography variant="subtitle1">
                      No resources added
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Add PDFs or rich-text resources
                      for this category.
                    </Typography>
                  </Paper>
                )}

              {/* RESOURCE ITEMS */}

              {!loading &&
                resources.length > 0 && (
                  <Stack spacing={1.5}>
                    {resources.map((resource) => {
                      const busy =
                        String(deletingId) ===
                          String(resource.id) ||
                        String(statusUpdatingId) ===
                          String(resource.id);

                      return (
                        <Paper
                          key={resource.id}
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 1.5,
                          }}
                        >
                          <Stack
                            direction={{
                              xs: 'column',
                              sm: 'row',
                            }}
                            spacing={2}
                            alignItems={{
                              xs: 'flex-start',
                              sm: 'center',
                            }}
                            justifyContent="space-between"
                          >
                            {/* RESOURCE DETAILS */}

                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                              sx={{ minWidth: 0 }}
                            >
                              <Box
                                sx={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 1,
                                  bgcolor:
                                    'background.neutral',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <Iconify
                                  icon={
                                    resource.resource_type ===
                                    'PDF'
                                      ? 'solar:document-bold'
                                      : 'solar:document-text-bold'
                                  }
                                  width={24}
                                />
                              </Box>

                              <Stack
                                spacing={0.5}
                                sx={{ minWidth: 0 }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  noWrap
                                >
                                  {resource.title}
                                </Typography>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                  alignItems="center"
                                >
                                  <Chip
                                    size="small"
                                    label={
                                      resource.resource_type
                                    }
                                    color={
                                      resource.resource_type ===
                                      'PDF'
                                        ? 'info'
                                        : 'secondary'
                                    }
                                  />

                                  <Chip
                                    size="small"
                                    label={
                                      resource.is_active
                                        ? 'Active'
                                        : 'Inactive'
                                    }
                                    color={
                                      resource.is_active
                                        ? 'success'
                                        : 'default'
                                    }
                                  />

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Order:{' '}
                                    {resource.display_order ??
                                      0}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Stack>

                            {/* RESOURCE ACTIONS */}

                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              {/* VIEW PDF */}

                              {resource.resource_type ===
                                'PDF' &&
                                resource.file_url && (
                                  <IconButton
                                    component="a"
                                    href={getFileUrl(
                                      resource.file_url
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="View PDF"
                                    disabled={busy}
                                  >
                                    <Iconify
                                      icon="solar:eye-linear"
                                    />
                                  </IconButton>
                                )}

                              {/* EDIT */}

                              <IconButton
                                title="Edit"
                                disabled={busy}
                                onClick={() =>
                                  handleEdit(resource)
                                }
                              >
                                <Iconify
                                  icon="eva:edit-fill"
                                />
                              </IconButton>

                              {/* STATUS */}

                              <IconButton
                                title={
                                  resource.is_active
                                    ? 'Deactivate'
                                    : 'Activate'
                                }
                                disabled={busy}
                                onClick={() =>
                                  handleToggleStatus(
                                    resource
                                  )
                                }
                              >
                                {String(statusUpdatingId) ===
                                String(resource.id) ? (
                                  <CircularProgress
                                    size={20}
                                  />
                                ) : (
                                  <Iconify
                                    icon={
                                      resource.is_active
                                        ? 'solar:eye-closed-linear'
                                        : 'solar:eye-linear'
                                    }
                                  />
                                )}
                              </IconButton>

                              {/* DELETE */}

                              <IconButton
                                color="error"
                                title="Delete"
                                disabled={busy}
                                onClick={() =>
                                  handleDelete(resource)
                                }
                              >
                                {String(deletingId) ===
                                String(resource.id) ? (
                                  <CircularProgress
                                    size={20}
                                  />
                                ) : (
                                  <Iconify
                                    icon="solar:trash-bin-trash-linear"
                                  />
                                )}
                              </IconButton>
                            </Stack>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
            </>
          )}

          {/* CREATE / EDIT FORM */}

          {showForm && (
            <Stack spacing={3}>
              {/* FORM HEADER */}

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <IconButton
                  onClick={handleCancelForm}
                  disabled={saving}
                >
                  <Iconify icon="eva:arrow-back-fill" />
                </IconButton>

                <Typography variant="subtitle1">
                  {editingResource
                    ? 'Edit Resource'
                    : 'Add New Resource'}
                </Typography>
              </Stack>

              <Alert severity="info">
                Adding resource to{' '}
                <strong>{category?.name}</strong>
              </Alert>

              {/* TITLE */}

              <TextField
                fullWidth
                required
                label="Resource Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={saving}
                placeholder="e.g. 15 Years Commercial Warranty"
              />

              {/* SLUG */}

              <TextField
                fullWidth
                required
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                disabled={saving}
                helperText="Unique within this category."
              />

              {/* DESCRIPTION */}

              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={saving}
              />

              {/* RESOURCE TYPE */}

              <TextField
                select
                fullWidth
                label="Resource Type"
                value={formData.resource_type}
                onChange={handleResourceTypeChange}
                disabled={saving}
              >
                <MenuItem value="PDF">
                  PDF Document
                </MenuItem>

                <MenuItem value="TEXT">
                  Rich Text Content
                </MenuItem>
              </TextField>

              {/* PDF UPLOAD */}

              {formData.resource_type ===
                'PDF' && (
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2">
                      PDF Document *
                    </Typography>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        borderStyle: 'dashed',
                        borderRadius: 1.5,
                        textAlign: 'center',
                      }}
                    >
                      <Iconify
                        icon="solar:document-bold"
                        width={40}
                        sx={{
                          color: 'text.disabled',
                          mb: 1,
                        }}
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Upload a PDF document
                      </Typography>

                      <Button
                        component="label"
                        variant="outlined"
                        disabled={saving}
                        startIcon={
                          <Iconify icon="solar:upload-minimalistic-linear" />
                        }
                      >
                        {formData.file
                          ? 'Change PDF'
                          : 'Select PDF'}

                        <input
                          hidden
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handleFileChange}
                        />
                      </Button>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        PDF only. Maximum 100 MB.
                      </Typography>
                    </Paper>

                    {/* SELECTED PDF */}

                    {formData.file && (
                      <Paper
                        variant="outlined"
                        sx={{ p: 1.5 }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ minWidth: 0 }}
                          >
                            <Iconify
                              icon="solar:document-bold"
                              width={24}
                            />

                            <Stack
                              sx={{ minWidth: 0 }}
                            >
                              <Typography
                                variant="body2"
                                noWrap
                              >
                                {formData.file.name}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {(
                                  formData.file.size /
                                  1024 /
                                  1024
                                ).toFixed(2)}{' '}
                                MB
                              </Typography>
                            </Stack>
                          </Stack>

                          <IconButton
                            color="error"
                            disabled={saving}
                            onClick={() =>
                              setFormData(
                                (prev) => ({
                                  ...prev,
                                  file: null,
                                })
                              )
                            }
                          >
                            <Iconify icon="eva:close-fill" />
                          </IconButton>
                        </Stack>
                      </Paper>
                    )}

                    {/* CURRENT PDF */}

                    {editingResource?.file_url &&
                      !formData.file && (
                        <Button
                          component="a"
                          href={getFileUrl(
                            editingResource.file_url
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="text"
                          sx={{
                            alignSelf: 'flex-start',
                          }}
                          startIcon={
                            <Iconify icon="solar:eye-linear" />
                          }
                        >
                          View Current PDF
                        </Button>
                      )}
                  </Stack>
                )}

              {/* RICH TEXT */}

              {formData.resource_type ===
                'TEXT' && (
                  <RichTextEditor
                    value={formData.content}
                    disabled={saving}
                    onChange={(content) =>
                      setFormData((prev) => ({
                        ...prev,
                        content,
                      }))
                    }
                  />
                )}

              {/* DISPLAY ORDER */}

              <TextField
                fullWidth
                type="number"
                label="Display Order"
                name="display_order"
                value={formData.display_order}
                onChange={handleChange}
                disabled={saving}
                inputProps={{ min: 0 }}
                helperText="Lower numbers appear first."
              />

              {/* ACTIVE STATUS */}

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    disabled={saving}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active:
                          event.target.checked,
                      }))
                    }
                  />
                }
                label="Active Resource"
              />

              {/* SAVE BUTTONS */}

              <Divider />

              <Stack
                direction="row"
                justifyContent="flex-end"
                spacing={1.5}
              >
                <Button
                  variant="outlined"
                  disabled={saving}
                  onClick={handleCancelForm}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  disabled={saving}
                  onClick={handleSubmit}
                  startIcon={
                    saving ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    ) : (
                      <Iconify icon="eva:save-fill" />
                    )
                  }
                >
                  {submitButtonText}
                </Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      {/* FOOTER */}

      {!showForm && (
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={
              loading ||
              deletingId !== null ||
              statusUpdatingId !== null
            }
          >
            Close
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

CategoryResources.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  category: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    name: PropTypes.string,
    slug: PropTypes.string,
  }),
};  