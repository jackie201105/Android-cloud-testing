/**
* File name: SettingsNotifications.js
* Author: HongMing
* Component: Settings Notifications
* Function: Display and update notification settings
*/

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Snackbar,
  Typography
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useState, useEffect } from 'react';
import Server from 'src/services/Server';
import sessionKey from 'src/constants/sessionKey';
import currentUser from 'src/config/currentUser';

const service = new Server();
const SettingsNotifications = (props) => {
  const [alert, setAlert] = useState({});
  const session = window.sessionStorage;
  const [settings, setSettings] = useState(() => {
    if (session.getItem(sessionKey.SETTINGS_KEY) == null) {
      return {};
    }
    // get setting information from the cache storage
    return JSON.parse(session.getItem(sessionKey.SETTINGS_KEY));
  });
  const [notifications, setNotifications] = useState(settings.notifications === undefined ? {} : settings.notifications);
  const [messages, setMessages] = useState(settings.messages === undefined ? {} : settings.messages);
  useEffect(() => {
    // get setting information from the database
    service.getSettings((response) => {
      if (JSON.stringify(settings) !== JSON.stringify(JSON.parse(response.data.value))) {
        // refresh information with query data
        const varSettings = JSON.parse(response.data.value);
        setSettings(varSettings);
        setNotifications(varSettings.notifications);
        setMessages(varSettings.messages);
      }
    });
  }, []);

  // the change event of message settings
  const handleMessageChange = (event) => {
    setMessages({
      ...messages,
      [event.target.name]: event.target.checked
    });
  };

  // the change event of notification settings
  const handleNotificationChange = (event) => {
    setNotifications({
      ...notifications,
      [event.target.name]: event.target.checked
    });
  };

  // the close event of the alert dialog
  const handleAlertClose = () => {
    const alterSuccess = { isError: false, isOpen: false, message: '' };
    setAlert(alterSuccess);
  };
  const onSaveClick = () => {
    const varMessage = messages;
    const varNotification = notifications;
    const settingClone = { uid: currentUser().uid, messages: varMessage, notifications: varNotification };
    // save setting information into the database
    service.saveSettings(settingClone)
      .then((response) => {
        if (response.data.value === undefined) {
          console.error(response.message);
        }
        // open a dialog to display success message
        const alterSuccess = { isError: false, isOpen: true, message: 'Save successfully!' };
        setAlert(alterSuccess);
      })
      .catch((error) => {
        // open a dialog to display error message
        const alterError = { isError: true, isOpen: true, message: 'error' };
        console.log(`${error}`);
        setAlert(alterError);
      });
  };

  return (
    <form {...props}>
      <Card>
        <CardHeader subheader="Manage the notifications" title="Notifications" />
        <Divider />
        <CardContent>
          <Grid container spacing={6} wrap="wrap">
            <Grid
              item
              md={4}
              sm={6}
              sx={{
                display: 'flex',
                flexDirection: 'column'
              }}
              xs={12}
            >
              <Typography color="textPrimary" gutterBottom variant="h6">
                Notifications
              </Typography>
              <FormControlLabel
                control={<Checkbox color="primary" name="email" onChange={handleNotificationChange} checked={notifications.email === undefined ? false : notifications.email} />}
                label="Email"
              />
              <FormControlLabel
                control={<Checkbox color="primary" name="push" onChange={handleNotificationChange} checked={notifications.push === undefined ? false : notifications.push} />}
                label="Push Notifications"
              />
              <FormControlLabel control={<Checkbox name="text" onChange={handleNotificationChange} checked={notifications.text === undefined ? false : notifications.text} />} label="Text Messages" />
              <FormControlLabel
                control={<Checkbox color="primary" name="phone" onChange={handleNotificationChange} checked={notifications.phone === undefined ? false : notifications.phone} />}
                label="Phone calls"
              />
            </Grid>
            <Grid
              item
              md={4}
              sm={6}
              sx={{
                display: 'flex',
                flexDirection: 'column'
              }}
              xs={12}
            >
              <Typography color="textPrimary" gutterBottom variant="h6">
                Messages
              </Typography>
              <FormControlLabel
                control={<Checkbox color="primary" name="email" onChange={handleMessageChange} checked={messages.email === undefined ? false : messages.email} />}
                label="Email"
              />
              <FormControlLabel
                control={<Checkbox name="push" onChange={handleMessageChange} checked={messages.push === undefined ? false : messages.push} />}
                label="Push Notifications"
              />
              <FormControlLabel
                control={<Checkbox color="primary" name="phone" onChange={handleMessageChange} checked={messages.phone === undefined ? false : messages.phone} />}
                label="Phone calls"
              />
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
          <Button color="primary" onClick={onSaveClick} variant="contained">
            Save
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

export default SettingsNotifications;
