import { useState, useEffect } from 'react';

import {
  Grid,
  Card,
  Stack,
  Button,
  Typography,
  CardContent,
} from '@mui/material';

import {
  getLookups,
  deleteLookup,
  getLookupDetails,
  deleteLookupDetail,
} from 'src/services/lookup.service';

import Iconify from 'src/components/iconify';

import LookupTable from '../LookupTable';
import LookupDialog from '../LookupDialog';
import LookupDetailDialog from '../LookupDetailDialog';
import LookupDetailsTable from '../LookupDetailsTable';



export default function LookupPage() {
  const [lookups, setLookups] = useState([]);
  const [details, setDetails] = useState([]);

  const [selectedLookup, setSelectedLookup] =
    useState(null);

  const [openLookupDialog, setOpenLookupDialog] =
    useState(false);

  const [editingLookup, setEditingLookup] =
    useState(null);

  const [openDetailDialog, setOpenDetailDialog] =
    useState(false);

  const [editingDetail, setEditingDetail] =
    useState(null);

  const loadLookups = async () => {
    try {
      const res = await getLookups();
      setLookups(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDetails = async (lookupId) => {
    try {
      const res = await getLookupDetails(
        lookupId
      );
      setDetails(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLookups();
  }, []);

  const handleSelectLookup = (lookup) => {
    setSelectedLookup(lookup);
    loadDetails(lookup.id);
  };

  const handleDeleteLookup = async (id) => {
    if (
      !window.confirm(
        'Delete this lookup?'
      )
    )
      return;

    await deleteLookup(id);

    if (selectedLookup?.id === id) {
      setSelectedLookup(null);
      setDetails([]);
    }

    loadLookups();
  };

  const handleDeleteDetail = async (id) => {
    if (
      !window.confirm(
        'Delete this detail?'
      )
    )
      return;

    await deleteLookupDetail(id);
    loadDetails(selectedLookup.id);
  };

  return (
    <Grid container spacing={3}>
    
      <Grid item xs={12} md={5}>
        
        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h6">
                Lookups
              </Typography>

              <Button
                startIcon={
  <Iconify icon="eva:plus-fill" />
}
                variant="contained"
                onClick={() => {
                  setEditingLookup(null);
                  setOpenLookupDialog(
                    true
                  );
                }}
              >
                Add
              </Button>
            </Stack>

            <LookupTable
              rows={lookups}
              selectedLookup={
                selectedLookup
              }
              onSelect={
                handleSelectLookup
              }
              onEdit={(row) => {
                setEditingLookup(row);
                setOpenLookupDialog(
                  true
                );
              }}
              onDelete={
                handleDeleteLookup
              }
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={7}>
        <Card>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h6">
                Lookup Details
              </Typography>

              <Button
                variant="contained"
                startIcon={
  <Iconify icon="eva:plus-fill" />
}
                disabled={
                  !selectedLookup
                }
                onClick={() => {
                  setEditingDetail(
                    null
                  );
                  setOpenDetailDialog(
                    true
                  );
                }}
              >
                Add Detail
              </Button>
            </Stack>

            <LookupDetailsTable
              rows={details}
              onEdit={(row) => {
                setEditingDetail(
                  row
                );
                setOpenDetailDialog(
                  true
                );
              }}
              onDelete={
                handleDeleteDetail
              }
            />
          </CardContent>
        </Card>
      </Grid>

      <LookupDialog
        open={openLookupDialog}
        onClose={() =>
          setOpenLookupDialog(false)
        }
        lookup={editingLookup}
        refresh={loadLookups}
      />

      <LookupDetailDialog
        open={openDetailDialog}
        onClose={() =>
          setOpenDetailDialog(false)
        }
        lookup={selectedLookup}
        detail={editingDetail}
        refresh={() =>
          loadDetails(
            selectedLookup?.id
          )
        }
      />
    </Grid>
  );
}