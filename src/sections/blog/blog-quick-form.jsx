import PropTypes from 'prop-types';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor, EditorContent } from '@tiptap/react';
import {
  useRef,
  useState,
  useEffect,
} from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { uploadBlogImage } from 'src/services/blogs.service';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const INITIAL_FORM = {
  title: '',
  description: '',
  content: '',
  tags: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  published: true,
};

// ----------------------------------------------------------------------

export default function BlogQuickForm({
  open,
  currentPost,
  externalSubmitting,
  onClose,
  onSubmit,
}) {
  const coverInputRef = useRef(null);

  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [coverFile, setCoverFile] =
    useState(null);

  const [coverPreview, setCoverPreview] =
    useState('');

  const [coverMedia, setCoverMedia] =
    useState(null);

  const [contentMedia, setContentMedia] =
    useState([]);

  const [dragActive, setDragActive] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [coverUploading, setCoverUploading] =
    useState(false);

  const [errors, setErrors] =
    useState({});

  const [submitError, setSubmitError] =
    useState('');

  const isEdit = Boolean(currentPost);

  const isSubmitting =
    submitting ||
    externalSubmitting;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (currentPost) {
      const postTags = Array.isArray(
        currentPost.tags
      )
        ? currentPost.tags.join(', ')
        : currentPost.tags || '';

      setFormData({
        title:
          currentPost.title || '',

        description:
          currentPost.description || '',

        content:
          currentPost.content || '',

        tags:
          postTags,

        metaTitle:
          currentPost.metaTitle || '',

        metaDescription:
          currentPost.metaDescription || '',

        metaKeywords:
          currentPost.metaKeywords || '',

        published:
          currentPost.status
            ? currentPost.status ===
              'PUBLISHED'
            : Boolean(
                currentPost.published
              ),
      });

      setCoverPreview(
        currentPost.cover || ''
      );

      setCoverMedia(
        currentPost.coverMedia ||
          null
      );

      setContentMedia(
        Array.isArray(
          currentPost.contentMedia
        )
          ? currentPost.contentMedia
          : []
      );
    } else {
      setFormData(INITIAL_FORM);
      setCoverPreview('');
      setCoverMedia(null);
      setContentMedia([]);
    }

    setCoverFile(null);
    setDragActive(false);
    setSubmitting(false);
    setCoverUploading(false);
    setErrors({});
    setSubmitError('');

    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  }, [open, currentPost]);

  useEffect(
    () => () => {
      if (
        coverPreview.startsWith(
          'blob:'
        )
      ) {
        URL.revokeObjectURL(
          coverPreview
        );
      }
    },
    [coverPreview]
  );

  const handleFieldChange = (
    event
  ) => {
    const {
      name,
      type,
      value,
      checked,
    } = event.target;

    const updatedValue =
      type === 'checkbox'
        ? checked
        : value;

    setFormData((previous) => ({
      ...previous,
      [name]: updatedValue,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: '',
      }));
    }
  };

  const handleContentChange = (
    html
  ) => {
    setFormData((previous) => ({
      ...previous,
      content: html,
    }));

    if (errors.content) {
      setErrors((previous) => ({
        ...previous,
        content: '',
      }));
    }
  };

  const handleCoverFile = (
    file
  ) => {
    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        'image/'
      )
    ) {
      setErrors((previous) => ({
        ...previous,
        cover:
          'Please select a valid image file.',
      }));

      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setErrors((previous) => ({
        ...previous,
        cover:
          'Cover image must be smaller than 10 MB.',
      }));

      return;
    }

    if (
      coverPreview.startsWith(
        'blob:'
      )
    ) {
      URL.revokeObjectURL(
        coverPreview
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    setCoverFile(file);
    setCoverPreview(previewUrl);
    setCoverMedia(null);

    setErrors((previous) => ({
      ...previous,
      cover: '',
    }));
  };

  const handleCoverInputChange = (
    event
  ) => {
    const [file] =
      event.target.files || [];

    handleCoverFile(file);

    event.target.value = '';
  };

  const handleCoverDrop = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const [file] =
      event.dataTransfer.files ||
      [];

    handleCoverFile(file);
  };

  const handleRemoveCover = () => {
    if (
      coverPreview.startsWith(
        'blob:'
      )
    ) {
      URL.revokeObjectURL(
        coverPreview
      );
    }

    setCoverFile(null);
    setCoverPreview('');
    setCoverMedia(null);

    if (coverInputRef.current) {
      coverInputRef.current.value =
        '';
    }
  };

  const handleContentImageUpload =
    async (file) => {
      validateImageFile(
        file,
        'Content image'
      );

      const uploadedMedia =
        await uploadBlogImage({
          file,
          mediaType: 'CONTENT',
          folder: 'content',
          altText: file.name,
          sortOrder:
            contentMedia.length,
        });

      setContentMedia(
        (previous) => [
          ...previous,
          uploadedMedia,
        ]
      );

      return uploadedMedia.url;
    };

  const uploadCoverIfRequired =
    async () => {
      if (!coverFile) {
        return coverMedia;
      }

      try {
        setCoverUploading(true);

        const uploadedCover =
          await uploadBlogImage({
            file: coverFile,
            mediaType: 'COVER',
            folder: 'covers',
            altText:
              formData.title ||
              coverFile.name,
            sortOrder: 0,
          });

        setCoverMedia(
          uploadedCover
        );

        setCoverPreview(
          uploadedCover.url
        );

        setCoverFile(null);

        return uploadedCover;
      } finally {
        setCoverUploading(false);
      }
    };

  const validateForm = () => {
    const newErrors = {};

    const contentText =
      getPlainTextFromHtml(
        formData.content
      );

    const containsImage =
      formData.content.includes(
        '<img'
      );

    if (!formData.title.trim()) {
      newErrors.title =
        'Post title is required.';
    }

    if (
      !formData.description.trim()
    ) {
      newErrors.description =
        'Description is required.';
    }

    if (
      !contentText &&
      !containsImage
    ) {
      newErrors.content =
        'Post content is required.';
    }

    if (!coverPreview) {
      newErrors.cover =
        'Cover image is required.';
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError('');

      const uploadedCover =
        await uploadCoverIfRequired();

      if (!uploadedCover) {
        setErrors((previous) => ({
          ...previous,
          cover:
            'Cover image is required.',
        }));

        return;
      }

      const tags = formData.tags
        .split(',')
        .map((tag) =>
          tag.trim()
        )
        .filter(Boolean);

      const activeContentMedia =
        contentMedia.filter(
          (media) => {
            const mediaUrl =
              media.url ||
              media.secure_url;

            if (!mediaUrl) {
              return false;
            }

            return formData.content.includes(
              mediaUrl
            );
          }
        );

      const payload = {
        title:
          formData.title.trim(),

        description:
          formData.description.trim(),

        content:
          formData.content,

        tags,

        metaTitle:
          formData.metaTitle.trim(),

        metaDescription:
          formData.metaDescription.trim(),

        metaKeywords:
          formData.metaKeywords.trim(),

        published:
          formData.published,

        status:
          formData.published
            ? 'PUBLISHED'
            : 'DRAFT',

        coverMedia:
          uploadedCover,

        contentMedia:
          activeContentMedia,
      };

      await onSubmit(payload);
    } catch (error) {
      console.error(
        'Failed to submit blog post:',
        error
      );

      setSubmitError(
        error.message ||
          'Failed to save blog post'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  let coverBorderColor =
    'divider';

  if (dragActive) {
    coverBorderColor =
      'primary.main';
  }

  if (errors.cover) {
    coverBorderColor =
      'error.main';
  }

  let submitButtonLabel =
    'Create post';

  if (isEdit) {
    submitButtonLabel =
      'Save changes';
  }

  if (isSubmitting) {
    submitButtonLabel =
      'Saving...';
  }

  let submitButtonIcon =
    'eva:plus-fill';

  if (isEdit) {
    submitButtonIcon =
      'solar:diskette-bold';
  }

  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          maxHeight: '94vh',
        },
      }}
    >
      <DialogTitle sx={{ pr: 8 }}>
        <Typography variant="h5">
          {isEdit
            ? 'Edit post'
            : 'Create new post'}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {isEdit
            ? 'Update the content and properties of this blog post.'
            : 'Create content and configure your new blog post.'}
        </Typography>

        <IconButton
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{
            top: 16,
            right: 16,
            position: 'absolute',
          }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        {submitError && (
          <Alert
            severity="error"
            onClose={() =>
              setSubmitError('')
            }
            sx={{ mb: 3 }}
          >
            {submitError}
          </Alert>
        )}

        <Stack spacing={3}>
          <Accordion
            defaultExpanded
            disableGutters
            sx={{
              border: 1,
              borderColor:
                'divider',
              borderRadius: 2,
              boxShadow: 'none',

              '&:before': {
                display: 'none',
              },

              '&.Mui-expanded': {
                borderRadius: 2,
              },
            }}
          >
            <AccordionSummary
              expandIcon={
                <Iconify icon="eva:arrow-ios-downward-fill" />
              }
              sx={{
                px: 3,
                minHeight: 72,
              }}
            >
              <Box>
                <Typography variant="subtitle2">
                  Details
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Title, description,
                  content and cover
                  image
                </Typography>
              </Box>
            </AccordionSummary>

            <Divider />

            <AccordionDetails
              sx={{ p: 3 }}
            >
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  name="title"
                  label="Post title"
                  placeholder="Enter post title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleFieldChange
                  }
                  error={Boolean(
                    errors.title
                  )}
                  helperText={
                    errors.title
                  }
                />

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  name="description"
                  label="Description"
                  placeholder="Write a short description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleFieldChange
                  }
                  error={Boolean(
                    errors.description
                  )}
                  helperText={
                    errors.description
                  }
                />

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1 }}
                  >
                    Content
                  </Typography>

                  <BlogContentEditor
                    value={
                      formData.content
                    }
                    error={Boolean(
                      errors.content
                    )}
                    onChange={
                      handleContentChange
                    }
                    onImageUpload={
                      handleContentImageUpload
                    }
                  />

                  {errors.content && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{
                        mt: 0.75,
                        ml: 1.5,
                        display:
                          'block',
                      }}
                    >
                      {
                        errors.content
                      }
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1 }}
                  >
                    Cover
                  </Typography>

                  <Box
                    onClick={() => {
                      if (
                        !coverPreview
                      ) {
                        coverInputRef.current?.click();
                      }
                    }}
                    onDragEnter={(
                      event
                    ) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setDragActive(
                        true
                      );
                    }}
                    onDragLeave={(
                      event
                    ) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setDragActive(
                        false
                      );
                    }}
                    onDragOver={(
                      event
                    ) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onDrop={
                      handleCoverDrop
                    }
                    sx={{
                      minHeight: 280,
                      border: 1,
                      borderStyle:
                        'dashed',
                      borderColor:
                        coverBorderColor,
                      borderRadius: 1.5,
                      bgcolor: dragActive
                        ? 'primary.lighter'
                        : 'background.neutral',
                      cursor:
                        coverPreview
                          ? 'default'
                          : 'pointer',
                      overflow:
                        'hidden',
                      position:
                        'relative',
                    }}
                  >
                    <input
                      ref={
                        coverInputRef
                      }
                      hidden
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={
                        handleCoverInputChange
                      }
                    />

                    {coverPreview ? (
                      <>
                        <Box
                          component="img"
                          src={
                            coverPreview
                          }
                          alt="Blog cover preview"
                          sx={{
                            width: 1,
                            height: 280,
                            display:
                              'block',
                            objectFit:
                              'cover',
                          }}
                        />

                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            top: 12,
                            right: 12,
                            position:
                              'absolute',
                          }}
                        >
                          <Button
                            size="small"
                            variant="contained"
                            color="inherit"
                            startIcon={
                              <Iconify icon="solar:camera-add-bold" />
                            }
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              coverInputRef.current?.click();
                            }}
                          >
                            Change
                          </Button>

                          <IconButton
                            color="error"
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              handleRemoveCover();
                            }}
                            sx={{
                              bgcolor:
                                'background.paper',

                              '&:hover': {
                                bgcolor:
                                  'background.paper',
                              },
                            }}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Stack>

                        {coverUploading && (
                          <Stack
                            alignItems="center"
                            justifyContent="center"
                            spacing={1}
                            sx={{
                              inset: 0,
                              zIndex: 3,
                              position:
                                'absolute',
                              bgcolor: (
                                theme
                              ) =>
                                alpha(
                                  theme
                                    .palette
                                    .grey[
                                    900
                                  ],
                                  0.62
                                ),
                              color:
                                'common.white',
                            }}
                          >
                            <CircularProgress
                              size={32}
                              color="inherit"
                            />

                            <Typography variant="caption">
                              Uploading
                              cover...
                            </Typography>
                          </Stack>
                        )}
                      </>
                    ) : (
                      <Stack
                        spacing={1.5}
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                          minHeight:
                            280,
                          px: 3,
                          textAlign:
                            'center',
                        }}
                      >
                        <Iconify
                          icon="solar:gallery-add-bold-duotone"
                          width={64}
                          sx={{
                            color:
                              'primary.main',
                          }}
                        />

                        <Typography variant="subtitle2">
                          Drop or
                          select a file
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Drag a file
                          here, or
                          click to
                          browse your
                          device.
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.disabled"
                        >
                          JPG, PNG,
                          WEBP or AVIF.
                          Maximum size
                          10 MB.
                        </Typography>
                      </Stack>
                    )}
                  </Box>

                  {errors.cover && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{
                        mt: 0.75,
                        ml: 1.5,
                        display:
                          'block',
                      }}
                    >
                      {
                        errors.cover
                      }
                    </Typography>
                  )}
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion
            defaultExpanded
            disableGutters
            sx={{
              border: 1,
              borderColor:
                'divider',
              borderRadius: 2,
              boxShadow: 'none',

              '&:before': {
                display: 'none',
              },

              '&.Mui-expanded': {
                borderRadius: 2,
              },
            }}
          >
            <AccordionSummary
              expandIcon={
                <Iconify icon="eva:arrow-ios-downward-fill" />
              }
              sx={{
                px: 3,
                minHeight: 72,
              }}
            >
              <Box>
                <Typography variant="subtitle2">
                  Properties
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Tags and SEO
                  attributes
                </Typography>
              </Box>
            </AccordionSummary>

            <Divider />

            <AccordionDetails
              sx={{ p: 3 }}
            >
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  name="tags"
                  label="Tags"
                  placeholder="Marble, Granite, Design"
                  value={
                    formData.tags
                  }
                  onChange={
                    handleFieldChange
                  }
                  helperText="Separate multiple tags using commas."
                />

                <TextField
                  fullWidth
                  name="metaTitle"
                  label="Meta title"
                  placeholder="SEO title"
                  value={
                    formData.metaTitle
                  }
                  onChange={
                    handleFieldChange
                  }
                  inputProps={{
                    maxLength: 60,
                  }}
                  helperText={`${formData.metaTitle.length}/60 characters`}
                />

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  name="metaDescription"
                  label="Meta description"
                  placeholder="SEO description"
                  value={
                    formData.metaDescription
                  }
                  onChange={
                    handleFieldChange
                  }
                  inputProps={{
                    maxLength: 160,
                  }}
                  helperText={`${formData.metaDescription.length}/160 characters`}
                />

                <TextField
                  fullWidth
                  name="metaKeywords"
                  label="Meta keywords"
                  placeholder="stone, marble, granite, quartzite"
                  value={
                    formData.metaKeywords
                  }
                  onChange={
                    handleFieldChange
                  }
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Card
            variant="outlined"
            sx={{ p: 2 }}
          >
            <FormControlLabel
              control={
                <Switch
                  name="published"
                  checked={
                    formData.published
                  }
                  onChange={
                    handleFieldChange
                  }
                />
              }
              label={
                formData.published
                  ? 'Publish'
                  : 'Save as draft'
              }
            />
          </Card>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: 3,
          py: 2,
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="inherit"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            coverUploading
          }
          startIcon={
            isSubmitting ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <Iconify
                icon={
                  submitButtonIcon
                }
              />
            )
          }
        >
          {submitButtonLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

function BlogContentEditor({
  value,
  error,
  onChange,
  onImageUpload,
}) {
  const imageInputRef =
    useRef(null);

  const fullscreenContainerRef =
    useRef(null);

  const [
    blockMenuAnchor,
    setBlockMenuAnchor,
  ] = useState(null);

  const [
    imageUploading,
    setImageUploading,
  ] = useState(false);

  const [
    imageError,
    setImageError,
  ] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),

      Underline,

      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol:
          'https',

        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),

      Image.configure({
        allowBase64: false,

        HTMLAttributes: {
          class:
            'blog-editor-image',
        },
      }),

      TextAlign.configure({
        types: [
          'heading',
          'paragraph',
        ],
      }),

      Placeholder.configure({
        placeholder:
          'Write something awesome...',
      }),
    ],

    content: value || '',

    onUpdate: ({
      editor: updatedEditor,
    }) => {
      onChange(
        updatedEditor.getHTML()
      );
    },

    editorProps: {
      attributes: {
        class:
          'blog-rich-text-editor',
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const incomingContent =
      value || '';

    const currentContent =
      editor.getHTML();

    if (
      incomingContent !==
      currentContent
    ) {
      editor.commands.setContent(
        incomingContent,
        {
          emitUpdate: false,
        }
      );
    }
  }, [editor, value]);

  const handleBlockMenuOpen = (
    event
  ) => {
    setBlockMenuAnchor(
      event.currentTarget
    );
  };

  const handleBlockMenuClose =
    () => {
      setBlockMenuAnchor(null);
    };

  const handleSetParagraph =
    () => {
      editor
        .chain()
        .focus()
        .setParagraph()
        .run();

      handleBlockMenuClose();
    };

  const handleSetHeading = (
    level
  ) => {
    editor
      .chain()
      .focus()
      .setHeading({ level })
      .run();

    handleBlockMenuClose();
  };

  const getCurrentBlockLabel =
    () => {
      if (!editor) {
        return 'Paragraph';
      }

      for (
        let level = 1;
        level <= 6;
        level += 1
      ) {
        if (
          editor.isActive(
            'heading',
            { level }
          )
        ) {
          return `Heading ${level}`;
        }
      }

      return 'Paragraph';
    };

  const handleAddLink = () => {
    if (!editor) {
      return;
    }

    const currentHref =
      editor.getAttributes(
        'link'
      ).href || '';

    const enteredUrl =
      window.prompt(
        'Enter URL',
        currentHref
      );

    if (enteredUrl === null) {
      return;
    }

    const normalizedUrl =
      enteredUrl.trim();

    if (!normalizedUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: normalizedUrl,
      })
      .run();
  };

  const handleRemoveLink = () => {
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .run();
  };

  const handleImageInputChange =
    async (event) => {
      const [file] =
        event.target.files || [];

      event.target.value = '';

      if (!file || !editor) {
        return;
      }

      try {
        setImageUploading(true);
        setImageError('');

        const imageUrl =
          await onImageUpload(
            file
          );

        if (!imageUrl) {
          return;
        }

        editor
          .chain()
          .focus()
          .setImage({
            src: imageUrl,
            alt: file.name,
            title: file.name,
          })
          .run();
      } catch (uploadError) {
        console.error(
          'Failed to insert editor image:',
          uploadError
        );

        setImageError(
          uploadError.message ||
            'Failed to upload image'
        );
      } finally {
        setImageUploading(false);
      }
    };

  const handleFullscreen =
    async () => {
      const container =
        fullscreenContainerRef.current;

      if (!container) {
        return;
      }

      try {
        if (
          document.fullscreenElement
        ) {
          await document.exitFullscreen();
          return;
        }

        await container.requestFullscreen();
      } catch (fullscreenError) {
        console.error(
          'Fullscreen mode failed:',
          fullscreenError
        );
      }
    };

  if (!editor) {
    return null;
  }

  return (
    <Box>
      {imageError && (
        <Alert
          severity="error"
          onClose={() =>
            setImageError('')
          }
          sx={{ mb: 1 }}
        >
          {imageError}
        </Alert>
      )}

      <Box
        ref={
          fullscreenContainerRef
        }
        sx={{
          border: 1,
          borderColor: error
            ? 'error.main'
            : 'divider',
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor:
            'background.paper',

          '&:fullscreen': {
            width: '100vw',
            height: '100vh',
            overflow: 'auto',
            border: 0,
            borderRadius: 0,
            bgcolor:
              'background.paper',
          },
        }}
      >
        <Box
          sx={{
            minHeight: 52,
            px: 1,
            py: 0.75,
            gap: 0.25,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            borderBottom: 1,
            borderColor:
              'divider',
            bgcolor:
              'background.paper',
            position: 'sticky',
            top: 0,
            zIndex: 2,
          }}
        >
          <Button
            color="inherit"
            variant="outlined"
            size="small"
            onClick={
              handleBlockMenuOpen
            }
            endIcon={
              <Iconify
                icon="eva:chevron-down-fill"
                width={16}
              />
            }
            sx={{
              minWidth: 120,
              mr: 0.5,
              fontWeight: 400,
              justifyContent:
                'space-between',
            }}
          >
            {
              getCurrentBlockLabel()
            }
          </Button>

          <Menu
            anchorEl={
              blockMenuAnchor
            }
            open={Boolean(
              blockMenuAnchor
            )}
            onClose={
              handleBlockMenuClose
            }
          >
            <MenuItem
              selected={editor.isActive(
                'paragraph'
              )}
              onClick={
                handleSetParagraph
              }
            >
              Paragraph
            </MenuItem>

            {[1, 2, 3, 4, 5, 6].map(
              (level) => (
                <MenuItem
                  key={level}
                  selected={editor.isActive(
                    'heading',
                    { level }
                  )}
                  onClick={() =>
                    handleSetHeading(
                      level
                    )
                  }
                >
                  Heading {level}
                </MenuItem>
              )
            )}
          </Menu>

          <ToolbarDivider />

          <EditorToolbarButton
            title="Bold"
            icon="mingcute:bold-line"
            active={editor.isActive(
              'bold'
            )}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBold()
                .run()
            }
          />

          <EditorToolbarButton
            title="Italic"
            icon="mingcute:italic-line"
            active={editor.isActive(
              'italic'
            )}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }
          />

          <EditorToolbarButton
            title="Underline"
            icon="mingcute:underline-line"
            active={editor.isActive(
              'underline'
            )}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleUnderline()
                .run()
            }
          />

          <EditorToolbarButton
            title="Strikethrough"
            icon="mingcute:strikethrough-line"
            active={editor.isActive(
              'strike'
            )}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleStrike()
                .run()
            }
          />

          <ToolbarDivider />

          <EditorToolbarButton
            title="Bulleted list"
            icon="solar:list-bold"
            active={editor.isActive(
              'bulletList'
            )}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBulletList()
                .run()
            }
          />

          <EditorToolbarButton
            title="Numbered list"
            icon="solar:list-down-bold"
            active={editor.isActive(
              'orderedList'
            )}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleOrderedList()
                .run()
            }
          />

          <ToolbarDivider />

          <EditorToolbarButton
            title="Align left"
            icon="solar:align-left-bold"
            active={editor.isActive({
              textAlign: 'left',
            })}
            onClick={() =>
              editor
                .chain()
                .focus()
                .setTextAlign(
                  'left'
                )
                .run()
            }
          />

          <EditorToolbarButton
            title="Align center"
            icon="solar:align-horizontal-center-bold"
            active={editor.isActive({
              textAlign: 'center',
            })}
            onClick={() =>
              editor
                .chain()
                .focus()
                .setTextAlign(
                  'center'
                )
                .run()
            }
          />

          <EditorToolbarButton
            title="Align right"
            icon="solar:align-right-bold"
            active={editor.isActive({
              textAlign: 'right',
            })}
            onClick={() =>
              editor
                .chain()
                .focus()
                .setTextAlign(
                  'right'
                )
                .run()
            }
          />

          <EditorToolbarButton
            title="Justify"
            icon="solar:align-vertically-bold"
            active={editor.isActive({
              textAlign: 'justify',
            })}
            onClick={() =>
              editor
                .chain()
                .focus()
                .setTextAlign(
                  'justify'
                )
                .run()
            }
          />

          <ToolbarDivider />

          <EditorToolbarButton
            title="Add link"
            icon="solar:link-bold"
            active={editor.isActive(
              'link'
            )}
            onClick={
              handleAddLink
            }
          />

          <EditorToolbarButton
            title="Remove link"
            icon="solar:link-broken-minimalistic-bold"
            disabled={
              !editor.isActive(
                'link'
              )
            }
            onClick={
              handleRemoveLink
            }
          />

          <EditorToolbarButton
            title="Insert image"
            icon="solar:gallery-add-bold"
            disabled={
              imageUploading
            }
            onClick={() =>
              imageInputRef.current?.click()
            }
          />

          <input
            ref={imageInputRef}
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={
              handleImageInputChange
            }
          />

          <ToolbarDivider />

          <EditorToolbarButton
            title="Blockquote"
            icon="mingcute:quote-left-fill"
            active={editor.isActive(
              'blockquote'
            )}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBlockquote()
                .run()
            }
          />

          <EditorToolbarButton
            title="Horizontal line"
            icon="solar:minus-square-bold"
            onClick={() =>
              editor
                .chain()
                .focus()
                .setHorizontalRule()
                .run()
            }
          />

          <EditorToolbarButton
            title="Clear formatting"
            icon="solar:eraser-bold"
            onClick={() =>
              editor
                .chain()
                .focus()
                .clearNodes()
                .unsetAllMarks()
                .run()
            }
          />

          <ToolbarDivider />

          <EditorToolbarButton
            title="Undo"
            icon="solar:undo-left-round-bold"
            disabled={
              !editor
                .can()
                .chain()
                .focus()
                .undo()
                .run()
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .undo()
                .run()
            }
          />

          <EditorToolbarButton
            title="Redo"
            icon="solar:undo-right-round-bold"
            disabled={
              !editor
                .can()
                .chain()
                .focus()
                .redo()
                .run()
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .redo()
                .run()
            }
          />

          <EditorToolbarButton
            title="Fullscreen"
            icon="solar:maximize-square-3-bold"
            onClick={
              handleFullscreen
            }
          />
        </Box>

        <Box
          sx={{
            position: 'relative',
            bgcolor:
              'background.neutral',

            '& .blog-rich-text-editor':
              {
                minHeight: 280,
                px: 2,
                py: 2,
                outline: 'none',
                color:
                  'text.primary',
                typography:
                  'body1',
              },

            '& .blog-rich-text-editor p':
              {
                mt: 0,
                mb: 1.5,
              },

            '& .blog-rich-text-editor h1':
              {
                typography: 'h2',
                mt: 3,
                mb: 1.5,
              },

            '& .blog-rich-text-editor h2':
              {
                typography: 'h3',
                mt: 3,
                mb: 1.5,
              },

            '& .blog-rich-text-editor h3':
              {
                typography: 'h4',
                mt: 2.5,
                mb: 1.25,
              },

            '& .blog-rich-text-editor h4':
              {
                typography: 'h5',
                mt: 2,
                mb: 1,
              },

            '& .blog-rich-text-editor h5':
              {
                typography: 'h6',
                mt: 2,
                mb: 1,
              },

            '& .blog-rich-text-editor h6':
              {
                typography:
                  'subtitle1',
                mt: 2,
                mb: 1,
              },

            '& .blog-rich-text-editor ul, & .blog-rich-text-editor ol':
              {
                pl: 4,
              },

            '& .blog-rich-text-editor li':
              {
                mb: 0.5,
              },

            '& .blog-rich-text-editor blockquote':
              {
                mx: 0,
                my: 2,
                pl: 2,
                borderLeft: 3,
                borderColor:
                  'primary.main',
                color:
                  'text.secondary',
              },

            '& .blog-rich-text-editor a':
              {
                color:
                  'primary.main',
                textDecoration:
                  'underline',
                cursor: 'pointer',
              },

            '& .blog-rich-text-editor hr':
              {
                my: 3,
                border: 0,
                borderTop: 1,
                borderColor:
                  'divider',
              },

            '& .blog-rich-text-editor img':
              {
                display: 'block',
                width: 'auto',
                maxWidth: '100%',
                maxHeight: 650,
                my: 2,
                mx: 'auto',
                borderRadius: 1.5,
                objectFit:
                  'contain',
              },

            '& .blog-rich-text-editor p.is-editor-empty:first-of-type::before':
              {
                content:
                  'attr(data-placeholder)',
                float: 'left',
                height: 0,
                pointerEvents:
                  'none',
                color:
                  'text.disabled',
              },
          }}
        >
          <EditorContent
            editor={editor}
          />

          {imageUploading && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                right: 16,
                bottom: 16,
                px: 1.5,
                py: 1,
                position:
                  'absolute',
                borderRadius: 1,
                bgcolor:
                  'background.paper',
                boxShadow: 4,
              }}
            >
              <CircularProgress
                size={16}
              />

              <Typography variant="caption">
                Uploading image
                to R2...
              </Typography>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

