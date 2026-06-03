import PropTypes from 'prop-types';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function CategoryCard({
  category,
  selected,
  onClick,
}) {

  return (
    <Paper
      elevation={selected ? 3 : 0}
      onClick={onClick}
      sx={{
        height: 50,
        p: 1.5,
        borderRadius: 2,
        cursor: 'pointer',

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',

        transition: 'all 0.2s ease',

        background: selected
          ? (theme) =>
              `linear-gradient(
                135deg,
                ${theme.palette.primary.main},
                ${theme.palette.primary.dark}
              )`
          : '#fff',

        color: selected
          ? '#fff'
          : 'text.primary',

        border: (theme) =>
          selected
            ? `1px solid ${theme.palette.primary.main}`
            : `1px solid ${theme.palette.divider}`,

        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <Typography
        variant="subtitle2"
        fontWeight={600}
        noWrap
      >
        {category.name}
      </Typography>

    </Paper>
  );
}

CategoryCard.propTypes = {
  category: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};