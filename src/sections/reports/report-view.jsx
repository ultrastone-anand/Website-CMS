import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function ReportView() {
  const [reportType, setReportType] =
    useState('');

  const handleShowReport = () => {
    console.log('SHOW REPORT', reportType);
  };

  const handleDownload = () => {
    console.log('DOWNLOAD REPORT', reportType);
  };

  return (
    <Container maxWidth={false}>
      <Card sx={{ p: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          Reports
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Generate and download system reports
        </Typography>

        <Stack spacing={3}>
          <TextField
            select
            fullWidth
            label="Report Type"
            value={reportType}
            onChange={(e) =>
              setReportType(e.target.value)
            }
          >
            <MenuItem value="products">
              Products Report
            </MenuItem>

            <MenuItem value="categories">
              Categories Report
            </MenuItem>

            <MenuItem value="featured">
              Featured Products
            </MenuItem>

            <MenuItem value="trending">
              Trending Products
            </MenuItem>

            <MenuItem value="new-arrivals">
              New Arrivals
            </MenuItem>

            <MenuItem value="active">
              Active Products
            </MenuItem>

            <MenuItem value="inactive">
              Inactive Products
            </MenuItem>
          </TextField>

          <Stack
            direction="row"
            spacing={2}
          >
            <TextField
              type="date"
              label="From Date"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />

            <TextField
              type="date"
              label="To Date"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Stack>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleShowReport}
            >
              Show Report
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleDownload}
            >
              Download Excel
            </Button>

            <Button
              variant="outlined"
              size="large"
            >
              Download PDF
            </Button>
          </Box>
        </Stack>
      </Card>
    </Container>
  );
}