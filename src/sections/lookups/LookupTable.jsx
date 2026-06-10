import PropTypes from 'prop-types';

import {
  Chip,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
} from '@mui/material';

import Iconify from 'src/components/iconify';

export default function LookupTable({
  rows,
  onEdit,
  onDelete,
  onSelect,
  selectedLookup,
}) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Code</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Status</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>

      <TableBody>
        {rows.map((row) => (
          <TableRow
            hover
            key={row.id}
            selected={
              selectedLookup?.id ===
              row.id
            }
            onClick={() =>
              onSelect(row)
            }
            sx={{
              cursor: 'pointer',
            }}
          >
            <TableCell>
              {row.lookup_code}
            </TableCell>

            <TableCell>
              {row.lookup_name}
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
                    : 'error'
                }
              />
            </TableCell>

            <TableCell>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row);
                }}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>

              <IconButton
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(row.id);
                }}
              >
                 <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

LookupTable.propTypes = {
  rows: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
  selectedLookup: PropTypes.object,
};