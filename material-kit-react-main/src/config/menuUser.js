/**
* File name: menuUser.js
* Author: HongMing
* Function: menu items for a standard user
*/

import {
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  User as UserIcon,
  Monitor as ManagerIcon,
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
    href: paths.task_manager,
    icon: ManagerIcon,
    title: 'Task Manager'
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
