import PropTypes from 'prop-types';
import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import {
  deleteLot,
  updateLotName,
  getProductLots,
  deleteLotImage,
  uploadAndSaveLotImages,
} from 'src/services/lotImage.service';

import LotUploadField from './LotUploadField';

// ----------------------------------------------------------------------

const createTemporaryId = (
  prefix = 'item'
) =>
  `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

// ----------------------------------------------------------------------

const createLotRow = (
  lotNumber = 1
) => ({
  id: createTemporaryId('lot'),
  lotId: null,
  lotName: `Lot ${lotNumber}`,
  originalLotName:
    `Lot ${lotNumber}`,
  images: [],
  isNew: true,
});

// ----------------------------------------------------------------------

const createImageObject = (
  file
) => ({
  id: createTemporaryId('image'),
  imageId: null,
  file,
  fileName: file.name,
  previewUrl:
    URL.createObjectURL(file),
  imageUrl: null,
  isNew: true,
});

// ----------------------------------------------------------------------

const getFileNameFromUrl = (
  imageUrl
) => {
  if (!imageUrl) {
    return 'Lot image';
  }

  try {
    return (
      decodeURIComponent(imageUrl)
        .split('/')
        .pop() || 'Lot image'
    );
  } catch {
    return (
      imageUrl
        .split('/')
        .pop() || 'Lot image'
    );
  }
};

// ----------------------------------------------------------------------

const mapDatabaseImage = (
  image
) => ({
  id: String(image.id),
  imageId: image.id,
  file: null,

  fileName:
    image.file_name ||
    getFileNameFromUrl(
      image.image_url
    ),

  previewUrl:
    image.image_url,

  imageUrl:
    image.image_url,

  altText:
    image.alt_text || '',

  displayOrder:
    image.display_order ?? 0,

  isPrimary:
    image.is_primary === true,

  isNew: false,
});

// ----------------------------------------------------------------------

const mapDatabaseLot = (
  lot
) => ({
  id: String(lot.id),
  lotId: lot.id,

  lotName:
    lot.lot_name || '',

  originalLotName:
    lot.lot_name || '',

  displayOrder:
    lot.display_order ?? 0,

  images:
    Array.isArray(lot.images)
      ? lot.images.map(
          mapDatabaseImage
        )
      : [],

  isNew: false,
});

// ----------------------------------------------------------------------

const revokeImagePreview = (
  image
) => {
  if (
    image?.isNew &&
    image?.previewUrl?.startsWith(
      'blob:'
    )
  ) {
    URL.revokeObjectURL(
      image.previewUrl
    );
  }
};

// ----------------------------------------------------------------------

const revokeLotPreviews = (
  lot
) => {
  (lot?.images || []).forEach(
    revokeImagePreview
  );
};

// ----------------------------------------------------------------------

export default function LotImagesTab({
  productId,
  onClose,
}) {
  const lotRowsRef =
    useRef([]);

  const [lotRows, setLotRows] =
    useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    deletingLotId,
    setDeletingLotId,
  ] = useState(null);

  const [
    deletingImageId,
    setDeletingImageId,
  ] = useState(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  // --------------------------------------------------------------------

  useEffect(() => {
    lotRowsRef.current =
      lotRows;
  }, [lotRows]);

  // --------------------------------------------------------------------

  useEffect(
    () => () => {
      lotRowsRef.current.forEach(
        revokeLotPreviews
      );
    },
    []
  );

  // --------------------------------------------------------------------

  const loadProductLots =
    useCallback(async () => {
      if (!productId) {
        setLotRows([
          createLotRow(1),
        ]);

        setErrorMessage(
          'Product database ID is missing.'
        );

        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');

        const response =
          await getProductLots(
            productId
          );

        const databaseLots =
          response?.data?.lots ||
          [];

        const mappedLots =
          databaseLots.map(
            mapDatabaseLot
          );

        setLotRows(
          mappedLots.length > 0
            ? mappedLots
            : [createLotRow(1)]
        );
      } catch (error) {
        console.error(
          'Load product lots error:',
          error
        );

        setErrorMessage(
          error.message ||
            'Failed to load product lots'
        );

        setLotRows([
          createLotRow(1),
        ]);
      } finally {
        setIsLoading(false);
      }
    }, [productId]);

  // --------------------------------------------------------------------

  useEffect(() => {
    loadProductLots();
  }, [loadProductLots]);

  // --------------------------------------------------------------------

  const getNextLotNumber = (
    previousRows
  ) => {
    const numbers =
      previousRows.map((row) => {
        const match =
          row.lotName?.match(
            /^Lot\s+(\d+)$/i
          );

        if (!match) {
          return 0;
        }

        return Number(match[1]);
      });

    return (
      Math.max(
        previousRows.length,
        ...numbers
      ) + 1
    );
  };

  // --------------------------------------------------------------------

  const handleAddLotRow = () => {
    setErrorMessage('');
    setSuccessMessage('');

    setLotRows(
      (previousRows) => {
        const nextLotNumber =
          getNextLotNumber(
            previousRows
          );

        return [
          ...previousRows,
          createLotRow(
            nextLotNumber
          ),
        ];
      }
    );
  };

  // --------------------------------------------------------------------

  const removeLotFromLocalState = (
    rowId
  ) => {
    setLotRows(
      (previousRows) => {
        const rowToRemove =
          previousRows.find(
            (row) =>
              row.id === rowId
          );

        revokeLotPreviews(
          rowToRemove
        );

        const updatedRows =
          previousRows.filter(
            (row) =>
              row.id !== rowId
          );

        if (
          updatedRows.length > 0
        ) {
          return updatedRows;
        }

        return [
          createLotRow(1),
        ];
      }
    );
  };

  // --------------------------------------------------------------------

  const handleRemoveLotRow =
    async (rowId) => {
      const row = lotRows.find(
        (item) =>
          item.id === rowId
      );

      if (!row) {
        return;
      }

      setErrorMessage('');
      setSuccessMessage('');

      if (!row.lotId) {
        removeLotFromLocalState(
          rowId
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Delete "${row.lotName}" and all its images?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingLotId(
          row.lotId
        );

        await deleteLot(
          row.lotId
        );

        removeLotFromLocalState(
          rowId
        );

        setSuccessMessage(
          'Lot deleted successfully'
        );
      } catch (error) {
        console.error(
          'Delete lot error:',
          error
        );

        setErrorMessage(
          error.message ||
            'Failed to delete lot'
        );
      } finally {
        setDeletingLotId(null);
      }
    };

  // --------------------------------------------------------------------

  const handleLotNameChange = (
    rowId,
    lotName
  ) => {
    setErrorMessage('');
    setSuccessMessage('');

    setLotRows(
      (previousRows) =>
        previousRows.map(
          (row) => {
            if (
              row.id !== rowId
            ) {
              return row;
            }

            return {
              ...row,
              lotName,
            };
          }
        )
    );
  };

  // --------------------------------------------------------------------

  const handleFilesSelected = (
    rowId,
    selectedFiles
  ) => {
    const validFiles =
      Array.from(
        selectedFiles || []
      ).filter((file) =>
        file.type.startsWith(
          'image/'
        )
      );

    if (!validFiles.length) {
      setErrorMessage(
        'Please select valid image files'
      );

      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    const newImages =
      validFiles.map(
        createImageObject
      );

    setLotRows(
      (previousRows) =>
        previousRows.map(
          (row) => {
            if (
              row.id !== rowId
            ) {
              return row;
            }

            return {
              ...row,

              images: [
                ...(row.images ||
                  []),

                ...newImages,
              ],
            };
          }
        )
    );
  };

  // --------------------------------------------------------------------

  const removeImageFromLocalState = (
    rowId,
    imageId
  ) => {
    setLotRows(
      (previousRows) =>
        previousRows.map(
          (row) => {
            if (
              row.id !== rowId
            ) {
              return row;
            }

            const imageToRemove =
              row.images?.find(
                (image) =>
                  image.id ===
                  imageId
              );

            revokeImagePreview(
              imageToRemove
            );

            return {
              ...row,

              images: (
                row.images || []
              ).filter(
                (image) =>
                  image.id !==
                  imageId
              ),
            };
          }
        )
    );
  };

  // --------------------------------------------------------------------

  const handleRemoveImage =
    async (
      rowId,
      imageId
    ) => {
      const row = lotRows.find(
        (item) =>
          item.id === rowId
      );

      const image =
        row?.images?.find(
          (item) =>
            item.id === imageId
        );

      if (!image) {
        return;
      }

      setErrorMessage('');
      setSuccessMessage('');

      if (!image.imageId) {
        removeImageFromLocalState(
          rowId,
          imageId
        );

        return;
      }

      const confirmed =
        window.confirm(
          'Delete this image permanently?'
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingImageId(
          image.imageId
        );

        await deleteLotImage(
          image.imageId
        );

        removeImageFromLocalState(
          rowId,
          imageId
        );

        setSuccessMessage(
          'Image deleted successfully'
        );
      } catch (error) {
        console.error(
          'Delete image error:',
          error
        );

        setErrorMessage(
          error.message ||
            'Failed to delete image'
        );
      } finally {
        setDeletingImageId(
          null
        );
      }
    };

  // --------------------------------------------------------------------

  const validateLots = () => {
    if (!productId) {
      throw new Error(
        'Product database ID is missing'
      );
    }

    const emptyNameLot =
      lotRows.find(
        (row) =>
          !row.lotName?.trim()
      );

    if (emptyNameLot) {
      throw new Error(
        'Every lot must have a lot name'
      );
    }

    const normalizedNames =
      lotRows.map((row) =>
        row.lotName
          .trim()
          .toLowerCase()
      );

    const uniqueNames =
      new Set(
        normalizedNames
      );

    if (
      uniqueNames.size !==
      normalizedNames.length
    ) {
      throw new Error(
        'Lot names must be unique for this product'
      );
    }
  };

  // --------------------------------------------------------------------

  const saveSingleLot =
    async (row) => {
      const trimmedLotName =
        row.lotName.trim();

      const newFiles = (
        row.images || []
      )
        .filter(
          (image) =>
            image.isNew &&
            image.file instanceof
              File
        )
        .map(
          (image) =>
            image.file
        );

      const lotNameChanged =
        Boolean(row.lotId) &&
        trimmedLotName !==
          row.originalLotName;

      if (lotNameChanged) {
        await updateLotName(
          row.lotId,
          trimmedLotName
        );
      }

      if (
        row.isNew ||
        newFiles.length > 0
      ) {
        return uploadAndSaveLotImages({
          productId,

          lotId:
            row.lotId,

          lotName:
            trimmedLotName,

          files:
            newFiles,
        });
      }

      return null;
    };

  // --------------------------------------------------------------------

  const handleSaveLots =
    async () => {
      try {
        setErrorMessage('');
        setSuccessMessage('');

        validateLots();

        setIsSaving(true);

        await Promise.all(
          lotRows.map(
            saveSingleLot
          )
        );

        await loadProductLots();

        setSuccessMessage(
          'Lot images saved successfully'
        );
      } catch (error) {
        console.error(
          'Save lot images error:',
          error
        );

        setErrorMessage(
          error.message ||
            'Failed to save lot images'
        );
      } finally {
        setIsSaving(false);
      }
    };

  // --------------------------------------------------------------------

  const totalImages = useMemo(
    () =>
      lotRows.reduce(
        (total, row) =>
          total +
          (row.images?.length ||
            0),
        0
      ),
    [lotRows]
  );

  // --------------------------------------------------------------------

  if (isLoading) {
    return (
      <Stack
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: 260,
        }}
      >
        <CircularProgress
          size={32}
        />

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Loading product lots...
        </Typography>
      </Stack>
    );
  }

  // --------------------------------------------------------------------

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle1">
          Product Lots
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Enter a lot name, then
          browse or drag images
          directly into that lot.
        </Typography>
      </Box>

      {errorMessage && (
        <Alert
          severity="error"
          onClose={() =>
            setErrorMessage('')
          }
        >
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          onClose={() =>
            setSuccessMessage('')
          }
        >
          {successMessage}
        </Alert>
      )}

      <Stack spacing={2}>
        {lotRows.map(
          (row, index) => {
            const isDeletingLot =
              Boolean(row.lotId) &&
              String(
                deletingLotId
              ) ===
                String(row.lotId);

            return (
              <LotUploadField
                key={row.id}
                rowId={row.id}
                lotId={row.lotId}
                index={index}
                lotName={
                  row.lotName
                }
                images={
                  row.images || []
                }
                disabled={isSaving}
                deletingLot={
                  isDeletingLot
                }
                deletingImageId={
                  deletingImageId
                }
                onLotNameChange={
                  handleLotNameChange
                }
                onFilesSelected={
                  handleFilesSelected
                }
                onRemoveImage={
                  handleRemoveImage
                }
                onAddRow={
                  handleAddLotRow
                }
                onRemoveRow={
                  handleRemoveLotRow
                }
                canRemoveRow={
                  lotRows.length >
                    1 ||
                  Boolean(row.lotId)
                }
              />
            );
          }
        )}
      </Stack>

      <Button
        variant="outlined"
        disabled={isSaving}
        onClick={
          handleAddLotRow
        }
        sx={{
          minHeight: 48,
          borderStyle: 'dashed',
          textTransform: 'none',
        }}
      >
        + Add Another Lot
      </Button>

      <Divider />

      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        spacing={2}
        alignItems={{
          xs: 'stretch',
          sm: 'center',
        }}
        justifyContent="space-between"
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          {lotRows.length}{' '}
          {lotRows.length === 1
            ? 'lot'
            : 'lots'}{' '}
          with {totalImages}{' '}
          {totalImages === 1
            ? 'image'
            : 'images'}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
        >
          <Button
            variant="outlined"
            disabled={isSaving}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={
              isSaving ||
              !productId
            }
            onClick={
              handleSaveLots
            }
            startIcon={
              isSaving ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : null
            }
            sx={{
              minWidth: 180,
              textTransform: 'none',
            }}
          >
            {isSaving
              ? 'Saving Lots...'
              : 'Save Lot Images'}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

LotImagesTab.propTypes = {
  productId:
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,

  onClose:
    PropTypes.func.isRequired,
};