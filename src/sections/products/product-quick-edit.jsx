import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { getCategories } from 'src/services/category.service';

// ---------------------------------------------------------------------------

const defaultForm = {
    name: '',
    slug: '',
    small_description: '',
    long_description: '',
    category_id: '',

    featured_images: [],
    gallery_images: [],
    featured_videos: [],

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
    shower_wall: false,
    shower_floor: false,
    exterior_floor: false,
    exterior_wall: false,
    pool_fountain: false,
    fireplace: false,
    furniture_top: false,

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
    ['shower_wall', 'Shower Wall'],
    ['shower_floor', 'Shower Floor'],
    ['exterior_floor', 'Exterior Floor'],
    ['exterior_wall', 'Exterior Wall'],
    ['pool_fountain', 'Pool / Fountain'],
    ['fireplace', 'Fireplace'],
    ['furniture_top', 'Furniture Top'],
];

const PRODUCT_FLAGS = [
    ['translucent', 'Translucent'],
    ['is_featured', 'Featured'],
    ['is_trending', 'Trending'],
    ['is_new_arrival', 'New Arrival'],
    ['is_active', 'Active'],
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

export default function ProductQuickEdit({ open, onClose, onSubmit, currentProduct }) {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState(defaultForm);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (currentProduct) {
            setFormData({ ...defaultForm, ...currentProduct });
        } else {
            setFormData(defaultForm);
        }
        setActiveTab(0);
    }, [currentProduct, open]);

    const loadCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (field, value) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    const handleCommaSplit = (field, raw) =>
        handleChange(field, raw.split(',').map((v) => v.trim()).filter(Boolean));

    // -------------------------------------------------------------------------

    const tabs = [
        { label: 'Basic Info', icon: '📋' },
        { label: 'Media', icon: '🖼️' },
        { label: 'Applications', icon: '🔧' },
        { label: 'Specifications', icon: '📊' },
        { label: 'Options', icon: '⚙️' },
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <DialogTitle
  sx={{
    px: 4,
    py: 2,
  }}
>
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

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{
    mt: 3,
    '& .MuiTab-root': {
      minHeight: 48,
      textTransform: 'none',
      fontWeight: 600,
    },
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
            <DialogContent
                sx={{
                    minHeight: 420,
                }}
            >
                {/* ── TAB 0: Basic Info ─────────────────────────────────────── */}
                {activeTab === 0 && (
                    <Stack spacing={3}>
                        <SectionLabel>Identity</SectionLabel>
                        <Grid
                            container
                            spacing={2.5}
                            sx={{
                                width: '100%',
                                m: 0,
                            }}
                        >
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Product Name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Slug"
                                    value={formData.slug}
                                    onChange={(e) => handleChange('slug', e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <Typography variant="body2" color="text.disabled" sx={{ mr: 0.5 }}>
                                                /
                                            </Typography>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Category"
                                    value={formData.category_id}
                                    onChange={(e) => handleChange('category_id', e.target.value)}
                                >
                                    {categories.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Origin Country"
                                    value={formData.origin_country}
                                    onChange={(e) => handleChange('origin_country', e.target.value)}
                                >
                                    {['India', 'Italy', 'Brazil', 'Turkey'].map((c) => (
                                        <MenuItem key={c} value={c}>
                                            {c}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>

                        <Divider />
                        <SectionLabel>Descriptions</SectionLabel>
                        <Grid container spacing={2.5}sx={{
                                width: '100%',
                                m: 0,
                            }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Short Description"
                                    value={formData.small_description}
                                    onChange={(e) => handleChange('small_description', e.target.value)}
                                    helperText="Shown in listing cards and search results"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={5}
                                    label="Full Description"
                                    value={formData.long_description}
                                    onChange={(e) => handleChange('long_description', e.target.value)}
                                    helperText="Shown on the product detail page"
                                />
                            </Grid>
                        </Grid>

                        <Divider />
                        <SectionLabel>Stone Details</SectionLabel>
                        <Grid container spacing={2.5} sx={{
                                width: '100%',
                                m: 0,
                            }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Pattern"
                                    value={formData.pattern}
                                    onChange={(e) => handleChange('pattern', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Stone Group"
                                    value={formData.stone_group}
                                    onChange={(e) => handleChange('stone_group', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Pantone Colour"
                                    value={formData.pantone_colour}
                                    onChange={(e) => handleChange('pantone_colour', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Variation Level"
                                    value={formData.variation_level}
                                    onChange={(e) => handleChange('variation_level', e.target.value)}
                                >
                                    {['V1', 'V2', 'V3', 'V4'].map((v) => (
                                        <MenuItem key={v} value={v}>
                                            {v}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
<Grid item xs={12} md={6}>
  <TextField
    select
    fullWidth
    label="Translucent"
    value={formData.translucent ? 'YES' : 'NO'}
    onChange={(e) =>
      handleChange('translucent', e.target.value === 'YES')
    }
  >
    <MenuItem value="YES">Yes</MenuItem>
    <MenuItem value="NO">No</MenuItem>
  </TextField>
</Grid>

<Grid item xs={12} md={6}>
  <TextField
    select
    fullWidth
    label="Cut To Size"
    value={formData.cut_to_size ? 'YES' : 'NO'}
    onChange={(e) =>
      handleChange('cut_to_size', e.target.value === 'YES')
    }
  >
    <MenuItem value="YES">Yes</MenuItem>
    <MenuItem value="NO">No</MenuItem>
  </TextField>
</Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Finishes Available"
                                    value={formData.finishes_available?.join(', ')}
                                    onChange={(e) => handleCommaSplit('finishes_available', e.target.value)}
                                    helperText="Comma-separated (e.g. Polished, Honed)"
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Thicknesses (cm)"
                                    value={formData.thicknesses_cm?.join(', ')}
                                    onChange={(e) => handleCommaSplit('thicknesses_cm', e.target.value)}
                                    helperText="Comma-separated (e.g. 1.2, 2.0)"
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Average Sizes (inches)"
                                    value={formData.average_sizes_inches?.join(', ')}
                                    onChange={(e) => handleCommaSplit('average_sizes_inches', e.target.value)}
                                    helperText="Comma-separated (e.g. 12x12, 24x24)"
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                )}

                {/* ── TAB 1: Media ──────────────────────────────────────────── */}
                {activeTab === 1 && (
                    <Stack spacing={3}>
                        <SectionLabel>Upload New Files</SectionLabel>
                        <Grid container spacing={2} sx={{
                                width: '100%',
                                m: 0,
                            }}>
                            {[
                                { label: 'Featured Images', field: 'featured_images', accept: 'image/*', icon: '🖼️' },
                                { label: 'Gallery Images', field: 'gallery_images', accept: 'image/*', icon: '🗂️' },
                                { label: 'Featured Videos', field: 'featured_videos', accept: 'video/*', icon: '🎬' },
                            ].map(({ label, accept, icon }) => (
                                <Grid item xs={12} md={4} key={label}>
                                    <Button
                                        fullWidth
                                        component="label"
                                        variant="outlined"
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
                                        <input hidden multiple type="file" accept={accept} />
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>

                        {formData.media?.length > 0 && (
                            <>
                                <Divider />
                                <SectionLabel>Existing Media ({formData.media.length})</SectionLabel>
                                <Grid container spacing={2} sx={{
                                width: '100%',
                                m: 0,
                            }}>
                                    {formData.media.map((item) => (
                                        <Grid item key={item.id} xs={12} sm={6} md={4}>
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                }}
                                            >
                                                {item.media_type.includes('IMAGE') ? (
                                                    <Box
                                                        component="img"
                                                        src={item.media_url}
                                                        alt=""
                                                        sx={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                                                    />
                                                ) : (
                                                    <Box
                                                        component="video"
                                                        controls
                                                        sx={{ width: '100%', display: 'block' }}
                                                    >
                                                        <source src={item.media_url} type="video/mp4" />
                                                        <track kind="captions" src="" label="English" default />
                                                    </Box>
                                                )}
                                                <Box sx={{ p: 1 }}>
                                                    <Chip
                                                        size="small"
                                                        label={item.media_type}
                                                        sx={{ fontSize: 10, height: 18 }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </>
                        )}

                        {!formData.media?.length && (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    py: 6,
                                    color: 'text.disabled',
                                    bgcolor: 'action.hover',
                                    borderRadius: 2,
                                }}
                            >
                                <Typography variant="body2">No existing media attached</Typography>
                            </Box>
                        )}
                    </Stack>
                )}

                {/* ── TAB 2: Applications ───────────────────────────────────── */}
                {activeTab === 2 && (
                    <Stack spacing={2}>
                        <SectionLabel>Where can this product be used?</SectionLabel>
                        <Grid container>
                            {APPLICATION_FIELDS.map(([key, label]) => (
                                <Grid item xs={12} sm={6} md={4} key={key}>
                                    <FormControlLabel
                                        sx={{ width: '100%', m: 0, py: 0.75, px: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={Boolean(formData[key])}
                                                onChange={(e) => handleChange(key, e.target.checked)}
                                            />
                                        }
                                        label={<Typography variant="body2">{label}</Typography>}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Stack>
                )}

                {/* ── TAB 3: Specifications ─────────────────────────────────── */}
                {activeTab === 3 && (
                    <Stack spacing={3}>
                        <SectionLabel>Resistance & Quality Ratings</SectionLabel>
                        <Grid container spacing={2.5} sx={{
                                width: '100%',
                                m: 0,
                            }}>
                            {RESISTANCE_FIELDS.map(([key, label]) => (
                                <Grid item xs={12} sm={6} key={key}>
                                    <TextField
                                        select
                                        fullWidth
                                        label={
                                            <Stack direction="row" alignItems="center">
                                                {label}
                                                <ResistanceBadge value={formData[key]} />
                                            </Stack>
                                        }
                                        value={formData[key]}
                                        onChange={(e) => handleChange(key, e.target.value)}
                                    >
                                        <MenuItem value="LOW">Low</MenuItem>
                                        <MenuItem value="MEDIUM">Medium</MenuItem>
                                        <MenuItem value="HIGH">High</MenuItem>
                                    </TextField>
                                </Grid>
                            ))}
                        </Grid>
                    </Stack>
                )}

                {/* ── TAB 4: Options / Flags ────────────────────────────────── */}
                {activeTab === 4 && (
                    <Stack spacing={2}>
                        <SectionLabel>Product Flags</SectionLabel>
                        <Box
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            {PRODUCT_FLAGS.map(([key, label], i) => (
                                <Box
                                    key={key}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        px: 2.5,
                                        py: 1.75,
                                        borderTop: i > 0 ? '1px solid' : 'none',
                                        borderColor: 'divider',
                                        bgcolor: formData[key] ? 'action.selected' : 'transparent',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body2" fontWeight={500}>
                                            {label}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {key === 'is_featured' && 'Show on homepage featured section'}
                                            {key === 'is_trending' && 'Show in trending products carousel'}
                                            {key === 'is_new_arrival' && 'Show in new arrivals section'}
                                            {key === 'is_active' && 'Make product visible to customers'}
                                            {key === 'translucent' && 'Product allows light to pass through'}
                                            {key === 'cut_to_size' && 'Available in custom cut-to-size orders'}
                                        </Typography>
                                    </Box>
                                    <Checkbox
                                        checked={Boolean(formData[key])}
                                        onChange={(e) => handleChange(key, e.target.checked)}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Stack>
                )}
            </DialogContent>

            {/* ── Footer ─────────────────────────────────────────────────────── */}
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                    <Stack direction="row" spacing={1}>
                        {activeTab > 0 && (
                            <Button variant="text" onClick={() => setActiveTab((p) => p - 1)}>
                                ← Back
                            </Button>
                        )}
                    </Stack>
                    <Stack direction="row" spacing={1.5}>
                        <Button variant="outlined" onClick={onClose}>
                            Cancel
                        </Button>
                        {activeTab < tabs.length - 1 ? (
                            <Button variant="contained" onClick={() => setActiveTab((p) => p + 1)}>
                                Next →
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={() => onSubmit(formData)}>
                                {currentProduct ? 'Update Product' : 'Create Product'}
                            </Button>
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
    onSubmit: PropTypes.func,
    currentProduct: PropTypes.object
};