function EditorToolbarButton({
  title,
  icon,
  active,
  disabled,
  onClick,
}) {
  return (
    <Tooltip title={title}>
      <span>
        <IconButton
          size="small"
          disabled={disabled}
          onClick={onClick}
          sx={{
            borderRadius: 0.75,

            color: active
              ? 'primary.main'
              : 'text.primary',

            bgcolor: active
              ? (theme) =>
                  alpha(
                    theme.palette
                      .primary.main,
                    0.12
                  )
              : 'transparent',
          }}
        >
          <Iconify
            icon={icon}
            width={18}
          />
        </IconButton>
      </span>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

function ToolbarDivider() {
  return (
    <Divider
      flexItem
      orientation="vertical"
      sx={{
        height: 22,
        mx: 0.5,
        alignSelf: 'center',
      }}
    />
  );
}

// ----------------------------------------------------------------------

function validateImageFile(
  file,
  fieldName
) {
  if (!file) {
    throw new Error(
      `${fieldName} is required.`
    );
  }

  if (
    !file.type.startsWith(
      'image/'
    )
  ) {
    throw new Error(
      `${fieldName} must be a valid image.`
    );
  }

  if (
    file.size >
    MAX_IMAGE_SIZE
  ) {
    throw new Error(
      `${fieldName} must be smaller than 10 MB.`
    );
  }
}

// ----------------------------------------------------------------------

function getPlainTextFromHtml(
  html
) {
  if (!html) {
    return '';
  }

  const temporaryElement =
    document.createElement('div');

  temporaryElement.innerHTML =
    html;

  return (
    temporaryElement.textContent?.trim() ||
    ''
  );
}

// ----------------------------------------------------------------------

BlogQuickForm.propTypes = {
  open: PropTypes.bool,
  currentPost: PropTypes.object,
  externalSubmitting:
    PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};

BlogQuickForm.defaultProps = {
  open: false,
  currentPost: null,
  externalSubmitting: false,
  onClose: () => {},
  onSubmit: () => {},
};

BlogContentEditor.propTypes = {
  value: PropTypes.string,
  error: PropTypes.bool,
  onChange:
    PropTypes.func.isRequired,
  onImageUpload:
    PropTypes.func.isRequired,
};

BlogContentEditor.defaultProps = {
  value: '',
  error: false,
};

EditorToolbarButton.propTypes = {
  title:
    PropTypes.string.isRequired,
  icon:
    PropTypes.string.isRequired,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick:
    PropTypes.func.isRequired,
};

EditorToolbarButton.defaultProps = {
  active: false,
  disabled: false,
};