/**
* File name: GridRecentData.js
* Author: HongMing
* Component: the latest task result
* Function: used to display the information of the latest task result
*/

import
{
  Box,
  Grid,
  Typography
} from '@material-ui/core';
import { useState, useEffect } from 'react';
import CardTestData from 'src/components/task//CardTestData';
import Server from 'src/services/Server';
import sessionKey from 'src/constants/sessionKey';

const service = new Server();

const GridRecentData = () => {
  const session = window.sessionStorage;
  const [recentData, setRecentData] = useState(() => {
    if (session.getItem(sessionKey.RECENT_KEY) == null) {
      return {};
    }
    // get the latest task result from the cache storage
    return JSON.parse(session.getItem(sessionKey.RECENT_KEY));
  });
  useEffect(() => {
    // get the latest task result from the database
    service.findRecentResult((response) => {
      if (JSON.stringify(recentData) !== JSON.stringify(JSON.parse(response.data.value))) {
        setRecentData(JSON.parse(response.data.value));
      }
    });
  }, []);
  return (
    <Grid container spacing={1}>
      <Grid item lg={12} md={12} xl={9} xs={12}>
        <Typography variant="h3">
          Latest tested app:&nbsp;
          {recentData.app_name === undefined ? '' : recentData.app_name}
        </Typography>
      </Grid>
      {service.extractTestResult(recentData).map((data) => (
        <Grid item lg={3} sm={6} xl={3} xs={12} key={data.label}>
          <CardTestData metric={data.label} metricValue={data.value} />
        </Grid>
      ))}
      <Grid item lg={12} md={12} xl={9} xs={12}>
        <Box sx={{ py: 1 }} borderTop={1} borderColor="grey.500" />
      </Grid>
    </Grid>
  );
};

export default GridRecentData;
