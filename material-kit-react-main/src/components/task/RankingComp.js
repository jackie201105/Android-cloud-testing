/**
* File name: RankingComp.js
* Author: HongMing
* Component: Ranking list
* Function: used to display ranking list of Android apps
*/

import { useState, useEffect, React } from 'react';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import PropTypes from 'prop-types';
import keySet from 'src/constants/sessionKey';
import Server from 'src/services/Server';

const service = new Server();

const RankingComp = ({
  title, sessionKey, ...props
}) => {
  const session = window.sessionStorage;
  const [ranking, setRanking] = useState(() => {
    if (session.getItem(sessionKey) == null) {
      return [];
    }
    // get ranking list from the cache storage
    return JSON.parse(session.getItem(sessionKey));
  });
  useEffect(() => {
    if (sessionKey === keySet.PERF_KEY) {
      // get performance ranking information from the database
      service.getPerfRanking((response) => {
        if (JSON.stringify(ranking) !== JSON.stringify(JSON.parse(response.data.value))) {
          const localPerfValue = JSON.parse(response.data.value);
          // display the performance ranking information
          setRanking(localPerfValue);
        }
      });
    } else if (sessionKey === keySet.STAB_KEY) {
      // get stability ranking information from the database
      service.getStabRanking((response) => {
        if (JSON.stringify(ranking) !== JSON.stringify(JSON.parse(response.data.value))) {
          const localStabRanking = JSON.parse(response.data.value);
          // display the stability ranking information
          setRanking(localStabRanking);
        }
      });
    }
  }, []);
  return (
    <Card {...props}>
      <CardHeader
        subtitle={`${ranking.length} in total`}
        title={title}
      />
      <Divider />
      <List>
        {ranking.map((app, i) => (
          <ListItem divider={i < ranking.length - 1} key={app.app_name}>
            <ListItemAvatar>
              <img
                alt={app.app_name}
                src={app.app_image}
                style={{
                  height: 48,
                  width: 48
                }}
              />
            </ListItemAvatar>
            <ListItemText primary={(i + 1).toString().concat('. ').concat(app.app_name)} />
          </ListItem>
        ))}
      </List>
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
          View all
        </Button>
      </Box>
    </Card>
  );
};

RankingComp.propTypes = {
  title: PropTypes.string.isRequired,
  sessionKey: PropTypes.string.isRequired,
};

export default RankingComp;
