/**
* File name: DeviceList.js
* Author: HongMing
* Component: Device list
* Function: Restart and stop Android devices
*/

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar';
import ColorCell from 'src/components/device/DeviceStatus';
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@material-ui/core';
import getInitials from 'src/utils/getInitials';

const DeviceList = ({
  devices, getSelectedDevices, hideCheck, ...rest
}) => {
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);

  // select certain checkbox components
  const refreshList = (selectedArray) => {
    setSelectedDeviceIds(selectedArray);
    // notify its parent screen what devices are selected
    getSelectedDevices(selectedArray);
  };

  // select or unselect all devices
  const handleSelectAll = (event) => {
    let newSelectedDeviceIds;
    if (event.target.checked) {
      newSelectedDeviceIds = devices.map((device) => device.device_id);
    } else {
      newSelectedDeviceIds = [];
    }
    refreshList(newSelectedDeviceIds);
  };

  // save ids of all selected devices
  const handleSelectOne = (event, id) => {
    const selectedIndex = selectedDeviceIds.indexOf(id);
    let newSelectedDeviceIds = [];
    if (selectedIndex === -1) {
      newSelectedDeviceIds = newSelectedDeviceIds.concat(selectedDeviceIds, id);
    } else if (selectedIndex === 0) {
      newSelectedDeviceIds = newSelectedDeviceIds.concat(selectedDeviceIds.slice(1));
    } else if (selectedIndex === selectedDeviceIds.length - 1) {
      newSelectedDeviceIds = newSelectedDeviceIds.concat(
        selectedDeviceIds.slice(0, -1)
      );
    } else if (selectedIndex > 0) {
      newSelectedDeviceIds = newSelectedDeviceIds.concat(
        selectedDeviceIds.slice(0, selectedIndex),
        selectedDeviceIds.slice(selectedIndex + 1)
      );
    }
    setSelectedDeviceIds(newSelectedDeviceIds);
    getSelectedDevices(newSelectedDeviceIds);
  };

  // change the total number of rows per page
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  // change the current page number
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    // select certain checkbox components
    refreshList([]);
  }, [devices]);

  return (
    <Card {...rest}>
      <PerfectScrollbar>
        <Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={devices.length > 0 && selectedDeviceIds.length === devices.length}
                    color="primary"
                    indeterminate={selectedDeviceIds.length > 0 && selectedDeviceIds.length < devices.length}
                    onChange={handleSelectAll}
                    sx={{ display: hideCheck ? 'none' : 'flex' }}
                  />
                </TableCell>
                <TableCell>Device ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Phone Brand</TableCell>
                <TableCell>Usage Count</TableCell>
                <TableCell>RAM</TableCell>
                <TableCell>CPU</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.slice(page * limit, page * limit + limit).map((device) => (
                <TableRow
                  hover
                  key={device.device_id}
                  selected={selectedDeviceIds.indexOf(device.device_id) !== -1}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedDeviceIds.indexOf(device.device_id) !== -1}
                      onChange={(event) => handleSelectOne(event, device.device_id)}
                      value="true"
                      sx={{ display: hideCheck ? 'none' : 'flex' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex'
                      }}
                    >
                      <Typography color="textPrimary" variant="body1">
                        {device.device_id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <ColorCell status={device.status} />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex'
                      }}
                    >
                      <Avatar
                        src={device.brand_image}
                        sx={{ mr: 2 }}
                        variant="square"
                      >
                        {getInitials(device.brand)}
                      </Avatar>
                      <Typography color="textPrimary" variant="body1">
                        {device.brand}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{device.usage_count}</TableCell>
                  <TableCell>{device.RAM}</TableCell>
                  <TableCell>{device.CPU}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </PerfectScrollbar>
      <TablePagination
        component="div"
        count={devices.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[2, 10, 25]}
      />
    </Card>
  );
};

DeviceList.propTypes = {
  devices: PropTypes.array.isRequired,
  getSelectedDevices: PropTypes.func.isRequired,
  hideCheck: PropTypes.bool.isRequired,
};

export default DeviceList;
