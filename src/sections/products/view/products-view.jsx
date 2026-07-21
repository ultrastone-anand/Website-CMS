import {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

import {
  getCategories,
} from 'src/services/category.service';
import {
  createProduct,
  deleteProduct,
  updateProduct,
  searchProducts,
  getProductDetail,
  updateProductStatus,
  updatePublishStatus,
  getProductsByCategory,
  uploadVideoDirectToR2,
  bulkupdateProductStatus,
} from 'src/services/product.service';

import Iconify from 'src/components/iconify';

import ProductCard from '../product-card';
import {
  canEditIdentity,
} from '../role-access';
import ProductQuickEdit from '../product-quick-edit';

export default function ProductsView() {
  const searchRequestIdRef = useRef(0);

  const [products, setProducts] =
    useState([]);

  const [
    searchResults,
    setSearchResults,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    productsLoading,
    setProductsLoading,
  ] = useState(false);

  const [
    searchLoading,
    setSearchLoading,
  ] = useState(false);

  const [showBin, setShowBin] =
    useState(false);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState('');

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    currentProduct,
    setCurrentProduct,
  ] = useState(null);

  const [
    deletedMediaIds,
    setDeletedMediaIds,
  ] = useState([]);

  const [
    selectedProducts,
    setSelectedProducts,
  ] = useState([]);

  const [
    productModalOpen,
    setProductModalOpen,
  ] = useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(null);

  const normalizedSearchTerm =
    searchTerm.trim();

  const isGlobalSearch =
    !selectedCategory &&
    normalizedSearchTerm.length >= 2;

  // ==============================
  // LOAD CATEGORIES
  // ==============================

  const loadCategories = async () => {
    try {
      const response =
        await getCategories();

      const data =
        response.data || [];

      const activeCategories = data
        .filter(
          (item) => item.is_active
        )
        .sort((a, b) =>
          (a.name || '').localeCompare(
            b.name || ''
          )
        );

      setCategories(
        activeCategories
      );

      // Do not automatically load
      // the first category.
      setSelectedCategory(null);
    } catch (error) {
      console.error(
        'Load Categories Error:',
        error
      );
    }
  };

  // ==============================
  // LOAD CATEGORY PRODUCTS
  // ==============================

  const loadProducts = async (
    slug
  ) => {
    if (!slug) {
      setProducts([]);
      return;
    }

    try {
      setProductsLoading(true);

      const response =
        await getProductsByCategory(
          slug
        );

      const sortedProducts = [
        ...(response.products || []),
      ].sort((a, b) =>
        (a.name || '').localeCompare(
          b.name || ''
        )
      );

      setProducts(
        sortedProducts
      );
    } catch (error) {
      console.error(
        'Load Products Error:',
        error
      );

      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // ==============================
  // GLOBAL PRODUCT SEARCH
  // ==============================

  const loadGlobalSearchResults = useCallback(
    async ({
      query,
      binStatus,
    }) => {
      const normalizedQuery =
        String(query || '').trim();

      if (
        normalizedQuery.length < 2
      ) {
        setSearchResults([]);
        return;
      }

      const requestId =
        searchRequestIdRef.current + 1;

      searchRequestIdRef.current =
        requestId;

      try {
        setSearchLoading(true);

        const response =
          await searchProducts({
            query:
              normalizedQuery,

            status:
              binStatus
                ? 'inactive'
                : 'active',

            page: 1,
            limit: 50,
          });

        if (
          requestId !==
          searchRequestIdRef.current
        ) {
          return;
        }

        const results = [
          ...(response.data || []),
        ].sort((a, b) =>
          (a.name || '').localeCompare(
            b.name || ''
          )
        );

        setSearchResults(
          results
        );
      } catch (error) {
        if (
          requestId !==
          searchRequestIdRef.current
        ) {
          return;
        }

        console.error(
          'Global Product Search Error:',
          error
        );

        setSearchResults([]);
      } finally {
        if (
          requestId ===
          searchRequestIdRef.current
        ) {
          setSearchLoading(false);
        }
      }
    },
    []
  );

  // ==============================
  // REFRESH CURRENT VIEW
  // ==============================

  const refreshCurrentView =
    async () => {
      if (
        selectedCategory?.slug
      ) {
        await loadProducts(
          selectedCategory.slug
        );

        return;
      }

      if (
        normalizedSearchTerm.length >=
        2
      ) {
        await loadGlobalSearchResults({
          query:
            normalizedSearchTerm,

          binStatus:
            showBin,
        });
      }
    };

  // ==============================
  // INITIAL CATEGORY LOAD
  // ==============================

  useEffect(() => {
    loadCategories();
  }, []);

  // ==============================
  // CATEGORY CHANGE
  // ==============================

  useEffect(() => {
    searchRequestIdRef.current += 1;
    setSearchLoading(false);
    setSelectedProducts([]);

    if (
      selectedCategory?.slug
    ) {
      setSearchResults([]);

      loadProducts(
        selectedCategory.slug
      );
    } else {
      setProducts([]);
    }
  }, [selectedCategory]);

  // ==============================
  // DEBOUNCED GLOBAL SEARCH
  // ==============================

  useEffect(() => {
    if (selectedCategory) {
      return undefined;
    }

    if (
      normalizedSearchTerm.length < 2
    ) {
      searchRequestIdRef.current += 1;

      setSearchResults([]);
      setSearchLoading(false);

      return undefined;
    }

    const timeoutId =
      window.setTimeout(() => {
        loadGlobalSearchResults({
          query:
            normalizedSearchTerm,

          binStatus:
            showBin,
        });
      }, 400);

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, [
    normalizedSearchTerm,
    selectedCategory,
    showBin,
    loadGlobalSearchResults,
  ]);
  // ==============================
  // PRODUCT MODAL
  // ==============================

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setDeletedMediaIds([]);
    setProductModalOpen(true);
  };

  const handleEditProduct =
    async (product) => {
      try {
        const response =
          await getProductDetail(
            product.slug
          );

        setCurrentProduct(
          response.product
        );

        setDeletedMediaIds([]);
        setProductModalOpen(true);
      } catch (error) {
        console.error(
          'Product Detail Error:',
          error
        );
      }
    };

  const handleCloseModal = () => {
    setProductModalOpen(false);
    setCurrentProduct(null);
    setDeletedMediaIds([]);
  };

  // ==============================
  // BUILD PRODUCT FORM DATA
  // ==============================

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
      data.append(
        key,
        payload[key] ?? ''
      );
    });

    // ARRAYS
    [
      'finishes_available',
      'thicknesses_cm',
      'average_sizes_inches',
    ].forEach((key) => {
      data.append(
        key,
        JSON.stringify(
          payload[key] || []
        )
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
        String(
          Boolean(payload[key])
        )
      );
    });

    // SILICA WARNING TEXT
    data.append(
      'silica_warning_message',
      payload
        .silica_warning_message ??
      ''
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
      data.append(
        key,
        payload[key] ?? ''
      );
    });

    // SEO TEXT
    [
      'meta_title',
      'meta_description',
      'canonical_url',
      'og_title',
      'og_description',
      'og_image',
      'seo_content',
    ].forEach((key) => {
      data.append(
        key,
        payload[key] ?? ''
      );
    });

    // SCHEMA MARKUP
    data.append(
      'schema_markup',
      JSON.stringify(
        payload.schema_markup ||
        {}
      )
    );

    // SEO BOOLEANS
    [
      'robots_index',
      'robots_follow',
    ].forEach((key) => {
      data.append(
        key,
        String(
          payload[key] ?? true
        )
      );
    });

    // IMAGE FILES
    [
      'closeup_images',
      'slab_images',
      'application_images',
      'bookmatch_slipmatch',
    ].forEach((field) => {
      (
        payload[field] || []
      ).forEach((file) => {
        if (
          file instanceof File
        ) {
          data.append(
            field,
            file
          );
        }
      });
    });

    // VIDEOS ALREADY UPLOADED TO R2
    data.append(
      'uploaded_featured_videos',
      JSON.stringify(
        uploadedFeaturedVideos
      )
    );

    // EXISTING MEDIA
    data.append(
      'existing_media',
      JSON.stringify(
        payload.media || []
      )
    );

    // DELETED MEDIA
    data.append(
      'deleted_media',
      JSON.stringify(
        deletedMediaIds
      )
    );

    // FAQS
    data.append(
      'faqs',
      JSON.stringify(
        payload.faqs || []
      )
    );

    // SILICA DATASHEET
    if (
      payload
        .silica_warning_datasheet instanceof
      File
    ) {
      data.append(
        'silica_datasheet',
        payload
          .silica_warning_datasheet
      );
    }

    return data;
  };

  // ==============================
  // UPLOAD FEATURED VIDEOS
  // ==============================

  const uploadFeaturedVideos =
    async (
      featuredVideos = []
    ) => {
      const newVideoFiles =
        featuredVideos.filter(
          (video) =>
            video instanceof File
        );

      if (
        newVideoFiles.length === 0
      ) {
        return [];
      }

      return Promise.all(
        newVideoFiles.map((file) =>
          uploadVideoDirectToR2(
            file
          )
        )
      );
    };

  // ==============================
  // CREATE / UPDATE PRODUCT
  // ==============================

  const handleSubmit =
    async (payload) => {
      try {
        setLoading(true);

        const uploadedFeaturedVideos =
          await uploadFeaturedVideos(
            payload.featured_videos
          );

        const formData =
          buildProductFormData(
            payload,
            uploadedFeaturedVideos
          );

        if (
          currentProduct?.id
        ) {
          await updateProduct(
            currentProduct.id,
            formData
          );
        } else {
          await createProduct(
            formData
          );
        }

        setDeletedMediaIds([]);
        handleCloseModal();

        await refreshCurrentView();
      } catch (error) {
        console.error(
          'Product Save Error:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

  // ==============================
  // DELETE PRODUCT
  // ==============================

  const handleDeleteProduct =
    async (productId) => {
      try {
        await deleteProduct(
          productId
        );

        setSelectedProducts(
          (previous) =>
            previous.filter(
              (id) =>
                id !== productId
            )
        );

        await refreshCurrentView();
      } catch (error) {
        console.error(
          'Delete Product Error:',
          error
        );
      }
    };

  // ==============================
  // BULK DEACTIVATE
  // ==============================

  const handleBulkDeactivate =
    async () => {
      try {
        if (
          selectedProducts.length ===
          0
        ) {
          return;
        }

        const confirmed =
          window.confirm(
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

        setProducts(
          (previousProducts) =>
            previousProducts.map(
              (product) =>
                idsToDeactivate.includes(
                  product.id
                )
                  ? {
                    ...product,
                    is_active:
                      false,
                    is_published:
                      false,
                  }
                  : product
            )
        );

        setSearchResults(
          (previousResults) => {
            if (!showBin) {
              return previousResults.filter(
                (product) =>
                  !idsToDeactivate.includes(
                    product.id
                  )
              );
            }

            return previousResults.map(
              (product) =>
                idsToDeactivate.includes(
                  product.id
                )
                  ? {
                    ...product,
                    is_active:
                      false,
                    is_published:
                      false,
                  }
                  : product
            );
          }
        );

        setSelectedProducts([]);

        await refreshCurrentView();
      } catch (error) {
        console.error(
          'Bulk Deactivate Error:',
          error
        );
      }
    };

  // ==============================
  // SELECT PRODUCT
  // ==============================

  const handleSelectProduct = (
    productId
  ) => {
    setSelectedProducts(
      (previous) =>
        previous.includes(productId)
          ? previous.filter(
            (id) =>
              id !== productId
          )
          : [
            ...previous,
            productId,
          ]
    );
  };

  // ==============================
  // STATUS CHANGE
  // ==============================

  const handleProductStatusChange =
    async (
      productId,
      status
    ) => {
      try {
        await updateProductStatus(
          productId,
          status
        );

        setSelectedProducts(
          (previous) =>
            previous.filter(
              (id) =>
                id !== productId
            )
        );

        await refreshCurrentView();
      } catch (error) {
        console.error(
          'Status Update Error:',
          error
        );
      }
    };

  // ==============================
  // PUBLISH CHANGE
  // ==============================

  const handlePublishProduct =
    async (
      productId,
      currentPublishStatus
    ) => {
      try {
        await updatePublishStatus(
          productId,
          currentPublishStatus
        );

        await refreshCurrentView();
      } catch (error) {
        console.error(
          'Publish Update Error:',
          error
        );
      }
    };

  // ==============================
  // DISPLAYED PRODUCTS
  // ==============================

  const sourceProducts =
    selectedCategory
      ? products
      : searchResults;

  const filteredProducts = [
    ...sourceProducts,
  ]
    .filter((product) => {
      if (!selectedCategory) {
        // Global search API already
        // filters search and status.
        return true;
      }

      const searchMatch =
        (product.name || '')
          .toLowerCase()
          .includes(
            normalizedSearchTerm.toLowerCase()
          );

      const statusMatch =
        showBin
          ? !product.is_active
          : product.is_active;

      return (
        searchMatch &&
        statusMatch
      );
    })
    .sort((a, b) =>
      (a.name || '').localeCompare(
        b.name || ''
      )
    );

  const activeCount =
    sourceProducts.filter(
      (product) =>
        product.is_active
    ).length;

  const inactiveCount =
    sourceProducts.filter(
      (product) =>
        !product.is_active
    ).length;

  const publishedCount =
    sourceProducts.filter(
      (product) =>
        product.is_published
    ).length;

  const filteredProductIds =
    filteredProducts.map(
      (product) =>
        product.id
    );

  const selectedFilteredCount =
    filteredProductIds.filter(
      (id) =>
        selectedProducts.includes(
          id
        )
    ).length;

  const isAllFilteredSelected =
    filteredProducts.length > 0 &&
    selectedFilteredCount ===
    filteredProducts.length;

  const isSomeFilteredSelected =
    selectedFilteredCount > 0 &&
    selectedFilteredCount <
    filteredProducts.length;

  const pageIsLoading =
    productsLoading ||
    searchLoading;

  const shouldShowSummary =
    Boolean(selectedCategory) ||
    isGlobalSearch;

  // ==============================
  // RENDER
  // ==============================

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
          {selectedProducts.length >
            0 ? (
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
              >
                {
                  selectedProducts.length
                }{' '}
                Selected
              </Typography>

              <Button
                color="warning"
                variant="contained"
                startIcon={
                  <Iconify icon="solar:trash-bin-trash-outline" />
                }
                onClick={
                  handleBulkDeactivate
                }
              >
                Move to Bin
              </Button>

              <Button
                color="inherit"
                variant="text"
                onClick={() =>
                  setSelectedProducts(
                    []
                  )
                }
              >
                Cancel
              </Button>
            </Stack>
          ) : (
            canEditIdentity && (
              <Button
                variant="contained"
                color="inherit"
                startIcon={
                  <Iconify icon="eva:plus-fill" />
                }
                onClick={
                  handleAddProduct
                }
              >
                New Product
              </Button>
            )
          )}
        </Stack>
      </Stack>

      <Stack
        direction={{
          xs: 'column',
          md: 'row',
        }}
        spacing={2}
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Autocomplete
          clearOnEscape
          sx={{
            flex: 1,
            minWidth: 280,
          }}
          options={categories}
          value={selectedCategory}
          onChange={(_, value) => {
            setSelectedProducts([]);
            setSearchResults([]);
            setSelectedCategory(value);
          }}
          getOptionLabel={(option) =>
            option?.name || ''
          }
          isOptionEqualToValue={(
            option,
            value
          ) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Category"
              placeholder="Optional"
              fullWidth
            />
          )}
        />

        <TextField
          fullWidth
          sx={{
            flex: 1,
            minWidth: 300,
          }}
          label="Search Products"
          placeholder={
            selectedCategory
              ? `Search in ${selectedCategory.name}`
              : 'Search across all products'
          }
          value={searchTerm}
          onChange={(event) => {
            setSelectedProducts([]);
            setSearchTerm(
              event.target.value
            );
          }}
          InputProps={{
            endAdornment:
              searchLoading ? (
                <CircularProgress
                  size={20}
                  sx={{ mr: 1 }}
                />
              ) : null,
          }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            height: 56,
            bgcolor:
              'background.neutral',
            border: (theme) =>
              `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            p: 0.5,
            gap: 0.5,
          }}
        >
          <Button
            disableElevation
            variant={
              !showBin
                ? 'contained'
                : 'text'
            }
            color={
              !showBin
                ? 'primary'
                : 'inherit'
            }
            sx={{
              minWidth: 110,
              height: 40,
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
            variant={
              showBin
                ? 'contained'
                : 'text'
            }
            color={
              showBin
                ? 'warning'
                : 'inherit'
            }
            startIcon={
              <Iconify icon="solar:trash-bin-trash-outline" />
            }
            sx={{
              minWidth: 110,
              height: 40,
              borderRadius: 1.5,
            }}
            onClick={() => {
              setShowBin(true);
              setSelectedProducts([]);
            }}
          >
            Bin

            {!showBin &&
              selectedCategory && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 0.8,
                    py: 0.2,
                    borderRadius: 5,
                    bgcolor:
                      'warning.main',
                    color:
                      'common.white',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {inactiveCount}
                </Box>
              )}
          </Button>
        </Box>
      </Stack>

      {shouldShowSummary && (
        <Stack
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          justifyContent="space-between"
          alignItems={{
            xs: 'flex-start',
            sm: 'center',
          }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              {selectedCategory
                ? selectedCategory.name
                : 'Search Results'}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              <Box
                component="span"
                fontWeight={600}
              >
                {activeCount}
              </Box>{' '}
              Active{' '}
              {activeCount !== 1
                ? 'Products'
                : 'Product'}

              {' • '}

              <Box
                component="span"
                fontWeight={600}
              >
                {inactiveCount}
              </Box>{' '}
              In Bin

              {' • '}

              <Box
                component="span"
                fontWeight={600}
              >
                {publishedCount}
              </Box>{' '}
              Published
            </Typography>
          </Box>

          {filteredProducts.length >
            0 && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Checkbox
                  checked={
                    isAllFilteredSelected
                  }
                  indeterminate={
                    isSomeFilteredSelected
                  }
                  onChange={(
                    event
                  ) => {
                    if (
                      event.target
                        .checked
                    ) {
                      setSelectedProducts(
                        (previous) => [
                          ...new Set([
                            ...previous,
                            ...filteredProductIds,
                          ]),
                        ]
                      );
                    } else {
                      setSelectedProducts(
                        (previous) =>
                          previous.filter(
                            (id) =>
                              !filteredProductIds.includes(
                                id
                              )
                          )
                      );
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

      {!selectedCategory &&
        normalizedSearchTerm.length <
        2 && (
          <Box
            sx={{
              py: 10,
              textAlign: 'center',
            }}
          >
            <Iconify
              icon="eva:search-fill"
              width={48}
              sx={{
                mb: 2,
                color:
                  'text.disabled',
              }}
            />

            <Typography
              variant="h6"
              color="text.secondary"
            >
              Search for a product
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Enter at least 2
              characters or select a
              category.
            </Typography>
          </Box>
        )}

      {pageIsLoading && (
        <Box
          sx={{
            py: 10,
            display: 'flex',
            flexDirection:
              'column',
            alignItems: 'center',
            justifyContent:
              'center',
            gap: 2,
          }}
        >
          <CircularProgress
            size={32}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {searchLoading
              ? 'Searching products...'
              : 'Loading products...'}
          </Typography>
        </Box>
      )}

      {!pageIsLoading && (
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
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();
                    }}
                    onChange={(
                      event
                    ) => {
                      event.stopPropagation();

                      handleSelectProduct(
                        product.id
                      );
                    }}
                    sx={{
                      position:
                        'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 1000,
                      bgcolor:
                        'background.paper',
                      borderRadius:
                        '50%',
                    }}
                  />

                  <ProductCard
                    product={
                      product
                    }
                    categories={
                      selectedCategory ||
                      product.category ||
                      product.stone_categories ||
                      null
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
      )}

      {!pageIsLoading &&
        shouldShowSummary &&
        filteredProducts.length ===
        0 && (
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

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Try another search term
              or select a different
              category.
            </Typography>
          </Box>
        )}

      <ProductQuickEdit
        open={productModalOpen}
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
        loading={loading}
        deletedMediaIds={
          deletedMediaIds
        }
        setDeletedMediaIds={
          setDeletedMediaIds
        }
      />
    </Container>
  );
}