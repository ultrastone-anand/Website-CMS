import PropTypes from 'prop-types';
import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

export default function MediaUploadField({
    rowId,
    fieldKey,
    index,
    mediaFields,
    onFilesSelected,
    onAddRow,
    onRemoveRow,
    onChangeType,
    canRemoveRow,
}) {
    const inputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [isSent, setIsSent] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [openPreview, setOpenPreview] = useState(false);

    const selectedMedia = mediaFields.find((item) => item.field === fieldKey);
    const isVideo = file?.type?.startsWith('video');

    const sendIfReady = (selectedFile, selectedField) => {
        if (!selectedFile || !selectedField || isSent) return;

        onFilesSelected(selectedField, [selectedFile]);
        setIsSent(true);
    };
    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) return;

        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setIsSent(false);

        if (fieldKey) {
            onFilesSelected(fieldKey, [selectedFile]);
            setIsSent(true);
        }

        e.target.value = '';
    };

    const handleCategoryChange = (e) => {
        const newField = e.target.value;

        onChangeType(rowId, newField);
        sendIfReady(file, newField);
    };

    let detectedFormat = '-';

    if (file && isVideo) {
        detectedFormat = 'Video';
    }

    if (file && !isVideo) {
        detectedFormat = 'Image';
    }

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
                <Typography variant="caption" fontWeight={700}>
                    Media File
                </Typography>
            </Grid>

            <Grid item md={2}>
                <Typography variant="caption" fontWeight={700}>
                    Detected Format
                </Typography>
            </Grid>

            <Grid item md={5}>
                <Typography variant="caption" fontWeight={700}>
                    Media Category
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
            <Grid container spacing={1.5} alignItems="center" sx={{ mb: 1.2 }}>


                <Grid item xs={12} md={3}>
                    <Box
                        sx={{
                            height: 46,
                            px: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1.25,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={() => inputRef.current?.click()}
                            sx={{
                                minWidth: 82,
                                height: 32,
                                fontWeight: 700,
                                px: 1.5,
                            }}
                        >
                            Browse
                        </Button>

                        <Typography
                            variant="body2"
                            noWrap
                            onClick={() => file && setOpenPreview(true)}
                            sx={{
                                color: file ? 'primary.main' : 'text.secondary',
                                cursor: file ? 'pointer' : 'default',
                                textDecoration: file ? 'underline' : 'none',
                                maxWidth: 90,
                            }}
                        >
                            {file ? file.name : 'No file'}
                        </Typography>

                        <input
                            ref={inputRef}
                            hidden
                            type="file"
                            accept={selectedMedia?.accept || 'image/*,video/*'}
                            onChange={handleFileChange}
                        />
                    </Box>
                </Grid>

                <Grid item xs={12} md={2}>
                    <Box
                        sx={{
                            height: 46,
                            px: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1.25,
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: 700,
                            bgcolor: 'background.neutral',
                        }}
                    >
                        Auto: {detectedFormat}
                    </Box>
                </Grid>

                <Grid item xs={12} md={5}>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        value={fieldKey}
                        disabled={isSent}
                        onChange={handleCategoryChange}
                        displayEmpty
                        sx={{
                            '& .MuiInputBase-root': {
                                height: 46,
                            },
                        }}
                    >
                        <MenuItem value="">
                            Select Media Category
                        </MenuItem>

                        {mediaFields.map((item) => (
                            <MenuItem key={item.field} value={item.field}>
                                {item.icon} {item.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} md={2}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton
                            onClick={onAddRow}
                            sx={{
                                width: 46,
                                height: 46,
                                minWidth: 46,
                                borderRadius: 1.25,
                                bgcolor: 'primary.main',
                                color: '#fff',
                                '&:hover': { bgcolor: 'primary.dark' },
                            }}
                        >
                            +
                        </IconButton>

                        <IconButton
                            disabled={!canRemoveRow}
                            onClick={() => onRemoveRow(rowId)}
                            sx={{
                                width: 46,
                                height: 46,
                                minWidth: 46,
                                borderRadius: 1.25,
                                border: '1px solid',
                                borderColor: canRemoveRow ? 'warning.main' : 'divider',
                            }}
                        >
                            -
                        </IconButton>
                    </Box>
                </Grid>
            </Grid>

            <Dialog
                open={openPreview}
                onClose={() => setOpenPreview(false)}
                maxWidth="md"
                fullWidth
            >
                <Box sx={{ p: 2 }}>
                    {isVideo ? (
                        <Box
                            component="video"
                            src={previewUrl}
                            controls
                            sx={{
                                width: '100%',
                                maxHeight: 500,
                                display: 'block',
                            }}
                        />
                    ) : (
                        <Box
                            component="img"
                            src={previewUrl}
                            alt={file?.name}
                            sx={{
                                width: '100%',
                                maxHeight: 500,
                                objectFit: 'contain',
                                display: 'block',
                            }}
                        />
                    )}
                </Box>
            </Dialog>
        </>
    );
}

MediaUploadField.propTypes = {
    rowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fieldKey: PropTypes.string.isRequired,
    mediaFields: PropTypes.array.isRequired,
    onFilesSelected: PropTypes.func.isRequired,
    onAddRow: PropTypes.func.isRequired,
    onRemoveRow: PropTypes.func.isRequired,
    onChangeType: PropTypes.func.isRequired,
    canRemoveRow: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
};