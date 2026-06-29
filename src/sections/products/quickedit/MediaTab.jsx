
import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import {Tooltip,MenuItem,TextField,IconButton} from '@mui/material';

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
    const [selectedMedia, setSelectedMedia] =
    useState('');
    
    return (
        <Stack spacing={3}>

            {canEditMedia() && (
                <>

                    <SectionLabel>
                        Upload New Files
                    </SectionLabel>

<Stack spacing={3}>

    <TextField
        select
        fullWidth
        label="Media Type"
        value={selectedMedia}
        onChange={(e) =>
            setSelectedMedia(
                e.target.value
            )
        }
        sx={{
            maxWidth: 350,
        }}
    >
        <MenuItem value="">
            Select Media Type
        </MenuItem>

        {MEDIA_FIELDS.map((item) => (
            <MenuItem
                key={item.field}
                value={item.field}
            >
                {item.icon} {item.label}
            </MenuItem>
        ))}
    </TextField>

    {selectedMedia && (
        <MediaUploadField
            label={
                MEDIA_FIELDS.find(
                    (m) =>
                        m.field ===
                        selectedMedia
                ).label
            }
            accept={
                MEDIA_FIELDS.find(
                    (m) =>
                        m.field ===
                        selectedMedia
                ).accept
            }
            icon={
                MEDIA_FIELDS.find(
                    (m) =>
                        m.field ===
                        selectedMedia
                ).icon
            }
            fieldKey={selectedMedia}
            previews={
                mediaPreviews[
                    selectedMedia
                ]
            }
            onFilesSelected={
                handleFilesSelected
            }
            onRemove={
                handleRemovePreview
            }
        />
    )}

</Stack>

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
        disabled={!canEditMedia()}
        onClick={() => handleDeleteMedia(item.id)}
        sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            width: 32,
            height: 32,
            bgcolor: 'rgba(244,67,54,0.9)',
            color: '#fff',
            backdropFilter: 'blur(4px)',
            transition: 'all .2s ease',

            '&:hover': {
                bgcolor: 'error.main',
                transform: 'scale(1.08)',
            },
        }}
    >
        <Iconify icon="mdi:close" width={18} />
    </IconButton>
</Tooltip>
                                    {[
                                        'SLAB_IMAGE',
                                        'CLOSEUP_IMAGE',
                                        'APPLICATION_IMAGE',
                                        'BOOKMATCH_SLIPMATCH',
                                    ].includes(item.media_type) ? (
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
                                                src={item.media_url}
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
                                            label={item.media_type}
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
                                                item.alt_text || ""
                                            }
                                            disabled={
                                                !canEditMedia()
                                            }
                                            onChange={(e) =>
                                                handleAltTextChange(
                                                    item.id,
                                                    e.target.value
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
                            textAlign: "center",
                            py: 6,
                            color: "text.disabled",
                            bgcolor: "action.hover",
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