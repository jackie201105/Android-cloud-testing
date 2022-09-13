/**
* File name: menuAdmin.js
* Author: HongMing
* Function: menu items for an administrator
*/

import {
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  User as UserIcon,
  Phone as PhoneIcon,
} from 'react-feather';
import InputIcon from '@material-ui/icons/Input';
import paths from 'src/constants/route_path';

// menu items
const items = [
  {
    href: paths.dashboard,
    icon: BarChartIcon,
    title: 'Dashboard Tasks'
  },
  {
    href: paths.device_manager,
    icon: PhoneIcon,
    title: 'Device Manager'
  },
  {
    href: paths.account,
    icon: UserIcon,
    title: 'Account'
  },
  {
    href: paths.settings,
    icon: SettingsIcon,
    title: 'Settings'
  },
  {
    href: paths.login,
    icon: InputIcon,
    title: 'Sign Out'
  },
];

export default items;
