import PropTypes from "prop-types";
import {
    useRef,
    useMemo,
    useState,
    useEffect,
} from "react";

import {
    Box,
    Card,
    Chip,
    Grid,
    Alert,
    Paper,
    Stack,
    Table,
    Button,
    Select,
    Divider,
    Tooltip,
    MenuItem,
    TableRow,
    TableBody,
    TableCell,
    TableHead,
    IconButton,
    InputLabel,
    Typography,
    CardContent,
    FormControl,
    LinearProgress,
    TableContainer,
    TablePagination,
    CircularProgress,
} from "@mui/material";

import Iconify from "src/components/iconify";


// ----------------------------------------------------------------------

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5001/api";

const CATEGORY_API = `${API_BASE_URL}/stones`;

const BULK_DESCRIPTION_API =
    `${API_BASE_URL}/bulk-descriptions`;

const ALLOWED_FILE_EXTENSION = ".xlsx";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const DEFAULT_ROWS_PER_PAGE = 10;

const EMPTY_SUMMARY = {
    total: 0,
    changed: 0,
    unchanged: 0,
    invalid: 0,
    both_descriptions_empty: 0,
};

// ----------------------------------------------------------------------

const getApiErrorMessage = async (
    response,
    fallbackMessage = "Something went wrong."
) => {
    try {
        const contentType =
            response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const result = await response.json();

            return (
                result?.message ||
                result?.error ||
                fallbackMessage
            );
        }

        const text = await response.text();

        return text || fallbackMessage;
    } catch {
        return fallbackMessage;
    }
};

// ----------------------------------------------------------------------

const normalizeCategories = (payload) => {
    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload)) {
        return payload;
    }

    return [];
};

// ----------------------------------------------------------------------

const getStatusChip = (status) => {
    switch (status) {
        case "changed":
            return {
                label: "Changed",
                color: "warning",
                icon: (
                    <Iconify
                        icon="solar:refresh-circle-bold"
                        width={16}
                    />
                ),
            };

        case "unchanged":
            return {
                label: "Unchanged",
                color: "success",
                icon: (
                    <Iconify
                        icon="solar:check-circle-bold"
                        width={16}
                    />
                ),
            };

        case "invalid":
            return {
                label: "Invalid",
                color: "error",
                icon: (
                    <Iconify
                        icon="solar:close-circle-bold"
                        width={16}
                    />
                ),
            };

        default:
            return {
                label: status || "Unknown",
                color: "default",
                icon: (
                    <Iconify
                        icon="solar:info-circle-bold"
                        width={16}
                    />
                ),
            };
    }
};

// ----------------------------------------------------------------------

const formatFileSize = (bytes) => {
    if (!bytes) {
        return "0 KB";
    }

    const sizeInKb = bytes / 1024;

    if (sizeInKb < 1024) {
        return `${sizeInKb.toFixed(1)} KB`;
    }

    return `${(sizeInKb / 1024).toFixed(1)} MB`;
};

// ----------------------------------------------------------------------

