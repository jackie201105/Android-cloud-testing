/**
* File name: SettingsPassword.js
* Author: HongMing
* Component: Setting Password
* Function: Change current password with new one
*/

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Snackbar
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useFirebase } from 'react-redux-firebase';

const SettingsPassword = (props) => {
  const firebase = useFirebase();
  const [alert, setAlert] = useState({});
  const [errorText, setErrorText] = useState('');
  const [values, setValues] = useState({
    password: '',
    confirm: ''
  });

  // the change event of the password field
  const handleChange = (event) => {
    if (errorText !== '') {
      setErrorText('');
    }
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  };

  // the close event of the alert dialog
  const handleAlertClose = () => {
    const alterSuccess = { isError: false, isOpen: false, message: '' };
    setAlert(alterSuccess);
  };

  // save the new password into firebase
  const handOnClick = () => {
    if (values.password !== values.confirm) {
      return setErrorText('Password not match');
    }
    const user = firebase.auth().currentUser;
    return user.updatePassword(values.password)
      .then(() => {
        // open success dialog
        const alterSuccess = { isError: false, isOpen: true, message: 'Save successfully!' };
        setAlert(alterSuccess);
      })
      .catch((error) => {
        // display error message
        setErrorText(error.message);
      });
  };

  return (
    <form {...props}>
      <Card>
        <CardHeader subheader="Update password" title="Password" />
        <Divider />
        <CardContent>
          <TextField
            fullWidth
            label="Password"
            margin="normal"
            name="password"
            onChange={handleChange}
            type="password"
            value={values.password}
            variant="outlined"
          />
          <TextField
            fullWidth
            error={errorText !== ''}
            label="Confirm password"
            margin="normal"
            name="confirm"
            onChange={handleChange}
            helperText={errorText}
            type="password"
            value={values.confirm}
            variant="outlined"
          />
        </CardContent>
        <Divider />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2
          }}
        >
          <Button color="primary" onClick={handOnClick} variant="contained">
            Update
          </Button>
          <Snackbar
            open={alert.isOpen}
            autoHideDuration={2000}
            onClose={handleAlertClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center'
            }}
          >
            <Alert onClose={handleAlertClose} severity={alert.isError ? 'error' : 'success'}>
              {alert.message}
            </Alert>
          </Snackbar>
        </Box>
      </Card>
    </form>
  );
};

export default SettingsPassword;
