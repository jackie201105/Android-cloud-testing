/**
* File name: task.js
* Author: HongMing
* Function: used to provide all APIs related to task management
*/

// Initialize all involved API classes
const extractAPK = require("../middleware/apk.analyse").extractAPK;
const database = require("../middleware/database");
const callPython = require("../middleware/proxy.python").call_python_script;
const device = require("../middleware/device");
const zip = require('express-zip');
const fs = require('fs');
// Set the directory of test results
const resultPath = __basedir.concat('/../testPy/test_results/');
// Set the default information if an Android app information cannot be extracted from APK.
const default_app_name = 'SystemManager';
const default_app_image = '/static/images/app/system.png';
const default_package = 'com.huawei.systemmanager';
/**
Get the information of tasks created by a user
Parameters:
req: contains two parts, uid and admin (true means the user is an administrator)
*/
const findAllTasks = (req, res) => {
  try {
    const uid = req.query.uid;
    const isAdmin = req.query.admin;
    database.findAllTasks(uid, isAdmin, function (err, result) {
      if (err !== null) {
        return res
          .status(500)
          .send({ message: `Could not get all tasks:${err}` });
      }
      return res
        .status(200)
        .send({ message: "Get all tasks successfully", value: result });
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not get all tasks:${err}` });
  }
};

/**
Get the latest result of tasks created by a user
parameter:
req.query: contain two parts, the user id and admin (true, the user is an administrator)
*/
const findRecentTaskResult = (req, res) => {
  try {
    database.findRecentTaskResult(req.query, function (err, result) {
      if (err !== null) {
        return res
          .status(500)
          .send({ message: `Could not get the recent task:${err}` });
      }
      return res
        .status(200)
        .send({ message: "Find a recent task successfully", value: result });
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not find a recent task:${err}` });
  }
};