const truncateText = (
    value,
    maxLength = 100
) => {
    if (!value) {
        return "—";
    }

    const text = String(value);

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength)}...`;
};

// ----------------------------------------------------------------------

const getDownloadFileName = (
    contentDisposition,
    fallbackFileName
) => {
    if (!contentDisposition) {
        return fallbackFileName;
    }

    const utf8Match = contentDisposition.match(
        /filename\*=UTF-8''([^;]+)/
    );

    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1]);
    }

    const normalMatch = contentDisposition.match(
        /filename="?([^";]+)"?/
    );

    if (normalMatch?.[1]) {
        return normalMatch[1];
    }

    return fallbackFileName;
};

// ----------------------------------------------------------------------

function SummaryCard({
    label,
    value,
    icon,
    color = "text.primary",
}) {
    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                height: "100%",
                borderRadius: 2,
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
            >
                <Box>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {label}
                    </Typography>

                    <Typography
                        variant="h5"
                        fontWeight={700}
                        color={color}
                    >
                        {value}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "grid",
                        placeItems: "center",
                    }}
                >
                    {icon}
                </Box>
            </Stack>
        </Paper>
    );
}

SummaryCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    icon: PropTypes.node.isRequired,
    color: PropTypes.string,
};

// ----------------------------------------------------------------------

export default function BulkDesc() {
    const fileInputRef = useRef(null);

    const [categories, setCategories] =
        useState([]);

    const [
        selectedCategoryId,
        setSelectedCategoryId,
    ] = useState("");

    const [selectedFile, setSelectedFile] =
        useState(null);

    const [
        validationData,
        setValidationData,
    ] = useState(null);

    const [
        isLoadingCategories,
        setIsLoadingCategories,
    ] = useState(false);

    const [
        isDownloading,
        setIsDownloading,
    ] = useState(false);

    const [isValidating, setIsValidating] =
        useState(false);

    const [isUpdating, setIsUpdating] =
        useState(false);

    const [alert, setAlert] = useState(null);

    const [page, setPage] = useState(0);

    const [rowsPerPage, setRowsPerPage] =
        useState(DEFAULT_ROWS_PER_PAGE);

    // --------------------------------------------------------------------

    const selectedCategory = useMemo(
        () =>
            categories.find(
                (category) =>
                    String(category.id) ===
                    String(selectedCategoryId)
            ) || null,
        [categories, selectedCategoryId]
    );

    const validationRows = useMemo(
        () =>
            Array.isArray(validationData?.rows)
                ? validationData.rows
                : [],
        [validationData]
    );

    const summary = useMemo(
        () => ({
            ...EMPTY_SUMMARY,
            ...(validationData?.summary || {}),
        }),
        [validationData]
    );

    const changedRows = useMemo(
        () =>
            validationRows.filter(
                (row) => row.status === "changed"
            ),
        [validationRows]
    );

    const paginatedRows = useMemo(() => {
        const start = page * rowsPerPage;

        return validationRows.slice(
            start,
            start + rowsPerPage
        );
    }, [validationRows, page, rowsPerPage]);

    const canDownload =
        Boolean(selectedCategoryId) &&
        !isDownloading &&
        !isLoadingCategories;

    const canValidate =
        Boolean(selectedCategoryId) &&
        Boolean(selectedFile) &&
        !isValidating &&
        !isUpdating;

    const canUpdate =
        changedRows.length > 0 &&
        Number(summary.invalid || 0) === 0 &&
        !isUpdating &&
        !isValidating;

    // --------------------------------------------------------------------

    const showAlert = (
        severity,
        message
    ) => {
        setAlert({
            severity,
            message,
        });
    };

    const clearValidation = () => {
        setValidationData(null);
        setPage(0);
    };

    const resetFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        clearValidation();
        resetFileInput();
    };

    const resetPage = () => {
        setSelectedCategoryId("");
        setSelectedFile(null);
        setValidationData(null);
        setAlert(null);
        setPage(0);
        resetFileInput();
    };

    // --------------------------------------------------------------------
    // LOAD CATEGORIES
    // --------------------------------------------------------------------

    useEffect(() => {
        let isMounted = true;

        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            setAlert(null);

            try {
                const response = await fetch(
                    CATEGORY_API,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    const message =
                        await getApiErrorMessage(
                            response,
                            "Unable to load categories."
                        );

                    throw new Error(message);
                }

                const payload = await response.json();

                if (!isMounted) {
                    return;
                }

                const categoryList =
                    normalizeCategories(payload);

                setCategories(categoryList);

                if (categoryList.length === 0) {
                    showAlert(
                        "warning",
                        "No categories were found."
                    );
                }
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                showAlert(
                    "error",
                    error.message ||
                    "Unable to load categories."
                );
            } finally {
                if (isMounted) {
                    setIsLoadingCategories(false);
                }
            }
        };

        fetchCategories();

        return () => {
            isMounted = false;
        };
    }, []);

    // --------------------------------------------------------------------

    const handleCategoryChange = (event) => {
        setSelectedCategoryId(
            event.target.value
        );

        setSelectedFile(null);
        setValidationData(null);
        setAlert(null);
        setPage(0);

        resetFileInput();
    };

    // --------------------------------------------------------------------
    // DOWNLOAD TEMPLATE
    // --------------------------------------------------------------------

    const handleDownloadTemplate =
        async () => {
            if (!selectedCategoryId) {
                showAlert(
                    "warning",
                    "Please select a category first."
                );

                return;
            }

            setIsDownloading(true);
            setAlert(null);

            try {
                const response = await fetch(
                    `${BULK_DESCRIPTION_API}/template/${selectedCategoryId}?t=${Date.now()}`,
                    {
                        method: "GET",
                        cache: "no-store",
                        headers: {
                            Accept:
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "Cache-Control": "no-cache",
                            Pragma: "no-cache",
                        },
                    }
                );

                if (!response.ok) {
                    const message =
                        await getApiErrorMessage(
                            response,
                            "Unable to download the Excel template."
                        );

                    throw new Error(message);
                }

                const blob = await response.blob();

                const fallbackFileName = `${selectedCategory?.slug ||
                    selectedCategory?.name ||
                    "category"
                    }-Product-Descriptions.xlsx`;

                const fileName =
                    getDownloadFileName(
                        response.headers.get(
                            "content-disposition"
                        ),
                        fallbackFileName
                    );

                const blobUrl =
                    window.URL.createObjectURL(blob);

                const link =
                    document.createElement("a");

                link.href = blobUrl;
                link.download = fileName;

                document.body.appendChild(link);

                link.click();
                link.remove();

                window.URL.revokeObjectURL(blobUrl);

                showAlert(
                    "success",
                    `Template downloaded for ${selectedCategory?.name ||
                    "the selected category"
                    }.`
                );
            } catch (error) {
                showAlert(
                    "error",
                    error.message ||
                    "Unable to download the Excel template."
                );
            } finally {
                setIsDownloading(false);
            }
        };

    // --------------------------------------------------------------------
    // FILE SELECTION
    // --------------------------------------------------------------------

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        setAlert(null);
        clearValidation();

        if (!file) {
            setSelectedFile(null);
            return;
        }

        const fileName =
            file.name.toLowerCase();

        if (
            !fileName.endsWith(
                ALLOWED_FILE_EXTENSION
            )
        ) {
            setSelectedFile(null);

            showAlert(
                "error",
                "Only .xlsx Excel files are allowed."
            );

            event.target.value = "";

            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setSelectedFile(null);

            showAlert(
                "error",
                "The Excel file must be smaller than 10 MB."
            );

            event.target.value = "";

            return;
        }

        setSelectedFile(file);
    };

    // --------------------------------------------------------------------
    // VALIDATE EXCEL
    // --------------------------------------------------------------------

    const handleValidateExcel =
        async () => {
            if (!selectedCategoryId) {
                showAlert(
                    "warning",
                    "Please select a category."
                );

                return;
            }

            if (!selectedFile) {
                showAlert(
                    "warning",
                    "Please select an Excel file."
                );

                return;
            }

            const formData = new FormData();

            formData.append(
                "category_id",
                selectedCategoryId
            );

            formData.append(
                "file",
                selectedFile
            );

            setIsValidating(true);
            setAlert(null);
            clearValidation();

            try {
                const response = await fetch(
                    `${BULK_DESCRIPTION_API}/validate`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                if (!response.ok) {
                    const message =
                        await getApiErrorMessage(
                            response,
                            "Unable to validate the Excel file."
                        );

                    throw new Error(message);
                }

                const payload =
                    await response.json();

                const result =
                    payload?.data || null;

                setValidationData(result);
                setPage(0);

                const invalidCount =
                    Number(
                        result?.summary?.invalid
                    ) || 0;

                const changedCount =
                    Number(
                        result?.summary?.changed
                    ) || 0;

                if (invalidCount > 0) {
                    showAlert(
                        "warning",
                        `Validation completed with ${invalidCount} invalid row${invalidCount === 1 ? "" : "s"
                        }. Fix the Excel file and upload it again.`
                    );

                    return;
                }

                if (changedCount === 0) {
                    showAlert(
                        "info",
                        "Validation completed. No description changes were found."
                    );

                    return;
                }

                showAlert(
                    "success",
                    `Validation completed. ${changedCount} product${changedCount === 1 ? "" : "s"
                    } are ready to update.`
                );
            } catch (error) {
                showAlert(
                    "error",
                    error.message ||
                    "Unable to validate the Excel file."
                );
            } finally {
                setIsValidating(false);
            }
        };

    // --------------------------------------------------------------------
    // BULK UPDATE
    // --------------------------------------------------------------------

    const handleBulkUpdate = async () => {
        if (!validationData) {
            showAlert(
                "warning",
                "Please validate the Excel file first."
            );

            return;
        }

        if (Number(summary.invalid) > 0) {
            showAlert(
                "error",
                "The file contains invalid rows. Fix them before updating."
            );

            return;
        }

        if (changedRows.length === 0) {
            showAlert(
                "info",
                "There are no changed descriptions to update."
            );

            return;
        }

        const updateRows = changedRows.map(
            (row) => ({
                product_id: row.product_id,
                long_description:
                    row.long_description ?? "",
                short_description:
                    row.short_description ?? "",
            })
        );

        setIsUpdating(true);
        setAlert(null);

        try {
            const response = await fetch(
                `${BULK_DESCRIPTION_API}/update`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        category_id: Number(
                            selectedCategoryId
                        ),
                        rows: updateRows,
                    }),
                }
            );

            if (!response.ok) {
                const message =
                    await getApiErrorMessage(
                        response,
                        "Unable to update product descriptions."
                    );

                throw new Error(message);
            }

            const payload =
                await response.json();

            const result =
                payload?.data || {};

            showAlert(
                "success",
                `${result.updated || 0} product description${Number(result.updated || 0) === 1
                    ? ""
                    : "s"
                } updated successfully. ${result.unchanged || 0
                } unchanged and ${result.failed || 0
                } failed.`
            );

            setValidationData((current) => {
                if (!current) {
                    return current;
                }

                const updatedRows =
                    current.rows.map((row) => {
                        if (
                            row.status !== "changed"
                        ) {
                            return row;
                        }

                        return {
                            ...row,
                            status: "unchanged",
                            current_long_description:
                                row.long_description,
                            current_short_description:
                                row.short_description,
                            long_description_changed:
                                false,
                            short_description_changed:
                                false,
                        };
                    });

                return {
                    ...current,
                    rows: updatedRows,
                    summary: {
                        ...current.summary,
                        changed: 0,
                        unchanged:
                            Number(
                                current.summary?.unchanged ||
                                0
                            ) +
                            Number(result.updated || 0),
                    },
                };
            });
        } catch (error) {
            showAlert(
                "error",
                error.message ||
                "Unable to update product descriptions."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    // --------------------------------------------------------------------

    const handlePageChange = (
        event,
        newPage
    ) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (
        event
    ) => {
        setRowsPerPage(
            Number.parseInt(
                event.target.value,
                10
            )
        );

        setPage(0);
    };

    // --------------------------------------------------------------------

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                alignItems={{
                    xs: "flex-start",
                    sm: "center",
                }}
                justifyContent="space-between"
                spacing={2}
                mb={3}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Bulk Product Descriptions
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Download category products, edit
                        descriptions in Excel, validate,
                        and update them in bulk.
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={
                        <Iconify
                            icon="solar:restart-bold"
                            width={18}
                        />
                    }
                    onClick={resetPage}
                    disabled={
                        isDownloading ||
                        isValidating ||
                        isUpdating
                    }
                >
                    Reset
                </Button>
            </Stack>

            {alert && (
                <Alert
                    severity={alert.severity}
                    onClose={() => setAlert(null)}
                    sx={{ mb: 3 }}
                >
                    {alert.message}
                </Alert>
            )}

            <Card
                variant="outlined"
                sx={{ mb: 3 }}
            >
                <CardContent>
                    <Stack spacing={3}>
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                1. Select Category
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Select the product category you
                                want to review or update.
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                                <FormControl
                                    fullWidth
                                    disabled={
                                        isLoadingCategories ||
                                        isDownloading ||
                                        isValidating ||
                                        isUpdating
                                    }
                                >
                                    <InputLabel id="bulk-description-category-label">
                                        Category
                                    </InputLabel>

                                    <Select
                                        labelId="bulk-description-category-label"
                                        value={
                                            selectedCategoryId
                                        }
                                        label="Category"
                                        onChange={
                                            handleCategoryChange
                                        }
                                    >
                                        {categories.map(
                                            (category) => (
                                                <MenuItem
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        spacing={1}
                                                        width="100%"
                                                    >
                                                        <Typography>
                                                            {category.name}
                                                        </Typography>

                                                        {!category.is_active && (
                                                            <Chip
                                                                label="Inactive"
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Stack>
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>
                                </FormControl>

                                {isLoadingCategories && (
                                    <LinearProgress
                                        sx={{ mt: 1 }}
                                    />
                                )}
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={
                                        isDownloading ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        ) : (
                                            <Iconify
                                                icon="solar:download-minimalistic-bold"
                                                width={18}
                                            />
                                        )
                                    }
                                    disabled={!canDownload}
                                    onClick={
                                        handleDownloadTemplate
                                    }
                                    sx={{ height: 56 }}
                                >
                                    {isDownloading
                                        ? "Downloading..."
                                        : "Download Template"}
                                </Button>
                            </Grid>
                        </Grid>

                        {selectedCategory && (
                            <Alert severity="info">
                                The Excel file will contain all
                                products under{" "}
                                <strong>
                                    {selectedCategory.name}
                                </strong>
                                , including their current long
                                and short descriptions.
                            </Alert>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            <Card
                variant="outlined"
                sx={{ mb: 3 }}
            >
                <CardContent>
                    <Stack spacing={3}>
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                2. Upload Completed Excel
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Upload the same Excel file
                                after reviewing or editing the
                                descriptions.
                            </Typography>
                        </Box>

                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                borderStyle: "dashed",
                                borderWidth: 2,
                                borderRadius: 2,
                                textAlign: "center",
                            }}
                        >
                            {!selectedFile ? (
                                <Stack
                                    spacing={2}
                                    alignItems="center"
                                >
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: "50%",
                                            bgcolor: "action.hover",
                                            display: "grid",
                                            placeItems: "center",
                                        }}
                                    >
                                        <Iconify
                                            icon="solar:cloud-upload-bold-duotone"
                                            width={30}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                        >
                                            Select completed Excel file
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Only .xlsx files up to 10 MB
                                            are supported.
                                        </Typography>
                                    </Box>

                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={
                                            <Iconify
                                                icon="solar:file-text-bold"
                                                width={18}
                                            />
                                        }
                                        disabled={
                                            !selectedCategoryId ||
                                            isValidating ||
                                            isUpdating
                                        }
                                    >
                                        Choose Excel File

                                        <input
                                            ref={fileInputRef}
                                            hidden
                                            type="file"
                                            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                            onChange={
                                                handleFileChange
                                            }
                                        />
                                    </Button>
                                </Stack>
                            ) : (
                                <Stack
                                    direction={{
                                        xs: "column",
                                        sm: "row",
                                    }}
                                    alignItems={{
                                        xs: "stretch",
                                        sm: "center",
                                    }}
                                    justifyContent="space-between"
                                    spacing={2}
                                >
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={2}
                                        minWidth={0}
                                    >
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 1.5,
                                                bgcolor:
                                                    "success.lighter",
                                                display: "grid",
                                                placeItems: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Iconify
                                                icon="solar:file-text-bold"
                                                width={24}
                                            />
                                        </Box>

                                        <Box
                                            minWidth={0}
                                            textAlign="left"
                                        >
                                            <Typography
                                                fontWeight={600}
                                                noWrap
                                            >
                                                {selectedFile.name}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {formatFileSize(
                                                    selectedFile.size
                                                )}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        justifyContent={{
                                            xs: "flex-end",
                                            sm: "initial",
                                        }}
                                    >
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            size="small"
                                            disabled={
                                                isValidating ||
                                                isUpdating
                                            }
                                        >
                                            Replace

                                            <input
                                                hidden
                                                type="file"
                                                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                                onChange={
                                                    handleFileChange
                                                }
                                            />
                                        </Button>

                                        <Tooltip title="Remove file">
                                            <span>
                                                <IconButton
                                                    color="error"
                                                    onClick={clearFile}
                                                    disabled={
                                                        isValidating ||
                                                        isUpdating
                                                    }
                                                >
                                                    <Iconify
                                                        icon="solar:close-circle-bold"
                                                        width={22}
                                                    />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            )}
                        </Paper>

                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={
                                isValidating ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                ) : (
                                    <Iconify
                                        icon="solar:upload-minimalistic-bold"
                                        width={18}
                                    />
                                )
                            }
                            disabled={!canValidate}
                            onClick={handleValidateExcel}
                            sx={{ minHeight: 48 }}
                        >
                            {isValidating
                                ? "Validating Excel..."
                                : "Validate Excel"}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {validationData && (
                <>
                    <Card
                        variant="outlined"
                        sx={{ mb: 3 }}
                    >
                        <CardContent>
                            <Stack spacing={3}>
                                <Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                    >
                                        3. Validation Summary
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mt={0.5}
                                    >
                                        Review the results before
                                        updating the database.
                                    </Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid
                                        item
                                        xs={6}
                                        md={2.4}
                                    >
                                        <SummaryCard
                                            label="Total"
                                            value={summary.total}
                                            icon={
                                                <Iconify
                                                    icon="solar:file-text-bold"
                                                    width={26}
                                                />
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={6}
                                        md={2.4}
                                    >
                                        <SummaryCard
                                            label="Changed"
                                            value={summary.changed}
                                            color="warning.main"
                                            icon={
                                                <Iconify
                                                    icon="solar:refresh-circle-bold"
                                                    width={26}
                                                />
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={6}
                                        md={2.4}
                                    >
                                        <SummaryCard
                                            label="Unchanged"
                                            value={summary.unchanged}
                                            color="success.main"
                                            icon={
                                                <Iconify
                                                    icon="solar:check-circle-bold"
                                                    width={26}
                                                />
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={6}
                                        md={2.4}
                                    >
                                        <SummaryCard
                                            label="Invalid"
                                            value={summary.invalid}
                                            color="error.main"
                                            icon={
                                                <Iconify
                                                    icon="solar:close-circle-bold"
                                                    width={26}
                                                />
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        md={2.4}
                                    >
                                        <SummaryCard
                                            label="Both Empty"
                                            value={
                                                summary.both_descriptions_empty
                                            }
                                            color="text.secondary"
                                            icon={
                                                <Iconify
                                                    icon="solar:info-circle-bold"
                                                    width={26}
                                                />
                                            }
                                        />
                                    </Grid>
                                </Grid>

                                {summary.invalid > 0 && (
                                    <Alert severity="error">
                                        This file contains invalid
                                        rows. The bulk update button
                                        will remain disabled until the
                                        Excel file is corrected and
                                        validated again.
                                    </Alert>
                                )}

                                {summary.invalid === 0 &&
                                    summary.changed === 0 && (
                                        <Alert severity="info">
                                            All uploaded descriptions
                                            are identical to the current
                                            database values. No update is
                                            required.
                                        </Alert>
                                    )}
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card
                        variant="outlined"
                        sx={{ mb: 3 }}
                    >
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ p: 2.5 }}>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    Validation Preview
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={0.5}
                                >
                                    Changed, unchanged and invalid
                                    products from the uploaded file.
                                </Typography>
                            </Box>

                            <Divider />

                            <TableContainer>
                                <Table
                                    size="small"
                                    sx={{ minWidth: 1500 }}
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Row</TableCell>

                                            <TableCell>
                                                Product ID
                                            </TableCell>

                                            <TableCell>
                                                Product
                                            </TableCell>

                                            <TableCell>
                                                Current Long Description
                                            </TableCell>

                                            <TableCell>
                                                Uploaded Long Description
                                            </TableCell>

                                            <TableCell>
                                                Current Short Description
                                            </TableCell>

                                            <TableCell>
                                                Uploaded Short Description
                                            </TableCell>

                                            <TableCell>
                                                Status
                                            </TableCell>

                                            <TableCell>
                                                Errors
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {paginatedRows.length ===
                                            0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={9}
                                                    align="center"
                                                    sx={{ py: 5 }}
                                                >
                                                    No rows found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedRows.map(
                                                (row) => {
                                                    const statusChip =
                                                        getStatusChip(
                                                            row.status
                                                        );

                                                    return (
                                                        <TableRow
                                                            key={`${row.row_number}-${row.product_id}`}
                                                            hover
                                                            sx={{
                                                                bgcolor:
                                                                    row.status ===
                                                                        "invalid"
                                                                        ? "error.lighter"
                                                                        : "inherit",
                                                            }}
                                                        >
                                                            <TableCell>
                                                                {row.row_number}
                                                            </TableCell>

                                                            <TableCell>
                                                                {row.product_id ||
                                                                    "—"}
                                                            </TableCell>

                                                            <TableCell
                                                                sx={{
                                                                    minWidth: 180,
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {row.product_name ||
                                                                    "—"}
                                                            </TableCell>

                                                            <TableCell
                                                                sx={{
                                                                    minWidth: 260,
                                                                    maxWidth: 320,
                                                                }}
                                                            >
                                                                <Tooltip
                                                                    title={
                                                                        row.current_long_description ||
                                                                        ""
                                                                    }
                                                                    placement="top"
                                                                    arrow
                                                                >
                                                                    <Typography variant="body2">
                                                                        {truncateText(
                                                                            row.current_long_description,
                                                                            120
                                                                        )}
                                                                    </Typography>
                                                                </Tooltip>
                                                            </TableCell>

                                                            <TableCell
                                                                sx={{
                                                                    minWidth: 260,
                                                                    maxWidth: 320,
                                                                    bgcolor:
                                                                        row.long_description_changed
                                                                            ? "warning.lighter"
                                                                            : "inherit",
                                                                }}
                                                            >
                                                                <Tooltip
                                                                    title={
                                                                        row.long_description ||
                                                                        ""
                                                                    }
                                                                    placement="top"
                                                                    arrow
                                                                >
                                                                    <Typography variant="body2">
                                                                        {truncateText(
                                                                            row.long_description,
                                                                            120
                                                                        )}
                                                                    </Typography>
                                                                </Tooltip>
                                                            </TableCell>

                                                            <TableCell
                                                                sx={{
                                                                    minWidth: 220,
                                                                    maxWidth: 280,
                                                                }}
                                                            >
                                                                <Tooltip
                                                                    title={
                                                                        row.current_short_description ||
                                                                        ""
                                                                    }
                                                                    placement="top"
                                                                    arrow
                                                                >
                                                                    <Typography variant="body2">
                                                                        {truncateText(
                                                                            row.current_short_description,
                                                                            100
                                                                        )}
                                                                    </Typography>
                                                                </Tooltip>
                                                            </TableCell>

                                                            <TableCell
                                                                sx={{
                                                                    minWidth: 220,
                                                                    maxWidth: 280,
                                                                    bgcolor:
                                                                        row.short_description_changed
                                                                            ? "warning.lighter"
                                                                            : "inherit",
                                                                }}
                                                            >
                                                                <Tooltip
                                                                    title={
                                                                        row.short_description ||
                                                                        ""
                                                                    }
                                                                    placement="top"
                                                                    arrow
                                                                >
                                                                    <Typography variant="body2">
                                                                        {truncateText(
                                                                            row.short_description,
                                                                            100
                                                                        )}
                                                                    </Typography>
                                                                </Tooltip>
                                                            </TableCell>

                                                            <TableCell>
                                                                <Chip
                                                                    size="small"
                                                                    label={
                                                                        statusChip.label
                                                                    }
                                                                    color={
                                                                        statusChip.color
                                                                    }
                                                                    icon={
                                                                        statusChip.icon
                                                                    }
                                                                    variant={
                                                                        row.status ===
                                                                            "unchanged"
                                                                            ? "outlined"
                                                                            : "filled"
                                                                    }
                                                                />
                                                            </TableCell>

                                                            <TableCell
                                                                sx={{
                                                                    minWidth: 240,
                                                                }}
                                                            >
                                                                {Array.isArray(
                                                                    row.errors
                                                                ) &&
                                                                    row.errors.length >
                                                                    0 ? (
                                                                    <Stack spacing={0.5}>
                                                                        {row.errors.map(
                                                                            (
                                                                                error,
                                                                                errorIndex
                                                                            ) => (
                                                                                <Typography
                                                                                    key={`${row.row_number}-error-${errorIndex}`}
                                                                                    variant="caption"
                                                                                    color="error"
                                                                                    display="block"
                                                                                >
                                                                                    • {error}
                                                                                </Typography>
                                                                            )
                                                                        )}
                                                                    </Stack>
                                                                ) : (
                                                                    "—"
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Divider />

                            <TablePagination
                                component="div"
                                count={validationRows.length}
                                page={page}
                                onPageChange={
                                    handlePageChange
                                }
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={
                                    handleRowsPerPageChange
                                }
                                rowsPerPageOptions={[
                                    10,
                                    25,
                                    50,
                                    100,
                                ]}
                            />
                        </CardContent>
                    </Card>

                    <Card variant="outlined">
                        <CardContent>
                            <Stack
                                direction={{
                                    xs: "column",
                                    md: "row",
                                }}
                                alignItems={{
                                    xs: "stretch",
                                    md: "center",
                                }}
                                justifyContent="space-between"
                                spacing={2}
                            >
                                <Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                    >
                                        4. Confirm Bulk Update
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mt={0.5}
                                    >
                                        {changedRows.length} changed
                                        product
                                        {changedRows.length === 1
                                            ? ""
                                            : "s"}{" "}
                                        will be updated. No products
                                        will be created.
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    startIcon={
                                        isUpdating ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        ) : (
                                            <Iconify
                                                icon="solar:check-circle-bold"
                                                width={18}
                                            />
                                        )
                                    }
                                    disabled={!canUpdate}
                                    onClick={handleBulkUpdate}
                                    sx={{
                                        minWidth: 220,
                                        minHeight: 48,
                                    }}
                                >
                                    {isUpdating
                                        ? "Updating..."
                                        : `Update ${changedRows.length} Products`}
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </>
            )}
        </Box>
    );
}