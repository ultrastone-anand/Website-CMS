import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import {
  getCategories,
  createCategory,
  updateCategory,
} from 'src/services/category.service';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import TableEmptyRows from '../table-empty-rows';
import CategoryTableRow from '../category-table-row';
import CategoryQuickEdit from '../category-quick-edit';
import CategoryTableHead from '../category-table-head';
import CategoryTableToolbar from '../category-table-toolbar';
import {
  emptyRows,
  applyFilter,
  getComparator,
} from '../utils';

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [openEdit, setOpenEdit] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response =
        await getCategories();

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

  const handleSort = (event, id) => {
    const isAsc =
      orderBy === id && order === 'asc';

    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  const handleSelectAllClick = (
    event
  ) => {
    if (event.target.checked) {
      const newSelecteds =
        categories.map(
          (n) => n.name
        );

      setSelected(newSelecteds);

      return;
    }

    setSelected([]);
  };

  const handleChangePage = (
    event,
    newPage
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event
  ) => {
    setPage(0);
    setRowsPerPage(
      parseInt(
        event.target.value,
        10
      )
    );
  };

  const handleFilterByName = (
    event
  ) => {
    setPage(0);
    setFilterName(
      event.target.value
    );
  };

  const dataFiltered =
    applyFilter({
      inputData: categories,
      comparator: getComparator(
        order,
        orderBy
      ),
      filterName,
    });

  const notFound =
    !dataFiltered.length &&
    !!filterName;

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setOpenEdit(true);
  };

  const handleEditCategory = (
    category
  ) => {
    setSelectedCategory(category);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedCategory(null);
  };

  const handleSubmitCategory =
    async (formData) => {
      try {
        if (
          selectedCategory
        ) {
          await updateCategory(
            selectedCategory.id,
            formData
          );
        } else {
          await createCategory(
            formData
          );
        }

        handleCloseEdit();

        await fetchCategories();
      } catch (error) {
        console.error(
          'Error saving category:',
          error
        );
      }
    };

  if (loading) {
    return (
      <Container>
        <Typography variant="h5">
          Loading categories...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={false}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
      >
        <Typography variant="h4">
          Categories
        </Typography>

        <Button
          variant="contained"
          color="inherit"
          startIcon={
            <Iconify icon="eva:plus-fill" />
          }
          onClick={
            handleAddCategory
          }
        >
          New Category
        </Button>
      </Stack>

      <Card>
        <CategoryTableToolbar
          numSelected={
            selected.length
          }
          filterName={
            filterName
          }
          onFilterName={
            handleFilterByName
          }
        />

        <Scrollbar>
          <TableContainer
            sx={{
              overflow:
                'unset',
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
                rowCount={
                  categories.length
                }
                numSelected={
                  selected.length
                }
                onRequestSort={
                  handleSort
                }
                onSelectAllClick={
                  handleSelectAllClick
                }
                headLabel={[
                  {
                    id: 'name',
                    label:
                      'Name',
                  },
                  {
                    id: 'slug',
                    label:
                      'Slug',
                  },
                  {
                    id: 'parent',
                    label:
                      'Parent',
                  },
                  {
                    id: 'type',
                    label:
                      'Type',
                  },
                  {
                    id: 'status',
                    label:
                      'Status',
                  },
                  {
                    id: '',
                  },
                ]}
              />

              <TableBody>
                {dataFiltered
                  .slice(
                    page *
                      rowsPerPage,
                    page *
                      rowsPerPage +
                      rowsPerPage
                  )
                  .map((row) => (
                    <CategoryTableRow
                      key={row.id}
                      row={row}
                      categories={
                        categories
                      }
                      onEdit={
                        handleEditCategory
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
                    query={
                      filterName
                    }
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={
            categories.length
          }
          rowsPerPage={
            rowsPerPage
          }
          onPageChange={
            handleChangePage
          }
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

      <CategoryQuickEdit
        open={openEdit}
        currentCategory={
          selectedCategory
        }
        categories={categories}
        onClose={
          handleCloseEdit
        }
        onSubmit={
          handleSubmitCategory
        }
      />
    </Container>
  );
}