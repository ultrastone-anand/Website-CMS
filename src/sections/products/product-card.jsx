import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import { canView, canEditIdentity } from './role-access';

export default function ShopProductCard({
product,
onEdit,
onDelete,
}) {
const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

const handleDeleteClick = () => {
setOpenDeleteDialog(true);
};

const handleCloseDialog = () => {
setOpenDeleteDialog(false);
};

const handleConfirmDelete = () => {
onDelete(product.id);
setOpenDeleteDialog(false);
};

return (
<>
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
product.closeup_image ||
'/assets/placeholder.png'
}
sx={{
top: 0,
width: 1,
height: 1,
objectFit: 'cover',
position: 'absolute',
}}
/> </Box>

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
        {canView()
          ? 'View Product'
          : 'Edit Product'}
      </Button>

      {canEditIdentity() && (
        <Button
          fullWidth
          variant="contained"
          color="error"
          onClick={handleDeleteClick}
        >
          Delete Product
        </Button>
      )}
    </CardActions>
  </Card>

  <Dialog
    open={openDeleteDialog}
    onClose={handleCloseDialog}
    maxWidth="xs"
    fullWidth
  >
    <DialogTitle>
      Delete Product
    </DialogTitle>

    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete
        <strong> {product.name}</strong>?
        <br />
        This action will make the
        product inactive and it will
        no longer appear in the
        product list.
      </DialogContentText>
    </DialogContent>

    <DialogActions>
      <Button
        onClick={handleCloseDialog}
      >
        Cancel
      </Button>

      <Button
        color="error"
        variant="contained"
        onClick={handleConfirmDelete}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
</>
);
}

ShopProductCard.propTypes = {
product: PropTypes.object,
onEdit: PropTypes.func,
onDelete: PropTypes.func,
};
