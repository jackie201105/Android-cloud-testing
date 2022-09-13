/**
* File name: menu.js
* Author: HongMing
* Function: display a menu based on the user with different roles
*/

import menuAdmin from './menuAdmin';
import menuUser from './menuUser';
import currentUser from './currentUser';

const menu = () => {
  console.log(currentUser().name);
  if (currentUser().name.includes('admin')) {
    // display the admin menu
    return menuAdmin;
  }
  // display the standard menu
  return menuUser;
};

export default menu;
