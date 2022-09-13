/**
* File name: ChartConfig.js
* Author: HongMing
* Component: A dataset template for displaying
*           the usage count of Android devices
*/
import LaptopMacIcon from '@material-ui/icons/LaptopMac';
import PhoneIcon from '@material-ui/icons/Phone';
import TabletIcon from '@material-ui/icons/Tablet';
import {
  colors,
} from '@material-ui/core';
import deviceType from 'src/constants/deviceType';

const clone = require('clone');

// icons that displays usage count of Android devices
const devices = [
  {
    title: deviceType.FOUR_RAM_TYPE,
    value: 0,
    icon: LaptopMacIcon,
    color: colors.indigo[500]
  },
  {
    title: deviceType.SIX_RAM_TYPE,
    value: 0,
    icon: TabletIcon,
    color: colors.red[600]
  },
  {
    title: deviceType.EIGHT_RAM_TYPE,
    value: 0,
    icon: PhoneIcon,
    color: colors.orange[600]
  }
];

// dataset templates for the Doughnut chart
const data = {
  datasets: [
    {
      data: [0, 0, 0],
      backgroundColor: [
        colors.indigo[500],
        colors.red[600],
        colors.orange[600]
      ],
      borderWidth: 8,
      borderColor: colors.common.white,
      hoverBorderColor: colors.common.white
    }
  ],
  labels: [deviceType.FOUR_RAM_TYPE, deviceType.SIX_RAM_TYPE, deviceType.EIGHT_RAM_TYPE]
};

/* eslint no-underscore-dangle: 0 */
export default (deviceData) => {
  const varDevice = clone(devices);
  const varData = clone(data);
  let sumValue = 0;
  // create a dataset with the template and deviceData parameter
  for (let i = 0; i < deviceData.length; i++) {
    sumValue += deviceData[i].count;
    // create the dataset based on different RAM types of Android devices
    if (deviceData[i]._id === '4G') {
      varData.datasets[0].data[0] = deviceData[i].count;
      varDevice[0].value = deviceData[i].count;
    } else if (deviceData[i]._id === '6G') {
      varData.datasets[0].data[1] = deviceData[i].count;
      varDevice[1].value = deviceData[i].count;
    } else if (deviceData[i]._id === '8G') {
      varData.datasets[0].data[2] = deviceData[i].count;
      varDevice[2].value = deviceData[i].count;
    }
  }
  const resultSum = (sumValue === 0 ? 1 : sumValue);
  for (let i = 0; i < varDevice.length; i++) {
    // display the usage proportion of each type of Android device.
    varDevice[i].value = Math.ceil((varDevice[i].value * 100) / resultSum);
  }
  return [varDevice, varData];
};
