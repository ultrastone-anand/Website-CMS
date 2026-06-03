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
  getProductDetail,
  getProductsByCategory,
} from 'src/services/product.service';

import Iconify from 'src/components/iconify';

import ProductCard from '../product-card';
import CategoryCard from '../category-card';
import ProductQuickEdit from '../product-quick-edit';

export default function ProductsView() {
  const [categories, setCategories] =
    useState([]);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(null);

  const [products, setProducts] =
    useState([]);

  const [productModalOpen, setProductModalOpen] =
    useState(false);

  const [currentProduct, setCurrentProduct] =
    useState(null);

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

  const loadCategories =
    async () => {
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

  const loadProducts =
    async (slug) => {
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

        setProductModalOpen(true);
      } catch (error) {
        console.error(error);
      }
    };

  const handleCloseModal =
    () => {
      setProductModalOpen(false);
      setCurrentProduct(null);
    };

  const handleSubmit =
    async (payload) => {
      try {
        if (currentProduct) {
          console.log(
            'UPDATE PRODUCT',
            payload
          );

          // await updateProduct(
          //   currentProduct.id,
          //   payload
          // );
        } else {
          console.log(
            'CREATE PRODUCT',
            payload
          );

          // await createProduct(
          //   payload
          // );
        }

        handleCloseModal();

        if (selectedCategory) {
          loadProducts(
            selectedCategory.slug
          );
        }
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

        <Button
  variant="contained"
  color="inherit"
  startIcon={<Iconify icon="eva:plus-fill" />}
  onClick={handleAddProduct}
>
  New Product
</Button>
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