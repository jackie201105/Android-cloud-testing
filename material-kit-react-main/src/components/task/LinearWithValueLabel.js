/**
* File name: LinearWithValueLabel.js
* Author: HongMing
* Component: progress indicator label
* Function: used to display the progress value
*/

import { LinearProgress, Typography, Box } from '@material-ui/core';
import PropTypes from 'prop-types';

const LinearWithValueLabel = ({ processValue }) => (
  <Box display={processValue === 0 ? 'none' : 'flex'} alignItems="center">
    <Box width="100%" mr={1}>
      <LinearProgress variant="determinate" value={processValue} />
    </Box>
    <Box minWidth={35}>
      <Typography variant="body2" color="textSecondary">
        Loading
        {Math.round(processValue)}
        %
      </Typography>
    </Box>
  </Box>
);

LinearWithValueLabel.propTypes = {
  processValue: PropTypes.number.isRequired
};

export default LinearWithValueLabel;
