import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

export default function PostCard({ post, index = 0, onEdit }) {
  if (!post) {
    return null;
  }

  const {
    cover = '',
    title = 'Untitled post',
    createdAt = null,
  } = post;

  const latestPostLarge = index === 0;
  const latestPost = index === 1 || index === 2;
  const isFeaturedPost = latestPostLarge || latestPost;

  const handleEdit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    onEdit(post);
  };


  const renderEditButton = (
    <Tooltip title="Edit post">
      <IconButton
        size="small"
        onClick={handleEdit}
        sx={{
          top: 16,
          right: 16,
          zIndex: 20,
          position: 'absolute',
          color: 'common.white',
          bgcolor: (theme) => alpha(theme.palette.grey[900], 0.56),
          backdropFilter: 'blur(6px)',
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
          },
        }}
      >
        <Iconify icon="solar:pen-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const renderTitle = (
    <Link
      component="button"
      type="button"
      color="inherit"
      variant="subtitle2"
      underline="hover"
      onClick={handleEdit}
      sx={{
        p: 0,
        border: 0,
        width: 1,
        height: 44,
        cursor: 'pointer',
        textAlign: 'left',
        overflow: 'hidden',
        bgcolor: 'transparent',
        WebkitLineClamp: 2,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        ...(latestPostLarge && {
          height: 60,
          typography: 'h5',
        }),
        ...(isFeaturedPost && {
          color: 'common.white',
        }),
      }}
    >
      {title}
    </Link>
  );

  const renderCover = cover ? (
    <Box
      component="img"
      alt={title}
      src={cover}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
        transition: (theme) =>
          theme.transitions.create('transform', {
            duration: theme.transitions.duration.standard,
          }),
      }}
    />
  ) : (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        top: 0,
        width: 1,
        height: 1,
        position: 'absolute',
        bgcolor: 'background.neutral',
        color: 'text.disabled',
      }}
    >
      <Iconify icon="solar:gallery-wide-bold-duotone" width={48} />
    </Stack>
  );

  const renderDate = (
    <Typography
      variant="caption"
      component="div"
      sx={{
        mb: 2,
        color: 'text.disabled',
        ...(isFeaturedPost && {
          opacity: 0.48,
          color: 'common.white',
        }),
      }}
    >
      {createdAt ? fDate(createdAt) : 'No date'}
    </Typography>
  );

  const renderShape = (
    <SvgColor
      color="paper"
      src="/assets/icons/shape-avatar.svg"
      sx={{
        width: 80,
        height: 36,
        zIndex: 9,
        bottom: -15,
        position: 'absolute',
        color: 'background.paper',
        ...(isFeaturedPost && {
          display: 'none',
        }),
      }}
    />
  );

  return (
    <Grid
      xs={12}
      sm={latestPostLarge ? 12 : 6}
      md={latestPostLarge ? 6 : 3}
    >
      <Card
        sx={{
          height: 1,
          position: 'relative',
          '&:hover .post-cover-image': {
            transform: 'scale(1.04)',
          },
        }}
      >
        <Box
          sx={{
            overflow: 'hidden',
            position: 'relative',
            pt: 'calc(100% * 3 / 4)',
            ...(isFeaturedPost && {
              pt: 'calc(100% * 4 / 3)',
              '&:after': {
                top: 0,
                left: 0,
                zIndex: 1,
                content: "''",
                width: '100%',
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
              },
            }),
            ...(latestPostLarge && {
              pt: {
                xs: 'calc(100% * 4 / 3)',
                sm: 'calc(100% * 3 / 4.66)',
              },
            }),
          }}
        >
          {renderShape}


          {cover ? (
            <Box
              component="img"
              className="post-cover-image"
              alt={title}
              src={cover}
              sx={{
                top: 0,
                width: 1,
                height: 1,
                objectFit: 'cover',
                position: 'absolute',
                transition: (theme) =>
                  theme.transitions.create('transform', {
                    duration: theme.transitions.duration.standard,
                  }),
              }}
            />
          ) : (
            renderCover
          )}

          {renderEditButton}
        </Box>

        <Box
          sx={{
            p: (theme) => theme.spacing(4, 3, 3),
            ...(isFeaturedPost && {
              zIndex: 2,
              width: 1,
              bottom: 0,
              position: 'absolute',
            }),
          }}
        >
          {renderDate}

          {renderTitle}

        </Box>
      </Card>
    </Grid>
  );
}

// ----------------------------------------------------------------------

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
    cover: PropTypes.string,
    title: PropTypes.string,
    view: PropTypes.number,
    comment: PropTypes.number,
    share: PropTypes.number,
    createdAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),
    author: PropTypes.shape({
      name: PropTypes.string,
      avatarUrl: PropTypes.string,
    }),
  }).isRequired,
  index: PropTypes.number,
  onEdit: PropTypes.func,
};

PostCard.defaultProps = {
  index: 0,
  onEdit: () => {},
};