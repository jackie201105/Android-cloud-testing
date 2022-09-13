/**
* File name: ColorCell.js
* Author: HongMing
* Component: Task status
* Function: used to display the status of the task with different colors
*/

import PropTypes from 'prop-types';
import { useState } from 'react';
import { makeStyles, Avatar, Box } from '@material-ui/core';
import GridFinishedData from 'src/components/task/GridFinishedData';

// color styles for tasks with different status
const useStyles = makeStyles({
  avatar: {
    background: (prop) => {
      // Finished task
      if (prop.status === 'Finished') {
        return 'linear-gradient(45deg, #73b53e 100%, #FF8E53 0%)';
      }
      // Pending task
      if (prop.status === 'Pending') {
        return 'linear-gradient(45deg,#254ff5 100%, #FF8E53 0%)';
      }
      // Ongoing task
      return 'linear-gradient(45deg, #FF8E53 100%, #FF8E53 0%)';
    }
  }
});

const ColorCell = ({ status, taskId, enableClick }) => {
  const classes = useStyles({ status });
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    // the component is clickable only if the task is finished
    if (!enableClick || status !== 'Finished') {
      return;
    }
    // open the dialog that displays the task information
    setOpen(true);
  };

  const handleClose = () => {
    // close the dialog
    setOpen(false);
  };

  return (
    <Box>
      <Avatar
        variant="rounded"
        className={classes.avatar}
        style={{ fontSize: '15px', width: '80px' }}
        onClick={handleClick}
      >
        {status}
      </Avatar>
      <GridFinishedData taskId={taskId} open={open} handleClose={handleClose} />
    </Box>
  );
};

ColorCell.propTypes = {
  status: PropTypes.string.isRequired,
  taskId: PropTypes.number.isRequired,
  enableClick: PropTypes.bool.isRequired,
};

export default ColorCell;
