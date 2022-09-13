/**
* File name: DashboardTask.js
* Author: HongMing
* Page: User Account
* Function: Display diverse information related to tasks and their results.
*/

import { useState, useEffect, React } from 'react';
import { Helmet } from 'react-helmet';
import
{
  Box,
  Container,
  Grid,
} from '@material-ui/core';

import RankingBar from 'src/components/task/RankingBar';
import RankingComp from 'src/components/task/RankingComp';
import TaskListResults from 'src/components/task/TaskListResults';
import Server from 'src/services/Server';
import GridRecentData from 'src/components/task/GridRecentData';
import sessionKey from 'src/constants/sessionKey';
import currentUser from 'src/config/currentUser';
import TrafficByDevice from 'src/components/device/TrafficByDevice';

const service = new Server();

const DashboardTask = () => {
  const user = currentUser();
  const session = window.sessionStorage;
  const taskKey = sessionKey.TASK_KEY;
  const stabKey = sessionKey.STAB_KEY;
  const perfKey = sessionKey.PERF_KEY;
  const coldKey = sessionKey.COLD_START_KEY;
  const crashKey = sessionKey.CRASH;
  const [tasks, setTasks] = useState(() => {
    if (session.getItem(taskKey) == null) {
      return [];
    }
    // get task information from the cache storage
    return JSON.parse(session.getItem(taskKey));
  });
  useEffect(() => {
    // get information of all tasks created by current user or an admin user
    service.findAllTasks((response) => {
      if (JSON.stringify(tasks) !== JSON.stringify(JSON.parse(response.data.value))) {
        // display task information
        setTasks(JSON.parse(response.data.value));
      }
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard | Task</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 3
        }}
      >
        <Container maxWidth={false}>
          { !user.isAdmin && (
          <GridRecentData />
          )}
          <Grid container spacing={3}>
            { !user.isAdmin && (
            <Grid item lg={12} md={12} xl={9} xs={12}>
              <TaskListResults
                hideCheck
                tasks={tasks}
                getSelectedTasks={(ids) => {
                  console.log(ids);
                }}
              />
            </Grid>
            )}
            { user.isAdmin && (
            <Grid item lg={8} md={8} xl={8} xs={8}>
              <TaskListResults
                hideCheck
                tasks={tasks}
                getSelectedTasks={(ids) => {
                  console.log(ids);
                }}
              />
            </Grid>
            )}
            { user.isAdmin && (
            <Grid item lg={4} md={4} xl={4} xs={4}>
              <TrafficByDevice sx={{ height: '100%' }} />
            </Grid>
            )}
            <Grid item lg={4} md={6} xl={3} xs={12}>
              <RankingComp sx={{ height: '100%' }} title="App ranking by performance metrics" sessionKey={perfKey} />
            </Grid>
            <Grid item lg={8} md={12} xl={9} xs={12}>
              <RankingBar title="Cold Start Time by app (unit: second)" sessionKey={coldKey} />
            </Grid>
            <Grid item lg={4} md={6} xl={3} xs={12}>
              <RankingComp sx={{ height: '100%' }} title="App ranking by stability metrics" sessionKey={stabKey} />
            </Grid>
            <Grid item lg={8} md={12} xl={9} xs={12}>
              <RankingBar title="Crash rate by app (unit: %)" sessionKey={crashKey} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default DashboardTask;
