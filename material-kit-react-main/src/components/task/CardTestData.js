/**
* File name: CardTestData.js
* Author: HongMing
* Component: Metric value
* Function: used to display a pair of metric values
*/

import
{
  Card,
  CardContent,
  Grid,
  Typography,
} from '@material-ui/core';
import PropTypes from 'prop-types';

const CardTestData = ({ metric, metricValue, ...props }) => (
  <Card {...props}>
    <CardContent>
      <Grid container spacing={3} sx={{ justifyContent: 'space-between' }}>
        <Grid item>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {metric}
          </Typography>
          <Typography color="textPrimary" variant="h3">
            {metricValue}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

CardTestData.propTypes = {
  metric: PropTypes.string.isRequired,
  metricValue: PropTypes.string.isRequired
};

export default CardTestData;
