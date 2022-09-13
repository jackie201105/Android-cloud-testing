/**
* File name: AccountProfile.js
* Author: HongMing
* Component: User Account Profile
* Function: Display and update account profile photo
*/

import moment from 'moment';
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
  Snackbar
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Server from 'src/services/Server';

const service = new Server();
const AccountProfile = ({
  account, ...props
}) => {
  const [alert, setAlert] = useState({});
  const [imageSource, setImageSource] = useState({ avatar: account.avatar, previewImage: false });
  const handleOnChange = (event) => {
    const newImage = event.target?.files?.[0];
    if (newImage) {
      const image = URL.createObjectURL(newImage);
      console.log(`image:${event.target.value}`);
      // update the user account's photo with the selected image
      setImageSource({ avatar: image, previewImage: true });
      // update the photo information into the database
      service.updatePhoto(newImage.name, account.uid)
        .then((response) => {
          if (response.data.value === undefined) {
            console.error(response.message);
          }
          // display success information
          const alterSuccess = { isError: false, isOpen: true, message: 'Save successfully!' };
          setAlert(alterSuccess);
        })
        .catch((error) => {
          const alterError = { isError: true, isOpen: true, message: error.message };
          console.log(`account: ${error}`);
          // display error message
          setAlert(alterError);
        });
    }
  };
  // close event of alter message dialogue
  const handleAlertClose = () => {
    const alterSuccess = { isError: false, isOpen: false, message: '' };
    setAlert(alterSuccess);
  };
  return (
    <Card {...props}>
      <CardContent>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Avatar
            src={imageSource.previewImage ? imageSource.avatar : '/static/images/avatars/'.concat(imageSource.avatar)}
            sx={{
              height: 100,
              width: 100
            }}
          />
          <Typography color="textPrimary" gutterBottom variant="h3">
            {account.name}
          </Typography>
          <Typography color="textSecondary" variant="body1">
            {`${account.first_name} ${account.last_name} ${account.country}`}
          </Typography>
          <Typography color="textSecondary" variant="body1">
            {`${moment().format('hh:mm A')} ${account.timezone}`}
          </Typography>
        </Box>
      </CardContent>
      <Divider />
      <CardActions>
        <label htmlFor="avatar-image-upload">
          <input
            hidden
            accept=".png"
            id="avatar-image-upload"
            type="file"
            onChange={handleOnChange}
          />
          <Button
            color="primary"
            variant="outlined"
            component="span"
            fullWidth
          >
            Upload picture
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
        </label>

      </CardActions>
    </Card>
  );
};
AccountProfile.propTypes = {
  account: PropTypes.object.isRequired,
};

export default AccountProfile;