/**
Get the result of a test task with the task id
parameter:
req.query: contain two parts, the user id and admin (true, the user is an administrator)
task id: the id of the task
*/
const findRecentTaskResultByTaskId = (req, res) => {
  try {
    const task_id = req.query.task_id;
    database.findRecentTaskResultByTaskId(req.query, task_id, function (err, result) {
      if (err !== null) {
        return res
          .status(500)
          .send({ message: `Could not get the recent task by task id:${err}` });
      }
      return res
        .status(200)
        .send({ message: "Find a recent task successfully by id", value: result });
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not find a recent task by task id:${err}` });
  }
};

/**
1. Insert a test result into the database
2. Update the task's status with 'Finished'
3. Idle the Android device
*/
const insertTaskResult = async (req, res) => {
  try {
    // Insert a test result into the database
    database.insertTaskResult(req.query, function (err, result) {
      if (err != null) {
        return res.status(500).send({
          message: ` Fail to add a new test result. ${err}`,
        });
      }
      task_id = result.task_id;
      device_id = result.device_id;
      // Update the task's status with 'Finished'
      database.completeTask(task_id, req.query.runningTime, function (err, result) {
        if (err != null) {
            console.log(`Fail to complete the task: ${err}`);
        }
        // Idle the Android device
        database.updateDeviceStatus([parseInt(device_id)], 'Idle');
      });
      res.status(200).send({
        message: ` Add a new test result ${task_id} successfully`,
        value: result,
      });
    });
  } catch (err) {
    console.log(`An error occurred invoking insertTaskResult: ${err}`);
    res.status(500).send({
      message: ` Fail to add a new test result. ${err}`,
    });
  }
};

/**
Insert a task into the database with an increased task id
req.query: contains the task information
*/
const addNewTask = async (req, res) => {
  const fileName = req.query.file;
  const testPeriod = req.query.test_period;
  const testPhone = req.query.test_phone;
  const uid = req.query.uid.slice(1, -1);
  // create a task object with the parameter value
  const task = { app_name: fileName, test_period: testPeriod,
                file_name: fileName, test_phone: testPhone, uid: uid};
  try {
    database.insertSingleTaskWithAutoId(task, function (err, result) {
      if (err != null) {
        return res.status(500).send({
          message: ` Fail to add a new test task for the app ${fileName}. ${err}`,
        });
      }
      res.status(200).send({
        message: ` Add a new task ${task.task_id} for the app ${fileName} successfully`,
        value: result,
      });
    });
  } catch (err) {
    console.log(`An error occurred invoking addNewTask: ${err}`);
    res.status(500).send({
      message: ` Fail to add a new test task for the app ${fileName}. ${err}`,
    });
  }
};

/**
Delete the task and relative test results form the database
Parameters:
re.query.task_ids; a set of task ids
*/
const deleteTasks =  async (req, res) => {
    if (req.query.task_ids == undefined) {
        return res.status(400).send({
           message: 'Fail to delete tasks: task id is null',
        })
    }
    try {
        const task_ids = JSON.parse(req.query.task_ids);
        // Delete all tasks from the database
        database.deleteTasks(task_ids, function (err, result) {
          if (err == null) {
              // Delete all test results from the tasks
              database.deleteTaskResults(task_ids, function (err, result) {
                if (err !== null) {
                    console.log(`Fail to deleteTaskResults: ${err}`);
                }
              });
            return res.status(200).send({
              message: ` Delete tasks successfully`,
              value: result,
            });
          }
          res.status(500).send({
            message: ` Fail to delete task ${task_ids}: ${err}`,
          });
        });
    } catch (err) {
        console.log(`An error occurred invoking deleteTasks: ${err}`);
        res.status(500).send({
          message: ` Fail to delete task for the app: ${err}`,
        });
    }

};

/**
1. Save the Android app's name and icon into database
2. Find an idle android device to start a test on the device
Parameters:
req.query.task: task information
*/
const updateTask = async (req, res) => {
  try {
    const task = JSON.parse(req.query.task);
    if (task.task_id == undefined) {
      return res.status(400).send({
        message: "Fail to update task: task id is null",
      });
    }
    if (task.file_name == undefined || task.file_name.trim() == "") {
      return res.status(400).send({
        message: "Fail to update task: file name is null",
      });
    }
    // extract Android app's information from the its APK file
    const apk = await extractAPK(task.file_name);
    task.app_name = (apk.package == null ? default_app_name : apk.package.split('.')[1]);
    task.app_image = (apk.icon == null ? default_app_image: apk.icon);
    task.package_name = (apk.package == null ? default_package: apk.package);
    // save the app's name and package name into the database
    database.updateSingleTask(task, function (err, result) {
      if (err == null) {
        database.findIdleDevice(task.test_phone, function (err, result) {
            if (result.length > 0) {
                // update the status of the device with 'Ongoing' value
                database.updateDeviceStatus([result[0].device_id], 'Ongoing');
                const resultData = database.updateTaskStatus(task.task_id, 'Ongoing');
                // Create a python process to run a test on the Android device
                callPython(task.task_id, task.uid, result[0].device_id, result[0].ip_address,
                task.package_name, task.test_period);
            } else {
                console.log(`Fail to update task ${task.task_id}: no idle device`);
            }
        });
        return res.status(200).send({
          message: ` Update task ${task.task_id} successfully`,
          value: result,
        });
      }
      res.status(500).send({
        message: ` Fail to update task ${task.task_id}: ${err}`,
      });
    });
  } catch (err) {
    console.log(`An error occurred invoking updateTask: ${err}`);
    res.status(500).send({
      message: ` Fail to update task for the app: ${err}`,
    });
  }
};

/**
Get the ranking list of Android apps' performance value
parameter:
req.query.uidVal: the user id
req.query.isAdmin: true, the user is an administrator
*/
const getPerformanceRankings = (req, res) => {
  try {
    const uid = req.query.uid;
    const isAdmin = req.query.admin;
    database.getPerformanceRankings(uid, isAdmin, function (err, result) {
      if (err !== null) {
        return res
          .status(500)
          .send({ message: `Could not get performance rankings:${err}` });
      }
      return res
        .status(200)
        .send({ message: "Get performance rankings successfully", value: result });
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not get performance rankings:${err}` });
  }
};

/**
Get the ranking list of Android apps' stability value
parameter:
req.query.uidVal: the user id
req.query.admin: true, the user is an administrator
*/
const getStabilityRankings = (req, res) => {
  try {
    const uid = req.query.uid;
    const isAdmin = req.query.admin;
    database.getStabilityRankings(uid, isAdmin, function (err, result) {
      if (err !== null) {
        return res
          .status(500)
          .send({ message: `Could not get stability rankings:${err}` });
      }
      return res
        .status(200)
        .send({ message: "Get stability rankings successfully", value: result });
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not get performance rankings:${err}` });
  }
};

/**
Zip test results and return to the front end.
*/
const zipResult = (req, res) => {
  try {
    let folder = req.query.file;
    if (folder == null || folder == undefined) {
        console.log('file parameter is required');
        folder = null;
    }
    if (folder == null || !fs.existsSync(resultPath.concat(folder))) {
        folder = 'default';
    }
    const array = [];
    const absolutePath = resultPath.concat(folder);
    // get test result files from the path
    fs.readdir(absolutePath, (err, files) => {
      files.forEach(file => {
        array.push({path:absolutePath.concat('/').concat(file), name:file});
      });
      // zip and return the results to the front end
      res.zip(array);
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not get the zip file:${err}` });
  }
};


module.exports = {
  addNewTask,
  insertTaskResult,
  deleteTasks,
  findAllTasks,
  updateTask,
  findRecentTaskResult,
  findRecentTaskResultByTaskId,
  getPerformanceRankings,
  getStabilityRankings,
  zipResult
};

