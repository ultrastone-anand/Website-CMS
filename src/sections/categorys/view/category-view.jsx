
import { useTheme } from '@emotion/react';
import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import {
  getCategories,
  createCategory,
  updateCategory,
} from 'src/services/category.service';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// NEW: CATEGORY SEO
import CategorySEO from '../categorySEO';
import TableNoData from '../table-no-data';
import TableEmptyRows from '../table-empty-rows';
import CategoryCardRow from '../category-card-row';
import { canAddCategory } from '../category-access';
import CategoryTableRow from '../category-table-row';
import CategoryResources from '../category_resources';
import CategoryQuickEdit from '../category-quick-edit';
import CategoryTableHead from '../category-table-head';
import CategoryTableToolbar from '../category-table-toolbar';
import {
  emptyRows,
  applyFilter,
  getComparator,
} from '../utils';

// ============================================================
// CATEGORY PAGE
// ============================================================

export default function CategoryPage() {
  const theme = useTheme();

  // ============================================================
  // TABLE STATE
  // ============================================================

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [categories, setCategories] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const isMobile = useMediaQuery(
    theme.breakpoints.down('md')
  );

  // ============================================================
  // CATEGORY CREATE / EDIT STATE
  // ============================================================

  const [openEdit, setOpenEdit] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  // ============================================================
  // CATEGORY RESOURCES STATE
  // ============================================================

  const [openResources, setOpenResources] =
    useState(false);

  const [resourceCategory, setResourceCategory] =
    useState(null);

  // ============================================================
  // NEW: CATEGORY SEO STATE
  // ============================================================

  const [openSEO, setOpenSEO] = useState(false);

  const [seoCategory, setSeoCategory] =
    useState(null);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchCategories();
  }, []);

  // ============================================================
  // FETCH CATEGORIES
  // ============================================================

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await getCategories();

      setCategories(response.data || []);
    } catch (error) {
      console.error(
        'Error fetching categories:',
        error
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // TABLE SORTING
  // ============================================================

  const handleSort = (event, id) => {
    const isAsc =
      orderBy === id && order === 'asc';

    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  // ============================================================
  // SELECT ALL
  // ============================================================

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = categories.map(
        (item) => item.name
      );

      setSelected(newSelecteds);

      return;
    }

    setSelected([]);
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);

    setRowsPerPage(
      parseInt(event.target.value, 10)
    );
  };

  // ============================================================
  // FILTER
  // ============================================================

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  // ============================================================
  // FILTERED DATA
  // ============================================================

  const dataFiltered = applyFilter({
    inputData: categories,
    comparator: getComparator(
      order,
      orderBy
    ),
    filterName,
  });

  const notFound =
    !dataFiltered.length && !!filterName;

  // ============================================================
  // ADD CATEGORY
  // ============================================================

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setOpenEdit(true);
  };

  // ============================================================
  // EDIT CATEGORY
  // ============================================================

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedCategory(null);
  };

  // ============================================================
  // CREATE / UPDATE CATEGORY
  // ============================================================

  const handleSubmitCategory = async (formData) => {
    try {
      if (selectedCategory) {
        await updateCategory(
          selectedCategory.id,
          formData
        );
      } else {
        await createCategory(formData);
      }

      await fetchCategories();

      handleCloseEdit();
    } catch (error) {
      console.error(
        'Error saving category:',
        error
      );

      throw error;
    }
  };

  // ============================================================
  // UPDATE CATEGORY STATUS
  // ============================================================

  const updateCategoryStatus = async (item) => {
    try {
      const payload = new FormData();

      payload.append(
        'is_active',
        String(!item.is_active)
      );

      await updateCategory(
        item.id,
        payload
      );

      await fetchCategories();
    } catch (error) {
      console.error(
        'Error updating category status:',
        error
      );
    }
  };

  // ============================================================
  // CATEGORY RESOURCES
  // ============================================================

  const handleManageResources = (category) => {
    setResourceCategory(category);
    setOpenResources(true);
  };

  const handleCloseResources = () => {
    setOpenResources(false);
    setResourceCategory(null);
  };

  // ============================================================
  // NEW: CATEGORY SEO
  // ============================================================

  const handleManageSEO = (category) => {
    if (!category?.id) return;

    setSeoCategory(category);
    setOpenSEO(true);
  };

  const handleCloseSEO = () => {
    setOpenSEO(false);
    setSeoCategory(null);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <Container>
        <Typography variant="h5">
          Loading categories...
        </Typography>
      </Container>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Container maxWidth={false}>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
      >
        <Typography variant="h4">
          Categories
        </Typography>

        {canAddCategory && (
          <Button
            variant="contained"
            color="inherit"
            startIcon={
              <Iconify icon="eva:plus-fill" />
            }
            onClick={handleAddCategory}
          >
            New Category
          </Button>
        )}
      </Stack>

      {/* =====================================================
          CATEGORY LIST
      ===================================================== */}

      <Card>
        <CategoryTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        {/* =====================================================
            MOBILE VIEW
        ===================================================== */}

        {isMobile ? (
          <Stack spacing={2} sx={{ p: 2 }}>
            {dataFiltered
              .slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
              .map((row) => (
                <CategoryCardRow
                  key={row.id}
                  row={row}
                  categories={categories}
                  onEdit={handleEditCategory}
                  onToggleStatus={
                    updateCategoryStatus
                  }
                  onManageResources={
                    handleManageResources
                  }
                  onManageSEO={
                    handleManageSEO
                  }
                />
              ))}

            {notFound && (
              <TableNoData query={filterName} />
            )}
          </Stack>
        ) : (
          /* =====================================================
             DESKTOP VIEW
          ===================================================== */

          <Scrollbar>
            <TableContainer
              sx={{
                overflow: 'unset',
              }}
            >
              <Table
                sx={{
                  minWidth: 1000,
                }}
              >
                <CategoryTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={categories.length}
                  numSelected={selected.length}
                  onRequestSort={handleSort}
                  onSelectAllClick={
                    handleSelectAllClick
                  }
                  headLabel={[
                    {
                      id: 'name',
                      label: 'Name',
                    },
                    {
                      id: 'slug',
                      label: 'Slug',
                    },
                    {
                      id: 'parent',
                      label: 'Parent',
                    },
                    {
                      id: 'type',
                      label: 'Type',
                    },
                    {
                      id: 'silica_warning',
                      label: 'Silica Warning',
                    },
                    {
                      id: 'datasheet',
                      label: 'Datasheet',
                    },
                    {
                      id: 'status',
                      label: 'Status',
                    },
                    {
                      id: '',
                    },
                  ]}
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      page * rowsPerPage,
                      page * rowsPerPage +
                        rowsPerPage
                    )
                    .map((row) => (
                      <CategoryTableRow
                        key={row.id}
                        row={row}
                        categories={categories}
                        onEdit={
                          handleEditCategory
                        }
                        onToggleStatus={
                          updateCategoryStatus
                        }
                        onManageResources={
                          handleManageResources
                        }
                        onManageSEO={
                          handleManageSEO
                        }
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(
                      page,
                      rowsPerPage,
                      categories.length
                    )}
                  />

                  {notFound && (
                    <TableNoData
                      query={filterName}
                    />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        )}

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        <TablePagination
          page={page}
          component="div"
          count={categories.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[
            5,
            10,
            25,
            50,
          ]}
          onRowsPerPageChange={
            handleChangeRowsPerPage
          }
        />
      </Card>

      {/* =====================================================
          CATEGORY CREATE / EDIT DIALOG
      ===================================================== */}

      <CategoryQuickEdit
        open={openEdit}
        currentCategory={
          selectedCategory
        }
        categories={categories}
        onClose={handleCloseEdit}
        onSubmit={handleSubmitCategory}
      />

      {/* =====================================================
          CATEGORY RESOURCES DIALOG
      ===================================================== */}

      <CategoryResources
        open={openResources}
        onClose={handleCloseResources}
        category={resourceCategory}
      />

      {/* =====================================================
          NEW: CATEGORY SEO DIALOG
      ===================================================== */}

      <CategorySEO
        open={openSEO}
        onClose={handleCloseSEO}
        category={seoCategory}
      />
    </Container>
  );
}
