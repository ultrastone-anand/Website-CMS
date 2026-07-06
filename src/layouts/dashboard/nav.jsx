import PropTypes from 'prop-types';
import { useMemo , useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Popper from '@mui/material/Popper';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import ClickAwayListener from '@mui/material/ClickAwayListener';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useResponsive } from 'src/hooks/use-responsive';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import { NAV } from './config-layout';
import { getNavConfig } from './config-navigation';

// ----------------------------------------------------------------------

function getStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem('user') || '{}');
  } catch (error) {
    return {};
  }
}

// ----------------------------------------------------------------------

export default function Nav({ openNav, onCloseNav }) {
  const pathname = usePathname();
  const upLg = useResponsive('up', 'lg');

  const [miniNav, setMiniNav] = useState(true);
  const [navConfig, setNavConfig] = useState([]);

  const user = useMemo(() => getStoredUser(), []);

  const isMini = upLg && miniNav;
  const navWidth = isMini ? NAV.WIDTH_MINI ?? 88 : NAV.WIDTH;

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Refresh nav items when the route changes (e.g. role-based nav).
  useEffect(() => {
    setNavConfig(getNavConfig());
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
      <Avatar src={user.photoURL} alt={user.first_name || 'User avatar'} />

      <Box sx={{ ml: 2, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {[user.first_name, user.last_name].filter(Boolean).join(' ')}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {user.role}
        </Typography>
      </Box>
    </Box>
  );

  const renderMenu = (
    <Stack component="nav" spacing={0.5} sx={{ px: 2 }}>
      {navConfig.map((item) => (
        <NavItem key={item.title} item={item} miniNav={isMini} pathname={pathname} />
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
      {upLg && (
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
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: '50%',
            boxShadow: 2,

            '&:hover': {
              bgcolor: 'background.paper',
            },
          }}
        >
          <Iconify
            icon={miniNav ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
            width={16}
          />
        </IconButton>
      )}

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
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,

            overflow: 'visible', // allow the toggle button to overflow the edge
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

function isChildActive(item, pathname) {
  return !!item.children?.some((child) => child.path === pathname || isChildActive(child, pathname));
}

function NavItem({ item, miniNav, pathname }) {
  const hasChildren = !!item.children?.length;
  const childActive = isChildActive(item, pathname);
  const active = item.path === pathname || childActive;
  const [anchorEl, setAnchorEl] = useState(null);

const openPopper = Boolean(anchorEl);

  const [open, setOpen] = useState(childActive);

  // Keep the group expanded if the active route moves to one of its children.
  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  const handleClick = () => {
    if (hasChildren) {
      setOpen((prev) => !prev);
    }
  };

  const handleMouseEnter = (event) => {
  if (miniNav && hasChildren) {
    setAnchorEl(event.currentTarget);
  }
};

const handleMouseLeave = () => {
  if (miniNav) {
    setAnchorEl(null);
  }
};

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={!miniNav ? undefined : handleMouseLeave}
        component={hasChildren ? 'div' : RouterLink}
        href={hasChildren ? undefined : item.path}
        sx={{
          minHeight: 44,
          borderRadius: 0.75,
          typography: 'body2',
          color: 'text.secondary',
          textTransform: 'capitalize',
          fontWeight: 'fontWeightMedium',

          display: 'flex',
          alignItems: 'center',
          justifyContent: miniNav ? 'center' : 'space-between',

          ...(active && {
            color: 'primary.main',
            fontWeight: 'fontWeightSemiBold',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
            },
          }),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <Box
            component="span"
            sx={{
              width: 24,
              height: 24,
              mr: miniNav ? 0 : 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {item.icon}
          </Box>

          {!miniNav && (
            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
            </Box>
          )}
        </Box>

        {hasChildren && !miniNav && (
          <Iconify
            icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
            width={16}
          />
        )}
      </ListItemButton>

      {miniNav && hasChildren && (
  <Popper
    open={openPopper}
    anchorEl={anchorEl}
    placement="right-start"
    sx={{ zIndex: 9999 }}
  >
    <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
      <Paper
        elevation={8}
        onMouseEnter={() => setAnchorEl(anchorEl)}
        onMouseLeave={() => setAnchorEl(null)}
        sx={{
          ml: 1,
          minWidth: 220,
          py: 1,
          borderRadius: 2,
        }}
      >
        {item.children.map((child) => (
          <ListItemButton
            key={child.title}
            component={RouterLink}
            href={child.path}
            sx={{
              px: 2,
              py: 1,
            }}
          >
            {child.title}
          </ListItemButton>
        ))}
      </Paper>
    </ClickAwayListener>
  </Popper>
)}

      {hasChildren && !miniNav && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ pl: 2 }}>
            {item.children.map((child) => (
              <NavItem key={child.title} item={child} miniNav={miniNav} pathname={pathname} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

NavItem.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string,
    path: PropTypes.string,
    icon: PropTypes.node,
    children: PropTypes.array,
  }),
  miniNav: PropTypes.bool,
  pathname: PropTypes.string,
};