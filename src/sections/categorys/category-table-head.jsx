import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

import { visuallyHidden } from './utils';

// ----------------------------------------------------------------------

export default function CategoryTableHead({
  order,
  orderBy,
  headLabel,
  onRequestSort,
}) {
  const createSortHandler =
    (property) => (event) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headLabel.map((headCell) => {
          const sortable = headCell.id !== '';

          return (
            <TableCell
              key={headCell.id}
              align={headCell.align || 'left'}
              sortDirection={
                orderBy === headCell.id
                  ? order
                  : false
              }
              sx={{
                width: headCell.width,
                minWidth: headCell.minWidth,
                fontWeight: 600,
              }}
            >
              {sortable ? (
                <TableSortLabel
                  hideSortIcon={false}
                  active={
                    orderBy === headCell.id
                  }
                  direction={
                    orderBy === headCell.id
                      ? order
                      : 'asc'
                  }
                  onClick={createSortHandler(
                    headCell.id
                  )}
                >
                  {headCell.label}

                  {orderBy === headCell.id && (
                    <Box
                      sx={{
                        ...visuallyHidden,
                      }}
                    >
                      {order === 'desc'
                        ? 'sorted descending'
                        : 'sorted ascending'}
                    </Box>
                  )}
                </TableSortLabel>
              ) : (
                headCell.label
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}

CategoryTableHead.propTypes = {
  order: PropTypes.oneOf([
    'asc',
    'desc',
  ]),
  orderBy: PropTypes.string,
  headLabel: PropTypes.array,
  onRequestSort: PropTypes.func,
};