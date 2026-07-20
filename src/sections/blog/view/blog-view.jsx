import { useState, useEffect, useCallback } from 'react';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';

import PostCard from '../post-card';
import PostSort from '../post-sort';
import PostSearch from '../post-search';
import BlogQuickForm from '../blog-quick-form';
import {
  getBlogs,
  createBlog,
  updateBlog,
} from '../../../services/blogs.service';

// ----------------------------------------------------------------------

export default function BlogView() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await getBlogs({
        page: 1,
        limit: 100,
      });

      const posts = Array.isArray(response.data)
        ? response.data.map(normalizeBlogPost)
        : [];

      setBlogPosts(posts);
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);

      setErrorMessage(
        error.message || 'Failed to fetch blog posts'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const validPosts = Array.isArray(blogPosts)
    ? blogPosts.filter((post) => post && post.id)
    : [];

  const handleOpenNewPost = () => {
    setSelectedPost(null);
    setOpenEdit(true);
  };

  const handleOpenEditPost = (post) => {
    setSelectedPost(post);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    if (saving) {
      return;
    }

    setOpenEdit(false);
    setSelectedPost(null);
  };

  const handleSubmitPost = async (formPayload) => {
    try {
      setSaving(true);
      setErrorMessage('');

      if (selectedPost?.id) {
        await updateBlog(
          selectedPost.id,
          formPayload
        );
      } else {
        await createBlog(formPayload);
      }

      await loadBlogs();

      setOpenEdit(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Failed to save blog post:', error);

      setErrorMessage(
        error.message || 'Failed to save blog post'
      );

      throw error;
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Container maxWidth={false}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={5}
        >
          <Typography variant="h4">
            Blog
          </Typography>

          <Button
            variant="contained"
            color="inherit"
            startIcon={
              <Iconify icon="eva:plus-fill" />
            }
            onClick={handleOpenNewPost}
          >
            New Post
          </Button>
        </Stack>

        {errorMessage && (
          <Alert
            severity="error"
            onClose={() => setErrorMessage('')}
            sx={{ mb: 3 }}
          >
            {errorMessage}
          </Alert>
        )}

        <Stack
          mb={5}
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={2}
          alignItems={{
            xs: 'stretch',
            sm: 'center',
          }}
          justifyContent="space-between"
        >
          <PostSearch posts={validPosts} />

          <PostSort
            options={[
              {
                value: 'latest',
                label: 'Latest',
              },
              {
                value: 'oldest',
                label: 'Oldest',
              },
            ]}
          />
        </Stack>

        {loading ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={2}
            sx={{
              minHeight: 360,
            }}
          >
            <CircularProgress />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Loading blog posts...
            </Typography>
          </Stack>
        ) : (
          <>
            <Grid container spacing={3}>
              {validPosts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={index}
                  onEdit={handleOpenEditPost}
                />
              ))}
            </Grid>

            {validPosts.length === 0 && (
              <Stack
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{
                  py: 10,
                }}
              >
                <Iconify
                  icon="solar:document-text-bold-duotone"
                  width={64}
                  sx={{
                    color: 'text.disabled',
                  }}
                />

                <Typography variant="h6">
                  No blog posts found
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Create your first blog post using the New Post button.
                </Typography>
              </Stack>
            )}
          </>
        )}
      </Container>

      <BlogQuickForm
        open={openEdit}
        currentPost={selectedPost}
        externalSubmitting={saving}
        onClose={handleCloseEdit}
        onSubmit={handleSubmitPost}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function normalizeBlogPost(blog) {
  const tags = Array.isArray(blog.tags)
    ? blog.tags
        .map((tag) => {
          if (typeof tag === 'string') {
            return tag;
          }

          return tag?.name || '';
        })
        .filter(Boolean)
    : [];

  const coverMedia =
    blog.cover &&
    typeof blog.cover === 'object'
      ? blog.cover
      : null;

  const coverUrl =
    coverMedia?.url ||
    blog.cover_url ||
    '';

  const contentMedia = Array.isArray(
    blog.content_media
  )
    ? blog.content_media
    : [];

  const status =
    blog.status || 'DRAFT';

  return {
    id: blog.id,

    title:
      blog.title ||
      'Untitled post',

    slug:
      blog.slug ||
      '',

    description:
      blog.description ||
      '',

    content:
      blog.content ||
      '',

    status,

    published:
      status === 'PUBLISHED',

    cover:
      coverUrl,

    coverMedia,

    contentMedia,

    tags,

    metaTitle:
      blog.meta_title ||
      blog.metaTitle ||
      '',

    metaDescription:
      blog.meta_description ||
      blog.metaDescription ||
      '',

    metaKeywords:
      blog.meta_keywords ||
      blog.metaKeywords ||
      '',

    createdAt:
      blog.created_at ||
      blog.createdAt ||
      null,

    updatedAt:
      blog.updated_at ||
      blog.updatedAt ||
      null,

    publishedAt:
      blog.published_at ||
      blog.publishedAt ||
      null,

    author:
      normalizeAuthor(blog),
  };
}

// ----------------------------------------------------------------------

function normalizeAuthor(blog) {
  const author =
    blog.author ||
    blog.users ||
    null;

  if (!author) {
    return {
      name: 'Admin',
      avatarUrl: '',
    };
  }

  const fullName = [
    author.first_name,
    author.last_name,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    name:
      fullName ||
      author.name ||
      author.email ||
      'Admin',

    avatarUrl:
      author.avatar_url ||
      author.avatarUrl ||
      '',
  };
}