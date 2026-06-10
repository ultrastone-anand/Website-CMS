import PropTypes from 'prop-types';

import {
  Chip,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  Typography,
  TableContainer,
} from '@mui/material';

import Iconify from 'src/components/iconify';

export default function LookupDetailsTable({
  rows,
  onEdit,
  onDelete,
}) {
  if (!rows?.length) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ py: 4, textAlign: 'center' }}
      >
        No lookup details found
      </Typography>
    );
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width={120}>
              Code
            </TableCell>

            <TableCell>
              Value Name
            </TableCell>

            <TableCell>
              Description
            </TableCell>

            <TableCell width={100}>
              Order
            </TableCell>

            <TableCell width={100}>
              Status
            </TableCell>

            <TableCell
              width={120}
              align="right"
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => (
            <TableRow
              hover
              key={row.id}
            >
              <TableCell>
                {row.value_code || '-'}
              </TableCell>

              <TableCell>
                {row.value_name}
              </TableCell>

              <TableCell>
                {row.description || '-'}
              </TableCell>

              <TableCell>
                {row.display_order}
              </TableCell>

              <TableCell>
                <Chip
                  size="small"
                  label={
                    row.is_active
                      ? 'Active'
                      : 'Inactive'
                  }
                  color={
                    row.is_active
                      ? 'success'
                      : 'default'
                  }
                />
              </TableCell>

              <TableCell align="right">
                <IconButton
                  size="small"
                  onClick={() =>
                    onEdit(row)
                  }
                >
                  <Iconify icon="solar:pen-bold" />
                </IconButton>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() =>
                    onDelete(row.id)
                  }
                >
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

LookupDetailsTable.propTypes = {
  rows: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};