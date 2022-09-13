/**
* File name: NewTask.js
* Author: HongMing
* Screen: New Task
* Function: used to create a new test task
*/

import { useState, React } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Snackbar,
  TextField,
  Typography
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import LinearWithValueLabel from 'src/components/task/LinearWithValueLabel';
import Server from 'src/services/Server';
import ResponseDialog from 'src/components/task/ResponseDialog';
import TestPhones from 'src/constants/test_phones';
import testPeriods from 'src/constants/test_period';

const defaultApp = '';
// default value of test period
const defaultPeriod = '0.1';
// default value of an Android device used for testing
const defaultPhone = 'Android 9 4G RAM';
const service = new Server();

const NewTask = ({ open, handleClose }) => {
  const [appFiles, setAppFiles] = useState([]);
  const [isError, setIsError] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [responseOpen, setResponseOpen] = useState(false);
  const [processValue, setProcessValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const [testPeriod, setTestPeriod] = useState(defaultPeriod);
  const [testPhone, setTestPhone] = useState(defaultPhone);

  // close event of the alert dialogue
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // close event of the response dialogue
  const handleResponseClose = () => {
    setResponseOpen(false);
  };

  // upload an Android app to the back end
  const handleUpload = ({ target }: any) => {
    // close if no file is chosen
    if (!target.files.length) {
      return;
    }
    setSelectedFile(target.files[0]);
    // upload the app to the back end
    service
      .upload(target.files[0], (event) => {
        // display the percentage of upload progress
        setProcessValue(Math.round((100 * event.loaded) / event.total));
      })
      .then((response) => {
        setIsError(false);
        // display the result of upload
        setMessage(response.data.message);
        setAlertOpen(true);
        setProcessValue(0);
        const tmpFiles = [];
        for (let i = 0; i < appFiles.length; i++) {
          tmpFiles.push(appFiles[i]);
        }
        tmpFiles.push(target.files[0].name);
        setAppFiles(tmpFiles);
      })
      .catch((error) => {
        // display error message
        setIsError(true);
        let msg = '';
        if (error.response !== undefined) {
          msg = error.response.data.message;
        } else {
          msg = String(error);
        }
        setMessage(msg);
        setAlertOpen(true);
        setProcessValue(0);
      });
  };

  // remove uploaded apps from the back end
  const handleDeleteFile = () => {
    service.deleteFile(appFiles);
  };

  // choose a test period
  const handleTestPeriods = (event) => {
    setTestPeriod(event.target.value);
  };

  // choose an Android device to test the app
  const handleTestPhone = (event) => {
    setTestPhone(event.target.value);
  };

  const handleCloseAndClear = () => {
    // clear all data after curren screen is close
    handleClose();
    setTimeout(() => {
      setAppFiles([]);
      setIsError(false);
      setAlertOpen(false);
      setResponseOpen(false);
      setProcessValue(0);
      setSelectedFile(null);
      setMessage('');
      setResponseMsg('');
      setTestPeriod(defaultPeriod);
      setTestPhone(defaultPhone);
    }, 500);
  };

  // close the current task screen
  const handleCancelTask = () => {
    if (selectedFile !== null && !isError) {
      // if the apk is updated, open a dialog to confirm whether to delete the apk
      setResponseMsg(
        'The uploaded APK will be deleted after closing. Are you sure you need to close it?'
      );
      setResponseOpen(true);
      return;
    }
    handleCloseAndClear();
  };

  // save the new task information
  const handleAddNewTask = () => {
    if (selectedFile === null) {
      setIsError(true);
      // remind to select one Android app required to test
      setMessage('Please upload an app to be tested');
      setAlertOpen(true);
      return;
    }
    if (isError) {
      setAlertOpen(true);
      return;
    }
    // save the new task into the database
    service.addNewTask(selectedFile.name, testPeriod, testPhone)
      .then((response) => {
        if (response.data.value === undefined) {
          return console.error(response.message);
        }
        handleCloseAndClear();
        // update the app's icon and name into the database
        return service.updateTask(response.data.value).then((result) => {
          console.log(result);
        });
      })
      .catch((error) => {
        console.log(`New task: ${error}`);
        handleCloseAndClear();
      });
  };

  const handleResponseConfirm = () => {
    // close the dialog and clear data
    handleCloseAndClear();
    // remove updated Android app files from the database
    handleDeleteFile();
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="form-dialog-title"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle id="form-dialog-title" disableTypography>
        <Typography color="textPrimary" variant="h3">
          Create a new test task
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <DialogContentText>
          Please upload the apk you need to test.
        </DialogContentText>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <TextField
              fullWidth
              label="APK file name"
              name="appName"
              variant="outlined"
              value={selectedFile ? selectedFile.name : defaultApp}
              inputProps={{ readOnly: true }}
            />
            <LinearWithValueLabel processValue={processValue} />
            <Snackbar
              open={alertOpen}
              autoHideDuration={2000}
              onClose={handleAlertClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center'
              }}
            >
              <Alert onClose={handleAlertClose} severity={isError ? 'error' : 'success'}>
                {message}
              </Alert>
            </Snackbar>
            <ResponseDialog
              open={responseOpen}
              handleClose={handleResponseClose}
              message={responseMsg}
              callback={handleResponseConfirm}
            />
          </Grid>
          <Grid item xs={6} md={6}>
            <TextField
              fullWidth
              label="Select test period"
              name="testPeriod"
              onChange={handleTestPeriods}
              required
              select
              SelectProps={{ native: true }}
              value={testPeriod}
              variant="outlined"
            >
              {testPeriods.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={6}>
            <TextField
              fullWidth
              label="Select a test phone"
              name="testPhone"
              onChange={handleTestPhone}
              required
              select
              SelectProps={{ native: true }}
              value={testPhone}
              variant="outlined"
            >
              {TestPhones.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions>
        <label htmlFor="contained-button-file">
          <input
            accept=".apk"
            id="contained-button-file"
            type="file"
            hidden
            disabled={processValue > 0}
            onChange={handleUpload}
          />
          <Button
            disabled={processValue > 0}
            variant="outlined"
            color="secondary"
            component="span"
          >
            Upload APK
          </Button>
        </label>
        <div style={{ flex: '1 0 0' }} />
        <Button onClick={handleCancelTask} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAddNewTask} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

NewTask.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired
};

export default NewTask;
