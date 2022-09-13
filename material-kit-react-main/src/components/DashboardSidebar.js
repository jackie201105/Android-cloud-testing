/**
* File name: DashboardSidebar.js
* Author: HongMing
* Component: Dashboard Side bar
* Function: display the account avatar and menus on the side bar
*/

import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  Hidden,
  List,
  Typography
} from '@material-ui/core';
import SignOut from 'src/pages/SignOut';
import paths from 'src/constants/route_path';
import menu from 'src/config/menu';
import Server from 'src/services/Server';
import NavItem from './NavItem';

const service = new Server();

const DashboardSidebar = ({ onMobileClose, openMobile }) => {
  const [account, setAccount] = useState({});
  const location = useLocation();
  const [responseOpen, setResponseOpen] = useState(false);
  const validateFunc = (href) => {
    if (href !== paths.login) {
      return true;
    }
    // open SignOut dialog
    setResponseOpen(true);
    return false;
  };

  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }
    // get current account information
    service.getAccount((response) => {
      const accountArray = JSON.parse(response.data.value);
      // display account information with query data
      if (accountArray.length > 0) {
        setAccount(accountArray[0]);
      } else {
        setAccount({});
      }
    });
  }, [location.pathname]);

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
          p: 2
        }}
      >
        <Avatar
          component={RouterLink}
          src={'/static/images/avatars/'.concat(account.avatar)}
          sx={{
            cursor: 'pointer',
            width: 64,
            height: 64
          }}
          to={paths.account}
        />
        <Typography color="textPrimary" variant="h5">
          {`${account.first_name} ${account.last_name}`}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <List>
          {menu().map((item) => (
            <NavItem
              href={item.href}
              key={item.title}
              title={item.title}
              icon={item.icon}
              validate={validateFunc}
            />
          ))}
        </List>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
    </Box>
  );

  return (
    <>
      <SignOut
        open={responseOpen}
        close={() => setResponseOpen(false)}
      />
      <Hidden lgUp>
        <Drawer
          anchor="left"
          onClose={onMobileClose}
          open={openMobile}
          variant="temporary"
          PaperProps={{
            sx: {
              width: 256
            }
          }}
        >
          {content}
        </Drawer>
      </Hidden>
      <Hidden lgDown>
        <Drawer
          anchor="left"
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: 256,
              top: 64,
              height: 'calc(100% - 64px)'
            }
          }}
        >
          {content}
        </Drawer>
      </Hidden>
    </>
  );
};

DashboardSidebar.propTypes = {
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool
};

DashboardSidebar.defaultProps = {
  onMobileClose: () => {},
  openMobile: false
};

export default DashboardSidebar;
