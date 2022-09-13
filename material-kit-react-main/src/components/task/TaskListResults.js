/**
* File name: TaskListResults.js
* Author: HongMing
* Component: Task list
* Function: Display a task list by page
*/

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import ColorCell from 'src/components/task/ColorCell';
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

const TaskListResults = ({
  tasks, getSelectedTasks, hideCheck, ...rest
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  // select certain tasks
  const refreshList = (selectedArray) => {
    setSelectedTaskIds(selectedArray);
    // notify its parent screen about the selected tasks
    getSelectedTasks(selectedArray);
  };
  // select or unselect all tasks
  const handleSelectAll = (event) => {
    let newSelectedTaskIds;
    if (event.target.checked) {
      // select all tasks
      newSelectedTaskIds = tasks.map((task) => task.task_id);
    } else {
      // unselect all tasks
      newSelectedTaskIds = [];
    }
    refreshList(newSelectedTaskIds);
  };

  // select a certain task
  const handleSelectOne = (event, id) => {
    const selectedIndex = selectedTaskIds.indexOf(id);
    let newSelectedTaskIds = [];
    if (selectedIndex === -1) {
      newSelectedTaskIds = newSelectedTaskIds.concat(selectedTaskIds, id);
    } else if (selectedIndex === 0) {
      newSelectedTaskIds = newSelectedTaskIds.concat(selectedTaskIds.slice(1));
    } else if (selectedIndex === selectedTaskIds.length - 1) {
      newSelectedTaskIds = newSelectedTaskIds.concat(
        selectedTaskIds.slice(0, -1)
      );
    } else if (selectedIndex > 0) {
      newSelectedTaskIds = newSelectedTaskIds.concat(
        selectedTaskIds.slice(0, selectedIndex),
        selectedTaskIds.slice(selectedIndex + 1)
      );
    }
    setSelectedTaskIds(newSelectedTaskIds);
    getSelectedTasks(newSelectedTaskIds);
  };

  const handleLimitChange = (event) => {
    // change row count per page
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    // select a certain page
    setPage(newPage);
  };

  useEffect(() => {
    // unselect all tasks
    refreshList([]);
  }, [tasks]);

  return (
    <Card {...rest}>
      <PerfectScrollbar>
        <Box sx={{ minWidth: 500 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={tasks.length > 0 && selectedTaskIds.length === tasks.length}
                    color="primary"
                    indeterminate={selectedTaskIds.length > 0 && selectedTaskIds.length < tasks.length}
                    onChange={handleSelectAll}
                    sx={{ display: hideCheck ? 'none' : 'flex' }}
                  />
                </TableCell>
                <TableCell>Task ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tested app</TableCell>
                <TableCell>Running time</TableCell>
                <TableCell>Created date</TableCell>
                <TableCell>Period</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.slice(page * limit, page * limit + limit).map((task) => (
                <TableRow
                  hover
                  key={task.task_id}
                  selected={selectedTaskIds.indexOf(task.task_id) !== -1}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedTaskIds.indexOf(task.task_id) !== -1}
                      onChange={(event) => handleSelectOne(event, task.task_id)}
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
                        CI
                        {task.task_id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <ColorCell status={task.status} taskId={task.task_id} enableClick />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex'
                      }}
                    >
                      <Avatar
                        src={task.app_image}
                        sx={{ mr: 2 }}
                        variant="square"
                      >
                        {getInitials(task.app_name)}
                      </Avatar>
                      <Typography color="textPrimary" variant="body1">
                        {task.app_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {task.runningTime}
                    {parseInt(task.runningTime, 10) > 1 ? 'mins' : 'min'}
                  </TableCell>
                  <TableCell>
                    {moment(task.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    {task.test_period}
                    {parseInt(task.test_period, 10) > 1 ? 'mins' : 'min'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </PerfectScrollbar>
      <TablePagination
        component="div"
        count={tasks.length}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[2, 10, 25]}
      />
    </Card>
  );
};

TaskListResults.propTypes = {
  tasks: PropTypes.array.isRequired,
  getSelectedTasks: PropTypes.func.isRequired,
  hideCheck: PropTypes.bool.isRequired
};

export default TaskListResults;
