import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Alert, Paper, Autocomplete } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';

import { getCategories } from 'src/services/category.service';
import { getLookupDetails } from 'src/services/lookup.service';

import { canEditSEO, canEditMedia, canEditIdentity, canEditDescription, canEditStoneDetails, canEditApplications } from './role-access';

// ---------------------------------------------------------------------------

const defaultForm = {
    name: '',
    slug: '',
    small_description: '',
    long_description: '',
    category_id: '',
    sealer: '',

    closeup_images: [],
    slab_images: [],
    featured_videos: [],
    application_images: [],
    bookmatch_slipmatch: [],

    finishes_available: [],
    pattern: '',
    thicknesses_cm: [],
    average_sizes_inches: [],
    stone_group: '',
    translucent: false,
    cut_to_size: false,
    origin_country: '',
    pantone_colour: '',

    color_enhancing: false,
    countertops_vanities: false,
    interior_floor: false,
    interior_wall: false,
    shower_wall: false,
    shower_floor: false,
    exterior_floor: false,
    exterior_wall: false,
    pool_fountain: false,
    fireplace: false,
    furniture_top: false,


    silica_warning: false,
    silica_warning_message: null,
    silica_datasheet_url: null,
    silica_datasheet_file: null,



    abrasion_resistance: 'LOW',
    stain_resistance: 'LOW',
    etching_resistance: 'LOW',
    heat_resistance: 'LOW',
    uv_resistance: 'LOW',
    color_range: 'LOW',
    movement_index: 'LOW',

    variation_level: 'V1',

    is_featured: false,
    is_trending: false,
    is_new_arrival: false,
    is_active: false,

    // =====================================
    // SEO
    // =====================================

    meta_title: '',
    meta_description: '',
    canonical_url: '',

    og_title: '',
    og_description: '',
    og_image: '',

    schema_markup: '',

    robots_index: true,
    robots_follow: true,

    seo_content: '',

    // =====================================
    // FAQ
    // =====================================

    faqs: [],
};
// ---------------------------------------------------------------------------

const RESISTANCE_FIELDS = [
    ['abrasion_resistance', 'Abrasion Resistance'],
    ['stain_resistance', 'Stain Resistance'],
    ['etching_resistance', 'Etching Resistance'],
    ['heat_resistance', 'Heat Resistance'],
    ['uv_resistance', 'UV Resistance'],
    ['color_range', 'Color Range'],
    ['movement_index', 'Movement Index'],
];

const APPLICATION_FIELDS = [
    ['color_enhancing', 'Color Enhancing'],
    ['countertops_vanities', 'Countertops / Vanities'],
    ['interior_floor', 'Interior Floor'],
    ['interior_wall', 'Interior Wall'],
    ['shower_wall', 'Shower Wall'],
    ['shower_floor', 'Shower Floor'],
    ['exterior_floor', 'Exterior Floor'],
    ['exterior_wall', 'Exterior Wall'],
    ['pool_fountain', 'Pool / Fountain'],
    ['fireplace', 'Fireplace'],
    ['furniture_top', 'Furniture Top'],
];

// ---------------------------------------------------------------------------

function SectionLabel({ children }) {
    return (
        <Typography
            variant="subtitle2"
            sx={{
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: 'text.secondary',
            }}
        >
            {children}
        </Typography>
    );
}

SectionLabel.propTypes = {
    children: PropTypes.node.isRequired,
};

function ResistanceBadge({ value }) {
    const colorMap = { LOW: 'error', MEDIUM: 'warning', HIGH: 'success' };
    return (
        <Chip
            size="small"
            label={value}
            color={colorMap[value] || 'default'}
            sx={{ ml: 1, fontSize: 10, height: 20 }}
        />
    );
}
ResistanceBadge.propTypes = {
    value: PropTypes.oneOf(['LOW', 'MEDIUM', 'HIGH']).isRequired,
};

// ---------------------------------------------------------------------------
// Media upload button + inline preview grid
// ---------------------------------------------------------------------------

