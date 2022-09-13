/**
* File name: Login.js
* Author: HongMing
* Page: Login
* Function: Login with an email address and password
*/

import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as Yup from 'yup';
import { Formik } from 'formik';
import {
  Box,
  Button,
  Container,
  Grid,
  Link,
  Snackbar,
  TextField,
  Typography
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import FacebookIcon from 'src/icons/Facebook';
import GoogleIcon from 'src/icons/Google';
import { useFirebase } from 'react-redux-firebase';
import paths from 'src/constants/route_path';

const Login = () => {
  const navigate = useNavigate();
  const firebase = useFirebase();
  const auth = firebase.auth();
  const [alertOpen, setAlertOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const handleAlertClose = () => {
    // close the alert dialogue
    setAlertOpen(false);
  };

  // login with email address and password
  const emailLogin = (credentials, { setSubmitting, setErrors }) => {
    setErrorMsg('');
    // keep authentication information in the session
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => auth.signInWithEmailAndPassword(credentials.email, credentials.password)
        .then((userCredential) => {
          // Signed in
          console.log(`Sign in with user.isAnonymous: ${JSON.stringify(userCredential.user.isAnonymous)}`);
          // switch to the dashboard page
          navigate(paths.dashboard);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
          // cancel login
          setSubmitting(false);
          if (error === undefined || error.code === undefined) {
            return;
          }
          // alert error message
          if (error.code.includes('password')) {
            // password error
            setErrors({ password: error.message });
          } else if (error.code.includes('user')) {
            // user error
            setErrors({ email: error.message });
          } else {
            setErrorMsg(error.message);
            setAlertOpen(true);
          }
        }));
  };

  return (
    <>
      <Helmet>
        <title>Login | Material Kit</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center'
        }}
      >
        <Container maxWidth="sm">
          <Formik
            initialValues={{
              email: '',
              password: ''
            }}
            validationSchema={Yup.object().shape({
              email: Yup.string()
                .email('Must be a valid email')
                .max(255)
                .required('Email is required'),
              password: Yup.string().max(255).required('Password is required')
            })}
            onSubmit={emailLogin}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
              touched,
              values
            }) => (
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <Typography color="textPrimary" variant="h2">
                    Sign in
                  </Typography>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    Sign in on the internal platform
                  </Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Button
                      color="primary"
                      fullWidth
                      startIcon={<FacebookIcon />}
                      onClick={handleSubmit}
                      size="large"
                      variant="contained"
                    >
                      Login with Facebook
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Button
                      fullWidth
                      startIcon={<GoogleIcon />}
                      onClick={handleSubmit}
                      size="large"
                      variant="contained"
                    >
                      Login with Google
                    </Button>
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    pb: 1,
                    pt: 3
                  }}
                >
                  <Typography
                    align="center"
                    color="textSecondary"
                    variant="body1"
                  >
                    or login with email address
                  </Typography>
                </Box>
                <TextField
                  error={Boolean(touched.email && errors.email)}
                  fullWidth
                  helperText={touched.email && errors.email}
                  label="Email Address"
                  margin="normal"
                  name="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="email"
                  value={values.email}
                  variant="outlined"
                />
                <TextField
                  error={Boolean(touched.password && errors.password)}
                  fullWidth
                  helperText={touched.password && errors.password}
                  label="Password"
                  margin="normal"
                  name="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="password"
                  value={values.password}
                  variant="outlined"
                  inputProps={{
                    autoComplete: 'new-password',
                    form: {
                      autoComplete: 'off',
                    },
                  }}
                />
                <Box sx={{ py: 2 }}>
                  <Button
                    color="primary"
                    disabled={isSubmitting}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                  >
                    Sign in now
                  </Button>
                  <Snackbar
                    open={alertOpen}
                    autoHideDuration={2000}
                    onClose={handleAlertClose}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'center'
                    }}
                  >
                    <Alert onClose={handleAlertClose} severity="error">
                      {errorMsg}
                    </Alert>
                  </Snackbar>
                </Box>
                <Typography color="textSecondary" variant="body1">
                  Don&apos;t have an account?
                  {' '}
                  <Link component={RouterLink} to={paths.register} variant="h6">
                    Sign up
                  </Link>
                </Typography>
              </form>
            )}
          </Formik>
        </Container>
      </Box>
    </>
  );
};

export default Login;
