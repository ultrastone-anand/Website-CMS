import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginView() {
  const theme = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      if (!email || !password) {
        setError('Please enter email and password');
        return;
      }

      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.replace('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ height: 1 }}
      >
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4" sx={{ mb: 1 }}>
            Sign In
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Enter your credentials to access the dashboard.
          </Typography>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      <Iconify
                        icon={
                          showPassword
                            ? 'eva:eye-fill'
                            : 'eva:eye-off-fill'
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Stack
            direction="row"
            justifyContent="flex-end"
            sx={{ mt: 2, mb: 3 }}
          >
            <Link underline="hover" variant="body2">
              Forgot Password?
            </Link>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            color="inherit"
            loading={loading}
            onClick={handleLogin}
          >
            Login
          </LoadingButton>
        </Card>
      </Stack>
    </Box>
  );
}