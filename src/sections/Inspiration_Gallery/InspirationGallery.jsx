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
    updateGalleryImageAlt,
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

const MAX_ALT_LENGTH = 250;
const IMAGES_PER_PAGE = 50;

const isVideoFile = (file) =>
    file?.type?.startsWith('video/');

const isVideoUrl = (url = '') => {
    const cleanUrl = url
        .split('?')[0]
        .toLowerCase();

    return (
        cleanUrl.endsWith('.mp4') ||
        cleanUrl.endsWith('.webm') ||
        cleanUrl.endsWith('.mov')
    );
};

const createDefaultAltText = (
    fileName = ''
) =>
    fileName
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

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

const getImageAlt = (image) =>
    image?.image_alt ??
    image?.imageAlt ??
    image?.alt ??
    '';

const extractCategories = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (
        Array.isArray(response?.categories)
    ) {
        return response.categories;
    }

    if (
        Array.isArray(
            response?.data?.categories
        )
    ) {
        return response.data.categories;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    return [];
};

const extractImages = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (
        Array.isArray(
            response?.data?.images
        )
    ) {
        return response.data.images;
    }

    if (
        Array.isArray(response?.images)
    ) {
        return response.images;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    return [];
};

const extractImagePagination = (
    response
) => {
    const pagination =
        response?.data?.pagination ??
        response?.pagination ??
        {};

    return {
        page:
            Number(
                pagination.page
            ) || 1,

        limit:
            Number(
                pagination.limit
            ) || IMAGES_PER_PAGE,

        total:
            Number(
                pagination.total
            ) || 0,

        totalPages:
            Number(
                pagination.totalPages ??
                    pagination.total_pages
            ) || 0,

        hasMore: Boolean(
            pagination.hasMore ??
                pagination.has_more
        ),
    };
};

const mergeUniqueImages = (
    currentImages,
    incomingImages
) => {
    const imageMap = new Map();

    [
        ...currentImages,
        ...incomingImages,
    ].forEach((image) => {
        const imageId =
            getImageId(image);

        const imageKey =
            imageId !== undefined &&
            imageId !== null
                ? String(imageId)
                : getImageUrl(image);

        if (imageKey) {
            imageMap.set(
                imageKey,
                image
            );
        }
    });

    return Array.from(
        imageMap.values()
    );
};

const extractPresignedUploads = (
    response
) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (
        Array.isArray(response?.uploads)
    ) {
        return response.uploads;
    }

    if (Array.isArray(response?.files)) {
        return response.files;
    }

    if (
        Array.isArray(
            response?.data?.uploads
        )
    ) {
        return response.data.uploads;
    }

    if (
        Array.isArray(response?.data?.files)
    ) {
        return response.data.files;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    return [];
};

const getPresignedUploadUrl = (item) =>
    item?.uploadUrl ??
    item?.upload_url ??
    item?.presignedUrl ??
    item?.presigned_url ??
    '';

const getPresignedPublicUrl = (item) =>
    item?.secure_url ??
    item?.publicUrl ??
    item?.public_url ??
    item?.url ??
    '';

const formatFileSize = (bytes) => {
    if (!bytes) {
        return '0 B';
    }

    const units = [
        'B',
        'KB',
        'MB',
        'GB',
    ];

    const unitIndex = Math.min(
        Math.floor(
            Math.log(bytes) /
                Math.log(1024)
        ),
        units.length - 1
    );

    const value =
        bytes / 1024 ** unitIndex;

    return `${value.toFixed(
        unitIndex === 0 ? 0 : 1
    )} ${units[unitIndex]}`;
};

const revokeFilePreviews = (files) => {
    files.forEach((item) => {
        if (item.preview) {
            URL.revokeObjectURL(
                item.preview
            );
        }
    });
};

