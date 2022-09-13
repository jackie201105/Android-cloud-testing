/**
* File name: GridFinishedData.js
* Author: HongMing
* Component: Finished Task
* Function: used to display the information of a finished task
*/

import
{
  Box,
  Button,
  Grid,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@material-ui/core';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CardTestData from 'src/components/task//CardTestData';
import Server from 'src/services/Server';

const service = new Server();

const GridFinishedData = ({ taskId, open, handleClose }) => {
  const [currentData, setCurrentData] = useState({});
  useEffect(() => {
    if (open) {
      // get the task information with the task id
      service.findRecentResultId(taskId, (result) => {
        setCurrentData(JSON.parse(result.data.value));
      });
    }
  }, [open]);

  // download the zip file of test results of the task
  const download = () => {
    service.downloadZip(currentData.result_url);
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="form-dialog-title"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle id="form-dialog-title" disableTypography>
        <Typography variant="h3">
          App name:&nbsp;
          {currentData.app_name === undefined ? '' : currentData.app_name}
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box m={1} display="flex" justifyContent="flex-start">
          <Box>
            <Typography variant="h4">
              Test time:&nbsp;
              {currentData.test_time === undefined ? '' : currentData.test_time}
            </Typography>
          </Box>
        </Box>
        <Grid container spacing={1} justify="flex-end">
          {service.extractTestResult(currentData).map((data) => (
            <Grid item lg={3} sm={6} xl={3} xs={12} key={data.label}>
              <CardTestData metric={data.label} metricValue={data.value} />
            </Grid>
          ))}
        </Grid>
        <Box display="flex" justifyContent="flex-end">
          <Box>
            <Button onClick={download} color="primary">
              Download Log
            </Button>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </Box>
        </Box>

      </DialogContent>
    </Dialog>
  );
};

GridFinishedData.propTypes = {
  taskId: PropTypes.number.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default GridFinishedData;
