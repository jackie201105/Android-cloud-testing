/**
* File name: TaskManager.js
* Author: HongMing
* Page: Task manager
* Function: Add and delete tasks
*/

import { useState, useEffect, React } from 'react';
import { Helmet } from 'react-helmet';
import {
  Box,
  Button,
  Container,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  SvgIcon,
  Snackbar
} from '@material-ui/core';
import { Search as SearchIcon } from 'react-feather';
import { Alert } from '@material-ui/lab';
import TaskListResults from 'src/components/task/TaskListResults';
import NewTask from 'src/components/task/NewTask';
import Server from 'src/services/Server';
import ResponseDialog from 'src/components/task/ResponseDialog';
import sessionKey from 'src/constants/sessionKey';

const service = new Server();

const TaskManager = () => {
  const session = window.sessionStorage;
  const [loadState, setLoadState] = useState(false);
  const [responseOpen, setResponseOpen] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const [tasks, setTasks] = useState(() => {
    if (session.getItem(sessionKey.TASK_KEY) == null) {
      console.log([]);
      return [];
    }
    // get task information from the cache storage
    return JSON.parse(session.getItem(sessionKey.TASK_KEY));
  });
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [rows, setRows] = useState(tasks);
  const [searched, setSearched] = useState('');
  const [open, setOpen] = useState(false);
  const requestSearch = (searchedVal: string) => {
    // filter tasks with a search key
    setSearched(searchedVal);
    const filteredRows = tasks.filter((row) => row
      .task_id.toString().includes(searchedVal.toLowerCase()));
    setRows(filteredRows);
  };

  const handleAlertClose = () => {
    // close the alert dialogue
    setAlertOpen(false);
    setIsError(false);
  };
  const handleResponseClose = () => setResponseOpen(false);
  const handleResponseConfirm = () => {
    handleResponseClose();
    // delete selected tasks
    service.deleteTask(selectedTaskIds)
      .then((response) => {
        // alert success message
        console.log(response);
        setMessage('Delete selected tasks successfully');
        setIsError(false);
        setAlertOpen(true);
        setLoadState(!loadState);
      })
      .catch((error) => {
        // alert error message
        setMessage(`Fail to delete selected tasks: ${error}`);
        setIsError(true);
        setAlertOpen(true);
      });
  };
  const handleDelTasks = () => {
    if (!selectedTaskIds.length) {
      // alert message to remind the user to select a task
      setMessage('Please select a task!');
      setIsError(true);
      setAlertOpen(true);
      return;
    }
    let nonPendingTask = null;
    console.log(`selectedTaskIds:${selectedTaskIds}, ${JSON.stringify(tasks)}`);
    for (let i = 0; i < tasks.length; i++) {
      if (selectedTaskIds.includes(tasks[i].task_id)
            && tasks[i].status === 'Ongoing') {
        // Not allowed to delete Ongoing tasks
        nonPendingTask = tasks[i];
        break;
      }
    }
    if (nonPendingTask !== null) {
      // alert message to remind the user not to delete Ongoing tasks
      setMessage('Ongoing task can not be deleted. Please check all selected tasks.');
      setIsError(true);
      setAlertOpen(true);
      return;
    }
    // alert message to remind the user to confirm deletion
    setResponseMsg('Are you sure you want to delete all selected tasks?');
    setResponseOpen(true);
  };

  const loadAllTasks = () => {
    // get all tasks from the database
    service.findAllTasks((response) => {
      if (JSON.stringify(tasks) !== JSON.stringify(JSON.parse(response.data.value))) {
        const tasksVar = JSON.parse(response.data.value);
        // display tasks with query data
        setTasks(tasksVar);
        setRows(tasksVar);
      }
    });
  };
  useEffect(() => {
    // get and display all tasks
    loadAllTasks();
  }, [loadState]);
  // select certain tasks
  const getSelectedTasks = (ids) => setSelectedTaskIds(ids);
  // open the NewTask dialogue
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    // load all tasks
    setOpen(false);
    loadAllTasks();
  };

  return (
    <>
      <Helmet>
        <title>Task Manager | Task</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 3
        }}
      >
        <Container maxWidth={false}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={loadAllTasks}
            >
              Refresh
            </Button>
            <Button
              onClick={handleClickOpen}
            >
              Add task
            </Button>
            <NewTask open={open} handleClose={handleClose} />
            <Button
              onClick={handleDelTasks}
            >
              Delete task
            </Button>
            <Snackbar
              open={alertOpen}
              autoHideDuration={2000}
              onClose={handleAlertClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center'
              }}
            >
              <Alert onClose={handleAlertClose} severity={isError ? 'error' : 'success'}>
                {message}
              </Alert>
            </Snackbar>
            <ResponseDialog
              open={responseOpen}
              handleClose={handleResponseClose}
              message={responseMsg}
              callback={handleResponseConfirm}
            />
          </Box>
          <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ maxWidth: 500 }}>
                  <TextField
                    fullWidth
                    value={searched}
                    onChange={(event) => requestSearch(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SvgIcon
                            fontSize="small"
                            color="action"
                          >
                            <SearchIcon />
                          </SvgIcon>
                        </InputAdornment>
                      )
                    }}
                    placeholder="Search task"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ pt: 3 }}>
            <TaskListResults
              hideCheck={false}
              tasks={rows}
              getSelectedTasks={getSelectedTasks}
            />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default TaskManager;
