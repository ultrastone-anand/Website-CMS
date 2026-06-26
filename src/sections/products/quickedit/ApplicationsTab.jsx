import PropTypes from 'prop-types';

import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import SectionLabel from './SectionLabel';

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

export default function ApplicationsTab({
    formData,
    handleChange,
    canEditApplications,
}) {
    return (
        <Stack spacing={2}>

            <SectionLabel>
                Where can this product be used?
            </SectionLabel>

            <Grid container>

                {APPLICATION_FIELDS.map(([key, label]) => (

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
                                py: .75,
                                px: 1,
                                borderRadius: 1,
                                '&:hover': {
                                    bgcolor: 'action.hover',
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

                ))}

            </Grid>

            {!canEditApplications() && (

                <Alert severity="info">
                    You do not have permission to modify application settings.
                </Alert>

            )}

        </Stack>
    );
}

ApplicationsTab.propTypes = {
    formData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    canEditApplications: PropTypes.func.isRequired,
};