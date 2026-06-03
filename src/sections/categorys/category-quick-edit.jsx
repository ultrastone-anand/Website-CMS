import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

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
        parent_id: currentCategory.parent_id || '',
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parent_id: '',
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
    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      parent_id:
        formData.parent_id === ''
          ? null
          : Number(formData.parent_id),
    };

    onSubmit(payload);
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
                  item.is_active &&
                  item.id !==
                    currentCategory?.id
              )
              .map((category) => (
                <MenuItem
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </MenuItem>
              ))}
          </TextField>
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