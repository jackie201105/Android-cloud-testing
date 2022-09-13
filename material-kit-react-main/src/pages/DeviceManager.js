/**
* File name: DeviceManager.js
* Author: HongMing
* Page: Device Manager
* Function: stop and restart Android devices.
*/

import { useState, useEffect, React } from 'react';
import { Helmet } from 'react-helmet';
import {
  Box,
  Button,
  Container,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  SvgIcon,
  Snackbar
} from '@material-ui/core';
import { Search as SearchIcon } from 'react-feather';
import { Alert } from '@material-ui/lab';
import DeviceListResults from 'src/components/device/DeviceList';
import Server from 'src/services/Server';
import ResponseDialog from 'src/components/task/ResponseDialog';
import sessionKey from 'src/constants/sessionKey';

const service = new Server();

const DeviceManager = () => {
  const session = window.sessionStorage;
  const [loadState, setLoadState] = useState(false);
  const [responseOpen, setResponseOpen] = useState(false);
  const [responseMsg, setResponseMsg] = useState({ msg: '' });
  const [message, setMessage] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const getSelectedDevices = (ids) => setSelectedDeviceIds(ids);
  const [devices, setDevices] = useState(() => {
    if (session.getItem(sessionKey.DEVICE_KEY) == null) {
      console.log([]);
      return [];
    }
    // get all device information from the cache storage
    return JSON.parse(session.getItem(sessionKey.DEVICE_KEY));
  });
  const [rows, setRows] = useState(devices);
  const [searched, setSearched] = useState('');
  const requestSearch = (searchedVal: string) => {
    setSearched(searchedVal);
    // filter the devices with the search value
    const filteredRows = devices.filter((row) => row
      .device_id.toString().includes(searchedVal.toLowerCase()));
    setRows(filteredRows);
  };

  const handleAlertClose = () => {
    // close the alert dialog
    setAlertOpen(false);
    setIsError(false);
  };
  // close the response dialog
  const handleResponseClose = () => setResponseOpen(false);
  const handleRequest = () => {
    if (responseMsg.stop) {
      // stop Android devices by update the status of devices
      return service.stopDevice(selectedDeviceIds);
    }
    // restart Android devices by update the status of devices
    return service.startDevice(selectedDeviceIds);
  };
  const handleResponseConfirm = () => {
    handleResponseClose();
    handleRequest().then((response) => {
      console.log(response);
      // open success dialog
      setMessage(`${responseMsg.stop ? 'Stop' : 'Restart'} devices successfully`);
      setIsError(false);
      setAlertOpen(true);
      setLoadState(!loadState);
    }).catch((error) => {
      // display error dialog
      setMessage(`Fail to ${responseMsg.stop ? 'Stop' : 'Restart'} devices: ${error}`);
      setIsError(true);
      setAlertOpen(true);
    });
  };

  // stop Android devices
  const stopDevices = () => {
    if (!selectedDeviceIds.length) {
      // alert message to remind the user to select a device
      setMessage('Please select a device!');
      setIsError(true);
      setAlertOpen(true);
      return;
    }
    // alert message to let the user to confirm
    setResponseMsg({ msg: 'Are you sure you want to stop all selected devices?', stop: true });
    setResponseOpen(true);
  };

  // start Android devices
  const startDevices = () => {
    if (!selectedDeviceIds.length) {
      // alert message to remind the user to select a device
      setMessage('Please select a device!');
      setIsError(true);
      setAlertOpen(true);
      return;
    }
    // alert message to let the user to confirm
    setResponseMsg({ msg: 'Are you sure you want to start all selected devices?', stop: false });
    setResponseOpen(true);
  };

  const LoadData = () => {
    // get all device information
    service.findAllDevices((response) => {
      if (JSON.stringify(devices) !== JSON.stringify(JSON.parse(response.data.value))) {
        setDevices(JSON.parse(response.data.value));
        setRows(JSON.parse(response.data.value));
      }
    });
  };

  useEffect(() => {
    // get all device information
    LoadData();
  }, [loadState]);

  return (
    <>
      <Helmet>
        <title>Device Manager | Device</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 3
        }}
      >
        <Container maxWidth={false}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={LoadData}
            >
              Refresh
            </Button>
            <Button
              onClick={stopDevices}
            >
              Stop device
            </Button>
            <Button
              onClick={startDevices}
            >
              Restart device
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
              <Alert onClose={handleAlertClose} severity={isError ? 'error' : 'success'}>
                {message}
              </Alert>
            </Snackbar>
            <ResponseDialog
              open={responseOpen}
              handleClose={handleResponseClose}
              callback={handleResponseConfirm}
              message={responseMsg.msg}
            />
          </Box>
          <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ maxWidth: 500 }}>
                  <TextField
                    fullWidth
                    value={searched}
                    onChange={(event) => requestSearch(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SvgIcon
                            fontSize="small"
                            color="action"
                          >
                            <SearchIcon />
                          </SvgIcon>
                        </InputAdornment>
                      )
                    }}
                    placeholder="Search device"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ pt: 3 }}>
            <DeviceListResults
              hideCheck={false}
              devices={rows}
              getSelectedDevices={getSelectedDevices}
            />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default DeviceManager;
