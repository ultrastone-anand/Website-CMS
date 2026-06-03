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

import { getRoles } from 'src/services/user.service';

export default function UserQuickEdit({
    open,
    onClose,
    onSubmit,
    currentUser,
}) {

    const [roles, setRoles] = useState([]);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: 'Ultra123',
        role_id: '',
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                first_name: currentUser.first_name || '',
                last_name: currentUser.last_name || '',
                email: currentUser.email || '',
                password: '',
                role_id: currentUser.roles?.id || '',
            });
        } else {
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                role_id: '',
            });
        }
    }, [currentUser]);

    const fetchRoles = async () => {
        try {
            const response = await getRoles();

            setRoles(response.data || []);
        } catch (error) {
            console.error('Failed to load roles:', error);
        }
    };

    const handleChange = (event) => {
        setFormData((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    };

    const handleSubmit = () => {
        const payload = {
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            role_id: Number(formData.role_id),
            password: "Ultra123",
        };

        if (formData.password?.trim()) {
            payload.password = formData.password;
        }

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
                {currentUser ? 'Edit User' : 'Add User'}
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                        fullWidth
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                    />

                    <TextField
                        fullWidth
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                    />

                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    {/* <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            helperText={
              currentUser
                ? 'Leave blank to keep current password'
                : ''
            }
          /> */}

                    <TextField
                        select
                        fullWidth
                        label="Role"
                        name="role_id"
                        value={formData.role_id}
                        onChange={handleChange}
                    >
                        <MenuItem value="">
                            Select Role
                        </MenuItem>

                        {roles.map((role) => (
                            <MenuItem
                                key={role.id}
                                value={role.id}
                            >
                                {role.name}
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
                    {currentUser
                        ? 'Update User'
                        : 'Create User'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

UserQuickEdit.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    currentUser: PropTypes.object,
};