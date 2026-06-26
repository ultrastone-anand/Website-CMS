import PropTypes from 'prop-types';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import SectionLabel from './SectionLabel';
import ResistanceBadge from './ResistanceBadge';

const RESISTANCE_FIELDS = [
    ['abrasion_resistance', 'Abrasion Resistance'],
    ['stain_resistance', 'Stain Resistance'],
    ['etching_resistance', 'Etching Resistance'],
    ['heat_resistance', 'Heat Resistance'],
    ['uv_resistance', 'UV Resistance'],
    ['color_range', 'Color Range'],
    ['movement_index', 'Movement Index'],
];

export default function SpecificationsTab({
    formData,
    handleChange,
    canEditApplications,
}) {
    return (
        <Stack spacing={3}>

            <SectionLabel>
                Resistance & Quality Ratings
            </SectionLabel>

            <Grid
                container
                spacing={2.5}
                sx={{
                    width: '100%',
                    m: 0,
                }}
            >

                {RESISTANCE_FIELDS.map(([key, label]) => (

                    <Grid
                        item
                        xs={12}
                        sm={6}
                        key={key}
                    >

                        <TextField
                            select
                            fullWidth
                            disabled={!canEditApplications()}
                            label={
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                >
                                    {label}

                                    <ResistanceBadge
                                        value={formData[key]}
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

                ))}

            </Grid>

            {!canEditApplications() && (

                <Alert severity="info">
                    You do not have permission to modify specification ratings.
                </Alert>

            )}

        </Stack>
    );
}

SpecificationsTab.propTypes = {
    formData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    canEditApplications: PropTypes.func.isRequired,
};