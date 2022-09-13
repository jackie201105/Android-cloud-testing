/**
* File name: Server.js
* Author: HongMing
* Function: used to call back end APIs through HTTP requests
*/

import http from 'src/utils/http-common';
import currentUser from 'src/config/currentUser';
import sessionKey from 'src/constants/sessionKey';
import download from 'downloadjs';
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["getUserInfo", "upload", "getFiles", "deleteFile", "addNewTask",
   "findAllTasks", "updateTask", "deleteTask", "getAccount", "findAllDevices", "extractTestResult", "getPerfRanking", "getStabRanking", "saveAccount",
   "saveSettings", "updatePhoto", "stopDevice", "startDevice", "getDeviceStat", "downloadZip"] }] */

class Server {
  getUserInfo() {
    // get current user information from session
    const user = currentUser();
    return 'uid='.concat(user.uid).concat('&admin=').concat(user.isAdmin);
  }

  downloadZip(resultFolder) {
    // download test results (a zip file) named with the parameter resultFolder
    return http.get('/zip?file='.concat(resultFolder), { responseType: 'arraybuffer' })
      .then(async (response) => {
        const blob = await new Blob([response.data], { type: 'application/zip' });
        // download the zip file into a local folder
        download(blob, resultFolder.concat('.zip'), 'application/zip');
        return response.data;
      });
  }

  upload(file, onUploadProgress) {
    // upload an Android app file to the back end
    const formData = new FormData();
    formData.append('file', file);
    return http.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  }

  deleteFile(files) {
    // removes Android app files from the back end
    let fileEx = '';
    for (let i = 0; i < files.length; i++) {
      fileEx = fileEx.concat('files=').concat(files[i]).concat('&');
    }
    fileEx = fileEx.slice(0, -1);
    return http
      .post('/remove?'.concat(fileEx))
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  deleteTask(taskIds) {
    // delete a set of tasks
    return http.post('/delete_task?task_ids='.concat(JSON.stringify(taskIds)));
  }

  addNewTask(fileName, testPeriod, testPhone) {
    const user = currentUser();
    // create a new task
    return http.get('/add_new_task', {
      params: {
        file: fileName, test_period: testPeriod, test_phone: testPhone, uid: user.uid
      }
    });
  }

  updateTask(task) {
    // update task with the task object
    return http.post('/update_task?task='.concat(JSON.stringify(task)));
  }

  findAllTasks(callback) {
    // get all tasks created by a user
    return http.get('/get_all_tasks?'.concat(this.getUserInfo())).then((response) => {
      if (response.status !== 200) {
        console.log(response.data.message);
      }
      // store the tasks into the cached storage
      window.sessionStorage.setItem(
        sessionKey.TASK_KEY,
        JSON.parse(JSON.stringify(response.data.value))
      );
      callback(response);
    });
  }

  getAccount(callback) {
    //  get account information of the current user
    return http.get('/get_account?'.concat(this.getUserInfo())).then((response) => {
      if (response.status !== 200) {
        console.log(response.data.message);
      }
      // storage the account information into the cache storage
      window.sessionStorage.setItem(
        sessionKey.ACCOUNT_KEY,
        JSON.parse(JSON.stringify(response.data.value))
      );
      callback(response);
    });
  }

  findAllDevices(callback) {
    //  get all device information
    return http.get('/get_all_devices').then((response) => {
      if (response.status !== 200) {
        console.log(response.data.message);
      }
      // storage the device information into cache storage
      window.sessionStorage.setItem(
        sessionKey.DEVICE_KEY,
        JSON.parse(JSON.stringify(response.data.value))
      );
      callback(response);
    });
  }

  getDeviceStat(callback) {
    // get usage count information of all devices
    return http.get('/get_device_stat').then((response) => {
      if (response.status !== 200) {
        console.log(response.data.message);
      }
      callback(response);
    });
  }

  extractTestResult(recentData) {
    // extract metric values from the test result
    if (recentData === undefined || JSON.stringify(recentData) === '{}') {
      return [];
    }
    const results = [
      {
        label: 'COLD START',
        value: JSON.stringify(recentData.time_cold_start).concat(' s')
      },
      {
        label: 'FRAME RATE',
        value: JSON.stringify(recentData.fps).concat(' fps')
      },
      {
        label: 'CRASH RATE',
        value: JSON.stringify(recentData.crash_rate).concat(' %')
      },
      {
        label: 'ANR RATE',
        value: JSON.stringify(recentData.anr_rate).concat(' %')
      },
    ];
    return results;
  }

  findRecentResult(callback) {
    // get the latest results of the task created by the current user
    return http.get('/get_recent_result?'.concat(this.getUserInfo())).then((response) => {
      if (response.status !== 200) {
        console.log(response.data.message);
      }
      // store the latest result into the cache storage
      window.sessionStorage.setItem(
        sessionKey.RECENT_KEY,
        JSON.parse(JSON.stringify(response.data.value))
      );
      callback(response);
    });
  }

  findRecentResultId(taskId, callback) {
    // get the test result with task id
    return http.get('/get_recent_result_by_id?task_id='.concat(taskId).concat('&')
      .concat(this.getUserInfo())).then((response) => {
      if (response.status !== 200) {
        console.log(response.data.message);
      }
      callback(response);
    });
  }

  getSettings(callback) {
    // get all setting information with user id
    return http.get('/get_settings?'.concat(this.getUserInfo())).then((response) => {
      if (response.status !== 200) {
        console.log(response.data.message);
      }
      //  store the setting information into the cache storage
      window.sessionStorage.setItem(
        sessionKey.SETTINGS_KEY,
        JSON.parse(JSON.stringify(response.data.value))
      );
      callback(response);
    });
  }

  getPerfRanking(callback) {
    //  get performance ranking of Android apps that ever have been tested by the user
    return http.get('/get_perf_rankings?'.concat(this.getUserInfo())).then((response) => {
      if (response.status !== 200) {
        console.log(response.data.message);
      }
      // store the ranking into the cache storage
      window.sessionStorage.setItem(
        sessionKey.PERF_KEY,
        JSON.parse(JSON.stringify(response.data.value))
      );
      callback(response);
    });
  }

  getStabRanking(callback) {
    //  get stability ranking of Android apps that ever have been tested by the user
    return http.get('/get_stat_rankings?'.concat(this.getUserInfo())).then((response) => {
      if (response.status !== 200) {
        console.log(response.data.message);
      }
      // store the ranking into the cache storage
      window.sessionStorage.setItem(
        sessionKey.STAB_KEY,
        JSON.parse(JSON.stringify(response.data.value))
      );
      callback(response);
    });
  }

  saveAccount(account) {
    // save the account information into the database
    return http.post('/save_account?account='.concat(JSON.stringify(account)));
  }

  updatePhoto(photo, uidVar) {
    // update the account profile photo into the database
    const data = { uid: uidVar, avatar: photo };
    return http.post('/update_photo?photo='.concat(JSON.stringify(data)));
  }

  saveSettings(setting) {
    // save setting information into the database
    return http.post('/save_settings?setting='.concat(JSON.stringify(setting)));
  }

  stopDevice(deviceIds) {
    // stop a set of devices
    return http.post('/update_device_status?status=offline&device_id='
      .concat(JSON.stringify(deviceIds)));
  }

  startDevice(deviceIds) {
    // start a set of devices
    return http.post('/update_device_status?status=Idle&device_id='.concat(JSON.stringify(deviceIds)));
  }
}

export default Server;
