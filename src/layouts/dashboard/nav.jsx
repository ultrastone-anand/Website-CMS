import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useResponsive } from 'src/hooks/use-responsive';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import { NAV } from './config-layout';
import navConfig from './config-navigation';

// ----------------------------------------------------------------------

export default function Nav({ openNav, onCloseNav }) {
  const pathname = usePathname();
const user = JSON.parse(localStorage.getItem('user') || '{}');
  const upLg = useResponsive('up', 'lg');

  const [miniNav, setMiniNav] = useState(false);

  const navWidth = miniNav ? 88 : NAV.WIDTH;

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderAccount = (
    <Box
      sx={{
        my: 3,
        mx: 2.5,
        py: 2,
        px: 2.5,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
      }}
    >
      <Avatar src={user.photoURL} alt="photoURL" />

      <Box sx={{ ml: 2 }}>
        <Typography variant="subtitle2">
          {user.first_name} { user.last_name}
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >
          {user.role}
        </Typography>
      </Box>
    </Box>
  );

  const renderMenu = (
    <Stack component="nav" spacing={0.5} sx={{ px: 2 }}>
      {navConfig.map((item) => (
        <NavItem
          key={item.title}
          item={item}
          miniNav={miniNav}
        />
      ))}
    </Stack>
  );

const renderContent = (
  <Box
    sx={{
      height: 1,
      position: 'relative',
      overflow: 'visible',
    }}
  >
<IconButton
  size="small"
  onClick={() => setMiniNav((prev) => !prev)}
  sx={{
    position: 'absolute',
    top: 20,
    right: 0,
    transform: 'translateX(50%)',

    zIndex: 9999,
    width: 36,
    height: 36,

    bgcolor: 'background.paper',
    border: (theme) =>
      `1px solid ${theme.palette.divider}`,
    borderRadius: '50%',
    boxShadow: 2,

    '&:hover': {
      bgcolor: 'background.paper',
    },
  }}
>
  <Iconify
    icon={
      miniNav
        ? 'eva:arrow-ios-forward-fill'
        : 'eva:arrow-ios-back-fill'
    }
    width={16}
  />
</IconButton>

    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Logo
  sx={{
    mt: 3,
    ml: miniNav ? 2.5 : 4,
    mb: miniNav ? 4 : 2,
  }}
/>

      {!miniNav && renderAccount}

      {renderMenu}

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  </Box>
);

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: navWidth },
        transition: 'width 0.3s ease',
      }}
    >
      {upLg ? (
  <Box
    sx={{
      height: '100vh',
      position: 'fixed',
      width: navWidth,
      transition: 'width 0.3s ease',
      borderRight: (theme) =>
        `dashed 1px ${theme.palette.divider}`,

      overflow: 'visible', // IMPORTANT
      zIndex: 1201, // keep sidebar above content
    }}
  >
    {renderContent}
  </Box>
) : (
  <Drawer
    open={openNav}
    onClose={onCloseNav}
    PaperProps={{
      sx: {
        width: navWidth,
      },
    }}
  >
    {renderContent}
  </Drawer>
)}
    </Box>
  );
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

// ----------------------------------------------------------------------

function NavItem({ item, miniNav }) {
  const pathname = usePathname();

  const active = item.path === pathname;

  return (
    <ListItemButton
      component={RouterLink}
      to={item.path}
      sx={{
        minHeight: 44,
        borderRadius: 0.75,
        typography: 'body2',
        color: 'text.secondary',
        textTransform: 'capitalize',
        fontWeight: 'fontWeightMedium',

        justifyContent: miniNav
          ? 'center'
          : 'flex-start',

        ...(active && {
          color: 'primary.main',
          fontWeight: 'fontWeightSemiBold',
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              0.08
            ),
          '&:hover': {
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary.main,
                0.16
              ),
          },
        }),
      }}
    >
      <Box
        component="span"
        sx={{
          width: 24,
          height: 24,
          mr: miniNav ? 0 : 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item.icon}
      </Box>

      {!miniNav && (
        <Box component="span">
          {item.title}
        </Box>
      )}
    </ListItemButton>
  );
}

NavItem.propTypes = {
  item: PropTypes.object,
  miniNav: PropTypes.bool,
};