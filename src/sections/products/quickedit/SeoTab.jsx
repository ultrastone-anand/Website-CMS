import PropTypes from 'prop-types';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Alert, MenuItem } from '@mui/material';

import SectionLabel from './SectionLabel';

export default function SeoTab({
    formData,
    handleChange,
    canEditSEO,
}) {
    return (
        <Stack spacing={3}>

            <SectionLabel>
                SEO Configuration
            </SectionLabel>

            <Grid
                container
                spacing={2.5}
                sx={{
                    width: '100%',
                    m: 0,
                }}
            >

                {/* Meta Title */}

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Meta Title"
                        disabled={!canEditSEO()}
                        value={formData?.meta_title || ""}
                        onChange={(e) =>
                            handleChange(
                                "meta_title",
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
                        label="Meta Description"
                        disabled={!canEditSEO()}
                        value={
                            formData?.meta_description || ""
                        }
                        onChange={(e) =>
                            handleChange(
                                "meta_description",
                                e.target.value
                            )
                        }
                    />
                </Grid>

                {/* Canonical */}

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Canonical URL"
                        disabled={!canEditSEO()}
                        value={
                            formData?.canonical_url || ""
                        }
                        onChange={(e) =>
                            handleChange(
                                "canonical_url",
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
                        value={
                            formData?.og_title || ""
                        }
                        onChange={(e) =>
                            handleChange(
                                "og_title",
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
                        value={
                            formData?.og_image || ""
                        }
                        onChange={(e) =>
                            handleChange(
                                "og_image",
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
                        rows={3}
                        label="OG Description"
                        disabled={!canEditSEO()}
                        value={
                            formData?.og_description || ""
                        }
                        onChange={(e) =>
                            handleChange(
                                "og_description",
                                e.target.value
                            )
                        }
                    />
                </Grid>

                                {/* Robots Index */}

                <Grid item xs={12} md={6}>
                    <TextField
                        select
                        fullWidth
                        label="Robots Index"
                        disabled={!canEditSEO()}
                        value={String(formData?.robots_index ?? true)}
                        onChange={(e) =>
                            handleChange(
                                "robots_index",
                                e.target.value === "true"
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
                        fullWidth
                        label="Robots Follow"
                        disabled={!canEditSEO()}
                        value={String(formData?.robots_follow ?? true)}
                        onChange={(e) =>
                            handleChange(
                                "robots_follow",
                                e.target.value === "true"
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

                {/* Schema */}

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        label="Schema Markup (JSON-LD)"
                        disabled={!canEditSEO()}
                        value={
                            formData?.schema_markup || ""
                        }
                        onChange={(e) =>
                            handleChange(
                                "schema_markup",
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
                            formData?.seo_content || ""
                        }
                        onChange={(e) =>
                            handleChange(
                                "seo_content",
                                e.target.value
                            )
                        }
                    />
                </Grid>

            </Grid>

            <Alert severity="info">
                SEO metadata helps improve search engine visibility
                and social sharing previews.
            </Alert>

        </Stack>
    );
}

SeoTab.propTypes = {
    formData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    canEditSEO: PropTypes.func.isRequired,
};