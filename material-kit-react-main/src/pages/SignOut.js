/**
* File name: SignOut.js
* Author: HongMing
* Page: SignOut
* Function: Sign out and switch to the Login page
*/

import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useFirebase } from 'react-redux-firebase';
import MSG_SIGN_OUT from 'src/constants/info';
import ResponseDialog from 'src/components/task/ResponseDialog';
import paths from 'src/constants/route_path';

const SignOut = ({ open, close }) => {
  const navigate = useNavigate();
  const firebase = useFirebase();
  const auth = firebase.auth();

  const handleSignOut = () => {
    // Sign out successfully
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => auth.signOut().then(() => {
        // delete all information from the cache storage
        window.sessionStorage.clear();
        // switch to the Login page
        navigate(paths.login, { replace: true });
      }).catch((error) => {
        // An error happened.
        console.error(error);
      }));
  };
  return (
    <ResponseDialog
      open={open}
      handleClose={close}
      message={MSG_SIGN_OUT}
      callback={handleSignOut}
    />
  );
};

SignOut.propTypes = {
  open: PropTypes.bool,
  close: PropTypes.func
};
export default SignOut;
