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
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from 'src/services/company.service';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserCardRow from '../company-card-row';
import TableEmptyRows from '../table-empty-rows';
import CompanyTableRow from '../company-table-row';
import CompanyQuickEdit from '../company-quick-edit';
import CompanyTableHead from '../company-table-head';
import CompanyTableToolbar from '../company-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';


// ----------------------------------------------------------------------

export default function CompanyPage() {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [openEdit, setOpenEdit] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedUser, setSelectedUser] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      setLoading(true);

      const response = await getCompanies();

      setUsers(response.data || response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';

    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map(
        (n) => `${n.first_name || ''} ${n.last_name || ''}`
      );

      setSelected(newSelecteds);
      return;
    }

    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: users,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const handleAddUser = () => {
    setSelectedUser(null);
    setOpenEdit(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedUser(null);
  };

  const handleSubmitUser = async (formData) => {
    try {
      if (selectedUser) {
        await updateCompany(
          selectedUser.id,
          formData
        );
      } else {
        await createCompany(formData);
      }

      handleCloseEdit();
      await fetchCompany();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handelDelete = async (user) => {
    try {
      await deleteCompany(user.id);
      await fetchCompany();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h5">
          Loading Showrooms...
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
          Showrooms
        </Typography>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleAddUser}
        >
          New Showroom
        </Button>
      </Stack>

      <Card>
        <CompanyTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        {isMobile ? (
          <Stack spacing={2} sx={{ p: 2 }}>
            {dataFiltered
              .slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
              .map((row) => (
                <UserCardRow
                  key={row.user_id}
                  row={row}
                  onEdit={handleEditUser}
                  onDelete={(user) =>
                    handelDelete(user.user_id)
                  }
                />
              ))}

            {notFound && (
              <TableNoData query={filterName} />
            )}
          </Stack>
        ) : (
          <Scrollbar>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <CompanyTableHead
                  order={order}
                  orderBy={orderBy}
                  rowCount={users.length}
                  numSelected={selected.length}
                  onRequestSort={handleSort}
                  onSelectAllClick={handleSelectAllClick}
                  headLabel={[
                    { id: 'name', label: 'Showroom Name' },
                    { id: 'city', label: 'City' },
                    { id: 'state', label: 'State' },
                    { id: 'primary_phone', label: 'Phone' },
                    { id: 'email', label: 'Email' },
                    { id: 'business_hours_mon_fri', label: 'Business Hours' },
                    { id: 'is_active', label: 'Status' },
                    { id: '' },
                  ]}
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                    .map((row) => (
                      <CompanyTableRow
                        key={row.user_id}
                        row={row}
                        onEdit={handleEditUser}
                        onDelete={(user) =>
                          handelDelete(user.user_id)
                        }
                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(
                      page,
                      rowsPerPage,
                      users.length
                    )}
                  />

                  {notFound && (
                    <TableNoData query={filterName} />
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        )}

        <TablePagination
          page={page}
          component="div"
          count={dataFiltered.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <CompanyQuickEdit
        open={openEdit}
        currentUser={selectedUser}
        onClose={handleCloseEdit}
        onSubmit={handleSubmitUser}
      />
    </Container>

  );
}