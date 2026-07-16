import PropTypes from 'prop-types';
import {
    useRef,
    useMemo,
    useState,
    useEffect,
    useCallback,
} from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import {
    compressVideo,
    shouldCompressVideo,
} from 'src/utils/compressVideo';

import {
    getGalleryImages,
    saveGalleryImages,
    deleteGalleryImage,
    getGalleryCategories,
    updateGalleryCategory,
    deleteGalleryCategory,
    createGalleryCategory,
    uploadGalleryImageToR2,
    createGalleryUploadUrls,
} from 'src/services/gallery.service';


const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
];

const isVideoFile = (file) =>
    file?.type?.startsWith('video/');

const isVideoUrl = (url = '') => {
    const cleanUrl = url.split('?')[0].toLowerCase();

    return (
        cleanUrl.endsWith('.mp4') ||
        cleanUrl.endsWith('.webm') ||
        cleanUrl.endsWith('.mov')
    );
};

const getCategoryId = (category) =>
    category?.id ??
    category?._id ??
    category?.category_id;

const getCategoryName = (category) =>
    category?.name ??
    category?.category_name ??
    category?.title ??
    'Untitled Category';

const getImageId = (image) =>
    image?.id ??
    image?._id ??
    image?.image_id;

const getImageCategoryId = (image) =>
    image?.category_id ??
    image?.categoryId ??
    image?.category?.id ??
    image?.category?._id;

const getImageUrl = (image) =>
    image?.image_url ??
    image?.url ??
    image?.imageUrl ??
    image?.public_url ??
    image?.file_url ??
    '';

const getImageName = (image) =>
    image?.title ??
    image?.image_alt ??
    image?.name ??
    image?.file_name ??
    image?.filename ??
    'Gallery media';

const extractCategories = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.categories)) {
        return response.categories;
    }
    if (Array.isArray(response?.data)) {
        return response.data;
    }
    if (Array.isArray(response?.data?.categories)) {
        return response.data.categories;
    }

    return [];
};

const extractImages = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.images)) {
        return response.images;
    }
    if (Array.isArray(response?.data)) {
        return response.data;
    }
    if (Array.isArray(response?.data?.images)) {
        return response.data.images;
    }

    return [];
};

const extractPresignedUploads = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.uploads)) {
        return response.uploads;
    }
    if (Array.isArray(response?.files)) {
        return response.files;
    }
    if (Array.isArray(response?.data)) {
        return response.data;
    }
    if (Array.isArray(response?.data?.uploads)) {
        return response.data.uploads;
    }
    if (Array.isArray(response?.data?.files)) {
        return response.data.files;
    }

    return [];
};

const getPresignedUploadUrl = (item) =>
    item?.uploadUrl ?? '';

const getPresignedPublicUrl = (item) =>
    item?.secure_url ?? '';

