
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import {
  Box,
  Alert,
  Stack,
  Button,
  Dialog,
  Switch,
  Divider,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import {
  updateCategorySeo,
  deleteCategorySeo,
  getCategorySeoById,
} from 'src/services/category.service';

import Iconify from 'src/components/iconify';

// ============================================================
// INITIAL FORM
// ============================================================

const INITIAL_FORM = {
  seo_title: '',
  meta_description: '',
  meta_keywords: '',
  canonical_url: '',
  og_title: '',
  og_description: '',
  og_image: '',
  robots_index: true,
  robots_follow: true,
  schema_markup: '',
  seo_content: '',
};

// ============================================================
// RESPONSE HELPERS
// ============================================================

const unwrapSeo = (response) => {
  const data = response?.data ?? response;

  return data?.seo ?? data?.category?.seo ?? data ?? {};
};

const formatSchemaMarkup = (schema) => {
  if (
    schema === null ||
    schema === undefined ||
    schema === ''
  ) {
    return '';
  }

  if (typeof schema === 'string') {
    return schema;
  }

  return JSON.stringify(schema, null, 2);
};

const toForm = (seo = {}) => ({
  ...INITIAL_FORM,

  seo_title: seo.seo_title ?? '',
  meta_description: seo.meta_description ?? '',
  meta_keywords: seo.meta_keywords ?? '',
  canonical_url: seo.canonical_url ?? '',
  og_title: seo.og_title ?? '',
  og_description: seo.og_description ?? '',
  og_image: seo.og_image ?? '',

  robots_index: seo.robots_index ?? true,
  robots_follow: seo.robots_follow ?? true,

  schema_markup: formatSchemaMarkup(
    seo.schema_markup
  ),

  seo_content: seo.seo_content ?? '',
});

// ============================================================
// VALIDATION HELPERS
// ============================================================

const isValidHttpUrl = (value) => {
  if (!value || !value.trim()) {
    return true;
  }

  try {
    const url = new URL(value.trim());

    return ['http:', 'https:'].includes(
      url.protocol
    );
  } catch {
    return false;
  }
};

const parseSchemaMarkup = (value) => {
  if (!value.trim()) {
    return null;
  }

  const parsed = JSON.parse(value);

  if (
    parsed === null ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed)
  ) {
    throw new Error(
      'Schema Markup must be a valid JSON object.'
    );
  }

  return parsed;
};

// ============================================================
// CATEGORY SEO COMPONENT
// ============================================================

