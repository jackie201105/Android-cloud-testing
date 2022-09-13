/**
* File name: RankingBar.js
* Author: HongMing
* Component: Ranking column chart
* Function: used to display ranking of performance and stability
*/

import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  colors,
  Divider,
  useTheme
} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import PropTypes from 'prop-types';
import keySet from 'src/constants/sessionKey';
import Server from 'src/services/Server';

const service = new Server();
const RankingBar = ({ sessionKey, title, ...props }) => {
  const generateDataset = (isPerf, varData, varLabels) => {
    // create a dataset for a ranking bar with performance or stability data
    const color = isPerf ? colors.green[500] : colors.red[500];
    const stabData = {
      datasets: [
        {
          backgroundColor: color,
          data: varData,
          barThickness: 12,
          maxBarThickness: 10,
          barPercentage: 0.5,
          categoryPercentage: 0.5
        }
      ],
      labels: varLabels
    };
    return stabData;
  };
  const isPerf = (sessionKey === keySet.COLD_START_KEY);
  const [ranking, setRanking] = useState(generateDataset(isPerf, [], []));
  useEffect(() => {
    const data = [];
    const labels = [];
    if (sessionKey === keySet.CRASH) {
      // get stability ranking from the database
      service.getStabRanking((response) => {
        const localStabRanking = JSON.parse(response.data.value);
        Object.keys(localStabRanking).forEach((index) => {
          labels.push(localStabRanking[index].app_name);
          data.push(localStabRanking[index].crash_rate);
        });
        // create a dataset for the stability ranking column chart
        const crashValue = generateDataset(isPerf, data, labels);
        setRanking(crashValue);
      });
    }
    if (sessionKey === keySet.COLD_START_KEY) {
      service.getPerfRanking((response) => {
        // get performance ranking from the database
        const localPerfValue = JSON.parse(response.data.value);
        Object.keys(localPerfValue).forEach((index) => {
          labels.push(localPerfValue[index].app_name);
          data.push(localPerfValue[index].time_cold_start);
        });
        // create a dataset for the performance ranking column chart
        const startValue = generateDataset(isPerf, data, labels);
        setRanking(startValue);
      });
    }
  }, []);
  const theme = useTheme();
  const options = {
    animation: false,
    cornerRadius: 20,
    layout: { padding: 0 },
    legend: { display: false },
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      xAxes: [
        {
          ticks: {
            fontColor: theme.palette.text.secondary
          },
          gridLines: {
            display: false,
            drawBorder: false
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            fontColor: theme.palette.text.secondary,
            beginAtZero: true,
            min: 0
          },
          gridLines: {
            borderDash: [2],
            borderDashOffset: [2],
            color: theme.palette.divider,
            drawBorder: false,
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2],
            zeroLineColor: theme.palette.divider
          }
        }
      ]
    },
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
  return (
    <Card {...props}>
      <CardHeader title={title} />
      <Divider />
      <CardContent>
        <Box
          sx={{
            height: 400,
            position: 'relative'
          }}
        >
          <Bar data={ranking} options={options} />
        </Box>
      </CardContent>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 2
        }}
      >
        <Button
          color="primary"
          endIcon={<ArrowRightIcon />}
          size="small"
          variant="text"
        >
          Overview
        </Button>
      </Box>
    </Card>
  );
};

RankingBar.propTypes = {
  sessionKey: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

export default RankingBar;
