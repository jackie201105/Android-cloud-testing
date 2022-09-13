/**
* File name: currentUser.js
* Author: HongMing
* Component: Navigation Item
* Function: get the user who logged in the current web application
*/

const user = () => {
  const session = window.sessionStorage;
  let currentUser = {};
  // get current user information from the cache storage
  for (let i = 0; i < session.length; i++) {
    if (session.key(i).includes('firebase')) {
      currentUser = JSON.parse(session.getItem(session.key(i)));
      break;
    }
  }
  // get the user's information including name, uid, admin role
  return {
    name: currentUser === null ? '' : JSON.stringify(currentUser.email),
    uid: currentUser === null ? '' : JSON.stringify(currentUser.uid),
    isAdmin: currentUser === null ? false : JSON.stringify(currentUser.email).includes('admin'),
  };
};

export default user;
