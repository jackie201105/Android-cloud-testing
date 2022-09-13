/**
* File name: NavItem.js
* Author: HongMing
* Component: Navigation Item
* Function: Display navigate item and link to relative pages
*/

import {
  matchPath,
  useLocation,
  useNavigate
} from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, ListItem } from '@material-ui/core';

const NavItem = ({
  href,
  icon: Icon,
  title,
  validate,
  ...rest
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const active = href ? !!matchPath({
    path: href,
    end: false
  }, location.pathname) : false;

  const navigateToHref = () => {
    if (validate(href)) {
      navigate(href, { replace: true });
    }
  };

  return (
    <ListItem
      disableGutters
      sx={{
        display: 'flex',
        py: 0
      }}
      {...rest}
    >
      <Button
        sx={{
          color: 'text.secondary',
          fontWeight: 'medium',
          justifyContent: 'flex-start',
          letterSpacing: 0,
          py: 1.25,
          textTransform: 'none',
          width: '100%',
          ...(active && {
            color: 'primary.main'
          }),
          '& svg': {
            mr: 1
          }
        }}
        onClick={navigateToHref}
      >
        {Icon && (
          <Icon size="20" />
        )}
        <span>
          {title}
        </span>
      </Button>
    </ListItem>
  );
};

NavItem.propTypes = {
  href: PropTypes.string,
  icon: PropTypes.elementType,
  title: PropTypes.string,
  validate: PropTypes.func,
};

export default NavItem;
