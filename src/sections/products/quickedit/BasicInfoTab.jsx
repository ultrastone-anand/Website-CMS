import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { Divider } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';

import SectionLabel from './SectionLabel';

export default function BasicInfoTab({
    formData,
    handleChange,
    handleCommaSplit,

    categories,
    countries,
    stone_group,
    finishes_available,
    thicknesses_cm,

    silicaData,
    handleSilicaFileChange,

    canEditIdentity,
    canEditDescription,
    canEditStoneDetails,
}) {
    return (
        <Stack spacing={3}>

            {/* ========================================================= */}
            {/* Identity */}
            {/* ========================================================= */}

            <SectionLabel>
                Identity
            </SectionLabel>

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
                        onChange={(e) => {

                            const name = e.target.value;

                            handleChange("name", name);
                            handleChange(
                                "slug",
                                name
                                    .toLowerCase()
                                    .trim()
                                    .replace(/\s+/g, "-")
                                    .replace(/[^a-z0-9-]/g, "")
                            );

                        }}
                        disabled={!canEditIdentity()}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Slug"
                        value={formData.slug}
                        disabled={!canEditIdentity()}
                        onChange={(e) =>
                            handleChange(
                                "slug",
                                e.target.value
                            )
                        }
                        InputProps={{
                            startAdornment: (
                                <Typography
                                    variant="body2"
                                    color="text.disabled"
                                    sx={{ mr: .5 }}
                                >
                                    /
                                </Typography>
                            ),
                        }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Autocomplete
                        options={categories}
                        disabled={!canEditIdentity()}
                        value={
                            categories.find(
                                (item) =>
                                    item.id === formData.category_id
                            ) || null
                        }
                        getOptionLabel={(option) =>
                            option?.name || ""
                        }
                        isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                        }
                        onChange={(_, value) =>
                            handleChange(
                                "category_id",
                                value?.id || ""
                            )
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
                        disabled={!canEditIdentity()}
                        value={
                            countries.find(
                                (item) =>
                                    item.value_name ===
                                    formData.origin_country
                            ) || null
                        }
                        getOptionLabel={(option) =>
                            option?.value_name || ""
                        }
                        isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                        }
                        onChange={(_, value) =>
                            handleChange(
                                "origin_country",
                                value?.value_name || ""
                            )
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
            {/* ========================================================= */}
            {/* Description */}
            {/* ========================================================= */}

            <Divider />

            <SectionLabel>
                Descriptions
            </SectionLabel>

            <Grid
                container
                spacing={2.5}
                sx={{
                    width: '100%',
                    m: 0,
                }}
            >

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
                                "small_description",
                                e.target.value.slice(0, 200)
                            )
                        }
                        inputProps={{
                            maxLength: 200,
                        }}
                        helperText={
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "100%",
                                }}
                            >
                                <span>
                                    Shown in listing cards and search results
                                </span>

                                <span>
                                    {(formData.small_description || "").length}/200
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
                                "long_description",
                                e.target.value.slice(0, 1000)
                            )
                        }
                        inputProps={{
                            maxLength: 1000,
                        }}
                        helperText={
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "100%",
                                }}
                            >
                                <span>
                                    Shown on the product detail page
                                </span>

                                <span>
                                    {(formData.long_description || "").length}/1000
                                </span>
                            </Box>
                        }
                    />
                </Grid>

            </Grid>

            {/* ========================================================= */}
            {/* Silica Warning */}
            {/* ========================================================= */}

            <Divider />

            <SectionLabel>
                Silica Warning
            </SectionLabel>

            <Grid
                container
                spacing={2.5}
                sx={{
                    width: '100%',
                    m: 0,
                }}
            >
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
                    <Stack
                        spacing={2}
                        sx={{
                            width: "100%",
                        }}
                    >

                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            required
                            disabled={!canEditDescription()}
                            label="Silica Warning Message"
                            value={silicaData.message}
                            onChange={(e) =>
                                handleChange(
                                    "silica_warning_message",
                                    e.target.value
                                )
                            }
                        />

                        <Button
                            variant="outlined"
                            component="label"
                            disabled={!canEditDescription()}
                        >
                            {silicaData.datasheet instanceof File
                                ? "Change PDF"
                                : "Upload Silica Datasheet PDF"}

                            <input
                                hidden
                                type="file"
                                accept="application/pdf"
                                onChange={handleSilicaFileChange}
                            />
                        </Button>

                        {/* Existing Uploaded PDF */}

                        {!(silicaData.datasheet instanceof File) &&
                            silicaData.datasheet && (

                                <Stack spacing={1}>

                                    <Typography variant="body2">
                                        Current PDF:
                                    </Typography>

                                    <a
                                        href={`${import.meta.env.VITE_API_URL.replace(
                                            "/api",
                                            ""
                                        )}${silicaData.datasheet}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Current Datasheet
                                    </a>

                                </Stack>

                            )}

                        {/* Newly Selected PDF */}

                        {silicaData.datasheet instanceof File && (

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
                                        {(
                                            silicaData.datasheet.size /
                                            1024
                                        ).toFixed(1)}{" "}
                                        KB
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

                        )}

                    </Stack>
                )}
            </Grid>

            {/* ========================================================= */}
            {/* Stone Details */}
            {/* ========================================================= */}

            <Divider />

            <SectionLabel>
                Stone Details
            </SectionLabel>

            <Grid
                container
                spacing={2.5}
                sx={{
                    width: '100%',
                    m: 0,
                }}
            >

                {/* Pattern */}

                <Grid item xs={12} md={6}>
                    <Autocomplete
                        options={[
                            'Bookmatch',
                            'Slipmatch',
                        ]}
                        value={formData.pattern || null}
                        disabled={!canEditStoneDetails()}
                        clearOnEscape
                        onChange={(_, value) =>
                            handleChange(
                                "pattern",
                                value || ""
                            )
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                label="Pattern"
                            />
                        )}
                    />
                </Grid>

                {/* Stone Group */}

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
                        getOptionLabel={(option) =>
                            option?.value_name || ""
                        }
                        isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                        }
                        onChange={(_, value) =>
                            handleChange(
                                "stone_group",
                                value?.value_name || ""
                            )
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                label="Stone Group"
                            />
                        )}
                    />
                </Grid>

                {/* Pantone */}

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Pantone Colour"
                        disabled={!canEditStoneDetails()}
                        value={formData.pantone_colour}
                        onChange={(e) =>
                            handleChange(
                                "pantone_colour",
                                e.target.value
                            )
                        }
                    />
                </Grid>

                {/* Variation */}

                <Grid item xs={12} md={6}>
                    <TextField
                        select
                        fullWidth
                        label="Variation Level"
                        disabled={!canEditStoneDetails()}
                        value={formData.variation_level}
                        onChange={(e) =>
                            handleChange(
                                "variation_level",
                                e.target.value
                            )
                        }
                    >
                        {["V1", "V2", "V3", "V4"].map((v) => (
                            <MenuItem
                                key={v}
                                value={v}
                            >
                                {v}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Translucent */}

                <Grid item xs={12} md={4}>
                    <TextField
                        select
                        fullWidth
                        label="Translucent"
                        disabled={!canEditStoneDetails()}
                        value={
                            formData.translucent
                                ? "YES"
                                : "NO"
                        }
                        onChange={(e) =>
                            handleChange(
                                "translucent",
                                e.target.value === "YES"
                            )
                        }
                    >
                        <MenuItem value="YES">
                            Yes
                        </MenuItem>

                        <MenuItem value="NO">
                            No
                        </MenuItem>

                    </TextField>
                </Grid>

                {/* Cut To Size */}

                <Grid item xs={12} md={4}>
                    <TextField
                        select
                        fullWidth
                        label="Cut To Size"
                        disabled={!canEditStoneDetails()}
                        value={
                            formData.cut_to_size
                                ? "YES"
                                : "NO"
                        }
                        onChange={(e) =>
                            handleChange(
                                "cut_to_size",
                                e.target.value === "YES"
                            )
                        }
                    >
                        <MenuItem value="YES">
                            Yes
                        </MenuItem>

                        <MenuItem value="NO">
                            No
                        </MenuItem>

                    </TextField>
                </Grid>

                {/* Sealer */}

                <Grid item xs={12} md={4}>
                    <TextField
                        select
                        fullWidth
                        label="Sealer"
                        disabled={!canEditStoneDetails()}
                        value={formData.sealer || "N/A"}
                        onChange={(e) =>
                            handleChange(
                                "sealer",
                                e.target.value
                            )
                        }
                    >

                        <MenuItem value="N/A">
                            N/A
                        </MenuItem>

                        <MenuItem value="Filamp90 or Mapei Ultra Care">
                            Filamp90 or Mapei Ultra Care
                        </MenuItem>

                    </TextField>
                </Grid>

                {/* Finishes */}

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
                        getOptionLabel={(option) =>
                            option?.value_name || ""
                        }
                        isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                        }
                        onChange={(_, value) =>
                            handleChange(
                                "finishes_available",
                                value.map(
                                    (item) => item.value_name
                                )
                            )
                        }
                        renderOption={(props, option, { selected }) => (
                            <li {...props}>
                                <Checkbox
                                    size="small"
                                    checked={selected}
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

                {/* Thickness */}

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
                        getOptionLabel={(option) =>
                            option?.value_name || ""
                        }
                        isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                        }
                        onChange={(_, value) =>
                            handleChange(
                                "thicknesses_cm",
                                value.map(
                                    (item) => item.value_name
                                )
                            )
                        }
                        renderOption={(props, option, { selected }) => (
                            <li {...props}>
                                <Checkbox
                                    size="small"
                                    checked={selected}
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

                {/* Average Sizes */}

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Average Sizes (inches)"
                        disabled={!canEditStoneDetails()}
                        value={
                            formData.average_sizes_inches?.join(", ")
                        }
                        onChange={(e) =>
                            handleCommaSplit(
                                "average_sizes_inches",
                                e.target.value
                            )
                        }
                        helperText="Comma-separated (e.g. 12x12, 24x24)"
                    />
                </Grid>

            </Grid>

        </Stack>
    );
}

BasicInfoTab.propTypes = {
    formData: PropTypes.object.isRequired,

    handleChange: PropTypes.func.isRequired,
    handleCommaSplit: PropTypes.func.isRequired,
    handleSilicaFileChange: PropTypes.func.isRequired,

    categories: PropTypes.array.isRequired,
    countries: PropTypes.array.isRequired,
    stone_group: PropTypes.array.isRequired,
    finishes_available: PropTypes.array.isRequired,
    thicknesses_cm: PropTypes.array.isRequired,

    silicaData: PropTypes.object.isRequired,

    canEditIdentity: PropTypes.func.isRequired,
    canEditDescription: PropTypes.func.isRequired,
    canEditStoneDetails: PropTypes.func.isRequired,
};