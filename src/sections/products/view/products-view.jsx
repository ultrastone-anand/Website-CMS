import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Checkbox, TextField, Autocomplete } from '@mui/material';

import { getCategories } from 'src/services/category.service';
import {
  createProduct,
  deleteProduct,
  updateProduct,
  getProductDetail,
  updateProductStatus,
  updatePublishStatus,
  getProductsByCategory,
  uploadVideoDirectToR2,
  bulkupdateProductStatus,
} from 'src/services/product.service';

import Iconify from 'src/components/iconify';

import ProductCard from '../product-card';
import { canEditIdentity } from '../role-access';
import ProductQuickEdit from '../product-quick-edit';

export default function ProductsView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBin, setShowBin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [deletedMediaIds, setDeletedMediaIds] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory,] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadProducts(
        selectedCategory.slug
      );
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const response =
        await getCategories();

      const data =
        response.data || [];

      const activeCategories = data
        .filter((item) => item.is_active)
        .sort((a, b) =>
          a.name.localeCompare(b.name)
        );

      setCategories(
        activeCategories
      );

      if (
        activeCategories.length > 0
      ) {
        setSelectedCategory(
          activeCategories[0]
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadProducts = async (slug) => {
    try {
      const response =
        await getProductsByCategory(
          slug
        );

      const sortedProducts = (
        response.products || []
      ).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setProducts(sortedProducts);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = async (product) => {
    try {
      const response =
        await getProductDetail(
          product.slug
        );

      setCurrentProduct(
        response.product
      );

      setProductModalOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setProductModalOpen(false);
    setCurrentProduct(null);
  };

const buildProductFormData = (
  payload,
  uploadedFeaturedVideos = []
) => {
  const data = new FormData();

  // BASIC
  [
    'name',
    'slug',
    'small_description',
    'long_description',
    'category_id',
    'pattern',
    'stone_group',
    'origin_country',
    'pantone_colour',
    'variation_level',
    'sealer',
  ].forEach((key) => {
    data.append(key, payload[key] ?? '');
  });

  // ARRAYS
  [
    'finishes_available',
    'thicknesses_cm',
    'average_sizes_inches',
  ].forEach((key) => {
    data.append(
      key,
      JSON.stringify(payload[key] || [])
    );
  });

  // BOOLEANS
  [
    'translucent',
    'cut_to_size',
    'color_enhancing',
    'countertops_vanities',
    'interior_floor',
    'interior_wall',
    'shower_wall',
    'shower_floor',
    'exterior_floor',
    'exterior_wall',
    'pool_fountain',
    'fireplace',
    'furniture_top',
    'is_featured',
    'is_trending',
    'is_new_arrival',
    'silica_warning',
    'is_active',
  ].forEach((key) => {
    data.append(
      key,
      String(Boolean(payload[key]))
    );
  });

  // This is text, not boolean
  data.append(
    'silica_warning_message',
    payload.silica_warning_message ?? ''
  );

  // SPECIFICATIONS
  [
    'abrasion_resistance',
    'stain_resistance',
    'etching_resistance',
    'heat_resistance',
    'uv_resistance',
    'color_range',
    'movement_index',
  ].forEach((key) => {
    data.append(key, payload[key] ?? '');
  });

  // SEO TEXT FIELDS
  [
    'meta_title',
    'meta_description',
    'canonical_url',
    'og_title',
    'og_description',
    'og_image',
    'seo_content',
  ].forEach((key) => {
    data.append(key, payload[key] ?? '');
  });

  // SCHEMA JSON
  data.append(
    'schema_markup',
    JSON.stringify(
      payload.schema_markup || {}
    )
  );

  // SEO BOOLEANS
  ['robots_index', 'robots_follow'].forEach(
    (key) => {
      data.append(
        key,
        String(payload[key] ?? true)
      );
    }
  );

  // IMAGE FILES ONLY
  [
    'closeup_images',
    'slab_images',
    'application_images',
    'bookmatch_slipmatch',
  ].forEach((field) => {
    (payload[field] || []).forEach(
      (file) => {
        if (file instanceof File) {
          data.append(field, file);
        }
      }
    );
  });

  // NEW VIDEOS ALREADY UPLOADED DIRECTLY TO R2
  data.append(
    'uploaded_featured_videos',
    JSON.stringify(uploadedFeaturedVideos)
  );

  // EXISTING PRODUCT MEDIA
  data.append(
    'existing_media',
    JSON.stringify(payload.media || [])
  );

  // DELETED MEDIA
  data.append(
    'deleted_media',
    JSON.stringify(deletedMediaIds)
  );

  // FAQS
  data.append(
    'faqs',
    JSON.stringify(payload.faqs || [])
  );

  // SILICA DATASHEET
  if (
    payload.silica_warning_datasheet instanceof
    File
  ) {
    data.append(
      'silica_datasheet',
      payload.silica_warning_datasheet
    );
  }

  return data;
};

const uploadFeaturedVideos = async (
  featuredVideos = []
) => {
  const newVideoFiles =
    featuredVideos.filter(
      (video) => video instanceof File
    );

  if (newVideoFiles.length === 0) {
    return [];
  }

  const uploadedVideos =
    await Promise.all(
      newVideoFiles.map((file) =>
        uploadVideoDirectToR2(file)
      )
    );

  return uploadedVideos;
};

const handleSubmit = async (payload) => {
  try {
    setLoading(true);

    // Step 1: Upload new video files directly to R2
    const uploadedFeaturedVideos =
      await uploadFeaturedVideos(
        payload.featured_videos
      );

    // Step 2: Build product form without raw videos
    const formData =
      buildProductFormData(
        payload,
        uploadedFeaturedVideos
      );

    // Step 3: Create or update product
    if (currentProduct?.id) {
      await updateProduct(
        currentProduct.id,
        formData
      );
    } else {
      await createProduct(formData);
    }

    setDeletedMediaIds([]);
    handleCloseModal();

    if (selectedCategory) {
      await loadProducts(
        selectedCategory.slug
      );
    }
  } catch (error) {
    console.error(
      'Product Save Error:',
      error
    );
  } finally {
    setLoading(false);
  }
};

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      if (selectedCategory) { await loadProducts(selectedCategory.slug); }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const searchMatch = product.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const statusMatch = showBin
        ? !product.is_active
        : product.is_active;

      return searchMatch && statusMatch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // const handleBulkDelete = async () => {
  //   try {
  //     if (selectedProducts.length === 0) return;

  //     const confirmed = window.confirm(
  //       `Delete ${selectedProducts.length} products?`
  //     );

  //     if (!confirmed) return;

  //     const idsToDelete = [...selectedProducts];

  //     await bulkdeleteProduct(idsToDelete);


  //     setProducts((prevProducts) =>
  //       prevProducts.filter(
  //         (product) =>
  //           !idsToDelete.includes(product.id)
  //       )
  //     );

  //     setSelectedProducts([]);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleBulkDeactivate = async () => {
    try {

      if (selectedProducts.length === 0) {
        return;
      }

      const confirmed = window.confirm(
        `Deactivate ${selectedProducts.length} products?`
      );

      if (!confirmed) {
        return;
      }

      const idsToDeactivate = [
        ...selectedProducts,
      ];

      await bulkupdateProductStatus(
        idsToDeactivate,
        false
      );

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          idsToDeactivate.includes(
            product.id
          )
            ? {
              ...product,
              is_active: false,
            }
            : product
        )
      );

      setSelectedProducts([]);

    } catch (error) {

      console.error(error);

    }
  };

  const handleSelectProduct = (
    productId
  ) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter(
          (id) => id !== productId
        )
        : [...prev, productId]
    );
  };

  const handleProductStatusChange = async (
    productId,
    status
  ) => {
    try {

      await updateProductStatus(
        productId,
        status
      );

      if (selectedCategory) {
        await loadProducts(
          selectedCategory.slug
        );
      }
    } catch (error) {
      console.error(
        "Status Update Error:",
        error
      );
    }
  };

  const handlePublishProduct = async (
    productId,
    currentPublishStatus
  ) => {
    console.log(productId, currentPublishStatus)
    try {

      await updatePublishStatus(
        productId,
        currentPublishStatus
      );

      if (selectedCategory) {
        await loadProducts(
          selectedCategory.slug
        );
      }

    } catch (error) {

      console.error(
        "Publish Update Error:",
        error
      );

    }

  };

  const activeCount = products.filter((p) => p.is_active).length;
  const inactiveCount = products.filter((p) => !p.is_active).length;
  const publishedCount = products.filter((p) => p.is_published).length;

  return (
    <Container maxWidth={false}>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={4}
      >
        <Typography variant="h4">
          Products
        </Typography>

        <Stack
          direction="row"
          spacing={2}
        >

          {selectedProducts.length > 0 ? (
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
              >
                {selectedProducts.length} Selected
              </Typography>

              <Button
                color="warning"
                variant="contained"
                startIcon={
                  <Iconify icon="solar:trash-bin-trash-outline" />
                }
                onClick={handleBulkDeactivate}
              >
                Move to Bin
              </Button>

              <Button
                color="inherit"
                variant="text"
                onClick={() => setSelectedProducts([])}
              >
                Cancel
              </Button>
            </Stack>
          ) : (
            canEditIdentity && (
              <Button
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={handleAddProduct}
              >
                New Product
              </Button>
            )
          )}
        </Stack>
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Autocomplete
          sx={{ flex: 1, minWidth: 280 }}
          options={categories}
          value={selectedCategory}
          onChange={(_, value) => {
            setSelectedProducts([]);
            setSelectedCategory(value);
          }}
          getOptionLabel={(option) => option?.name || ""}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Category"
            />
          )}
        />

        <TextField
          sx={{ flex: 1, minWidth: 300 }}
          label="Search Products"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Box
          sx={{
            display: "flex",
            bgcolor: "background.neutral",
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            p: 0.5,
            gap: 0.5,
          }}
        >
          <Button
            disableElevation
            variant={!showBin ? "contained" : "text"}
            color={!showBin ? "primary" : "inherit"}
            sx={{
              minWidth: 110,
              borderRadius: 1.5,
            }}
            onClick={() => {
              setShowBin(false);
              setSelectedProducts([]);
            }}
          >
            Products
          </Button>

          <Button
            disableElevation
            variant={showBin ? "contained" : "text"}
            color={showBin ? "warning" : "inherit"}
            startIcon={
              <Iconify icon="solar:trash-bin-trash-outline" />
            }
            sx={{
              minWidth: 110,
              borderRadius: 1.5,
            }}
            onClick={() => {
              setShowBin(true);
              setSelectedProducts([]);
            }}
          >
            Bin
            {!showBin && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 0.8,
                  py: 0.2,
                  borderRadius: 5,
                  bgcolor: "warning.main",
                  color: "common.white",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {products.filter((p) => !p.is_active).length}
              </Box>
            )}
          </Button>
        </Box>
      </Stack>

      {selectedCategory && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              {selectedCategory.name}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              <Box component="span" fontWeight={600}>
                {activeCount}
              </Box>{" "}
              Active {activeCount !== 1 ? "Products" : "Product"}
              {" • "}
              <Box component="span" fontWeight={600}>
                {inactiveCount}
              </Box>{" "}
              In Bin
              {" • "}
              <Box component="span" fontWeight={600}>
                {publishedCount}
              </Box>{" "}
              Published
            </Typography>
          </Box>

          {filteredProducts.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Checkbox
                checked={
                  filteredProducts.length > 0 &&
                  selectedProducts.length ===
                  filteredProducts.length
                }
                indeterminate={
                  selectedProducts.length > 0 &&
                  selectedProducts.length <
                  filteredProducts.length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProducts(
                      filteredProducts.map(
                        (p) => p.id
                      )
                    );
                  } else {
                    setSelectedProducts([]);
                  }
                }}
              />

              <Typography>
                Select All
              </Typography>
            </Stack>
          )}
        </Stack>
      )}

      <Grid
        container
        spacing={3}
      >
        {filteredProducts.map(
          (product) => (
            <Grid
              key={product.id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
            >
              <Box position="relative">
                <Checkbox
                  checked={selectedProducts.includes(
                    product.id
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onChange={(e) => {
                    e.stopPropagation();

                    handleSelectProduct(
                      product.id
                    );
                  }}
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    zIndex: 1000,
                    bgcolor: "background.paper",
                    borderRadius: "50%",
                  }}
                />

                <ProductCard
                  product={product}
                  categories={
                    selectedCategory
                  }
                  onEdit={
                    handleEditProduct
                  }
                  onDelete={
                    handleDeleteProduct
                  }
                  onStatusChange={
                    handleProductStatusChange
                  }
                  onPublish={
                    handlePublishProduct
                  }
                />
              </Box>
            </Grid>
          )
        )}
      </Grid>

      {products.length === 0 && (
        <Box
          sx={{
            py: 10,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
          >
            No products found
          </Typography>
        </Box>
      )}

      <ProductQuickEdit open={
        productModalOpen
      }
        onClose={
          handleCloseModal
        }
        currentProduct={
          currentProduct
        }
        categories={
          categories
        }
        onSubmit={
          handleSubmit
        }
        loading={
          loading
        }
        deletedMediaIds={deletedMediaIds}
        setDeletedMediaIds={setDeletedMediaIds}
      />
    </Container>
  );
}