function MediaUploadField({ label, accept, icon, fieldKey, previews, onFilesSelected, onRemove }) {
    const inputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        onFilesSelected(fieldKey, files);
        // Reset so the same file can be re-selected if removed
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
                    '&:hover': { borderStyle: 'solid' },
                }}
            >
                <span style={{ fontSize: 22 }}>{icon}</span>
                <Typography variant="caption">{label}</Typography>
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
                        const fileSize = item.file?.size || item.size || 0;

                        const maxSize = isVideo
                            ? 100 * 1024 * 1024
                            : 10 * 1024 * 1024;

                        const exceedsLimit = fileSize > maxSize;
                        return (


                            <Grid item key={idx} xs={6} sm={4}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        borderRadius: 1.5,
                                        overflow: 'hidden',
                                        border: '1px solid',
                                        borderColor: exceedsLimit
                                            ? 'error.main'
                                            : 'divider',
                                        bgcolor: 'background.neutral',
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
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                            muted
                                            onMouseEnter={(e) => e.currentTarget.play()}
                                            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                        />
                                    ) : (
                                        <Box
                                            component="img"
                                            src={item.url}
                                            alt={item.name}
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                    )}

                                    {/* Remove button */}
                                    <IconButton
                                        size="small"
                                        onClick={() => onRemove(fieldKey, idx)}
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            bgcolor: 'rgba(0,0,0,0.55)',
                                            color: 'white',
                                            width: 22,
                                            height: 22,
                                            fontSize: 12,
                                            '&:hover': { bgcolor: 'error.main' },
                                        }}
                                    >
                                        ✕
                                    </IconButton>

                                    {/* File name tooltip at bottom */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            px: 0.75,
                                            py: 0.4,
                                            bgcolor: 'rgba(0,0,0,0.5)',
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'white',
                                                fontSize: 9,
                                                display: 'block',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {item.name}
                                        </Typography>

                                        {item.file && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'rgba(255,255,255,0.8)',
                                                    fontSize: 8,
                                                    display: 'block',
                                                }}
                                            >
                                                {(item.file.size / 1024 / 1024).toFixed(2)} MB / {isVideo ? '100 MB' : '10 MB'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        )
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
    previews: PropTypes.arrayOf(PropTypes.shape({ url: PropTypes.string, name: PropTypes.string })).isRequired,
    onFilesSelected: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
};

// ---------------------------------------------------------------------------

const defaultPreviews = {
    closeup_images: [],
    slab_images: [],
    featured_videos: [],
    application_images: [],
    bookmatch_slipmatch: [],
};

