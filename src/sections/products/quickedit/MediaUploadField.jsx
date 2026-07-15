import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import {
    compressVideo,
    formatFileSize,
    shouldCompressVideo,
} from 'src/utils/compressVideo';

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

    const [toastOpen, setToastOpen] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [compressionMessage, setCompressionMessage] = useState('');
    const [compressionError, setCompressionError] = useState('');

    const selectedMedia = mediaFields.find(
        (item) => item.field === fieldKey
    );

    const isVideo = file?.type?.startsWith('video/');

    useEffect(
        () => () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        },
        [previewUrl]
    );

    const updatePreview = (selectedFile) => {
        setPreviewUrl((currentUrl) => {
            if (currentUrl) {
                URL.revokeObjectURL(currentUrl);
            }

            return URL.createObjectURL(selectedFile);
        });
    };

    const sendIfReady = (
        selectedFile,
        selectedField,
        alreadySent = isSent
    ) => {
        if (!selectedFile || !selectedField || alreadySent) {
            return;
        }

        onFilesSelected(selectedField, [selectedFile]);
        setIsSent(true);
    };

    const handleFileChange = async (event) => {
        const selectedFile = event.target.files?.[0];

        event.target.value = '';

        if (!selectedFile) {
            return;
        }

        setCompressionError('');
        setCompressionMessage('');
        setCompressionProgress(0);
        setIsSent(false);

        let finalFile = selectedFile;

        try {
            if (shouldCompressVideo(selectedFile)) {
                setIsCompressing(true);
                setToastOpen(true);

                setCompressionMessage(
                    `Preparing ${formatFileSize(
                        selectedFile.size
                    )} video for compression.`
                );

                finalFile = await compressVideo(
                    selectedFile,
                    setCompressionProgress
                );

                if (finalFile === selectedFile) {
                    setCompressionMessage(
                        `Compression did not reduce the video. Original file retained at ${formatFileSize(
                            selectedFile.size
                        )}.`
                    );
                } else {
                    setCompressionMessage(
                        `Compressed from ${formatFileSize(
                            selectedFile.size
                        )} to ${formatFileSize(finalFile.size)}.`
                    );
                }
            } else if (selectedFile.type.startsWith('video/')) {
                setCompressionMessage(
                    `Video ready at ${formatFileSize(
                        selectedFile.size
                    )}. Compression was not required.`
                );

                setToastOpen(true);
            }

            setFile(finalFile);
            updatePreview(finalFile);

            if (fieldKey) {
                onFilesSelected(fieldKey, [finalFile]);
                setIsSent(true);
            }
        } catch (error) {
            console.error('Video compression failed:', error);

            setFile(null);
            setPreviewUrl('');
            setIsSent(false);

            setCompressionError(
                error instanceof Error
                    ? error.message
                    : 'Video compression failed.'
            );

            setToastOpen(true);
        } finally {
            setIsCompressing(false);
        }
    };

    const handleCategoryChange = (event) => {
        const newField = event.target.value;

        onChangeType(rowId, newField);
        sendIfReady(file, newField);
    };

    const handleToastClose = (event, reason) => {
        if (reason === 'clickaway' || isCompressing) {
            return;
        }

        setToastOpen(false);
    };

    let detectedFormat = '-';

    if (file && isVideo) {
        detectedFormat = 'Video';
    }

    if (file && !isVideo) {
        detectedFormat = 'Image';
    }

    let displayedFileName = 'No file';

    if (file) {
        displayedFileName = file.name;
    }

    let toastTitle = 'Video ready';

    if (isCompressing) {
        toastTitle = `Compressing video: ${compressionProgress}%`;
    }

    if (compressionError) {
        toastTitle = 'Compression failed';
    }

    let toastSeverity = 'success';

    if (isCompressing) {
        toastSeverity = 'info';
    }

    if (compressionError) {
        toastSeverity = 'error';
    }

    const toastDescription =
        compressionError || compressionMessage;

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
                            Media File
                        </Typography>
                    </Grid>

                    <Grid item md={2}>
                        <Typography
                            variant="caption"
                            fontWeight={700}
                        >
                            Detected Format
                        </Typography>
                    </Grid>

                    <Grid item md={5}>
                        <Typography
                            variant="caption"
                            fontWeight={700}
                        >
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

            <Grid
                container
                spacing={1.5}
                alignItems="center"
                sx={{ mb: 1.2 }}
            >
                <Grid item xs={12} md={3}>
                    <Box
                        sx={{
                            height: 46,
                            px: 1,
                            border: '1px solid',
                            borderColor: isCompressing
                                ? 'primary.main'
                                : 'divider',
                            borderRadius: 1.25,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Button
                            variant="outlined"
                            disabled={isCompressing}
                            onClick={() =>
                                inputRef.current?.click()
                            }
                            startIcon={
                                isCompressing ? (
                                    <CircularProgress
                                        size={15}
                                        color="inherit"
                                    />
                                ) : null
                            }
                            sx={{
                                minWidth: 82,
                                height: 32,
                                fontWeight: 700,
                                px: 1.5,
                            }}
                        >
                            {isCompressing ? 'Working' : 'Browse'}
                        </Button>

                        <Typography
                            variant="body2"
                            noWrap
                            onClick={() => {
                                if (file && !isCompressing) {
                                    setOpenPreview(true);
                                }
                            }}
                            sx={{
                                color: file
                                    ? 'primary.main'
                                    : 'text.secondary',
                                cursor:
                                    file && !isCompressing
                                        ? 'pointer'
                                        : 'default',
                                textDecoration: file
                                    ? 'underline'
                                    : 'none',
                                maxWidth: 90,
                            }}
                        >
                            {displayedFileName}
                        </Typography>

                        <input
                            ref={inputRef}
                            hidden
                            type="file"
                            accept={
                                selectedMedia?.accept ||
                                'image/*,video/*'
                            }
                            disabled={isCompressing}
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
                        disabled={isSent || isCompressing}
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
                            <MenuItem
                                key={item.field}
                                value={item.field}
                            >
                                {item.icon} {item.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} md={2}>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: 'flex-end',
                        }}
                    >
                        <IconButton
                            disabled={isCompressing}
                            onClick={onAddRow}
                            sx={{
                                width: 46,
                                height: 46,
                                minWidth: 46,
                                borderRadius: 1.25,
                                bgcolor: 'primary.main',
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                },
                                '&.Mui-disabled': {
                                    bgcolor:
                                        'action.disabledBackground',
                                },
                            }}
                        >
                            +
                        </IconButton>

                        <IconButton
                            disabled={
                                !canRemoveRow || isCompressing
                            }
                            onClick={() => onRemoveRow(rowId)}
                            sx={{
                                width: 46,
                                height: 46,
                                minWidth: 46,
                                borderRadius: 1.25,
                                border: '1px solid',
                                borderColor:
                                    canRemoveRow &&
                                    !isCompressing
                                        ? 'warning.main'
                                        : 'divider',
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
                            alt={file?.name || 'Selected media'}
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

            <Snackbar
                open={toastOpen}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                autoHideDuration={isCompressing ? null : 5000}
                onClose={handleToastClose}
                sx={{
                    mt: 7,
                    mr: 1,
                    maxWidth: 380,
                }}
            >
                <Alert
                    variant="filled"
                    severity={toastSeverity}
                    onClose={
                        isCompressing
                            ? undefined
                            : () => setToastOpen(false)
                    }
                    icon={
                        isCompressing ? (
                            <CircularProgress
                                size={18}
                                color="inherit"
                            />
                        ) : undefined
                    }
                    sx={{
                        width: '100%',
                        minWidth: 320,
                        alignItems: 'center',
                        boxShadow: 4,
                    }}
                >
                    <Typography
                        variant="body2"
                        fontWeight={700}
                    >
                        {toastTitle}
                    </Typography>

                    {toastDescription && (
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                mt: 0.5,
                            }}
                        >
                            {toastDescription}
                        </Typography>
                    )}

                    {isCompressing && (
                        <LinearProgress
                            variant="determinate"
                            value={compressionProgress}
                            color="inherit"
                            sx={{
                                mt: 1,
                                height: 4,
                                borderRadius: 2,
                                bgcolor:
                                    'rgba(255, 255, 255, 0.25)',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: '#fff',
                                },
                            }}
                        />
                    )}
                </Alert>
            </Snackbar>
        </>
    );
}

MediaUploadField.propTypes = {
    rowId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    fieldKey: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    mediaFields: PropTypes.array.isRequired,
    onFilesSelected: PropTypes.func.isRequired,
    onAddRow: PropTypes.func.isRequired,
    onRemoveRow: PropTypes.func.isRequired,
    onChangeType: PropTypes.func.isRequired,
    canRemoveRow: PropTypes.bool.isRequired,
};