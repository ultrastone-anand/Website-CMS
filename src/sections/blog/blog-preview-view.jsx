// src/sections/blog/view/blog-preview-view.jsx

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function BlogPreviewView() {
  const navigate = useNavigate();

  const post = useMemo(() => {
    try {
      const savedPreview = sessionStorage.getItem('blogPreview');

      return savedPreview ? JSON.parse(savedPreview) : null;
    } catch (error) {
      console.error('Unable to load blog preview:', error);

      return null;
    }
  }, []);

  if (!post) {
    return (
      <Container maxWidth="md">
        <Stack spacing={2} alignItems="center" sx={{ py: 10 }}>
          <Typography variant="h4">Preview unavailable</Typography>

          <Typography color="text.secondary">
            No blog preview information was found.
          </Typography>

          <Button variant="contained" onClick={() => navigate('/blog')}>
            Back to blog
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Stack spacing={4} sx={{ py: 5 }}>
        <Button
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          onClick={() => window.close()}
          sx={{ alignSelf: 'flex-start' }}
        >
          Close preview
        </Button>

        <Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
            {post.tags?.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Stack>

          <Typography variant="h2" sx={{ mb: 2 }}>
            {post.title}
          </Typography>

          <Typography variant="h6" color="text.secondary">
            {post.description}
          </Typography>
        </Box>

        {post.cover && (
          <Box
            component="img"
            src={post.cover}
            alt={post.title}
            sx={{
              width: 1,
              maxHeight: 560,
              borderRadius: 2,
              objectFit: 'cover',
            }}
          />
        )}

        <Typography
          component="div"
          variant="body1"
          sx={{
            lineHeight: 1.9,
            whiteSpace: 'pre-wrap',
          }}
        >
          {post.content}
        </Typography>
      </Stack>
    </Container>
  );
}