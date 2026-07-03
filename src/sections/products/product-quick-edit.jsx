import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { getCategories } from 'src/services/category.service';
import { getLookupDetails } from 'src/services/lookup.service';
import { deleteProductMedia } from 'src/services/product.service';

import SeoTab from './quickedit/SeoTab';
import FaqTab from './quickedit/FaqTab';
import MediaTab from './quickedit/MediaTab';
import RemarksTab from './quickedit/RemarksTab';
import BasicInfoTab from './quickedit/BasicInfoTab';
import ApplicationsTab from './quickedit/ApplicationsTab';
import SpecificationsTab from './quickedit/SpecificationsTab';
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
}

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
        ...(currentProduct
        ? [{ label: 'Remarks', icon: '📝' }]
        : []),
    ];

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

    const handleDeleteMedia = async (mediaId) => {
    try {

        await deleteProductMedia(mediaId);

        setFormData((prev) => ({
            ...prev,
            media: prev.media.filter(
                (item) => item.id !== mediaId
            ),
        }));


    } catch (error) {

        alert(
            error.message,
            { variant: "error" }
        );

    }
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
                    <BasicInfoTab
                        formData={formData}
                        handleChange={handleChange}
                        handleCommaSplit={handleCommaSplit}
                        categories={categories}
                        countries={countries}
                        stone_group={stone_group}
                        finishes_available={finishes_available}
                        thicknesses_cm={thicknesses_cm}
                        silicaData={silicaData}
                        handleSilicaFileChange={handleSilicaFileChange}
                        canEditIdentity={canEditIdentity}
                        canEditDescription={canEditDescription}
                        canEditStoneDetails={canEditStoneDetails}
                    />
                )}

                {/* ── TAB 1: Media ──────────────────────────────────────────── */}
                {activeTab === 1 && (
                    <MediaTab
                        formData={formData}
                        mediaPreviews={mediaPreviews}
                        handleFilesSelected={handleFilesSelected}
                        handleRemovePreview={handleRemovePreview}
                        handleAltTextChange={handleAltTextChange}
                        canEditMedia={canEditMedia}
                        handleDeleteMedia={handleDeleteMedia}
                    />
                )}

                {/* ── TAB 2: Applications ───────────────────────────────────── */}
                {activeTab === 2 && (
                    <ApplicationsTab
                        formData={formData}
                        handleChange={handleChange}
                        canEditApplications={canEditApplications}
                    />
                )}

                {/* ── TAB 3: Specifications ─────────────────────────────────── */}
                {activeTab === 3 && (
                    <SpecificationsTab
                        formData={formData}
                        handleChange={handleChange}
                        canEditApplications={canEditApplications}
                    />
                )}
                {/* ── TAB 4: SEO ─────────────────────────────────── */}
                {activeTab === 4 && (
                    <SeoTab
                        formData={formData}
                        handleChange={handleChange}
                        canEditSEO={canEditSEO}
                    />
                )}
                {/* ── TAB 5: FAQ ─────────────────────────────────── */}
                {activeTab === 5 && (
                    <FaqTab
                        formData={formData}
                        addFaq={addFaq}
                        removeFaq={removeFaq}
                        updateFaq={updateFaq}
                        canEditDescription={canEditDescription}
                    />
                )}
                {/* ── TAB 6: Remarks ─────────────────────────────────── */}
                {activeTab === 6 && currentProduct && (
                    <RemarksTab
                        productId={currentProduct.id}
                    />
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