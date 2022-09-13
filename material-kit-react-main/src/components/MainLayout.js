/**
* File name: MainLayout.js
* Author: HongMing
* Component: Main Layout
* Function: Display the main layout
*/

import { Outlet } from 'react-router-dom';
import { experimentalStyled } from '@material-ui/core';
import MainNavbar from './MainNavbar';

// the style of root component
const MainLayoutRoot = experimentalStyled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  height: '100%',
  overflow: 'hidden',
  width: '100%'
}));

// the style of wrapper component
const MainLayoutWrapper = experimentalStyled('div')({
  display: 'flex',
  flex: '1 1 auto',
  overflow: 'hidden',
  paddingTop: 64
});

// the style of container component
const MainLayoutContainer = experimentalStyled('div')({
  display: 'flex',
  flex: '1 1 auto',
  overflow: 'hidden'
});

// the style of content component
const MainLayoutContent = experimentalStyled('div')({
  flex: '1 1 auto',
  height: '100%',
  overflow: 'auto'
});

const MainLayout = () => (
  <MainLayoutRoot>
    <MainNavbar />
    <MainLayoutWrapper>
      <MainLayoutContainer>
        <MainLayoutContent>
          <Outlet />
        </MainLayoutContent>
      </MainLayoutContainer>
    </MainLayoutWrapper>
  </MainLayoutRoot>
);

export default MainLayout;
