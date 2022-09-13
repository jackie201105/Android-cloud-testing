/**
* File name: AccountProfileDetails.js
* Author: HongMing
* Component: User Account Detail
* Function: Display and update the detail information of an account
*/

import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Snackbar,
  TextField
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import states from 'src/constants/states';
import Server from 'src/services/Server';

const service = new Server();
const AccountProfileDetails = ({
  account, updateFunc, ...props
}) => {
  const [alert, setAlert] = useState({});
  // account information
  const [values, setValues] = useState({
    first_name: account.first_name,
    last_name: account.last_name,
    email: account.email,
    phone: account.phone,
    state: account.state,
    country: account.country,
    uid: account.uid
  });

  const saveDetail = () => {
    // save account details
    service.saveAccount(values)
      .then((response) => {
        if (response.data.value === undefined) {
          console.error(response.message);
        }
        // notify its parent screen that the account information has been updated
        updateFunc(values);
        const alterSuccess = { isError: false, isOpen: true, message: 'Save successfully!' };
        // open the success dialog
        setAlert(alterSuccess);
      })
      .catch((error) => {
        const alterError = { isError: true, isOpen: true, message: 'error' };
        console.log(`${error}`);
        // open the error dialog
        setAlert(alterError);
      });
  };
  // The change event of account information
  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  };
  // The close event of the dialog
  const handleAlertClose = () => {
    const alterSuccess = { isError: false, isOpen: false, message: '' };
    setAlert(alterSuccess);
  };

  return (
    <form autoComplete="off" noValidate {...props}>
      <Card>
        <CardHeader subheader="The information can be edited" title="Profile" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                helperText="Please specify the first name"
                label="First name"
                name="first_name"
                onChange={handleChange}
                required
                value={values.first_name}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Last name"
                name="last_name"
                onChange={handleChange}
                required
                value={values.last_name}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                disabled
                label="Email Address"
                name="email"
                onChange={handleChange}
                required
                value={values.email}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                onChange={handleChange}
                type="number"
                value={values.phone}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                onChange={handleChange}
                required
                value={values.country}
                variant="outlined"
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Select State"
                name="state"
                onChange={handleChange}
                required
                select
                SelectProps={{ native: true }}
                value={values.state}
                variant="outlined"
              >
                {states.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2
          }}
        >
          <Button onClick={saveDetail} color="primary" variant="contained">
            Save details
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

AccountProfileDetails.propTypes = {
  account: PropTypes.object.isRequired,
  updateFunc: PropTypes.func.isRequired,
};

export default AccountProfileDetails;
