import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { getCategories } from 'src/services/category.service';

export default function CategoryQuickEdit({
  open,
  onClose,
  onSubmit,
  currentCategory,
}) {
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',

    silica_warning: false,
    silica_warning_message: '',
    silica_datasheet_url: '',

    silica_datasheet_file: null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (currentCategory) {
      setFormData({
        name: currentCategory.name || '',
        slug: currentCategory.slug || '',
        description: currentCategory.description || '',
          parent_id:
    currentCategory.parent_id
      ? String(currentCategory.parent_id)
      : '',
        silica_warning:
          currentCategory.silica_warning || false,

        silica_warning_message:
          currentCategory.silica_warning_message || '',

        silica_datasheet_url:
          currentCategory.silica_datasheet_url || '',

        silica_datasheet_file: null

      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parent_id: '',
        silica_warning: false,
        silica_warning_message: '',
        silica_datasheet_url: '',
        silica_datasheet_file: null

      });
    }
  }, [currentCategory]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();

      setCategories(response.data || []);
    } catch (error) {
      console.error(
        'Failed to load categories:',
        error
      );
    }
  };

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]:
        event.target.value,
    }));
  };

 const handleSubmit = () => {

  if (formData.silica_warning) {

    if (!formData.silica_warning_message) {

      alert(
        "Silica warning message is required"
      );

      return;
    }


    if (
      !formData.silica_datasheet_url &&
      !formData.silica_datasheet_file
    ) {

      alert(
        "Silica datasheet PDF is required"
      );

      return;
    }

  }


  const payload = new FormData();


  payload.append(
    "name",
    formData.name
  );


  payload.append(
    "slug",
    formData.slug
  );


  payload.append(
    "description",
    formData.description
  );


  payload.append(
    "parent_id",
    formData.parent_id === ''
      ? ''
      : Number(formData.parent_id)
  );


  payload.append(
    "silica_warning",
    formData.silica_warning
  );


  if (formData.silica_warning) {

    payload.append(
      "silica_warning_message",
      formData.silica_warning_message
    );


    if (formData.silica_datasheet_file) {

      payload.append(
        "silica_datasheet",
        formData.silica_datasheet_file
      );

    }

  }

  onSubmit(payload);

};

  const handleSilicaToggle = (event) => {

    setFormData((prev) => ({
      ...prev,
      silica_warning: event.target.checked,

      // clear values if turned off
      ...(event.target.checked
        ? {}
        : {
          silica_warning_message: '',
          silica_datasheet_url: ''
        })
    }));

  };

  const handleSilicaFileChange = (event) => {

    const file = event.target.files[0];


    if (file) {

      if (file.type !== "application/pdf") {

        alert(
          "Only PDF files are allowed"
        );

        return;

      }


      setFormData((prev) => ({
        ...prev,
        silica_datasheet_file: file
      }));

    }

  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {currentCategory
          ? 'Edit Category'
          : 'Add Category'}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
<TextField
  select
  fullWidth
  label="Parent Category"
  name="parent_id"
  value={formData.parent_id}
  onChange={handleChange}
>
  <MenuItem value="">
    No Parent Category
  </MenuItem>

 {categories
  .filter(
    (item) =>
      item.parent_id === null &&
      item.id !== currentCategory?.id &&
      (
        item.is_active ||
        item.id === currentCategory?.parent_id
      )
  )
  .map((category) => (
    <MenuItem
      key={category.id}
      value={String(category.id)}
    >
      {category.name}
      {!category.is_active && " (Inactive)"}
    </MenuItem>
  ))}
</TextField>
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  formData.silica_warning
                }
                onChange={
                  handleSilicaToggle
                }
              />

            }
            label="Enable Silica Warning"
          />

          {formData.silica_warning && (
            <>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Silica Warning Message"
                name="silica_warning_message"
                value={
                  formData.silica_warning_message
                }
                onChange={handleChange}
                required
              />


              <Button
                variant="outlined"
                component="label"
              >
                {
                  formData.silica_datasheet_file
                    ? "Change PDF"
                    : "Upload Silica Datasheet PDF"
                }

                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={handleSilicaFileChange}
                />

              </Button>
{/* Existing Uploaded PDF */}
{
  !formData.silica_datasheet_file &&
  formData.silica_datasheet_url && (
    <Stack spacing={1}>
      <Typography variant="body2">
        Current PDF:
      </Typography>

      <a
        href={`http://localhost:5001${formData.silica_datasheet_url}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View Current Datasheet
      </a>
    </Stack>
  )
}

{/* Newly Selected PDF */}
{
  formData.silica_datasheet_file && (
    <Stack spacing={1}>
      <Typography variant="body2">
        Selected:
        {" "}
        {formData.silica_datasheet_file.name}
      </Typography>

      <Button
        size="small"
        color="error"
        onClick={() =>
          setFormData(prev => ({
            ...prev,
            silica_datasheet_file: null
          }))
        }
      >
        Remove Selected PDF
      </Button>
    </Stack>
  )
}


            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          variant="outlined"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          {currentCategory
            ? 'Update Category'
            : 'Create Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CategoryQuickEdit.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  currentCategory: PropTypes.object,
};