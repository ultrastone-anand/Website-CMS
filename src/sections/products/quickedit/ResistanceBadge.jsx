import PropTypes from 'prop-types';

import Chip from '@mui/material/Chip';

export default function ResistanceBadge({ value }) {
    const colorMap = {
        LOW: 'error',
        MEDIUM: 'warning',
        HIGH: 'success',
    };

    return (
        <Chip
            size="small"
            label={value}
            color={colorMap[value] || 'default'}
            sx={{
                ml: 1,
                fontSize: 10,
                height: 20,
            }}
        />
    );
}

ResistanceBadge.propTypes = {
    value: PropTypes.oneOf([
        'LOW',
        'MEDIUM',
        'HIGH',
    ]).isRequired,
};