/**
* File name: DeviceStatus.js
* Author: HongMing
* Component: Device Status cell
* Function: used to display the status of an Android device
*/

import PropTypes from 'prop-types';
import { makeStyles, Avatar } from '@material-ui/core';

const useStyles = makeStyles({
  avatar: {
    background: (prop) => {
      // set the filled color of the cell based on different status of the Android device
      if (prop.status === 'Idle') {
        // Idle status
        return 'linear-gradient(45deg, #73b53e 100%, #FF8E53 0%)';
      }
      if (prop.status === 'Ongoing') {
        // Ongoing status
        return 'linear-gradient(45deg,#254ff5 100%, #FF8E53 0%)';
      }
      // Offline status
      return 'linear-gradient(45deg, #FF8E53 100%, #FF8E53 0%)';
    }
  }
});

const ColorCell = (props) => {
  const { status } = props;
  const classes = useStyles({ status });
  return (
    <Avatar
      variant="rounded"
      className={classes.avatar}
      style={{ fontSize: '15px', width: '80px' }}
    >
      {status}
    </Avatar>
  );
};

ColorCell.propTypes = {
  status: PropTypes.string.isRequired
};

export default ColorCell;