export default function CategorySEO({
  open,
  onClose,
  category,
}) {
  // ============================================================
  // STATE
  // ============================================================

  const [form, setForm] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loadFailed, setLoadFailed] = useState(false);

  const busy = loading || saving || deleting;

  // ============================================================
  // LOAD CATEGORY SEO
  // ============================================================

  useEffect(() => {
    if (!open || !category?.id) {
      return undefined;
    }

    let cancelled = false;

    const loadSeo = async () => {
      setLoading(true);
      setLoadFailed(false);
      setError('');
      setSuccess('');
      setForm(INITIAL_FORM);

      try {
        const response = await getCategorySeoById(
          category.id
        );

        if (cancelled) {
          return;
        }

        const seoData = unwrapSeo(response);

        setForm(toForm(seoData));
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          'Error loading category SEO:',
          err
        );

        setLoadFailed(true);

        setError(
          err.message ||
            'Failed to load category SEO.'
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSeo();

    return () => {
      cancelled = true;
    };
  }, [open, category?.id]);

  // ============================================================
  // FORM HANDLERS
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess('');
  };

  const handleSwitch = (name) => (event) => {
    setForm((prev) => ({
      ...prev,
      [name]: event.target.checked,
    }));

    setSuccess('');
  };

  // ============================================================
  // SAVE CATEGORY SEO
  // ============================================================

  const handleSave = async () => {
    if (!category?.id || busy || loadFailed) {
      return;
    }

    setError('');
    setSuccess('');

    // ----------------------------------------------------------
    // VALIDATE SCHEMA MARKUP
    // ----------------------------------------------------------

    let schemaMarkup = null;

    try {
      schemaMarkup = parseSchemaMarkup(
        form.schema_markup
      );
    } catch (err) {
      setError(
        err.message ||
          'Schema Markup must be valid JSON.'
      );

      return;
    }

    // ----------------------------------------------------------
    // VALIDATE URL FIELDS
    // ----------------------------------------------------------

    const urlFields = [
      'canonical_url',
      'og_image',
    ];

    const invalidUrlField = urlFields.find(
      (field) => !isValidHttpUrl(form[field])
    );

    if (invalidUrlField) {
      setError(
        `${invalidUrlField.replace(
          /_/g,
          ' '
        )} must be a valid HTTP or HTTPS URL.`
      );

      return;
    }

    // ----------------------------------------------------------
    // PREPARE PAYLOAD
    // ----------------------------------------------------------

    const payload = {
      seo_title: form.seo_title.trim(),

      meta_description:
        form.meta_description.trim(),

      meta_keywords:
        form.meta_keywords.trim(),

      canonical_url:
        form.canonical_url.trim(),

      og_title:
        form.og_title.trim(),

      og_description:
        form.og_description.trim(),

      og_image:
        form.og_image.trim(),

      robots_index:
        form.robots_index,

      robots_follow:
        form.robots_follow,

      schema_markup:
        schemaMarkup,

      seo_content:
        form.seo_content,
    };

    // ----------------------------------------------------------
    // API REQUEST
    // ----------------------------------------------------------

    try {
      setSaving(true);

      const response = await updateCategorySeo(
        category.id,
        payload
      );

      if (response?.success === false) {
        throw new Error(
          response.message ||
            'Failed to save category SEO.'
        );
      }

      setSuccess(
        'Category SEO saved successfully.'
      );
    } catch (err) {
      console.error(
        'Error saving category SEO:',
        err
      );

      setError(
        err.message ||
          'Failed to save category SEO.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CLEAR CATEGORY SEO
  // ============================================================

  const handleDelete = async () => {
    if (!category?.id || busy || loadFailed) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to clear all SEO settings for "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      setDeleting(true);

      const response = await deleteCategorySeo(
        category.id
      );

      if (response?.success === false) {
        throw new Error(
          response.message ||
            'Failed to clear category SEO.'
        );
      }

      setForm({ ...INITIAL_FORM });

      setSuccess(
        'Category SEO cleared successfully.'
      );
    } catch (err) {
      console.error(
        'Error clearing category SEO:',
        err
      );

      setError(
        err.message ||
          'Failed to clear category SEO.'
      );
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // CLOSE DIALOG
  // ============================================================

  const handleClose = () => {
    if (busy) {
      return;
    }

    setError('');
    setSuccess('');

    onClose?.();
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      disableEscapeKeyDown={busy}
    >
      {/* ======================================================
          DIALOG HEADER
      ====================================================== */}

      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6">
              Manage Category SEO
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {category?.name || 'Category'}
            </Typography>
          </Box>

          <IconButton
            onClick={handleClose}
            disabled={busy}
          >
            <Iconify
              icon="mingcute:close-line"
              width={22}
            />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      {/* ======================================================
          DIALOG CONTENT
      ====================================================== */}

      <DialogContent sx={{ py: 3 }}>
        {loading ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{ py: 8 }}
          >
            <CircularProgress />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Loading category SEO...
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={3}>
            {/* ERROR MESSAGE */}

            {error && (
              <Alert
                severity="error"
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {/* SUCCESS MESSAGE */}

            {success && (
              <Alert
                severity="success"
                onClose={() => setSuccess('')}
              >
                {success}
              </Alert>
            )}

            {/* API LOAD ERROR */}

            {loadFailed && (
              <Alert severity="warning">
                Existing SEO information could not be
                loaded. Saving is disabled to prevent
                accidentally overwriting stored SEO
                settings. Check the Category SEO API
                endpoint and reopen this dialog.
              </Alert>
            )}

            {/* ==================================================
                SEARCH ENGINE METADATA
            ================================================== */}

            <Typography variant="subtitle1">
              Search Engine Metadata
            </Typography>

            <TextField
              fullWidth
              label="SEO Title"
              name="seo_title"
              value={form.seo_title}
              onChange={handleChange}
              disabled={busy || loadFailed}
              helperText={`${form.seo_title.length} characters`}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Meta Description"
              name="meta_description"
              value={form.meta_description}
              onChange={handleChange}
              disabled={busy || loadFailed}
              helperText={`${form.meta_description.length} characters`}
            />

            <TextField
              fullWidth
              label="Meta Keywords"
              name="meta_keywords"
              value={form.meta_keywords}
              onChange={handleChange}
              disabled={busy || loadFailed}
              helperText="Optional, comma-separated keywords."
            />

            <TextField
              fullWidth
              label="Canonical URL"
              name="canonical_url"
              value={form.canonical_url}
              onChange={handleChange}
              disabled={busy || loadFailed}
              placeholder={`https://www.ultrastones.com/product-category/${category?.slug || 'quartz'}`}
              helperText="Leave empty to use the default category URL."
            />

            <Divider />

            {/* ==================================================
                OPEN GRAPH
            ================================================== */}

            <Typography variant="subtitle1">
              Open Graph / Social Sharing
            </Typography>

            <TextField
              fullWidth
              label="OG Title"
              name="og_title"
              value={form.og_title}
              onChange={handleChange}
              disabled={busy || loadFailed}
            />

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="OG Description"
              name="og_description"
              value={form.og_description}
              onChange={handleChange}
              disabled={busy || loadFailed}
            />

            <TextField
              fullWidth
              label="OG Image URL"
              name="og_image"
              value={form.og_image}
              onChange={handleChange}
              disabled={busy || loadFailed}
              placeholder="https://..."
            />

            {form.og_image &&
              isValidHttpUrl(form.og_image) && (
                <Box
                  component="img"
                  src={form.og_image}
                  alt="Open Graph preview"
                  sx={{
                    width: '100%',
                    maxHeight: 220,
                    objectFit: 'contain',
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                  }}
                />
              )}

            <Divider />

            {/* ==================================================
                SEARCH ENGINE INDEXING
            ================================================== */}

            <Typography variant="subtitle1">
              Search Engine Indexing
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={form.robots_index}
                  onChange={handleSwitch(
                    'robots_index'
                  )}
                  disabled={busy || loadFailed}
                />
              }
              label="Allow search engines to index this category"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.robots_follow}
                  onChange={handleSwitch(
                    'robots_follow'
                  )}
                  disabled={busy || loadFailed}
                />
              }
              label="Allow search engines to follow links"
            />

            <Divider />

            {/* ==================================================
                SCHEMA MARKUP
            ================================================== */}

            <Typography variant="subtitle1">
              Structured Data
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={7}
              label="Schema Markup (JSON-LD)"
              name="schema_markup"
              value={form.schema_markup}
              onChange={handleChange}
              disabled={busy || loadFailed}
              placeholder='{"@context":"https://schema.org","@type":"CollectionPage"}'
              helperText="Enter a valid JSON object without script tags."
              InputProps={{
                sx: {
                  fontFamily: 'monospace',
                  fontSize: 13,
                },
              }}
            />

            <Divider />

            {/* ==================================================
                SEO CONTENT
            ================================================== */}

            <Typography variant="subtitle1">
              SEO Page Content
            </Typography>

            <TextField
              fullWidth
              multiline
              minRows={6}
              label="SEO Content"
              name="seo_content"
              value={form.seo_content}
              onChange={handleChange}
              disabled={busy || loadFailed}
              helperText="Additional SEO content for the category page."
            />
          </Stack>
        )}
      </DialogContent>

      {/* ======================================================
          DIALOG FOOTER
      ====================================================== */}

      <Divider />

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          color="error"
          onClick={handleDelete}
          disabled={busy || loadFailed}
        >
          {deleting ? 'Clearing...' : 'Clear SEO'}
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={busy}
        >
          Close
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={busy || loadFailed}
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
          {saving ? 'Saving...' : 'Save SEO'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================
// PROP TYPES
// ============================================================

CategorySEO.propTypes = {
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