function MediaPreview({
    url,
    name,
    file,
    controls = false,
    height = 130,
}) {
    const video =
        isVideoFile(file) ||
        isVideoUrl(url);

    if (!url) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height,
                    px: 1,
                    display: 'flex',
                    textAlign: 'center',
                    alignItems: 'center',
                    justifyContent:
                        'center',
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
                    height,
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
            alt={name || ''}
            loading="lazy"
            sx={{
                width: '100%',
                height,
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
    height: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
};

export default function InspirationGallery() {
    const fileInputRef = useRef(null);
    const selectedFilesRef = useRef([]);

    const [categories, setCategories] =
        useState([]);

    const [images, setImages] =
        useState([]);

    const [imagesPage, setImagesPage] =
        useState(1);

    const [totalImages, setTotalImages] =
        useState(0);

    const [
        hasMoreImages,
        setHasMoreImages,
    ] = useState(false);

    const [loadingMore, setLoadingMore] =
        useState(false);

    const [
        selectedFiles,
        setSelectedFiles,
    ] = useState([]);

    const [
        selectedCategoryId,
        setSelectedCategoryId,
    ] = useState('');

    const [loading, setLoading] =
        useState(true);

    const [
        imagesLoading,
        setImagesLoading,
    ] = useState(false);

    const [uploading, setUploading] =
        useState(false);

    const [
        compressing,
        setCompressing,
    ] = useState(false);

    const [dragActive, setDragActive] =
        useState(false);

    const [
        uploadProgress,
        setUploadProgress,
    ] = useState(0);

    const [
        compressionProgress,
        setCompressionProgress,
    ] = useState(0);

    const [
        expandedCategory,
        setExpandedCategory,
    ] = useState(false);

    const [
        categoryDialog,
        setCategoryDialog,
    ] = useState({
        open: false,
        mode: 'create',
        category: null,
    });

    const [
        categoryName,
        setCategoryName,
    ] = useState('');

    const [
        savingCategory,
        setSavingCategory,
    ] = useState(false);

    const [
        altDialog,
        setAltDialog,
    ] = useState({
        open: false,
        image: null,
    });

    const [altText, setAltText] =
        useState('');

    const [savingAlt, setSavingAlt] =
        useState(false);

    const [
        deleteDialog,
        setDeleteDialog,
    ] = useState({
        open: false,
        type: '',
        item: null,
    });

    const [deleting, setDeleting] =
        useState(false);

    const [message, setMessage] =
        useState({
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
                    String(
                        getCategoryId(
                            category
                        )
                    ) ===
                    String(
                        selectedCategoryId
                    )
            ),
        [
            categories,
            selectedCategoryId,
        ]
    );

    const imagesByCategory = useMemo(
        () => {
            const groupedImages = {};

            categories.forEach(
                (category) => {
                    const categoryId =
                        getCategoryId(
                            category
                        );

                    if (
                        categoryId !==
                            undefined &&
                        categoryId !== null
                    ) {
                        groupedImages[
                            String(categoryId)
                        ] = [];
                    }
                }
            );

            images.forEach((image) => {
                const categoryId =
                    getImageCategoryId(
                        image
                    );

                if (
                    categoryId ===
                        undefined ||
                    categoryId === null
                ) {
                    return;
                }

                const categoryKey =
                    String(categoryId);

                if (
                    !groupedImages[
                        categoryKey
                    ]
                ) {
                    groupedImages[
                        categoryKey
                    ] = [];
                }

                groupedImages[
                    categoryKey
                ].push(image);
            });

            return groupedImages;
        },
        [categories, images]
    );

    const showMessage = useCallback(
        (
            text,
            severity = 'success'
        ) => {
            setMessage({
                open: true,
                severity,
                text,
            });
        },
        []
    );

    const loadCategories =
        useCallback(async () => {
            const response =
                await getGalleryCategories();

            const categoryList =
                extractCategories(response);

            setCategories(categoryList);

            setSelectedCategoryId(
                (currentCategoryId) => {
                    const exists =
                        categoryList.some(
                            (category) =>
                                String(
                                    getCategoryId(
                                        category
                                    )
                                ) ===
                                String(
                                    currentCategoryId
                                )
                        );

                    if (exists) {
                        return currentCategoryId;
                    }

                    if (
                        categoryList.length
                    ) {
                        return String(
                            getCategoryId(
                                categoryList[0]
                            )
                        );
                    }

                    return '';
                }
            );

            return categoryList;
        }, []);

    const loadImages = useCallback(
        async ({
            page = 1,
            reset = false,
        } = {}) => {
            if (reset) {
                setImagesLoading(true);
            } else {
                setLoadingMore(true);
            }

            try {
                const response =
                    await getGalleryImages({
                        page,
                        limit:
                            IMAGES_PER_PAGE,
                    });

                const incomingImages =
                    extractImages(response);

                const pagination =
                    extractImagePagination(
                        response
                    );

                setImages(
                    (currentImages) => {
                        if (reset) {
                            return incomingImages;
                        }

                        return mergeUniqueImages(
                            currentImages,
                            incomingImages
                        );
                    }
                );

                setImagesPage(
                    pagination.page
                );

                setTotalImages(
                    pagination.total
                );

                setHasMoreImages(
                    pagination.hasMore
                );

                return {
                    images:
                        incomingImages,
                    pagination,
                };
            } finally {
                setImagesLoading(false);
                setLoadingMore(false);
            }
        },
        []
    );

    const loadPage =
        useCallback(async () => {
            setLoading(true);

            try {
                await Promise.all([
                    loadCategories(),

                    loadImages({
                        page: 1,
                        reset: true,
                    }),
                ]);
            } catch (error) {
                showMessage(
                    error instanceof Error
                        ? error.message
                        : 'Failed to load inspiration gallery',
                    'error'
                );
            } finally {
                setLoading(false);
            }
        }, [
            loadCategories,
            loadImages,
            showMessage,
        ]);

    const handleLoadMoreImages =
        useCallback(async () => {
            if (
                loadingMore ||
                imagesLoading ||
                !hasMoreImages
            ) {
                return;
            }

            try {
                await loadImages({
                    page: imagesPage + 1,
                    reset: false,
                });
            } catch (error) {
                showMessage(
                    error instanceof Error
                        ? error.message
                        : 'Failed to load more gallery media',
                    'error'
                );
            }
        }, [
            loadingMore,
            imagesLoading,
            hasMoreImages,
            imagesPage,
            loadImages,
            showMessage,
        ]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    useEffect(() => {
        selectedFilesRef.current =
            selectedFiles;
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
            const incomingFiles =
                Array.from(files || []);

            const supportedFiles = [];
            const errors = [];

            incomingFiles.forEach((file) => {
                if (
                    !ALLOWED_TYPES.includes(
                        file.type
                    )
                ) {
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
                supportedFiles.filter(
                    (file) =>
                        shouldCompressVideo(
                            file
                        )
                );

            if (
                videosToCompress.length
            ) {
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
                const progressByFile =
                    new Map();

                const preparedFiles =
                    await Promise.all(
                        supportedFiles.map(
                            async (
                                file,
                                index
                            ) => {
                                let finalFile =
                                    file;

                                if (
                                    shouldCompressVideo(
                                        file
                                    )
                                ) {
                                    setActivity(
                                        (
                                            current
                                        ) => ({
                                            ...current,
                                            open: true,
                                            title: `Compressing ${file.name}`,
                                            description: `Original size: ${formatFileSize(
                                                file.size
                                            )}`,
                                            severity:
                                                'info',
                                        })
                                    );

                                    finalFile =
                                        await compressVideo(
                                            file,
                                            (
                                                fileProgress
                                            ) => {
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

                                const video =
                                    isVideoFile(
                                        finalFile
                                    );

                                return {
                                    id: `${finalFile.name}-${finalFile.size}-${finalFile.lastModified}-${Math.random()}`,
                                    file: finalFile,
                                    originalSize:
                                        file.size,
                                    wasCompressed:
                                        finalFile !==
                                        file,
                                    preview:
                                        URL.createObjectURL(
                                            finalFile
                                        ),
                                    imageAlt:
                                        video
                                            ? ''
                                            : createDefaultAltText(
                                                  finalFile.name
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
                        (item) =>
                            item.wasCompressed
                    );

                if (
                    compressedFiles.length
                ) {
                    setCompressionProgress(
                        100
                    );

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

    const handleFileInputChange =
        async (event) => {
            const { files } =
                event.target;

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

    const updateSelectedFileAlt =
        useCallback(
            (fileId, imageAlt) => {
                setSelectedFiles(
                    (currentFiles) =>
                        currentFiles.map(
                            (item) =>
                                item.id ===
                                fileId
                                    ? {
                                          ...item,
                                          imageAlt,
                                      }
                                    : item
                        )
                );
            },
            []
        );

    const removeSelectedFile = (
        fileId
    ) => {
        setSelectedFiles(
            (currentFiles) => {
                const removedFile =
                    currentFiles.find(
                        (item) =>
                            item.id ===
                            fileId
                    );

                if (
                    removedFile?.preview
                ) {
                    URL.revokeObjectURL(
                        removedFile.preview
                    );
                }

                return currentFiles.filter(
                    (item) =>
                        item.id !== fileId
                );
            }
        );
    };

    const clearSelectedFiles =
        useCallback(() => {
            setSelectedFiles(
                (currentFiles) => {
                    revokeFilePreviews(
                        currentFiles
                    );

                    return [];
                }
            );
        }, []);

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

        const imagesWithoutAlt =
            selectedFiles.filter(
                (item) =>
                    !isVideoFile(
                        item.file
                    ) &&
                    !item.imageAlt?.trim()
            );

        if (imagesWithoutAlt.length) {
            showMessage(
                'Please add alt text for every selected image',
                'error'
            );

            return;
        }

        const invalidAltText =
            selectedFiles.find(
                (item) =>
                    !isVideoFile(
                        item.file
                    ) &&
                    item.imageAlt?.trim()
                        .length >
                        MAX_ALT_LENGTH
            );

        if (invalidAltText) {
            showMessage(
                `Alt text cannot exceed ${MAX_ALT_LENGTH} characters`,
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
            const filesPayload =
                selectedFiles.map(
                    ({ file }) => ({
                        fileName:
                            file.name,
                        contentType:
                            file.type,
                    })
                );

            const presignResponse =
                await createGalleryUploadUrls(
                    {
                        categoryId:
                            selectedCategoryId,
                        files:
                            filesPayload,
                    }
                );

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
                                (
                                    current
                                ) => ({
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
                                            .file
                                            .type,
                                }
                            );

                            completedUploads +=
                                1;

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
                                    progress ===
                                    100
                                        ? 'Finalizing upload'
                                        : 'Uploading media',
                                description: `${completedUploads} of ${selectedFiles.length} completed`,
                                severity:
                                    'info',
                                progress,
                            });

                            const video =
                                isVideoFile(
                                    selectedFile.file
                                );

                            return {
                                secure_url:
                                    publicUrl,
                                image_alt:
                                    video
                                        ? null
                                        : selectedFile.imageAlt.trim(),
                                title:
                                    selectedFile
                                        .file
                                        .name,
                            };
                        }
                    )
                );

            await saveGalleryImages({
                categoryId:
                    selectedCategoryId,
                images:
                    uploadedImages,
            });

            clearSelectedFiles();

            await loadImages({
                page: 1,
                reset: true,
            });

            setExpandedCategory(
                String(
                    selectedCategoryId
                )
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
                    error instanceof Error
                        ? error.message
                        : 'Failed to upload gallery media',
                severity: 'error',
                progress: 0,
            });

            showMessage(
                error instanceof Error
                    ? error.message
                    : 'Failed to upload gallery media',
                'error'
            );
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const openCreateCategoryDialog =
        () => {
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
        if (savingCategory) {
            return;
        }

        setCategoryDialog({
            open: false,
            mode: 'create',
            category: null,
        });

        setCategoryName('');
    };

    const handleSaveCategory =
        async () => {
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
                    categoryDialog.mode ===
                    'edit'
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
                        await createGalleryCategory(
                            {
                                name: trimmedName,
                            }
                        );

                    const createdCategory =
                        response?.category ??
                        response?.data
                            ?.category ??
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

                setCategoryDialog({
                    open: false,
                    mode: 'create',
                    category: null,
                });

                setCategoryName('');

                await loadCategories();
            } catch (error) {
                showMessage(
                    error instanceof Error
                        ? error.message
                        : 'Failed to save category',
                    'error'
                );
            } finally {
                setSavingCategory(false);
            }
        };

    const openAltDialog = (image) => {
        setAltText(getImageAlt(image));

        setAltDialog({
            open: true,
            image,
        });
    };

    const closeAltDialog = () => {
        if (savingAlt) {
            return;
        }

        setAltDialog({
            open: false,
            image: null,
        });

        setAltText('');
    };

    const handleSaveAlt = async () => {
        const trimmedAlt =
            altText.trim();

        if (!trimmedAlt) {
            showMessage(
                'Image alt text is required',
                'error'
            );

            return;
        }

        if (
            trimmedAlt.length >
            MAX_ALT_LENGTH
        ) {
            showMessage(
                `Image alt text cannot exceed ${MAX_ALT_LENGTH} characters`,
                'error'
            );

            return;
        }

        const imageId =
            getImageId(
                altDialog.image
            );

        if (!imageId) {
            showMessage(
                'Unable to identify this media item',
                'error'
            );

            return;
        }

        setSavingAlt(true);

        try {
            const response =
                await updateGalleryImageAlt(
                    imageId,
                    trimmedAlt
                );

            const updatedImage =
                response?.image ??
                response?.data?.image ??
                response?.data ??
                response;

            setImages(
                (currentImages) =>
                    currentImages.map(
                        (image) => {
                            if (
                                String(
                                    getImageId(
                                        image
                                    )
                                ) !==
                                String(
                                    imageId
                                )
                            ) {
                                return image;
                            }

                            return {
                                ...image,
                                ...(updatedImage &&
                                typeof updatedImage ===
                                    'object'
                                    ? updatedImage
                                    : {}),
                                image_alt:
                                    updatedImage?.image_alt ??
                                    trimmedAlt,
                            };
                        }
                    )
            );

            setAltDialog({
                open: false,
                image: null,
            });

            setAltText('');

            showMessage(
                'Alt text updated successfully'
            );
        } catch (error) {
            showMessage(
                error instanceof Error
                    ? error.message
                    : 'Failed to update alt text',
                'error'
            );
        } finally {
            setSavingAlt(false);
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
        if (deleting) {
            return;
        }

        setDeleteDialog({
            open: false,
            type: '',
            item: null,
        });
    };

    const handleConfirmDelete =
        async () => {
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
                        ) ===
                        String(categoryId)
                    ) {
                        clearSelectedFiles();
                        setSelectedCategoryId(
                            ''
                        );
                    }

                    await Promise.all([
                        loadCategories(),

                        loadImages({
                            page: 1,
                            reset: true,
                        }),
                    ]);

                    showMessage(
                        'Category deleted successfully'
                    );
                }

                if (
                    deleteDialog.type ===
                    'image'
                ) {
                    const imageId =
                        getImageId(
                            deleteDialog.item
                        );

                    await deleteGalleryImage(
                        imageId
                    );

                    setImages(
                        (
                            currentImages
                        ) =>
                            currentImages.filter(
                                (image) =>
                                    String(
                                        getImageId(
                                            image
                                        )
                                    ) !==
                                    String(
                                        imageId
                                    )
                            )
                    );

                    setTotalImages(
                        (currentTotal) =>
                            Math.max(
                                currentTotal -
                                    1,
                                0
                            )
                    );

                    showMessage(
                        'Media deleted successfully'
                    );
                }

                setDeleteDialog({
                    open: false,
                    type: '',
                    item: null,
                });
            } catch (error) {
                showMessage(
                    error instanceof Error
                        ? error.message
                        : 'Failed to delete item',
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
                    justifyContent:
                        'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    let categoryButtonText =
        'Create';

    if (savingCategory) {
        categoryButtonText =
            'Saving...';
    } else if (
        categoryDialog.mode === 'edit'
    ) {
        categoryButtonText =
            'Update';
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
                        Manage gallery
                        categories, images and
                        videos.
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
                            event.preventDefault();
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
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fill, minmax(240px, 1fr))',
                                alignItems:
                                    'flex-start',
                                gap: 1.5,
                            }}
                        >
                            {selectedFiles.map(
                                (item) => {
                                    const video =
                                        isVideoFile(
                                            item.file
                                        );

                                    const altLength =
                                        item
                                            .imageAlt
                                            ?.length ||
                                        0;

                                    return (
                                        <Paper
                                            key={
                                                item.id
                                            }
                                            variant="outlined"
                                            sx={{
                                                minWidth:
                                                    0,
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
                                                    item.imageAlt ||
                                                    item
                                                        .file
                                                        .name
                                                }
                                                file={
                                                    item.file
                                                }
                                                height={
                                                    150
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
                                                        '&:hover':
                                                            {
                                                                bgcolor:
                                                                    'background.paper',
                                                            },
                                                    }}
                                                >
                                                    ×
                                                </IconButton>
                                            </Tooltip>

                                            <Box
                                                sx={{
                                                    p: 1.25,
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
                                                        fontWeight: 600,
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
                                                    sx={{
                                                        mb: video
                                                            ? 0
                                                            : 1.25,
                                                    }}
                                                >
                                                    {video
                                                        ? 'Video'
                                                        : 'Image'}
                                                    {
                                                        ' • '
                                                    }
                                                    {formatFileSize(
                                                        item
                                                            .file
                                                            .size
                                                    )}
                                                </Typography>

                                                {!video && (
                                                    <TextField
                                                        fullWidth
                                                        required
                                                        multiline
                                                        minRows={
                                                            2
                                                        }
                                                        maxRows={
                                                            4
                                                        }
                                                        size="small"
                                                        label="Image alt text"
                                                        value={
                                                            item.imageAlt ||
                                                            ''
                                                        }
                                                        error={
                                                            !item.imageAlt?.trim() ||
                                                            altLength >
                                                                MAX_ALT_LENGTH
                                                        }
                                                        disabled={
                                                            uploading ||
                                                            compressing
                                                        }
                                                        onClick={(
                                                            event
                                                        ) =>
                                                            event.stopPropagation()
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateSelectedFileAlt(
                                                                item.id,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        inputProps={{
                                                            maxLength:
                                                                MAX_ALT_LENGTH,
                                                        }}
                                                        helperText={
                                                            !item.imageAlt?.trim()
                                                                ? 'Alt text is required'
                                                                : `${altLength}/${MAX_ALT_LENGTH} characters`
                                                        }
                                                    />
                                                )}

                                                {video && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        display="block"
                                                        sx={{
                                                            mt: 1,
                                                        }}
                                                    >
                                                        Alt text
                                                        is not
                                                        required
                                                        for video.
                                                    </Typography>
                                                )}

                                                {item.wasCompressed && (
                                                    <Typography
                                                        variant="caption"
                                                        color="success.main"
                                                        display="block"
                                                        sx={{
                                                            mt: 0.75,
                                                        }}
                                                    >
                                                        {formatFileSize(
                                                            item.originalSize
                                                        )}
                                                        {
                                                            ' → '
                                                        }
                                                        {formatFileSize(
                                                            item
                                                                .file
                                                                .size
                                                        )}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Paper>
                                    );
                                }
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
                            Showing {images.length}
                            {totalImages > 0
                                ? ` of ${totalImages}`
                                : ''}{' '}
                            media items grouped
                            by category.
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
                                                loaded
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
                                                    'grid',
                                                gridTemplateColumns:
                                                    'repeat(auto-fill, minmax(200px, 1fr))',
                                                alignItems:
                                                    'flex-start',
                                                gap: 1.5,
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

                                                    const imageAlt =
                                                        getImageAlt(
                                                            image
                                                        );

                                                    const video =
                                                        isVideoUrl(
                                                            imageUrl
                                                        );

                                                    return (
                                                        <Paper
                                                            key={getImageId(
                                                                image
                                                            )}
                                                            variant="outlined"
                                                            sx={{
                                                                minWidth: 0,
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
                                                                name={
                                                                    imageAlt ||
                                                                    getImageName(
                                                                        image
                                                                    )
                                                                }
                                                                controls={
                                                                    video
                                                                }
                                                                height={
                                                                    145
                                                                }
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
                                                                        '&:hover':
                                                                            {
                                                                                bgcolor:
                                                                                    'background.paper',
                                                                            },
                                                                    }}
                                                                >
                                                                    ×
                                                                </IconButton>
                                                            </Tooltip>

                                                            <Box
                                                                sx={{
                                                                    p: 1,
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

                                                                {!video && (
                                                                    <>
                                                                        <Typography
                                                                            variant="caption"
                                                                            color={
                                                                                imageAlt
                                                                                    ? 'text.secondary'
                                                                                    : 'error.main'
                                                                            }
                                                                            title={
                                                                                imageAlt
                                                                            }
                                                                            sx={{
                                                                                display:
                                                                                    '-webkit-box',
                                                                                mt: 0.5,
                                                                                minHeight: 34,
                                                                                overflow:
                                                                                    'hidden',
                                                                                WebkitBoxOrient:
                                                                                    'vertical',
                                                                                WebkitLineClamp: 2,
                                                                            }}
                                                                        >
                                                                            {imageAlt
                                                                                ? `Alt: ${imageAlt}`
                                                                                : 'Alt text not added'}
                                                                        </Typography>

                                                                        <Button
                                                                            fullWidth
                                                                            size="small"
                                                                            variant="outlined"
                                                                            sx={{
                                                                                mt: 1,
                                                                            }}
                                                                            onClick={() =>
                                                                                openAltDialog(
                                                                                    image
                                                                                )
                                                                            }
                                                                        >
                                                                            {imageAlt
                                                                                ? 'Edit Alt Text'
                                                                                : 'Add Alt Text'}
                                                                        </Button>
                                                                    </>
                                                                )}

                                                                {video && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                        sx={{
                                                                            display:
                                                                                'block',
                                                                            mt: 0.5,
                                                                        }}
                                                                    >
                                                                        Video
                                                                        media
                                                                    </Typography>
                                                                )}
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
                                                No media is
                                                currently
                                                loaded for
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
                                                Upload Media
                                            </Button>
                                        </Box>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        );
                    }
                )}

                {hasMoreImages && (
                    <Stack
                        alignItems="center"
                        spacing={1}
                        sx={{ mt: 3 }}
                    >
                        <Button
                            size="large"
                            variant="outlined"
                            disabled={
                                loadingMore ||
                                imagesLoading
                            }
                            onClick={
                                handleLoadMoreImages
                            }
                            startIcon={
                                loadingMore ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                ) : null
                            }
                        >
                            {loadingMore
                                ? 'Loading More...'
                                : 'Load More Media'}
                        </Button>

                        {totalImages > 0 && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {images.length} of{' '}
                                {totalImages} loaded
                            </Typography>
                        )}
                    </Stack>
                )}

                {!hasMoreImages &&
                    images.length > 0 &&
                    totalImages > 0 && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            align="center"
                            sx={{
                                display:
                                    'block',
                                mt: 3,
                            }}
                        >
                            All {totalImages}{' '}
                            media items are
                            loaded.
                        </Typography>
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
                                    'Enter' &&
                                !savingCategory
                            ) {
                                event.preventDefault();
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
                open={altDialog.open}
                onClose={closeAltDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {getImageAlt(
                        altDialog.image
                    )
                        ? 'Edit Image Alt Text'
                        : 'Add Image Alt Text'}
                </DialogTitle>

                <DialogContent>
                    {altDialog.image && (
                        <Box
                            sx={{
                                mt: 1,
                                mb: 2,
                                overflow:
                                    'hidden',
                                borderRadius: 1.5,
                                border:
                                    '1px solid',
                                borderColor:
                                    'divider',
                            }}
                        >
                            <MediaPreview
                                url={getImageUrl(
                                    altDialog.image
                                )}
                                name={
                                    altText ||
                                    getImageName(
                                        altDialog.image
                                    )
                                }
                                controls={isVideoUrl(
                                    getImageUrl(
                                        altDialog.image
                                    )
                                )}
                                height={260}
                            />
                        </Box>
                    )}

                    <TextField
                        autoFocus
                        fullWidth
                        required
                        multiline
                        minRows={3}
                        maxRows={6}
                        label="Image alt text"
                        placeholder="Describe what is visible in the image"
                        value={altText}
                        error={
                            altText.length >
                            MAX_ALT_LENGTH
                        }
                        disabled={savingAlt}
                        onChange={(event) =>
                            setAltText(
                                event.target
                                    .value
                            )
                        }
                        onKeyDown={(event) => {
                            if (
                                event.key ===
                                    'Enter' &&
                                (event.ctrlKey ||
                                    event.metaKey)
                            ) {
                                event.preventDefault();
                                handleSaveAlt();
                            }
                        }}
                        inputProps={{
                            maxLength:
                                MAX_ALT_LENGTH,
                        }}
                        helperText={`${altText.length}/${MAX_ALT_LENGTH} characters`}
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        color="inherit"
                        disabled={savingAlt}
                        onClick={
                            closeAltDialog
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        disabled={
                            savingAlt ||
                            !altText.trim() ||
                            altText.trim()
                                .length >
                                MAX_ALT_LENGTH
                        }
                        onClick={
                            handleSaveAlt
                        }
                        startIcon={
                            savingAlt ? (
                                <CircularProgress
                                    size={16}
                                    color="inherit"
                                />
                            ) : null
                        }
                    >
                        {savingAlt
                            ? 'Saving...'
                            : 'Save Alt Text'}
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
                        startIcon={
                            deleting ? (
                                <CircularProgress
                                    size={16}
                                    color="inherit"
                                />
                            ) : null
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
                    severity={message.severity}
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