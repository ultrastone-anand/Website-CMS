import QRCode from 'qrcode';
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
import { Tooltip, IconButton } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import Iconify from 'src/components/iconify';

import { canView, canEditIdentity } from './role-access';


export default function ShopProductCard({
  product,
  categories,
  onEdit,
  onDelete,
  onStatusChange,
  onPublish,
}) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // const handleDeleteClick = () => {
  //   setOpenDeleteDialog(true);
  // };

  const handleCloseDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleConfirmDelete = () => {
    onDelete(product.id);
    setOpenDeleteDialog(false);
  };

  const handleDownloadQR = async () => {
    try {
      const qrUrl = `https://web.ultrastone.in/product/${categories.slug}/${product.slug}`;

      const dataUrl = await QRCode.toDataURL(qrUrl, {
        width: 500,
        margin: 2,
      });

      const link = document.createElement('a');

      link.href = dataUrl;
      link.download = `${product.slug}-qr.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('QR generation failed', error);
    }
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
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              variant="subtitle1"
              noWrap
              sx={{ flex: 1 }}
            >
              {product.name}
            </Typography>

            <Tooltip title="Download QR Code">
              <IconButton
                size="small"
                onClick={handleDownloadQR}
              >
                <Iconify
                  icon="mdi:qrcode"
                  width={32}
                />
              </IconButton>
            </Tooltip>
          </Stack>



          <Typography
            variant="body2"
            color="text.secondary"
          >
            {product.pattern} ● {product.stone_group}
          </Typography>
        </Stack>

        <CardActions
          sx={{
            px: 2,
            pb: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
<Stack
  direction="row"
  spacing={1}
  justifyContent="flex-end"
  sx={{
    px: 2,
    pb: 2,
  }}
>
  {/* If product is inactive, show ONLY Activate button */}
  {!product.is_active ? (
    canEditIdentity() && (
      <Tooltip title="Activate">
        <IconButton
          onClick={() =>
            onStatusChange(product.id, true)
          }
          sx={{
            bgcolor: "success.lighter",
            color: "success.main",
            "&:hover": {
              bgcolor: "success.main",
              color: "common.white",
            },
          }}
        >
          <Iconify
            icon="mdi:toggle-switch"
            width={22}
          />
        </IconButton>
      </Tooltip>
    )
  ) : (
    <>
      {/* Edit */}
      <Tooltip title={canView() ? "View Product" : "Edit Product"}>
        <IconButton
          onClick={() => onEdit(product)}
          sx={{
            bgcolor: "primary.lighter",
            color: "primary.main",
            "&:hover": {
              bgcolor: "primary.main",
              color: "common.white",
            },
          }}
        >
          <Iconify
            icon="mdi:pencil-outline"
            width={20}
          />
        </IconButton>
      </Tooltip>

      {/* Deactivate */}
      {canEditIdentity() && (
        <Tooltip title="Deactivate">
          <IconButton
            onClick={() =>
              onStatusChange(product.id, false)
            }
            sx={{
              bgcolor: "warning.lighter",
              color: "warning.main",
              "&:hover": {
                bgcolor: "warning.main",
                color: "common.white",
              },
            }}
          >
            <Iconify
              icon="mdi:toggle-switch"
              width={22}
            />
          </IconButton>
        </Tooltip>
      )}

      {/* Publish */}
      {canEditIdentity() && (
        <Tooltip
          title={
            product.is_published
              ? "Unpublish"
              : "Publish"
          }
        >
          <IconButton
            onClick={() =>
              onPublish(
                product.id,
                !product.is_published
              )
            }
            sx={{
              bgcolor: product.is_published
                ? "secondary.lighter"
                : "grey.200",
              color: product.is_published
                ? "secondary.main"
                : "text.secondary",
              "&:hover": {
                bgcolor: product.is_published
                  ? "secondary.main"
                  : "grey.700",
                color: "common.white",
              },
            }}
          >
            <Iconify
              icon={
                product.is_published
                  ? "mdi:web-check"
                  : "mdi:web-off"
              }
              width={20}
            />
          </IconButton>
        </Tooltip>
      )}
    </>
  )}
</Stack>
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
  categories: PropTypes.object,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onPublish: PropTypes.func,
};
