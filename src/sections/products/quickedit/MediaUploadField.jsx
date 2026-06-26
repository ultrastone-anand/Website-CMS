import { useRef } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

export default function MediaUploadField({
    label,
    accept,
    icon,
    fieldKey,
    previews,
    onFilesSelected,
    onRemove,
}) {
    const inputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        if (!files.length) return;

        onFilesSelected(fieldKey, files);

        // Allow selecting the same file again
        e.target.value = '';
    };

    const isVideo = accept.startsWith('video');

    return (
        <Stack spacing={1.5}>
            {/* Upload Button */}
            <Button
                fullWidth
                variant="outlined"
                onClick={() => inputRef.current?.click()}
                sx={{
                    height: 80,
                    borderStyle: 'dashed',
                    borderRadius: 2,
                    flexDirection: 'column',
                    gap: 0.5,
                    color: 'text.secondary',
                    '&:hover': {
                        borderStyle: 'solid',
                    },
                }}
            >
                <span style={{ fontSize: 22 }}>{icon}</span>

                <Typography variant="caption">
                    {label}
                </Typography>

                <input
                    ref={inputRef}
                    hidden
                    multiple
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                />
            </Button>

            {/* Preview Grid */}
            {previews.length > 0 && (
                <Grid container spacing={1}>
                    {previews.map((item, idx) => {
                        const fileSize =
                            item.file?.size || item.size || 0;

                        const maxSize = isVideo
                            ? 100 * 1024 * 1024
                            : 10 * 1024 * 1024;

                        const exceedsLimit =
                            fileSize > maxSize;

                        return (
                            <Grid
                                item
                                xs={6}
                                sm={4}
                                key={idx}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        borderRadius: 1.5,
                                        overflow: 'hidden',
                                        border: '1px solid',
                                        borderColor: exceedsLimit
                                            ? 'error.main'
                                            : 'divider',
                                        bgcolor:
                                            'background.neutral',
                                        aspectRatio: '4/3',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {isVideo ? (
                                        <Box
                                            component="video"
                                            src={item.url}
                                            muted
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block',
                                            }}
                                            onMouseEnter={(e) =>
                                                e.currentTarget.play()
                                            }
                                            onMouseLeave={(e) => {
                                                e.currentTarget.pause();
                                                e.currentTarget.currentTime = 0;
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            component="img"
                                            src={item.url}
                                            alt={item.name}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block',
                                            }}
                                        />
                                    )}

                                    {/* Remove */}
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            onRemove(fieldKey, idx)
                                        }
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            bgcolor:
                                                'rgba(0,0,0,.55)',
                                            color: 'white',
                                            width: 22,
                                            height: 22,
                                            fontSize: 12,
                                            '&:hover': {
                                                bgcolor:
                                                    'error.main',
                                            },
                                        }}
                                    >
                                        ✕
                                    </IconButton>

                                    {/* Footer */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            px: .75,
                                            py: .4,
                                            bgcolor:
                                                'rgba(0,0,0,.5)',
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'white',
                                                fontSize: 9,
                                                display: 'block',
                                                whiteSpace:
                                                    'nowrap',
                                                overflow: 'hidden',
                                                textOverflow:
                                                    'ellipsis',
                                            }}
                                        >
                                            {item.name}
                                        </Typography>

                                        {item.file && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color:
                                                        'rgba(255,255,255,.8)',
                                                    fontSize: 8,
                                                    display: 'block',
                                                }}
                                            >
                                                {(item.file.size /
                                                    1024 /
                                                    1024).toFixed(
                                                    2
                                                )}{' '}
                                                MB /{' '}
                                                {isVideo
                                                    ? '100 MB'
                                                    : '10 MB'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Stack>
    );
}

MediaUploadField.propTypes = {
    label: PropTypes.string.isRequired,
    accept: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    fieldKey: PropTypes.string.isRequired,
    previews: PropTypes.arrayOf(
        PropTypes.shape({
            url: PropTypes.string,
            name: PropTypes.string,
        })
    ).isRequired,
    onFilesSelected: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
};