export default function ProductQuickEdit({ open, onClose, loading, onSubmit, currentProduct }) {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState(defaultForm);
    const [activeTab, setActiveTab] = useState(0);
    const [mediaPreviews, setMediaPreviews] = useState(defaultPreviews);
    const [countries, setCountries] = useState([]);
    const [stone_group, setStone_group] = useState([])
    const [finishes_available, setFinishes_available] = useState([]);
    const [thicknesses_cm, setThicknesses_cm] = useState([])

    useEffect(() => {
        fetchStonegroup();
        fetchCountries();
        loadCategories();
        fetchThickness();
        fetchFinish();
    }, [open]);

    const fetchFinish = async () => {
        try {
            const response =
                await getLookupDetails(5);

            setFinishes_available(response.data || []);
        } catch (error) {
            console.error(
                'Failed to load Finishes:',
                error
            );
        }
    };

    const fetchThickness = async () => {
        try {
            const response =
                await getLookupDetails(4);

            setThicknesses_cm(response.data || []);
        } catch (error) {
            console.error(
                'Failed to load Thickness:',
                error
            );
        }
    };

    const fetchStonegroup = async () => {
        try {
            const response =
                await getLookupDetails(2);

            setStone_group(response.data || []);
        } catch (error) {
            console.error(
                'Failed to load Stone Groups:',
                error
            );
        }
    };

    const fetchCountries = async () => {
        try {
            const response =
                await getLookupDetails(3);

            setCountries(response.data || []);
        } catch (error) {
            console.error(
                'Failed to load countries:',
                error
            );
        }
    };

    const formatSchemaMarkup = (schema) => {
        if (!schema) return '';
        if (typeof schema === 'object') return JSON.stringify(schema, null, 2);
        return schema;
    };

    const loadCategories = async () => {
        try {
            const response = await getCategories();

            const activeCategories = (response.data || []).filter(
                (category) => category.is_active
            );

            setCategories(activeCategories);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (currentProduct) {
            setFormData({
                ...defaultForm,
                ...currentProduct,
                ...(currentProduct.seo || {}),
                schema_markup: formatSchemaMarkup(currentProduct.seo?.schema_markup),
            });
        } else {
            setFormData(defaultForm);
        }
        setActiveTab(0);
        setMediaPreviews((prev) => {
            Object.values(prev).flat().forEach((item) => {
                if (item.url?.startsWith('blob:')) URL.revokeObjectURL(item.url);
            });
            return defaultPreviews;
        });
    }, [currentProduct, open]);



    const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

    const handleCommaSplit = (field, raw) => handleChange(field, raw.split(',').map((v) => v.trim()).filter(Boolean));


    // ── Media handlers ────────────────────────────────────────────────────────

    const handleFilesSelected = (fieldKey, files) => {
        const newItems = files.map((file) => ({
            url: URL.createObjectURL(file),
            name: file.name,
            file,
        }));
        setMediaPreviews((prev) => ({
            ...prev,
            [fieldKey]: [...prev[fieldKey], ...newItems],
        }));
        // Also store File objects in formData for submission
        setFormData((prev) => ({
            ...prev,
            [fieldKey]: [...(prev[fieldKey] || []), ...files],
        }));
    };

    const handleRemovePreview = (fieldKey, idx) => {
        setMediaPreviews((prev) => {
            const updated = [...prev[fieldKey]];
            const removed = updated.splice(idx, 1)[0];
            if (removed?.url?.startsWith('blob:')) URL.revokeObjectURL(removed.url);
            return { ...prev, [fieldKey]: updated };
        });
        setFormData((prev) => {
            const updated = [...(prev[fieldKey] || [])];
            updated.splice(idx, 1);
            return { ...prev, [fieldKey]: updated };
        });
    };

    // ── Tabs ──────────────────────────────────────────────────────────────────

    const tabs = [
        { label: 'Basic Info', icon: '📋' },
        { label: 'Media', icon: '🖼️' },
        { label: 'Applications', icon: '🔧' },
        { label: 'Specifications', icon: '📊' },
        { label: 'SEO', icon: '🌐' },
        { label: 'FAQ', icon: '❓' },
    ];

    const MEDIA_FIELDS = [
        { label: 'Closeup Images', field: 'closeup_images', accept: 'image/*', icon: '🔍' },
        { label: 'Slab Images', field: 'slab_images', accept: 'image/*', icon: '🪨' },
        { label: 'Application Images (3D)', field: 'application_images', accept: 'image/*', icon: '🏢' },
        { label: 'Bookmatch/Slipmatch', field: 'bookmatch_slipmatch', accept: 'image/*', icon: '🪞' },
        { label: 'Featured Videos', field: 'featured_videos', accept: 'video/*', icon: '🎬' },
    ];

    const generateSlug = (text) =>
        text
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");


    const handleAltTextChange = (
        mediaId,
        value
    ) => {
        setFormData((prev) => ({
            ...prev,
            media: prev.media.map((media) =>
                media.id === mediaId
                    ? {
                        ...media,
                        alt_text: value,
                    }
                    : media
            ),
        }));
    };

    const addFaq = () => {
        setFormData((prev) => ({
            ...prev,
            faqs: [
                ...(prev.faqs || []),
                {
                    question: '',
                    answer: '',
                },
            ],
        }));
    };

    const removeFaq = (index) => {
        setFormData((prev) => ({
            ...prev,
            faqs: prev.faqs.filter(
                (_, i) => i !== index
            ),
        }));
    };

    const updateFaq = (
        index,
        field,
        value
    ) => {
        setFormData((prev) => ({
            ...prev,
            faqs: prev.faqs.map(
                (faq, i) =>
                    i === index
                        ? {
                            ...faq,
                            [field]: value,
                        }
                        : faq
            ),
        }));
    };

    const silicaData = {
        warning:
            formData.silica_warning ??
            formData.stone_categories?.silica_warning ??
            false,

        message:
            formData.silica_warning_message ||
            formData.stone_categories?.silica_warning_message ||
            "",

        datasheet:
        formData.silica_warning_datasheet || // NEW FILE
        formData.silica_datasheet_url ||     // EXISTING URL
        formData.stone_categories?.silica_datasheet_url ||
            ""
    };

    const handleSilicaFileChange = (event) => {
        const file = event.target.files?.[0];

        handleChange(
            "silica_warning_datasheet",
            file || null
        );
    };
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{
            sx: {
                height: '90vh',
                maxHeight: '90vh',
            },
        }}>
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <DialogTitle sx={{ px: 4, py: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 1.5,
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: 18,
                            }}
                        >
                            {currentProduct ? '✏️' : '＋'}
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                                {currentProduct ? 'Edit Product' : 'New Product'}
                            </Typography>
                            {currentProduct?.name && (
                                <Typography variant="caption" color="text.secondary">
                                    {currentProduct.name}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </Stack>

                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{
                        mt: 3,
                        '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600 },
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabs.map((t, i) => (
                        <Tab
                            key={i}
                            label={
                                <Stack direction="row" alignItems="center" spacing={0.75}>
                                    <span style={{ fontSize: 14 }}>{t.icon}</span>
                                    <span>{t.label}</span>
                                </Stack>
                            }
                            sx={{ minHeight: 44, fontSize: 13 }}
                        />
                    ))}
                </Tabs>
                <Divider />
            </DialogTitle>

            {/* ── Body ───────────────────────────────────────────────────────── */}
            <DialogContent sx={{ minHeight: 420 }}>

                {/* ── TAB 0: Basic Info ─────────────────────────────────────── */}
                {activeTab === 0 && (
                    <Stack spacing={3}>
                        <SectionLabel>Identity</SectionLabel>
                        <Grid container spacing={2.5} sx={{ width: '100%', m: 0 }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Product Name"
                                    value={formData.name}
                                    onChange={(e) => {
                                        const name = e.target.value;

                                        handleChange("name", name);
                                        handleChange("slug", generateSlug(name));
                                    }}
                                    disabled={!canEditIdentity()}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Slug" value={formData.slug}
                                    onChange={(e) => handleChange('slug', e.target.value)} disabled={!canEditIdentity()}
                                    InputProps={{
                                        startAdornment: (
                                            <Typography variant="body2" color="text.disabled" sx={{ mr: 0.5 }}>/</Typography>
                                        ),
                                    }} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    options={categories}
                                    getOptionLabel={(option) =>
                                        option?.name || ''
                                    }
                                    value={
                                        categories.find(
                                            (category) =>
                                                category.id ===
                                                formData.category_id
                                        ) || null
                                    }
                                    disabled={!canEditIdentity()}
                                    onChange={(_, value) =>
                                        handleChange(
                                            'category_id',
                                            value?.id || ''
                                        )
                                    }
                                    isOptionEqualToValue={(option, value) =>
                                        option.id === value.id
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Category"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    options={countries}
                                    getOptionLabel={(option) =>
                                        option?.value_name || ''
                                    }
                                    value={
                                        countries.find(
                                            (country) =>
                                                country.value_name ===
                                                formData.origin_country
                                        ) || null
                                    }
                                    disabled={!canEditIdentity()}
                                    onChange={(_, value) =>
                                        handleChange(
                                            'origin_country',
                                            value?.value_name || ''
                                        )
                                    }
                                    isOptionEqualToValue={(option, value) =>
                                        option.id === value.id
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Origin Country"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        <Divider />
                        <SectionLabel>Descriptions</SectionLabel>
                        <Grid container spacing={2.5} sx={{ width: '100%', m: 0 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Short Description"
                                    disabled={!canEditDescription()}
                                    value={formData.small_description}
                                    onChange={(e) =>
                                        handleChange(
                                            'small_description',
                                            e.target.value.slice(0, 100)
                                        )
                                    }
                                    inputProps={{ maxLength: 100 }}
                                    helperText={
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                            }}
                                        >
                                            <span>
                                                Shown in listing cards and search results
                                            </span>
                                            <span>
                                                {(formData.small_description || '').length}/100
                                            </span>
                                        </Box>
                                    }
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={5}
                                    label="Full Description"
                                    disabled={!canEditDescription()}
                                    value={formData.long_description}
                                    onChange={(e) =>
                                        handleChange(
                                            'long_description',
                                            e.target.value.slice(0, 500)
                                        )
                                    }
                                    inputProps={{ maxLength: 500 }}
                                    helperText={
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                            }}
                                        >
                                            <span>
                                                Shown on the product detail page
                                            </span>
                                            <span>
                                                {(formData.long_description || '').length}/500
                                            </span>
                                        </Box>
                                    }
                                />
                            </Grid>
                        </Grid>

                        <Divider />
                        <SectionLabel>Silica Warning</SectionLabel>
                        <Grid container spacing={2.5} sx={{ width: '100%', m: 0 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={silicaData.warning}
                                        disabled={!canEditDescription()}
                                        onChange={(e) =>
                                            handleChange(
                                                "silica_warning",
                                                e.target.checked
                                            )
                                        }
                                    />
                                }
                                label="Enable Silica Warning"
                            />
                            {silicaData.warning && (
                                <Stack spacing={2} sx={{ width: "100%" }}>

                                    <TextField
                                        fullWidth
                                        multiline
                                        disabled={!canEditDescription()}
                                        minRows={3}
                                        label="Silica Warning Message"
                                        value={silicaData.message}
                                        onChange={(e) =>
                                            handleChange(
                                                "silica_warning_message",
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                    <Button
                                        variant="outlined"
                                        disabled={!canEditDescription()}
                                        component="label"
                                    >
                                        {
                                            silicaData.datasheet instanceof File
                                                ? "Change PDF"
                                                : "Upload Silica Datasheet PDF"
                                        }

                                        <input
                                            hidden
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleSilicaFileChange}
                                        />
                                    </Button>

                                    {/* Existing Uploaded PDF */}
                                    {
                                        !(silicaData.datasheet instanceof File) &&
                                        silicaData.datasheet && (
                                            <Stack spacing={1}>
                                                <Typography variant="body2">
                                                    Current PDF:
                                                </Typography>

                                                <a
                                                    href={`${import.meta.env.VITE_API_URL.replace('/api','')}${silicaData.datasheet}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View Current Datasheet
                                                </a>
                                            </Stack>
                                        )
                                    }

                                    {/* Newly Selected PDF */}
{
    silicaData.datasheet instanceof File && (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                bgcolor: "success.lighter",
            }}
        >
            <Stack spacing={1}>
                <Typography
                    variant="subtitle2"
                    color="success.main"
                >
                    ✓ New PDF Selected
                </Typography>

                <Typography variant="body2">
                    {silicaData.datasheet.name}
                </Typography>

                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    {(silicaData.datasheet.size / 1024).toFixed(1)} KB
                </Typography>

                <Button
                    size="small"
                    component="a"
                    href={URL.createObjectURL(
                        silicaData.datasheet
                    )}
                    target="_blank"
                >
                    Preview PDF
                </Button>

                <Button
                    size="small"
                    color="error"
                    onClick={() =>
                        handleChange(
                            "silica_warning_datasheet",
                            null
                        )
                    }
                >
                    Remove PDF
                </Button>
            </Stack>
        </Paper>
    )
}

                                </Stack>
                            )}
                        </Grid>

                        <Divider />
                        <SectionLabel>Stone Details</SectionLabel>
                        <Grid container spacing={2.5} sx={{ width: '100%', m: 0 }}>
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    options={[
                                        'Bookmatch',
                                        'Slipmatch',
                                    ]}
                                    value={formData.pattern || null}
                                    disabled={!canEditStoneDetails()}
                                    onChange={(_, value) =>
                                        handleChange('pattern', value || '')
                                    }
                                    clearOnEscape
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Pattern"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    options={stone_group}
                                    disabled={!canEditStoneDetails()}
                                    value={
                                        stone_group.find(
                                            (item) =>
                                                item.value_name ===
                                                formData.stone_group
                                        ) || null
                                    }
                                    onChange={(_, newValue) =>
                                        handleChange(
                                            'stone_group',
                                            newValue?.value_name || ''
                                        )
                                    }
                                    getOptionLabel={(option) =>
                                        option?.value_name || ''
                                    }
                                    isOptionEqualToValue={(option, value) =>
                                        option.id === value.id
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Stone Group"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Pantone Colour" value={formData.pantone_colour} disabled={!canEditStoneDetails()}
                                    onChange={(e) => handleChange('pantone_colour', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField select fullWidth label="Variation Level" value={formData.variation_level} disabled={!canEditStoneDetails()}
                                    onChange={(e) => handleChange('variation_level', e.target.value)}>
                                    {['V1', 'V2', 'V3', 'V4'].map((v) => (
                                        <MenuItem key={v} value={v}>{v}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField select fullWidth label="Translucent" disabled={!canEditStoneDetails()}
                                    value={formData.translucent ? 'YES' : 'NO'}
                                    onChange={(e) => handleChange('translucent', e.target.value === 'YES')}>
                                    <MenuItem value="YES">Yes</MenuItem>
                                    <MenuItem value="NO">No</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField select fullWidth label="Cut To Size" disabled={!canEditStoneDetails()}
                                    value={formData.cut_to_size ? 'YES' : 'NO'}
                                    onChange={(e) => handleChange('cut_to_size', e.target.value === 'YES')}>
                                    <MenuItem value="YES">Yes</MenuItem>
                                    <MenuItem value="NO">No</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Sealer"
                                    disabled={!canEditStoneDetails()}
                                    value={formData.sealer || 'N/A'}
                                    onChange={(e) => handleChange('sealer', e.target.value)}
                                >
                                    <MenuItem value="N/A">N/A</MenuItem>
                                    <MenuItem value="Filamp90 or Mapei Ultra Care">
                                        Filamp90 or Mapei Ultra Care
                                    </MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Autocomplete
                                    multiple
                                    disableCloseOnSelect
                                    options={finishes_available}
                                    disabled={!canEditStoneDetails()}
                                    value={finishes_available.filter((item) =>
                                        formData.finishes_available?.includes(
                                            item.value_name
                                        )
                                    )}
                                    onChange={(_, newValue) =>
                                        handleChange(
                                            'finishes_available',
                                            newValue.map(
                                                (item) => item.value_name
                                            )
                                        )
                                    }
                                    getOptionLabel={(option) =>
                                        option?.value_name || ''
                                    }
                                    isOptionEqualToValue={(option, value) =>
                                        option.id === value.id
                                    }
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                            <Checkbox
                                                checked={selected}
                                                size="small"
                                                sx={{ mr: 1 }}
                                            />
                                            {option.value_name}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Finishes Available"
                                            placeholder="Select finishes"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Autocomplete
                                    multiple
                                    disableCloseOnSelect
                                    options={thicknesses_cm}
                                    disabled={!canEditStoneDetails()}
                                    value={thicknesses_cm.filter((item) =>
                                        formData.thicknesses_cm?.includes(
                                            item.value_name
                                        )
                                    )}
                                    onChange={(_, newValue) =>
                                        handleChange(
                                            'thicknesses_cm',
                                            newValue.map(
                                                (item) => item.value_name
                                            )
                                        )
                                    }
                                    getOptionLabel={(option) =>
                                        option?.value_name || ''
                                    }
                                    isOptionEqualToValue={(option, value) =>
                                        option.id === value.id
                                    }
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                            <Checkbox
                                                checked={selected}
                                                size="small"
                                                sx={{ mr: 1 }}
                                            />
                                            {option.value_name}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Thicknesses (cm)"
                                            placeholder="Select thicknesses"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth label="Average Sizes (inches)" disabled={!canEditStoneDetails()}
                                    value={formData.average_sizes_inches?.join(', ')}
                                    onChange={(e) => handleCommaSplit('average_sizes_inches', e.target.value)}
                                    helperText="Comma-separated (e.g. 12x12, 24x24)" />
                            </Grid>
                        </Grid>
                    </Stack>
                )}

                {/* ── TAB 1: Media ──────────────────────────────────────────── */}
                {activeTab === 1 && (
                    <Stack spacing={3}>
                        {canEditMedia() && <><SectionLabel>Upload New Files</SectionLabel>

                            <Grid
                                container
                                spacing={2.5}
                                sx={{ width: '100%', m: 0 }}
                            >
                                {MEDIA_FIELDS.map(
                                    ({
                                        label,
                                        field,
                                        accept,
                                        icon,
                                    }) => (
                                        <Grid
                                            item
                                            xs={12}
                                            md={4}
                                            key={field}
                                        >
                                            <MediaUploadField
                                                label={label}
                                                accept={accept}
                                                icon={icon}
                                                fieldKey={field}
                                                previews={
                                                    mediaPreviews[field]
                                                }
                                                onFilesSelected={
                                                    handleFilesSelected
                                                }
                                                onRemove={
                                                    handleRemovePreview
                                                }
                                            />
                                        </Grid>
                                    )
                                )}
                            </Grid> </>}

                        {!canEditMedia() && (
                            <Alert severity="info">
                                You have view-only access to
                                product media.
                            </Alert>
                        )}

                        {formData.media?.length > 0 && (
                            <>
                                <Divider />

                                <SectionLabel>
                                    Existing Media (
                                    {formData.media.length})
                                </SectionLabel>

                                <Grid
                                    container
                                    spacing={2}
                                    sx={{
                                        width: '100%',
                                        m: 0,
                                    }}
                                >
                                    {formData.media.map(
                                        (item) => (
                                            <Grid
                                                item
                                                key={item.id}
                                                xs={12}
                                                sm={6}
                                                md={4}
                                            >
                                                <Box
                                                    sx={{
                                                        position:
                                                            'relative',
                                                        borderRadius: 2,
                                                        overflow:
                                                            'hidden',
                                                        border:
                                                            '1px solid',
                                                        borderColor:
                                                            'divider',
                                                    }}
                                                >
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
                                                                display:
                                                                    'block',
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
                                                            value={item.alt_text || ''}
                                                            disabled={!canEditMedia()}
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

                                        )

                                    )}

                                </Grid>
                            </>
                        )}

                        {!formData.media?.length &&
                            mediaPreviews
                                .closeup_images
                                .length === 0 &&
                            mediaPreviews
                                .slab_images
                                .length === 0 &&
                            mediaPreviews
                                .application_images
                                .length === 0 &&
                            mediaPreviews
                                .bookmatch_slipmatch
                                .length === 0 &&
                            mediaPreviews
                                .featured_videos
                                .length === 0 && (
                                <Box
                                    sx={{
                                        textAlign:
                                            'center',
                                        py: 6,
                                        color:
                                            'text.disabled',
                                        bgcolor:
                                            'action.hover',
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography variant="body2">
                                        No existing media
                                        attached
                                    </Typography>
                                </Box>
                            )}
                    </Stack>
                )}

                {/* ── TAB 2: Applications ───────────────────────────────────── */}
                {activeTab === 2 && (
                    <Stack spacing={2}>
                        <SectionLabel>
                            Where can this product be used?
                        </SectionLabel>

                        <Grid container>
                            {APPLICATION_FIELDS.map(
                                ([key, label]) => (
                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                        md={4}
                                        key={key}
                                    >
                                        <FormControlLabel
                                            sx={{
                                                width: '100%',
                                                m: 0,
                                                py: 0.75,
                                                px: 1,
                                                borderRadius: 1,
                                                '&:hover': {
                                                    bgcolor:
                                                        'action.hover',
                                                },
                                            }}
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    disabled={
                                                        !canEditApplications()
                                                    }
                                                    checked={Boolean(
                                                        formData[key]
                                                    )}
                                                    onChange={(e) =>
                                                        canEditApplications() &&
                                                        handleChange(
                                                            key,
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                            }
                                            label={
                                                <Typography variant="body2">
                                                    {label}
                                                </Typography>
                                            }
                                        />
                                    </Grid>
                                )
                            )}

                        </Grid>

                        {!canEditApplications() && (
                            <Alert
                                severity="info"
                            >
                                You do not have permission
                                to modify application
                                settings.
                            </Alert>
                        )}
                    </Stack>
                )}

                {/* ── TAB 3: Specifications ─────────────────────────────────── */}
                {activeTab === 3 && (
                    <Stack spacing={3}>
                        <SectionLabel>
                            Resistance & Quality Ratings
                        </SectionLabel>

                        <Grid
                            container
                            spacing={2.5}
                            sx={{ width: '100%', m: 0 }}
                        >
                            {RESISTANCE_FIELDS.map(
                                ([key, label]) => (
                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                        key={key}
                                    >
                                        <TextField
                                            select
                                            fullWidth
                                            disabled={
                                                !canEditApplications()
                                            }
                                            label={
                                                <Stack
                                                    direction="row"
                                                    alignItems="center"
                                                >
                                                    {label}
                                                    <ResistanceBadge
                                                        value={
                                                            formData[key]
                                                        }
                                                    />
                                                </Stack>
                                            }
                                            value={formData[key]}
                                            onChange={(e) =>
                                                canEditApplications() &&
                                                handleChange(
                                                    key,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <MenuItem value="LOW">
                                                Low
                                            </MenuItem>

                                            <MenuItem value="MEDIUM">
                                                Medium
                                            </MenuItem>

                                            <MenuItem value="HIGH">
                                                High
                                            </MenuItem>
                                        </TextField>
                                    </Grid>
                                )
                            )}
                        </Grid>

                        {!canEditApplications() && (
                            <Alert
                                severity='info'
                            >
                                You do not have permission to
                                modify specification ratings.
                            </Alert>
                        )}
                    </Stack>
                )}

                {/* ── TAB 4: SEO ─────────────────────────────────── */}
                {activeTab === 4 && (
                    <Stack spacing={3}>
                        <SectionLabel>
                            SEO Configuration
                        </SectionLabel>

                        <Grid
                            container
                            spacing={2.5}
                            sx={{ width: '100%', m: 0 }}
                        >
                            {/* Meta Title */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Meta Title"
                                    value={formData?.meta_title || ''}
                                    disabled={!canEditSEO()}
                                    onChange={(e) =>
                                        handleChange(
                                            'meta_title',
                                            e.target.value
                                        )
                                    }
                                />
                            </Grid>

                            {/* Meta Description */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    disabled={!canEditSEO()}
                                    label="Meta Description"
                                    value={
                                        formData?.meta_description || ''
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            'meta_description',
                                            e.target.value
                                        )
                                    }
                                />
                            </Grid>

                            {/* Canonical URL */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Canonical URL"
                                    disabled={!canEditSEO()}
                                    value={
                                        formData?.canonical_url || ''
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            'canonical_url',
                                            e.target.value
                                        )
                                    }
                                />
                            </Grid>

                            {/* OG Title */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="OG Title"
                                    disabled={!canEditSEO()}
                                    value={formData?.og_title || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            'og_title',
                                            e.target.value
                                        )
                                    }
                                />
                            </Grid>

                            {/* OG Image */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="OG Image URL"
                                    disabled={!canEditSEO()}
                                    value={formData?.og_image || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            'og_image',
                                            e.target.value
                                        )
                                    }
                                />
                            </Grid>

                            {/* OG Description */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    disabled={!canEditSEO()}
                                    rows={3}
                                    label="OG Description"
                                    value={
                                        formData?.og_description || ''
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            'og_description',
                                            e.target.value
                                        )
                                    }
                                />
                            </Grid>

                            {/* Robots Index */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    disabled={!canEditSEO()}
                                    fullWidth
                                    label="Robots Index"
                                    value={String(formData?.robots_index ?? true)}
                                    onChange={(e) =>
                                        handleChange(
                                            'robots_index',
                                            e.target.value === 'true'
                                        )
                                    }
                                >
                                    <MenuItem value="true">
                                        Index
                                    </MenuItem>

                                    <MenuItem value="false">
                                        No Index
                                    </MenuItem>
                                </TextField>
                            </Grid>

                            {/* Robots Follow */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    disabled={!canEditSEO()}
                                    fullWidth
                                    label="Robots Follow"
                                    value={String(formData?.robots_follow ?? true)}
                                    onChange={(e) =>
                                        handleChange(
                                            'robots_follow',
                                            e.target.value === 'true'
                                        )
                                    }
                                >
                                    <MenuItem value="true">
                                        Follow
                                    </MenuItem>

                                    <MenuItem value="false">
                                        No Follow
                                    </MenuItem>
                                </TextField>
                            </Grid>

                            {/* Schema Markup */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={8}
                                    disabled={!canEditSEO()}
                                    label="Schema Markup (JSON-LD)"
                                    value={
                                        formData?.schema_markup || ''
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            'schema_markup',
                                            e.target.value
                                        )
                                    }
                                    placeholder={`{
  "@context": "https://schema.org",
  "@type": "Product"
}`}
                                />
                            </Grid>

                            {/* SEO Content */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={8}
                                    label="SEO Content"
                                    disabled={!canEditSEO()}
                                    value={
                                        formData?.seo_content || ''
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            'seo_content',
                                            e.target.value
                                        )
                                    }
                                />
                            </Grid>
                        </Grid>

                        <Alert severity="info">
                            SEO metadata helps improve search
                            engine visibility and social sharing
                            previews.
                        </Alert>
                    </Stack>
                )}

                {/* ── TAB 5: FAQ ─────────────────────────────────── */}
                {activeTab === 5 && (
                    <Stack spacing={3}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <SectionLabel>
                                Product FAQs
                            </SectionLabel>

                            <Button
                                variant="contained"
                                disabled={!canEditDescription()}
                                onClick={addFaq}
                            >
                                Add FAQ
                            </Button>
                        </Stack>

                        {!formData.faqs?.length && (
                            <Alert severity="info">
                                No FAQs added yet.
                            </Alert>
                        )}

                        {formData.faqs?.map(
                            (faq, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        p: 2,
                                    }}
                                >
                                    <Stack spacing={2}>
                                        <TextField
                                            fullWidth
                                            disabled={!canEditDescription()}
                                            label={`Question ${index + 1
                                                }`}
                                            value={
                                                faq.question || ''
                                            }
                                            onChange={(e) =>
                                                updateFaq(
                                                    index,
                                                    'question',
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <TextField
                                            fullWidth
                                            multiline
                                            disabled={!canEditDescription()}
                                            rows={4}
                                            label="Answer"
                                            value={
                                                faq.answer || ''
                                            }
                                            onChange={(e) =>
                                                updateFaq(
                                                    index,
                                                    'answer',
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <Stack
                                            direction="row"
                                            justifyContent="flex-end"
                                        >
                                            <Button
                                                color="error"
                                                disabled={!canEditDescription()}
                                                onClick={() =>
                                                    removeFaq(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Box>
                            )
                        )}
                    </Stack>
                )}

            </DialogContent>

            {/* ── Footer ─────────────────────────────────────────────────────── */}
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                    <Stack direction="row" spacing={1}>
                        {activeTab > 0 && (
                            <Button variant="text" onClick={() => setActiveTab((p) => p - 1)}>← Back</Button>
                        )}
                    </Stack>
                    <Stack direction="row" spacing={1.5}>
                        <Button variant="outlined" onClick={onClose}>Cancel</Button>
                        {activeTab < tabs.length - 1 ? (
                            <Button variant="contained" onClick={() => setActiveTab((p) => p + 1)}>Next →</Button>
                        ) : (
                            <LoadingButton
                                variant="contained"
                                loading={loading}
                                onClick={() => onSubmit(formData)}
                            // onClick={() => console.log(formData)}
                            >
                                {currentProduct ? 'Update Product' : 'Create Product'}
                            </LoadingButton>
                        )}
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}

ProductQuickEdit.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    loading: PropTypes.bool,
    onSubmit: PropTypes.func,
    currentProduct: PropTypes.object,
};