/**
* File name: TrafficByDevice.js
* Author: HongMing
* Component: A set of components including a Doughnut chart and Icons
* Function: used to display usage count of Android devices with different RAM sizes
*/

import { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  useTheme
} from '@material-ui/core';
import createChartStyle from 'src/components/device/ChartConfig';
import Server from 'src/services/Server';

const service = new Server();

const TrafficByDevice = (props) => {
  const theme = useTheme();
  // style configurations of the Doughnut chart
  const options = {
    animation: false,
    cutoutPercentage: 80,
    layout: { padding: 0 },
    legend: {
      display: false
    },
    maintainAspectRatio: false,
    responsive: true,
    tooltips: {
      backgroundColor: theme.palette.background.paper,
      bodyFontColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      enabled: true,
      footerFontColor: theme.palette.text.secondary,
      intersect: false,
      mode: 'index',
      titleFontColor: theme.palette.text.primary
    }
  };
  const [dataset, setDataset] = useState({ devices: [], data: {} });

  useEffect(() => {
    // get information about the usage status of all Android devices
    service.getDeviceStat((response) => {
      // create a dataset with the information
      const result = createChartStyle(JSON.parse(response.data.value));
      setDataset({ devices: result[0], data: result[1] });
    });
  }, []);

  return (
    <Card {...props}>
      <CardHeader title="Utilization rate by Device" />
      <Divider />
      <CardContent>
        <Box
          sx={{
            height: 250,
            position: 'relative'
          }}
        >
          <Doughnut
            data={dataset.data}
            options={options}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pt: 2
          }}
        >
          {dataset.devices.map(({
            color,
            icon: Icon,
            title,
            value
          }) => (
            <Box
              key={title}
              sx={{
                p: 1,
                textAlign: 'center'
              }}
            >
              <Icon color="action" />
              <Typography
                style={{ color }}
                variant="h5"
              >
                {title}
              </Typography>
              <Typography
                color="textPrimary"
                variant="h5"
              >
                {value}
                %
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrafficByDevice;
