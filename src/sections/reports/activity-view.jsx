import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Dialog,
  Avatar,
  Divider,
  Collapse,
  TextField,
  Typography,
  IconButton,
  CardContent,
  DialogTitle,
  DialogContent,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { getActivities } from 'src/services/activity.service';

import Iconify from 'src/components/iconify';

const ACTION_COLORS = {
  CREATE: 'success',
  BULK_CREATE: 'success',

  UPDATE: 'warning',

  DELETE: 'error',
  BULK_DELETE: 'error',
};

const HIDDEN_FIELDS = [
  'password_hash',
  'created_at',
  'updated_at',
];

function prettifyField(field) {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ChangeCard({ field, values }) {
  const oldValue = values?.old;
  const newValue = values?.new;

  const isMediaField =
    field === 'media' &&
    Array.isArray(oldValue) &&
    Array.isArray(newValue);

  if (isMediaField) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6">Media</Typography>
            <Chip size="small" color="warning" label={`${newValue.length} Updated`} />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box flex={1}>
              <Typography color="error.main" fontWeight={700} mb={2}>
                Previous Media
              </Typography>
              <Stack spacing={2}>
                {oldValue.map((item) => (
                  <Card key={item.id} variant="outlined" sx={{ borderColor: 'error.light' }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={item.media_url}
                          variant="rounded"
                          sx={{ width: 80, height: 80 }}
                        />
                        <Box>
                          <Typography fontWeight={600}>
                            {item.media_type}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            ID: {item.id}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5 }}
                          >
                            Alt Text:
                            <strong>
                              {item.alt_text || '—'}
                            </strong>
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>

            <Stack justifyContent="center" alignItems="center">
              <Iconify icon="mdi:compare-horizontal" width={28} sx={{ color: 'text.secondary' }} />
            </Stack>

            <Box flex={1}>
              <Typography color="success.main" fontWeight={700} mb={2}>
                Current Media
              </Typography>
              <Stack spacing={2}>
                {newValue.map((item) => (
                  <Card key={item.id} variant="outlined" sx={{ borderColor: 'success.light' }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={item.media_url}
                          variant="rounded"
                          sx={{ width: 80, height: 80 }}
                        />
                        <Box>
                          <Typography fontWeight={600}>
                            {item.media_type}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            ID: {item.id}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5 }}
                          >
                            Alt Text:
                            <strong>
                              {item.alt_text || '—'}
                            </strong>
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography fontWeight={700}>{prettifyField(field)}</Typography>
          <Chip size="small" color="warning" label="Modified" />
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Box
            flex={1}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#fff5f5',
              border: '1px solid',
              borderColor: 'error.light',
            }}
          >
            <Typography variant="caption" color="error.main" fontWeight={700}>
              OLD VALUE
            </Typography>
            <Typography sx={{ mt: 1 }}>{String(oldValue ?? '-')}</Typography>
          </Box>

          <Box
            flex={1}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#f0fff4',
              border: '1px solid',
              borderColor: 'success.light',
            }}
          >
            <Typography variant="caption" color="success.main" fontWeight={700}>
              NEW VALUE
            </Typography>
            <Typography sx={{ mt: 1 }}>{String(newValue ?? '-')}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

ChangeCard.propTypes = {
  field: PropTypes.string.isRequired,
  values: PropTypes.shape({
    old: PropTypes.any,
    new: PropTypes.any,
  }).isRequired,
};

export default function ActivityView() {
  const [activities, setActivities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState({});

  const toggleModule = (moduleName) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]: prev[moduleName] === false,
    }));
  };

  const filteredActivities = activities.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.created_by_name?.toLowerCase().includes(q) ||
      a.module_name?.toLowerCase().includes(q)
    );
  });

  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    const key = activity.module_name || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(activity);
    return acc;
  }, {});

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getActivities();
      setActivities(response?.data || response || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }


  const isCreateAction =
  selected?.action === 'CREATE';

const isBulkCreateAction =
  selected?.action === 'BULK_CREATE';
  
  const isDeleteAction =
  selected?.action === 'DELETE';

