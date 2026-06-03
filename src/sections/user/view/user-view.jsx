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

import { getUsers , createUser , updateUser } from 'src/services/user.service';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserQuickEdit from '../user-quick-edit';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function UserPage() {
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await getUsers();

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

  const transformedUsers = users.map((user) => ({
    ...user,
    name: `${user.first_name || ''} ${user.last_name || ''}`,
  }));

  const dataFiltered = applyFilter({
    inputData: transformedUsers,
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
      await updateUser(
        selectedUser.user_id,
        formData
      );
    } else {
      await createUser(formData);
    }

    handleCloseEdit();
    await fetchUsers();
  } catch (error) {
    console.error('Error saving user:', error);
  }
};
  if (loading) {
    return (
      <Container>
        <Typography variant="h5">
          Loading users...
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
          Users
        </Typography>

        <Button
  variant="contained"
  color="inherit"
  startIcon={<Iconify icon="eva:plus-fill" />}
  onClick={handleAddUser}
>
  New User
</Button>
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={users.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'email', label: 'Email' },
                  { id: 'role', label: 'Role' },
                  { id: 'status', label: 'Status' },
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
                    <UserTableRow
                      key={row.user_id}
                      row={row}
                      onEdit={handleEditUser}
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

        <TablePagination
          page={page}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <UserQuickEdit
  open={openEdit}
  currentUser={selectedUser}
  onClose={handleCloseEdit}
  onSubmit={handleSubmitUser}
/>
    </Container>
    
  );
}