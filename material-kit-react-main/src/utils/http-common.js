/**
* File name: http-common.js
* Author: HongMing
* Function: axios API used to send HTTP requests to the back end
*/

import axios from 'axios';

export default axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-type': 'application/json'
  }
});
