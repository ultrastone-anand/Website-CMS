import PropTypes from 'prop-types';

import Typography from '@mui/material/Typography';

export default function SectionLabel({ children }) {
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