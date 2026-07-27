import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import {
    Tooltip,
    TextField,
    IconButton,
} from '@mui/material';

import Iconify from 'src/components/iconify';

import SectionLabel from './SectionLabel';
import MediaUploadField from './MediaUploadField';

const MEDIA_FIELDS = [
    {
        label: 'Closeup Images',
        field: 'closeup_images',
        accept: 'image/*',
        icon: '🔍',
    },
    {
        label: 'Slab Images',
        field: 'slab_images',
        accept: 'image/*',
        icon: '🪨',
    },
    {
        label: 'Application Images (3D)',
        field: 'application_images',
        accept: 'image/*',
        icon: '🏢',
    },
    {
        label: 'Bookmatch/Slipmatch',
        field: 'bookmatch_slipmatch',
        accept: 'image/*',
        icon: '🪞',
    },
    {
        label: 'Featured Videos',
        field: 'featured_videos',
        accept: 'video/*',
        icon: '🎬',
    },
];

export default function MediaTab({
    formData,
    mediaPreviews,
    handleFilesSelected,
    handleRemovePreview,
    handleAltTextChange,
    canEditMedia,
    handleDeleteMedia,
}) {
    const [isDragging, setIsDragging] = useState(false);

    const [uploadRows, setUploadRows] = useState([
        {
            id: Date.now(),
            field: '',
            initialFile: null,
        },
    ]);

    const handleAddUploadRow = () => {
        setUploadRows((prev) => [
            ...prev,
            {
                id: Date.now() + Math.random(),
                field: '',
                initialFile: null,
            },
        ]);
    };

    const handleRemoveUploadRow = (id) => {
        setUploadRows((prev) =>
            prev.length === 1
                ? prev
                : prev.filter((row) => row.id !== id)
        );
    };

    const handleChangeUploadType = (id, field) => {
        setUploadRows((prev) =>
            prev.map((row) =>
                row.id === id
                    ? {
                          ...row,
                          field,
                      }
                    : row
            )
        );
    };

    const createRowsFromFiles = (files) => {
        const validFiles = Array.from(files).filter(
            (file) =>
                file.type.startsWith('image/') ||
                file.type.startsWith('video/')
        );

        if (!validFiles.length) {
            return;
        }

        const droppedRows = validFiles.map((file, index) => ({
            id: `${Date.now()}-${index}-${Math.random()}`,
            field: '',
            initialFile: file,
        }));

        setUploadRows((prev) => {
            /*
             * Replace the original completely empty row when files
             * are dropped for the first time.
             */
            const hasOnlyEmptyInitialRow =
                prev.length === 1 &&
                !prev[0].field &&
                !prev[0].initialFile;

            if (hasOnlyEmptyInitialRow) {
                return droppedRows;
            }

            return [...prev, ...droppedRows];
        });
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(false);

        createRowsFromFiles(event.dataTransfer.files);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();

        event.dataTransfer.dropEffect = 'copy';

        setIsDragging(true);
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();

        /*
         * Prevent drag leave from firing when moving between
         * children inside the drop area.
         */
        if (event.currentTarget.contains(event.relatedTarget)) {
            return;
        }

        setIsDragging(false);
    };

    return (
        <Stack spacing={3}>
            {canEditMedia() && (
                <>
                    <SectionLabel>
                        Upload New Media
                    </SectionLabel>

                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            mt: -2,
                        }}
                    >
                        Drag multiple media files below or browse
                        files individually, then select a product
                        media category for each file.
                    </Typography>

                    <Box
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        sx={{
                            p: 2,
                            border: '2px dashed',
                            borderColor: isDragging
                                ? 'primary.main'
                                : 'divider',
                            borderRadius: 2,
                            bgcolor: isDragging
                                ? 'action.hover'
                                : 'background.paper',
                            transition:
                                'border-color 0.2s ease, background-color 0.2s ease',
                        }}
                    >
                        {/* Drag-and-drop area */}
                        <Box
                            sx={{
                                mb: 2,
                                py: 2.5,
                                px: 2,
                                borderRadius: 1.5,
                                bgcolor: isDragging
                                    ? 'primary.lighter'
                                    : 'background.neutral',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                gap: 1.5,
                                pointerEvents: 'none',
                            }}
                        >
                            <Iconify
                                icon="solar:upload-minimalistic-bold-duotone"
                                width={30}
                                sx={{
                                    color: isDragging
                                        ? 'primary.main'
                                        : 'text.secondary',
                                }}
                            />

                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: isDragging
                                            ? 'primary.main'
                                            : 'text.primary',
                                    }}
                                >
                                    {isDragging
                                        ? 'Drop media files here'
                                        : 'Drag and drop multiple files here'}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                    }}
                                >
                                    One upload row will be created
                                    for every image or video
                                </Typography>
                            </Box>
                        </Box>

                        {uploadRows.map((row, index) => (
                            <MediaUploadField
                                key={row.id}
                                index={index}
                                rowId={row.id}
                                fieldKey={row.field}
                                initialFile={row.initialFile}
                                mediaFields={MEDIA_FIELDS}
                                previews={
                                    mediaPreviews[row.field]
                                }
                                onFilesSelected={
                                    handleFilesSelected
                                }
                                onRemove={handleRemovePreview}
                                onAddRow={handleAddUploadRow}
                                onRemoveRow={
                                    handleRemoveUploadRow
                                }
                                onChangeType={
                                    handleChangeUploadType
                                }
                                canRemoveRow={
                                    uploadRows.length > 1
                                }
                            />
                        ))}
                    </Box>
                </>
            )}

            {!canEditMedia() && (
                <Alert severity="info">
                    You have view-only access to product media.
                </Alert>
            )}

            {formData.media?.length > 0 && (
                <>
                    <Divider />

                    <SectionLabel>
                        Existing Media ({formData.media.length})
                    </SectionLabel>

                    <Grid
                        container
                        spacing={2}
                        sx={{
                            width: '100%',
                            m: 0,
                        }}
                    >
                        {formData.media.map((item) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                key={item.id}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Tooltip title="Remove Media">
                                        <IconButton
                                            disabled={
                                                !canEditMedia()
                                            }
                                            onClick={() =>
                                                handleDeleteMedia(
                                                    item.id
                                                )
                                            }
                                            sx={{
                                                position:
                                                    'absolute',
                                                top: 8,
                                                right: 8,
                                                zIndex: 10,
                                                width: 32,
                                                height: 32,
                                                bgcolor:
                                                    'rgba(244,67,54,0.9)',
                                                color: '#fff',
                                                backdropFilter:
                                                    'blur(4px)',
                                                transition:
                                                    'all .2s ease',

                                                '&:hover': {
                                                    bgcolor:
                                                        'error.main',
                                                    transform:
                                                        'scale(1.08)',
                                                },
                                            }}
                                        >
                                            <Iconify
                                                icon="mdi:close"
                                                width={18}
                                            />
                                        </IconButton>
                                    </Tooltip>

                                    {[
                                        'SLAB_IMAGE',
                                        'CLOSEUP_IMAGE',
                                        'APPLICATION_IMAGE',
                                        'BOOKMATCH_SLIPMATCH',
                                    ].includes(
                                        item.media_type
                                    ) ? (
                                        <Box
                                            component="img"
                                            src={item.media_url}
                                            alt=""
                                            sx={{
                                                width: '100%',
                                                height: 160,
                                                objectFit: 'cover',
                                                display: 'block',
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            component="video"
                                            controls
                                            sx={{
                                                width: '100%',
                                                display: 'block',
                                            }}
                                        >
                                            <source
                                                src={
                                                    item.media_url
                                                }
                                                type="video/mp4"
                                            />

                                            <track
                                                kind="captions"
                                                src=""
                                                label="English"
                                                default
                                            />
                                        </Box>
                                    )}

                                    <Box sx={{ p: 1 }}>
                                        <Chip
                                            size="small"
                                            label={
                                                item.media_type
                                            }
                                            sx={{
                                                fontSize: 10,
                                                height: 18,
                                            }}
                                        />

                                        <TextField
                                            sx={{ mt: 2 }}
                                            fullWidth
                                            size="small"
                                            label="Alt Text"
                                            value={
                                                item.alt_text || ''
                                            }
                                            disabled={
                                                !canEditMedia()
                                            }
                                            onChange={(event) =>
                                                handleAltTextChange(
                                                    item.id,
                                                    event.target
                                                        .value
                                                )
                                            }
                                        />
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            {!formData.media?.length &&
                mediaPreviews.closeup_images.length === 0 &&
                mediaPreviews.slab_images.length === 0 &&
                mediaPreviews.application_images.length === 0 &&
                mediaPreviews.bookmatch_slipmatch.length === 0 &&
                mediaPreviews.featured_videos.length === 0 && (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 6,
                            color: 'text.disabled',
                            bgcolor: 'action.hover',
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="body2">
                            No existing media attached
                        </Typography>
                    </Box>
                )}
        </Stack>
    );
}

MediaTab.propTypes = {
    formData: PropTypes.object.isRequired,

    mediaPreviews: PropTypes.shape({
        closeup_images: PropTypes.array.isRequired,
        slab_images: PropTypes.array.isRequired,
        application_images: PropTypes.array.isRequired,
        bookmatch_slipmatch: PropTypes.array.isRequired,
        featured_videos: PropTypes.array.isRequired,
    }).isRequired,

    handleFilesSelected: PropTypes.func.isRequired,
    handleRemovePreview: PropTypes.func.isRequired,
    handleAltTextChange: PropTypes.func.isRequired,
    handleDeleteMedia: PropTypes.func.isRequired,
    canEditMedia: PropTypes.func.isRequired,
};