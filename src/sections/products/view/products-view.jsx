import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import {
  getCategories,
} from 'src/services/category.service';
import {
  createProduct,
  deleteProduct,
  updateProduct,
  getProductDetail,
  getProductsByCategory,
} from 'src/services/product.service';

import Iconify from 'src/components/iconify';

import ProductCard from '../product-card';
import CategoryCard from '../category-card';
import ProductQuickEdit from '../product-quick-edit';

export default function ProductsView() {
  const [categories, setCategories] =useState([]);
  const [selectedCategory,setSelectedCategory,] = useState(null);
  const [products, setProducts] =useState([]);
  const [productModalOpen, setProductModalOpen] =useState(false);
  const [currentProduct, setCurrentProduct] =useState(null);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const canAddProducts = [1, 3, 4].includes(Number(user?.role_id));

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

  const buildProductFormData = (payload) => {
    const data = new FormData();

    // BASIC
    [
      "name",
      "slug",
      "small_description",
      "long_description",
      "category_id",
      "pattern",
      "stone_group",
      "origin_country",
      "pantone_colour",
      "variation_level",
    ].forEach((key) => {
      data.append(key, payload[key] ?? "");
    });

    // ARRAYS
    [
      "finishes_available",
      "thicknesses_cm",
      "average_sizes_inches",
    ].forEach((key) => {
      data.append(key, JSON.stringify(payload[key] || []));
    });

    // BOOLEANS
    [
      "translucent",
      "cut_to_size",
      "color_enhancing",
      "countertops_vanities",
      "interior_floor",
      "shower_wall",
      "shower_floor",
      "exterior_floor",
      "exterior_wall",
      "pool_fountain",
      "fireplace",
      "furniture_top",
      "is_featured",
      "is_trending",
      "is_new_arrival",
      "is_active",
    ].forEach((key) => {
      data.append(key, payload[key] || false);
    });

    // SPECIFICATIONS
    [
      "abrasion_resistance",
      "stain_resistance",
      "etching_resistance",
      "heat_resistance",
      "uv_resistance",
      "color_range",
      "movement_index",
    ].forEach((key) => {
      data.append(key, payload[key] ?? "");
    });

    // FILES
    [
      "closeup_images",
      "slab_images",
      "featured_videos",
      "application_images",
      "bookmatch_slipmatch",
    ].forEach((field) => {
      (payload[field] || []).forEach((file) => {
        if (file instanceof File) {
          data.append(field, file);
        }
      });
    });

    return data;
  };

  const handleSubmit = async (payload) => {
    try {
      const formData = buildProductFormData(payload);

      if (currentProduct?.id) {
        await updateProduct(currentProduct.id, formData);
      } else {
        await createProduct(formData);
      }

      handleCloseModal();

      if (selectedCategory) {
        await loadProducts(selectedCategory.slug);
      }
    } catch (error) {
      console.error("Product Save Error:", error);
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

        {canAddProducts && <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleAddProduct}
        >
          New Product
        </Button>}
      </Stack>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 700,
        }}
      >
        Categories
      </Typography>

      <Grid
        container
        spacing={2}
        sx={{ mb: 5 }}
      >
        {categories.map(
          (category) => (
            <Grid
              key={category.id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              xl={2}
            >
              <CategoryCard
                category={category}
                selected={
                  selectedCategory?.id ===
                  category.id
                }
                onClick={() =>
                  setSelectedCategory(
                    category
                  )
                }
              />
            </Grid>
          )
        )}
      </Grid>

      {selectedCategory && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            {
              selectedCategory.name
            }
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {products.length}{' '}
            product
            {products.length !== 1
              ? 's'
              : ''}
          </Typography>
        </Box>
      )}

      <Grid
        container
        spacing={3}
      >
        {products.map(
          (product) => (
            <Grid
              key={product.id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
            >
              <ProductCard
                product={
                  product
                }
                onEdit={
                  handleEditProduct
                }
                onDelete={
                  handleDeleteProduct
                }
              />
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

      <ProductQuickEdit
        open={
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
      />
    </Container>
  );
}