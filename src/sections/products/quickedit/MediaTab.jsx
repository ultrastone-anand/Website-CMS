import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import {Tooltip,TextField,IconButton} from '@mui/material';

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

const [uploadRows, setUploadRows] = useState([
    { id: Date.now(), field: '' },
]);

const handleAddUploadRow = () => {
    setUploadRows((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), field: '' },
    ]);
};

const handleRemoveUploadRow = (id) => {
    setUploadRows((prev) =>
        prev.length === 1 ? prev : prev.filter((row) => row.id !== id)
    );
};

const handleChangeUploadType = (id, field) => {
    setUploadRows((prev) =>
        prev.map((row) =>
            row.id === id ? { ...row, field } : row
        )
    );
};
    return (
        <Stack spacing={3}>

            {canEditMedia() && (
                <>

<SectionLabel>
    Upload New Media
</SectionLabel>

<Typography variant="body2" sx={{ color: 'text.secondary', mt: -2 }}>
    Upload media file first, then select its product media category.
</Typography>

<Box
    sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
    }}
>

{uploadRows.map((row , index) => (
    <MediaUploadField
        key={row.id}
        index={index}
        rowId={row.id}
        fieldKey={row.field}
        mediaFields={MEDIA_FIELDS}
        previews={mediaPreviews[row.field]}
        onFilesSelected={handleFilesSelected}
        onRemove={handleRemovePreview}
        onAddRow={handleAddUploadRow}
        onRemoveRow={handleRemoveUploadRow}
        onChangeType={handleChangeUploadType}
        canRemoveRow={uploadRows.length > 1}
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