/**
* File name: routes.js
* Author: HongMing
* Function: route mapping that describes that relationship between route paths and pages
*/

import { Navigate } from 'react-router-dom';
import DashboardLayout from 'src/components/DashboardLayout';
import MainLayout from 'src/components/MainLayout';
import Account from 'src/pages/Account';
import Login from 'src/pages/Login';
import NotFound from 'src/pages/NotFound';
import Register from 'src/pages/Register';
import Settings from 'src/pages/Settings';
import DashboardTask from 'src/pages/DashboardTask';
import TaskManager from 'src/pages/TaskManager';
import DeviceManager from 'src/pages/DeviceManager';

// route mapping
const routes = (isLoggedIn) => [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: '404', element: <NotFound /> },
      { path: '/', element: <Login /> },
      { path: 'app', element: <NotFound /> },
      { path: '*', element: <NotFound /> },
    ]
  },
  {
    path: 'app',
    element: isLoggedIn ? <DashboardLayout /> : <Navigate to="/login" />,
    children: [
      { path: 'account', element: <Account /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
      { path: 'dashboard_task', element: <DashboardTask /> },
      { path: 'task_manager', element: <TaskManager /> },
      { path: 'device_manager', element: <DeviceManager /> },
    ]
  },
];

export default routes;