const isBulkDeleteAction =
  selected?.action === 'BULK_DELETE';
  return (
    <>
      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search by user or module..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" width={20} sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
          endAdornment: search && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearch('')}>
                <Iconify icon="eva:close-fill" width={16} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Grouped Activity List */}
      <Stack spacing={2}>
        {Object.keys(groupedActivities).length === 0 && (
          <Alert severity="info">No activity records found.</Alert>
        )}

        {Object.entries(groupedActivities).map(([moduleName, moduleActivities]) => {
          const isOpen = expandedModules[moduleName] !== false;

          return (
            <Card key={moduleName} variant="outlined">
              {/* Module Group Header */}
              <CardContent
                sx={{ cursor: 'pointer', py: '12px !important' }}
                onClick={() => toggleModule(moduleName)}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon="eva:layers-fill" width={18} sx={{ color: 'primary.main' }} />
                    <Typography fontWeight={700}>{moduleName}</Typography>
                    <Chip
                      label={`${moduleActivities.length} ${moduleActivities.length === 1 ? 'activity' : 'activities'}`}
                      size="small"
                      color="primary"
                      variant="soft"
                    />
                  </Stack>
                  <Iconify
                    icon={isOpen ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'}
                    width={20}
                    sx={{ color: 'text.secondary' }}
                  />
                </Stack>
              </CardContent>

              <Collapse in={isOpen}>
                <Divider />
                <Stack spacing={0}>
                  {moduleActivities.map((activity, idx) => (
                    <Box key={activity.id}>
                      <CardContent
                        sx={{
                          cursor: 'pointer',
                          transition: '0.2s',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => setSelected(activity)}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          flexWrap="wrap"
                          spacing={2}
                        >
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Chip
                              label={activity.action}
                              color={ACTION_COLORS[activity.action] || 'default'}
                              size="small"
                            />
                            <Typography fontWeight={700}>{activity.resource_type}</Typography>
                            <Typography color="text.secondary">
                              #{activity.resource_id || '-'}
                            </Typography>
                          </Stack>

                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(activity.created_at), 'dd MMM yyyy hh:mm a')}
                          </Typography>
                        </Stack>

                        <Typography variant="body2" sx={{ mt: 1 }}>
                          By: <strong>{activity.created_by_name}</strong>
                        </Typography>

                        {activity.action === 'UPDATE' && activity.changed_fields && (
                          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                            Changed Fields: {Object.keys(activity.changed_fields).length}
                          </Typography>
                        )}
                      </CardContent>
                      {idx < moduleActivities.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Stack>
              </Collapse>
            </Card>
          );
        })}
      </Stack>

      {/* Detail Dialog */}
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="xl"
      >
        {selected && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Activity Details</Typography>
                <IconButton onClick={() => setSelected(null)}>
                  <Iconify icon="eva:close-fill" width={20} />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                  gap: 2,
                  mb: 4,
                }}
              >
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">User</Typography>
                    <Typography fontWeight={600}>{selected.created_by_name}</Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Action</Typography>
                    <Box mt={1}>
                      <Chip
                        color={ACTION_COLORS[selected.action]}
                        label={selected.action}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Module</Typography>
                    <Typography fontWeight={600}>{selected.module_name}</Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Resource</Typography>
                    <Typography fontWeight={600}>
                      {selected.resource_type} #{selected.resource_id}
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">IP Address</Typography>
                    <Typography fontWeight={600}>{selected.ip_address}</Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">Date</Typography>
                    <Typography fontWeight={600}>
                      {format(new Date(selected.created_at), 'dd MMM yyyy hh:mm:ss a')}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {selected.action === 'UPDATE' && (
                <>
                  {selected.changed_fields && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Changed Fields ({Object.keys(selected.changed_fields).length})
                      </Typography>

                      <Stack spacing={2} mb={4}>
                        {Object.entries(selected.changed_fields)
                          .filter(([field]) => !HIDDEN_FIELDS.includes(field))
                          .map(([field, values]) => (
                            <ChangeCard key={field} field={field} values={values} />
                          ))}
                      </Stack>
                    </>
                  )}

                  <Typography variant="h6" gutterBottom>
                    Complete Record Comparison
                  </Typography>

                  <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                    <Card variant="outlined" sx={{ flex: 1, borderColor: 'error.light' }}>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                          <Chip label="OLD RECORD" color="error" size="small" />
                        </Stack>
                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'grey.100',
                            overflow: 'auto',
                            maxHeight: 600,
                            fontSize: 12,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {JSON.stringify(selected.old_values, null, 2)}
                        </Box>
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ flex: 1, borderColor: 'success.light' }}>
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                          <Chip label="NEW RECORD" color="success" size="small" />
                        </Stack>
                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'grey.100',
                            overflow: 'auto',
                            maxHeight: 600,
                            fontSize: 12,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {JSON.stringify(selected.new_values, null, 2)}
                        </Box>
                      </CardContent>
                    </Card>
                  </Stack>
                </>
              )}

              
                {isCreateAction && (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Created Record
      </Typography>

      <pre style={{ overflow: 'auto', maxHeight: 500 }}>
        {JSON.stringify(selected.new_values, null, 2)}
      </pre>
    </CardContent>
  </Card>
)}

{isBulkCreateAction && (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Created Records ({selected.new_values?.count || 0})
      </Typography>

      <Stack spacing={1}>
        {selected.new_values?.products?.map((product) => (
          <Card key={product.id} variant="outlined">
            <CardContent>
              <Typography fontWeight={600}>
                {product.name}
              </Typography>
              <Typography variant="body2">
                {product.slug}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </CardContent>
  </Card>
)}

{isDeleteAction && (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Deleted Record
      </Typography>

      <pre style={{ overflow: 'auto', maxHeight: 500 }}>
        {JSON.stringify(selected.old_values, null, 2)}
      </pre>
    </CardContent>
  </Card>
)}              
{isBulkDeleteAction && (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Deleted Records ({selected.new_values?.count || 0})
      </Typography>

      <Stack spacing={1}>
        {selected.new_values?.products?.map((product) => (
          <Card
            key={product.id}
            variant="outlined"
            sx={{ borderColor: 'error.light' }}
          >
            <CardContent sx={{ py: 1.5 }}>
              <Typography fontWeight={600}>
                {product.name}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                ID: {product.id}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Slug: {product.slug}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </CardContent>
  </Card>
)}
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}