const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );
    const value = bytes / 1024 ** unitIndex;

    return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${
        units[unitIndex]
    }`;
};

const revokeFilePreviews = (files) => {
    files.forEach((item) => {
        if (item.preview) {
            URL.revokeObjectURL(item.preview);
        }
    });
};

function MediaPreview({
    url,
    name,
    file,
    controls = false,
}) {
    const video = isVideoFile(file) || isVideoUrl(url);

    if (!url) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: 100,
                    px: 1,
                    display: 'flex',
                    textAlign: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                }}
            >
                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    Media unavailable
                </Typography>
            </Box>
        );
    }

    if (video) {
        return (
            <Box
                component="video"
                src={url}
                controls={controls}
                muted={!controls}
                playsInline
                preload="metadata"
                sx={{
                    width: '100%',
                    height: 100,
                    display: 'block',
                    objectFit: 'cover',
                    bgcolor: 'common.black',
                }}
            />
        );
    }

    return (
        <Box
            component="img"
            src={url}
            alt={name}
            loading="lazy"
            sx={{
                width: '100%',
                height: 100,
                display: 'block',
                objectFit: 'cover',
            }}
        />
    );
}

MediaPreview.propTypes = {
    url: PropTypes.string,
    name: PropTypes.string,
    file: PropTypes.oneOfType([
        PropTypes.instanceOf(File),
        PropTypes.oneOf([null]),
    ]),
    controls: PropTypes.bool,
};

export default function InspirationGallery() {
    const fileInputRef = useRef(null);
    const selectedFilesRef = useRef([]);

    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] =
        useState('');

    const [loading, setLoading] = useState(true);
    const [imagesLoading, setImagesLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const [uploadProgress, setUploadProgress] = useState(0);
    const [compressionProgress, setCompressionProgress] =
        useState(0);

    const [expandedCategory, setExpandedCategory] =
        useState(false);

    const [categoryDialog, setCategoryDialog] = useState({
        open: false,
        mode: 'create',
        category: null,
    });

    const [categoryName, setCategoryName] = useState('');
    const [savingCategory, setSavingCategory] =
        useState(false);

    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        type: '',
        item: null,
    });

    const [deleting, setDeleting] = useState(false);

    const [message, setMessage] = useState({
        open: false,
        severity: 'success',
        text: '',
    });

    const [, setActivity] = useState({
        open: false,
        title: '',
        description: '',
        severity: 'info',
        progress: 0,
    });

    const selectedCategory = useMemo(
        () =>
            categories.find(
                (category) =>
                    String(getCategoryId(category)) ===
                    String(selectedCategoryId)
            ),
        [categories, selectedCategoryId]
    );

    const imagesByCategory = useMemo(() => {
        const groupedImages = {};

        categories.forEach((category) => {
            groupedImages[
                String(getCategoryId(category))
            ] = [];
        });

        images.forEach((image) => {
            const categoryId = String(
                getImageCategoryId(image)
            );

            if (!groupedImages[categoryId]) {
                groupedImages[categoryId] = [];
            }

            groupedImages[categoryId].push(image);
        });

        return groupedImages;
    }, [categories, images]);

    const showMessage = useCallback(
        (text, severity = 'success') => {
            setMessage({
                open: true,
                severity,
                text,
            });
        },
        []
    );

    const loadCategories = useCallback(async () => {
        const response = await getGalleryCategories();
        const categoryList = extractCategories(response);

        setCategories(categoryList);

        setSelectedCategoryId((currentCategoryId) => {
            const exists = categoryList.some(
                (category) =>
                    String(getCategoryId(category)) ===
                    String(currentCategoryId)
            );

            if (exists) {
                return currentCategoryId;
            }

            if (categoryList.length) {
                return String(
                    getCategoryId(categoryList[0])
                );
            }

            return '';
        });

        return categoryList;
    }, []);

    const loadImages = useCallback(async () => {
        setImagesLoading(true);

        try {
            const response = await getGalleryImages({
                limit: 500,
            });

            setImages(extractImages(response));
        } finally {
            setImagesLoading(false);
        }
    }, []);

    const loadPage = useCallback(async () => {
        setLoading(true);

        try {
            await Promise.all([
                loadCategories(),
                loadImages(),
            ]);
        } catch (error) {
            showMessage(
                error.message ||
                    'Failed to load inspiration gallery',
                'error'
            );
        } finally {
            setLoading(false);
        }
    }, [loadCategories, loadImages, showMessage]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    useEffect(() => {
        selectedFilesRef.current = selectedFiles;
    }, [selectedFiles]);

    useEffect(
        () => () => {
            revokeFilePreviews(
                selectedFilesRef.current
            );
        },
        []
    );

    const validateFiles = useCallback(
        async (files) => {
            const incomingFiles = Array.from(files || []);
            const supportedFiles = [];
            const errors = [];

            incomingFiles.forEach((file) => {
                if (!ALLOWED_TYPES.includes(file.type)) {
                    errors.push(
                        `${file.name}: unsupported file type`
                    );
                    return;
                }

                supportedFiles.push(file);
            });

            if (errors.length) {
                showMessage(
                    errors.join(', '),
                    'error'
                );
            }

            if (!supportedFiles.length) {
                return;
            }

            const videosToCompress =
                supportedFiles.filter((file) =>
                    shouldCompressVideo(file)
                );

            if (videosToCompress.length) {
                setCompressing(true);
                setCompressionProgress(0);

                setActivity({
                    open: true,
                    title: 'Preparing video compression',
                    description: `${videosToCompress.length} large video file(s) will be compressed.`,
                    severity: 'info',
                    progress: 0,
                });
            }

            try {
                const progressByFile = new Map();

                const preparedFiles = await Promise.all(
                    supportedFiles.map(
                        async (file, index) => {
                            let finalFile = file;

                            if (
                                shouldCompressVideo(file)
                            ) {
                                setActivity(
                                    (current) => ({
                                        ...current,
                                        open: true,
                                        title: `Compressing ${file.name}`,
                                        description: `Original size: ${formatFileSize(
                                            file.size
                                        )}`,
                                        severity: 'info',
                                    })
                                );

                                finalFile =
                                    await compressVideo(
                                        file,
                                        (fileProgress) => {
                                            progressByFile.set(
                                                index,
                                                fileProgress
                                            );

                                            const total =
                                                supportedFiles.reduce(
                                                    (
                                                        sum,
                                                        currentFile,
                                                        fileIndex
                                                    ) => {
                                                        if (
                                                            !shouldCompressVideo(
                                                                currentFile
                                                            )
                                                        ) {
                                                            return (
                                                                sum +
                                                                100
                                                            );
                                                        }

                                                        return (
                                                            sum +
                                                            (progressByFile.get(
                                                                fileIndex
                                                            ) ||
                                                                0)
                                                        );
                                                    },
                                                    0
                                                );

                                            const progress =
                                                Math.round(
                                                    total /
                                                        supportedFiles.length
                                                );

                                            setCompressionProgress(
                                                progress
                                            );

                                            setActivity(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    progress,
                                                })
                                            );
                                        }
                                    );
                            } else {
                                progressByFile.set(
                                    index,
                                    100
                                );
                            }

                            return {
                                id: `${finalFile.name}-${finalFile.size}-${finalFile.lastModified}-${Math.random()}`,
                                file: finalFile,
                                originalSize:
                                    file.size,
                                wasCompressed:
                                    finalFile !== file,
                                preview:
                                    URL.createObjectURL(
                                        finalFile
                                    ),
                            };
                        }
                    )
                );

                setSelectedFiles(
                    (currentFiles) => [
                        ...currentFiles,
                        ...preparedFiles,
                    ]
                );

                const compressedFiles =
                    preparedFiles.filter(
                        (item) => item.wasCompressed
                    );

                if (compressedFiles.length) {
                    setCompressionProgress(100);

                    setActivity({
                        open: true,
                        title: 'Compression complete',
                        description: `${compressedFiles.length} video file(s) compressed successfully.`,
                        severity: 'success',
                        progress: 100,
                    });
                }
            } catch (error) {
                console.error(
                    'Video compression failed:',
                    error
                );

                setActivity({
                    open: true,
                    title: 'Compression failed',
                    description:
                        error instanceof Error
                            ? error.message
                            : 'Video compression failed.',
                    severity: 'error',
                    progress: 0,
                });

                showMessage(
                    error instanceof Error
                        ? error.message
                        : 'Video compression failed',
                    'error'
                );
            } finally {
                setCompressing(false);
            }
        },
        [showMessage]
    );

    const handleFileInputChange = async (event) => {
        const { files } = event.target;
        event.target.value = '';

        await validateFiles(files);
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!uploading && !compressing) {
            setDragActive(true);
        }
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (
            !event.currentTarget.contains(
                event.relatedTarget
            )
        ) {
            setDragActive(false);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);

        if (!uploading && !compressing) {
            await validateFiles(
                event.dataTransfer.files
            );
        }
    };

    const removeSelectedFile = (fileId) => {
        setSelectedFiles((currentFiles) => {
            const removedFile =
                currentFiles.find(
                    (item) => item.id === fileId
                );

            if (removedFile?.preview) {
                URL.revokeObjectURL(
                    removedFile.preview
                );
            }

            return currentFiles.filter(
                (item) => item.id !== fileId
            );
        });
    };

    const clearSelectedFiles = () => {
        revokeFilePreviews(selectedFiles);
        setSelectedFiles([]);
    };

    const handleUpload = async () => {
        if (!selectedCategoryId) {
            showMessage(
                'Please select a category first',
                'error'
            );
            return;
        }

        if (!selectedFiles.length) {
            showMessage(
                'Please select at least one media file',
                'error'
            );
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        setActivity({
            open: true,
            title: 'Preparing upload',
            description: `${selectedFiles.length} media file(s) selected.`,
            severity: 'info',
            progress: 0,
        });

        try {
            const filesPayload = selectedFiles.map(
                ({ file }) => ({
                    fileName: file.name,
                    contentType: file.type,
                })
            );

            const presignResponse =
                await createGalleryUploadUrls({
                    categoryId:
                        selectedCategoryId,
                    files: filesPayload,
                });

            const presignedUploads =
                extractPresignedUploads(
                    presignResponse
                );

            if (
                presignedUploads.length !==
                selectedFiles.length
            ) {
                throw new Error(
                    'The server did not return an upload URL for every media file'
                );
            }

            let completedUploads = 0;

            const uploadedImages =
                await Promise.all(
                    selectedFiles.map(
                        async (
                            selectedFile,
                            index
                        ) => {
                            const presignedItem =
                                presignedUploads[
                                    index
                                ];

                            const uploadUrl =
                                getPresignedUploadUrl(
                                    presignedItem
                                );

                            const publicUrl =
                                getPresignedPublicUrl(
                                    presignedItem
                                );

                            if (!uploadUrl) {
                                throw new Error(
                                    `Upload URL missing for ${selectedFile.file.name}`
                                );
                            }

                            if (!publicUrl) {
                                throw new Error(
                                    `Public URL missing for ${selectedFile.file.name}`
                                );
                            }

                            setActivity(
                                (current) => ({
                                    ...current,
                                    title: `Uploading ${selectedFile.file.name}`,
                                    description: `${completedUploads} of ${selectedFiles.length} completed`,
                                })
                            );

                            await uploadGalleryImageToR2(
                                {
                                    uploadUrl,
                                    file: selectedFile.file,
                                    contentType:
                                        presignedItem.contentType ||
                                        selectedFile
                                            .file.type,
                                }
                            );

                            completedUploads += 1;

                            const progress =
                                Math.round(
                                    (completedUploads /
                                        selectedFiles.length) *
                                        100
                                );

                            setUploadProgress(
                                progress
                            );

                            setActivity({
                                open: true,
                                title:
                                    progress === 100
                                        ? 'Finalizing upload'
                                        : 'Uploading media',
                                description: `${completedUploads} of ${selectedFiles.length} completed`,
                                severity: 'info',
                                progress,
                            });

                            return {
                                secure_url:
                                    publicUrl,
                                image_alt:
                                    selectedFile
                                        .file.name,
                                title:
                                    selectedFile
                                        .file.name,
                            };
                        }
                    )
                );

            await saveGalleryImages({
                categoryId: selectedCategoryId,
                images: uploadedImages,
            });

            clearSelectedFiles();
            await loadImages();

            setExpandedCategory(
                String(selectedCategoryId)
            );

            setActivity({
                open: true,
                title: 'Upload complete',
                description: `${uploadedImages.length} media file(s) uploaded successfully.`,
                severity: 'success',
                progress: 100,
            });

            showMessage(
                'Media uploaded successfully'
            );
        } catch (error) {
            setActivity({
                open: true,
                title: 'Upload failed',
                description:
                    error.message ||
                    'Failed to upload gallery media',
                severity: 'error',
                progress: 0,
            });

            showMessage(
                error.message ||
                    'Failed to upload gallery media',
                'error'
            );
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const openCreateCategoryDialog = () => {
        setCategoryName('');
        setCategoryDialog({
            open: true,
            mode: 'create',
            category: null,
        });
    };

    const openEditCategoryDialog = (
        category
    ) => {
        setCategoryName(
            getCategoryName(category)
        );

        setCategoryDialog({
            open: true,
            mode: 'edit',
            category,
        });
    };

    const closeCategoryDialog = () => {
        if (savingCategory) return;

        setCategoryDialog({
            open: false,
            mode: 'create',
            category: null,
        });

        setCategoryName('');
    };

    const handleSaveCategory = async () => {
        const trimmedName =
            categoryName.trim();

        if (!trimmedName) {
            showMessage(
                'Category name is required',
                'error'
            );
            return;
        }

        setSavingCategory(true);

        try {
            if (
                categoryDialog.mode === 'edit'
            ) {
                await updateGalleryCategory(
                    getCategoryId(
                        categoryDialog.category
                    ),
                    {
                        name: trimmedName,
                    }
                );

                showMessage(
                    'Category updated successfully'
                );
            } else {
                const response =
                    await createGalleryCategory({
                        name: trimmedName,
                    });

                const createdCategory =
                    response?.category ??
                    response?.data?.category ??
                    response?.data ??
                    response;

                if (
                    getCategoryId(
                        createdCategory
                    )
                ) {
                    setSelectedCategoryId(
                        String(
                            getCategoryId(
                                createdCategory
                            )
                        )
                    );
                }

                showMessage(
                    'Category created successfully'
                );
            }

            closeCategoryDialog();
            await loadCategories();
        } catch (error) {
            showMessage(
                error.message ||
                    'Failed to save category',
                'error'
            );
        } finally {
            setSavingCategory(false);
        }
    };

    const openDeleteDialog = (
        type,
        item
    ) => {
        setDeleteDialog({
            open: true,
            type,
            item,
        });
    };

    const closeDeleteDialog = () => {
        if (deleting) return;

        setDeleteDialog({
            open: false,
            type: '',
            item: null,
        });
    };

    const handleConfirmDelete = async () => {
        setDeleting(true);

        try {
            if (
                deleteDialog.type ===
                'category'
            ) {
                const categoryId =
                    getCategoryId(
                        deleteDialog.item
                    );

                await deleteGalleryCategory(
                    categoryId
                );

                if (
                    String(
                        selectedCategoryId
                    ) === String(categoryId)
                ) {
                    clearSelectedFiles();
                    setSelectedCategoryId('');
                }

                await Promise.all([
                    loadCategories(),
                    loadImages(),
                ]);

                showMessage(
                    'Category deleted successfully'
                );
            }

            if (
                deleteDialog.type === 'image'
            ) {
                const imageId = getImageId(
                    deleteDialog.item
                );

                await deleteGalleryImage(
                    imageId
                );

                setImages(
                    (currentImages) =>
                        currentImages.filter(
                            (image) =>
                                String(
                                    getImageId(
                                        image
                                    )
                                ) !==
                                String(imageId)
                        )
                );

                showMessage(
                    'Media deleted successfully'
                );
            }

            closeDeleteDialog();
        } catch (error) {
            showMessage(
                error.message ||
                    'Failed to delete item',
                'error'
            );
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    let categoryButtonText = 'Create';

    if (savingCategory) {
        categoryButtonText = 'Saving...';
    } else if (
        categoryDialog.mode === 'edit'
    ) {
        categoryButtonText = 'Update';
    }

    let uploadButtonText = `Upload ${selectedFiles.length} Media`;

    if (uploading) {
        uploadButtonText = `Uploading ${uploadProgress}%`;
    }

    let uploadHeading =
        'Drop or select files';

    if (compressing) {
        uploadHeading = `Compressing video ${compressionProgress}%`;
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row',
                }}
                alignItems={{
                    xs: 'flex-start',
                    sm: 'center',
                }}
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Inspiration Gallery
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Manage gallery categories,
                        images and videos.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    onClick={
                        openCreateCategoryDialog
                    }
                >
                    Add Category
                </Button>
            </Stack>

            <Paper
                variant="outlined"
                sx={{ p: 2.5, mb: 3 }}
            >
                <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ mb: 0.5 }}
                >
                    Categories
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                >
                    Select the category where
                    you want to upload media.
                </Typography>

                {categories.length ? (
                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                    >
                        {categories.map(
                            (category) => {
                                const categoryId =
                                    String(
                                        getCategoryId(
                                            category
                                        )
                                    );

                                const selected =
                                    String(
                                        selectedCategoryId
                                    ) ===
                                    categoryId;

                                const imageCount =
                                    imagesByCategory[
                                        categoryId
                                    ]?.length ||
                                    0;

                                return (
                                    <Chip
                                        key={
                                            categoryId
                                        }
                                        label={`${getCategoryName(
                                            category
                                        )} (${imageCount})`}
                                        color={
                                            selected
                                                ? 'primary'
                                                : 'default'
                                        }
                                        variant={
                                            selected
                                                ? 'filled'
                                                : 'outlined'
                                        }
                                        onClick={() =>
                                            setSelectedCategoryId(
                                                categoryId
                                            )
                                        }
                                        sx={{
                                            height: 38,
                                            px: 0.5,
                                            fontWeight:
                                                selected
                                                    ? 700
                                                    : 500,
                                        }}
                                    />
                                );
                            }
                        )}
                    </Stack>
                ) : (
                    <Alert severity="info">
                        No categories are
                        available. Create your
                        first category to begin.
                    </Alert>
                )}
            </Paper>

            <Paper
                variant="outlined"
                sx={{ p: 2.5, mb: 3 }}
            >
                <Stack
                    direction={{
                        xs: 'column',
                        sm: 'row',
                    }}
                    alignItems={{
                        xs: 'flex-start',
                        sm: 'center',
                    }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mb: 2 }}
                >
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Upload Media
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Uploading to:{' '}
                            <strong>
                                {selectedCategory
                                    ? getCategoryName(
                                          selectedCategory
                                      )
                                    : 'No category selected'}
                            </strong>
                        </Typography>
                    </Box>

                    {selectedFiles.length >
                        0 && (
                        <Button
                            color="inherit"
                            disabled={
                                uploading ||
                                compressing
                            }
                            onClick={
                                clearSelectedFiles
                            }
                        >
                            Clear All
                        </Button>
                    )}
                </Stack>

                <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                        if (
                            !uploading &&
                            !compressing &&
                            selectedCategoryId
                        ) {
                            fileInputRef.current?.click();
                        }
                    }}
                    onKeyDown={(event) => {
                        if (
                            (event.key ===
                                'Enter' ||
                                event.key ===
                                    ' ') &&
                            !uploading &&
                            !compressing &&
                            selectedCategoryId
                        ) {
                            fileInputRef.current?.click();
                        }
                    }}
                    onDragEnter={
                        handleDragEnter
                    }
                    onDragLeave={
                        handleDragLeave
                    }
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    sx={{
                        minHeight: 240,
                        p: 3,
                        border:
                            '1.5px dashed',
                        borderColor:
                            dragActive
                                ? 'primary.main'
                                : 'divider',
                        borderRadius: 2,
                        bgcolor: dragActive
                            ? 'action.hover'
                            : 'background.default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                            'center',
                        textAlign: 'center',
                        cursor:
                            uploading ||
                            compressing ||
                            !selectedCategoryId
                                ? 'not-allowed'
                                : 'pointer',
                        opacity:
                            selectedCategoryId
                                ? 1
                                : 0.6,
                        transition: '0.2s',
                        '&:hover': {
                            borderColor:
                                selectedCategoryId
                                    ? 'primary.main'
                                    : 'divider',
                        },
                    }}
                >
                    <input
                        ref={fileInputRef}
                        hidden
                        multiple
                        type="file"
                        accept={ALLOWED_TYPES.join(
                            ','
                        )}
                        disabled={
                            uploading ||
                            compressing ||
                            !selectedCategoryId
                        }
                        onChange={
                            handleFileInputChange
                        }
                    />

                    <Box>
                        <Box
                            sx={{
                                width: 72,
                                height: 58,
                                mx: 'auto',
                                mb: 2,
                                borderRadius: 2,
                                bgcolor:
                                    'primary.lighter',
                                color:
                                    'primary.main',
                                display: 'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                                fontSize: 34,
                            }}
                        >
                            ↑
                        </Box>

                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            {uploadHeading}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.75 }}
                        >
                            Drag files here, or{' '}
                            <Box
                                component="span"
                                sx={{
                                    color:
                                        'primary.main',
                                    textDecoration:
                                        'underline',
                                }}
                            >
                                browse your device
                            </Box>
                            .
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display: 'block',
                                mt: 1,
                            }}
                        >
                            JPG, PNG, WebP, AVIF,
                            MP4, MOV or WebM
                        </Typography>

                        {compressing && (
                            <Box
                                sx={{
                                    width: 280,
                                    maxWidth:
                                        '100%',
                                    mt: 2,
                                }}
                            >
                                <LinearProgress
                                    variant="determinate"
                                    value={
                                        compressionProgress
                                    }
                                />
                            </Box>
                        )}
                    </Box>
                </Box>

                {selectedFiles.length >
                    0 && (
                    <Box sx={{ mt: 2.5 }}>
                        <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            sx={{ mb: 1.5 }}
                        >
                            Selected media (
                            {selectedFiles.length})
                        </Typography>

                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems:
                                    'flex-start',
                                gap: 1,
                            }}
                        >
                            {selectedFiles.map(
                                (item) => (
                                    <Paper
                                        key={
                                            item.id
                                        }
                                        variant="outlined"
                                        sx={{
                                            width: 108,
                                            flexShrink: 0,
                                            position:
                                                'relative',
                                            overflow:
                                                'hidden',
                                            borderRadius: 1.5,
                                        }}
                                    >
                                        <MediaPreview
                                            url={
                                                item.preview
                                            }
                                            name={
                                                item
                                                    .file
                                                    .name
                                            }
                                            file={
                                                item.file
                                            }
                                        />

                                        <Tooltip title="Remove media">
                                            <IconButton
                                                size="small"
                                                disabled={
                                                    uploading ||
                                                    compressing
                                                }
                                                onClick={() =>
                                                    removeSelectedFile(
                                                        item.id
                                                    )
                                                }
                                                sx={{
                                                    position:
                                                        'absolute',
                                                    top: 5,
                                                    right: 5,
                                                    width: 27,
                                                    height: 27,
                                                    bgcolor:
                                                        'rgba(255,255,255,0.92)',
                                                }}
                                            >
                                                ×
                                            </IconButton>
                                        </Tooltip>

                                        <Box
                                            sx={{
                                                p: 0.75,
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                title={
                                                    item
                                                        .file
                                                        .name
                                                }
                                                sx={{
                                                    display:
                                                        'block',
                                                    overflow:
                                                        'hidden',
                                                    textOverflow:
                                                        'ellipsis',
                                                    whiteSpace:
                                                        'nowrap',
                                                }}
                                            >
                                                {
                                                    item
                                                        .file
                                                        .name
                                                }
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                display="block"
                                            >
                                                {isVideoFile(
                                                    item.file
                                                )
                                                    ? 'Video'
                                                    : 'Image'}
                                                {' • '}
                                                {formatFileSize(
                                                    item
                                                        .file
                                                        .size
                                                )}
                                            </Typography>

                                            {item.wasCompressed && (
                                                <Typography
                                                    variant="caption"
                                                    color="success.main"
                                                    display="block"
                                                >
                                                    {formatFileSize(
                                                        item.originalSize
                                                    )}
                                                    {' → '}
                                                    {formatFileSize(
                                                        item
                                                            .file
                                                            .size
                                                    )}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Paper>
                                )
                            )}
                        </Box>

                        {uploading && (
                            <Box sx={{ mt: 2 }}>
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    sx={{
                                        mb: 0.75,
                                    }}
                                >
                                    <Typography variant="body2">
                                        Uploading
                                        media...
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        fontWeight={
                                            700
                                        }
                                    >
                                        {
                                            uploadProgress
                                        }
                                        %
                                    </Typography>
                                </Stack>

                                <LinearProgress
                                    variant="determinate"
                                    value={
                                        uploadProgress
                                    }
                                />
                            </Box>
                        )}

                        <Stack
                            direction="row"
                            justifyContent="flex-end"
                            sx={{ mt: 2 }}
                        >
                            <Button
                                variant="contained"
                                disabled={
                                    uploading ||
                                    compressing ||
                                    !selectedFiles.length ||
                                    !selectedCategoryId
                                }
                                onClick={
                                    handleUpload
                                }
                                startIcon={
                                    uploading ? (
                                        <CircularProgress
                                            size={
                                                16
                                            }
                                            color="inherit"
                                        />
                                    ) : null
                                }
                            >
                                {
                                    uploadButtonText
                                }
                            </Button>
                        </Stack>
                    </Box>
                )}
            </Paper>

            <Box>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                >
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Gallery Media
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            View and manage
                            images and videos
                            grouped by category.
                        </Typography>
                    </Box>

                    {imagesLoading && (
                        <CircularProgress
                            size={22}
                        />
                    )}
                </Stack>

                {categories.map(
                    (category) => {
                        const categoryId =
                            String(
                                getCategoryId(
                                    category
                                )
                            );

                        const categoryImages =
                            imagesByCategory[
                                categoryId
                            ] || [];

                        return (
                            <Accordion
                                key={
                                    categoryId
                                }
                                expanded={
                                    expandedCategory ===
                                    categoryId
                                }
                                onChange={(
                                    _,
                                    isExpanded
                                ) =>
                                    setExpandedCategory(
                                        isExpanded
                                            ? categoryId
                                            : false
                                    )
                                }
                                disableGutters
                                sx={{
                                    mb: 1.5,
                                    border:
                                        '1px solid',
                                    borderColor:
                                        'divider',
                                    borderRadius:
                                        '8px !important',
                                    boxShadow:
                                        'none',
                                    overflow:
                                        'hidden',
                                    '&::before': {
                                        display:
                                            'none',
                                    },
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={
                                        <Typography
                                            component="span"
                                            sx={{
                                                fontSize: 22,
                                            }}
                                        >
                                            ▾
                                        </Typography>
                                    }
                                >
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        spacing={2}
                                        sx={{
                                            width: '100%',
                                            pr: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography fontWeight={700}>
                                                {getCategoryName(
                                                    category
                                                )}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {
                                                    categoryImages.length
                                                }{' '}
                                                media
                                            </Typography>
                                        </Box>

                                        <Stack
                                            direction="row"
                                            spacing={
                                                0.5
                                            }
                                            onClick={(
                                                event
                                            ) =>
                                                event.stopPropagation()
                                            }
                                        >
                                            <Button
                                                size="small"
                                                onClick={() =>
                                                    openEditCategoryDialog(
                                                        category
                                                    )
                                                }
                                            >
                                                Edit
                                            </Button>

                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                    openDeleteDialog(
                                                        'category',
                                                        category
                                                    )
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </AccordionSummary>

                                <Divider />

                                <AccordionDetails
                                    sx={{ p: 2 }}
                                >
                                    {categoryImages.length ? (
                                        <Box
                                            sx={{
                                                display:
                                                    'flex',
                                                flexWrap:
                                                    'wrap',
                                                alignItems:
                                                    'flex-start',
                                                gap: 1,
                                            }}
                                        >
                                            {categoryImages.map(
                                                (
                                                    image
                                                ) => {
                                                    const imageUrl =
                                                        getImageUrl(
                                                            image
                                                        );

                                                    return (
                                                        <Paper
                                                            key={getImageId(
                                                                image
                                                            )}
                                                            variant="outlined"
                                                            sx={{
                                                                width: 108,
                                                                flexShrink: 0,
                                                                position:
                                                                    'relative',
                                                                overflow:
                                                                    'hidden',
                                                                borderRadius: 1.5,
                                                            }}
                                                        >
                                                            <MediaPreview
                                                                url={
                                                                    imageUrl
                                                                }
                                                                name={getImageName(
                                                                    image
                                                                )}
                                                                controls={isVideoUrl(
                                                                    imageUrl
                                                                )}
                                                            />

                                                            <Tooltip title="Delete media">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() =>
                                                                        openDeleteDialog(
                                                                            'image',
                                                                            image
                                                                        )
                                                                    }
                                                                    sx={{
                                                                        position:
                                                                            'absolute',
                                                                        top: 5,
                                                                        right: 5,
                                                                        width: 27,
                                                                        height: 27,
                                                                        bgcolor:
                                                                            'rgba(255,255,255,0.92)',
                                                                    }}
                                                                >
                                                                    ×
                                                                </IconButton>
                                                            </Tooltip>

                                                            <Box
                                                                sx={{
                                                                    p: 0.75,
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="caption"
                                                                    title={getImageName(
                                                                        image
                                                                    )}
                                                                    sx={{
                                                                        display:
                                                                            'block',
                                                                        fontWeight: 600,
                                                                        overflow:
                                                                            'hidden',
                                                                        textOverflow:
                                                                            'ellipsis',
                                                                        whiteSpace:
                                                                            'nowrap',
                                                                    }}
                                                                >
                                                                    {getImageName(
                                                                        image
                                                                    )}
                                                                </Typography>
                                                            </Box>
                                                        </Paper>
                                                    );
                                                }
                                            )}
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                py: 4,
                                                textAlign:
                                                    'center',
                                                border:
                                                    '1px dashed',
                                                borderColor:
                                                    'divider',
                                                borderRadius: 1.5,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                No media has
                                                been added to
                                                this category.
                                            </Typography>

                                            <Button
                                                size="small"
                                                sx={{
                                                    mt: 1,
                                                }}
                                                onClick={() => {
                                                    setSelectedCategoryId(
                                                        categoryId
                                                    );
                                                    fileInputRef.current?.click();
                                                }}
                                            >
                                                Upload
                                                Media
                                            </Button>
                                        </Box>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        );
                    }
                )}
            </Box>

            <Dialog
                open={categoryDialog.open}
                onClose={
                    closeCategoryDialog
                }
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    {categoryDialog.mode ===
                    'edit'
                        ? 'Edit Category'
                        : 'Add Category'}
                </DialogTitle>

                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Category name"
                        value={categoryName}
                        onChange={(event) =>
                            setCategoryName(
                                event.target
                                    .value
                            )
                        }
                        onKeyDown={(event) => {
                            if (
                                event.key ===
                                'Enter'
                            ) {
                                handleSaveCategory();
                            }
                        }}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        color="inherit"
                        disabled={
                            savingCategory
                        }
                        onClick={
                            closeCategoryDialog
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        disabled={
                            savingCategory ||
                            !categoryName.trim()
                        }
                        onClick={
                            handleSaveCategory
                        }
                    >
                        {
                            categoryButtonText
                        }
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialog.open}
                onClose={closeDeleteDialog}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    Delete{' '}
                    {deleteDialog.type ===
                    'category'
                        ? 'Category'
                        : 'Media'}
                </DialogTitle>

                <DialogContent>
                    <Alert severity="warning">
                        {deleteDialog.type ===
                        'category'
                            ? `Are you sure you want to delete "${getCategoryName(
                                  deleteDialog.item
                              )}"? Its media may also be deleted.`
                            : `Are you sure you want to delete "${getImageName(
                                  deleteDialog.item
                              )}"?`}
                    </Alert>
                </DialogContent>

                <DialogActions>
                    <Button
                        color="inherit"
                        disabled={deleting}
                        onClick={
                            closeDeleteDialog
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        disabled={deleting}
                        onClick={
                            handleConfirmDelete
                        }
                    >
                        {deleting
                            ? 'Deleting...'
                            : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>


            <Snackbar
                open={message.open}
                autoHideDuration={4000}
                onClose={() =>
                    setMessage(
                        (current) => ({
                            ...current,
                            open: false,
                        })
                    )
                }
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <Alert
                    severity={
                        message.severity
                    }
                    variant="filled"
                    onClose={() =>
                        setMessage(
                            (current) => ({
                                ...current,
                                open: false,
                            })
                        )
                    }
                    sx={{ width: '100%' }}
                >
                    {message.text}
                </Alert>
            </Snackbar>
        </Box>
    );
}