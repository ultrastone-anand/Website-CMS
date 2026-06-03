import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';

export default function ShopProductCard({
  product,
  onEdit,
}) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          pt: '55%',
          position: 'relative',
        }}
      >
        <Box
          component="img"
          alt={product.name}
          src={
            product.featured_image ||
            '/assets/placeholder.png'
          }
          sx={{
            top: 0,
            width: 1,
            height: 1,
            objectFit: 'cover',
            position: 'absolute',
          }}
        />
      </Box>

      <Stack
        spacing={2}
        sx={{
          p: 2,
          flexGrow: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          noWrap
        >
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {product.pattern}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {product.stone_group}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
        >
          {product.is_featured && (
            <Chip
              size="small"
              label="Featured"
              color="warning"
            />
          )}

          {product.is_trending && (
            <Chip
              size="small"
              label="Trending"
              color="primary"
            />
          )}

          {product.is_new_arrival && (
            <Chip
              size="small"
              label="New"
              color="success"
            />
          )}
        </Stack>
      </Stack>

      <CardActions
        sx={{
          px: 2,
          pb: 2,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          onClick={() => onEdit(product)}
        >
          Edit Product
        </Button>
      </CardActions>
    </Card>
  );
}

ShopProductCard.propTypes = {
  product: PropTypes.object,
  onEdit: PropTypes.func,
};