/**
* File name: database.js
* Author: HongMing
* Function: used to provide APIs for accessing data from the MongoDB database
*/

// Initialize API classes
const moment = require("moment");
const MongoClient = require("mongodb").MongoClient;
// Initialize all constant information related to the database
const url = "mongodb://localhost:27017"; // the IP address of the database
const dbName = "test_platform"; // the database name
const taskCollection = "task"; // the name of the 'task' data collection
const resultCollection = "task_result"; // the name of the 'task result' data collection
const deviceCollection = "device"; // the name of the 'device' data collection
const accountCollection = "account"; // the name of the 'account' data collection
const settingCollection = "setting"; // the name of the 'setting' data collection
const statPerfRankings = "stat_perf"; // the name of the 'stat_perf' view
const statStabRankings = "stat_stab"; // the name of the 'stat_stab' view
const statDeviceTypeCollection = "device_stat_by_type"; // the name of the 'device_stat_by_type' view
const rankingCount = 5; // the count of Android apps in the ranking list

/**
Connect to the MongoDB database
*/
const connectDatabase = () => {
    return MongoClient.connect(url, { useUnifiedTopology: true });
};

/**
Get the usage count of all Android devices
*/
const getDeviceStat = function (callback) {
  try {
    MongoClient.connect(
      url,
      { useUnifiedTopology: true },
      function (err, client) {
        if (err !== null) {
          console.log(`getDeviceStat, MongoClient.connect: err:${err}`);
          return callback(err, null);
        }
        // get the Android device's usage count from the database
        const collection = client.db(dbName).collection(statDeviceTypeCollection);
        collection.find({ }).toArray(function (err, docs) {
          callback(err, JSON.stringify(docs));
          client.close();
        });
      }
    );
  } catch (err) {
    console.log(`An error occurred invoking getDeviceStat:${err}`);
    callback(err, null);
  }
};

/**
Delete a test task by a task id
*/
const deleteSingleTask = (client, oneTask) => {
    const collection = client.db(dbName).collection(taskCollection);
    return collection.deleteOne({ task_id: parseInt(oneTask.task_id) });
};

/**
Add a new test task into the database
*/
const insertSingleTask = (client,oneTask) => {
    const collection = client.db(dbName).collection(taskCollection);
    return collection.insertOne(oneTask);
};

/**
Insert a test result into the database
*/
const insertTaskResult = async (oneTaskResult, callback) => {
    let database = null;
    try {
        task_result = {};
        // extract the information from the task result
        task_result.task_id = parseInt(oneTaskResult.task_id);
        task_result.time_cold_start = parseFloat(oneTaskResult.time_cold_start);
        task_result.fps = parseFloat(oneTaskResult.fps);
        task_result.crash_rate = parseFloat(oneTaskResult.crash_rate);
        task_result.anr_rate = parseFloat(oneTaskResult.anr_rate);
        task_result.device_id = parseInt(oneTaskResult.device_id);
        task_result.test_time = oneTaskResult.test_time;
        task_result.uid = oneTaskResult.uid;
        task_result.result_url = oneTaskResult.result_url;
        database = await connectDatabase();
        const collectionQuery = database.db(dbName).collection(taskCollection);
        // get the task information by task id from the task data collection
        const taskArr = await collectionQuery.find({ task_id: task_result.task_id }).toArray();
        if (taskArr.length > 0) {
            task_result.app_name = taskArr[0].app_name;
            task_result.app_image = taskArr[0].app_image;
        }
        const collection = database.db(dbName).collection(resultCollection);
        // insert the task result into the 'task result' data collection
        const insertResult = await collection.insertOne(task_result);
        if (insertResult.insertedCount == 0) {
            throw `Fail to insert insertResult ${insertResult}`;
        }
        callback(null, oneTaskResult);
    } catch (err) {
        console.error(`insertTaskResult:${err}`);
        callback(err, null);
    } finally {
        if (database) {
            database.close();
        }
    }
};

/**
Delete tasks with a set of task id
*/
const deleteTasks = async (task_ids, callback) => {
    let database = null;
    try {
        if (task_ids == undefined) {
            throw 'task id is null';
        }
        database = await connectDatabase();
        const collection = database.db(dbName).collection(taskCollection);
        const deleteResult = await collection.deleteMany({ task_id: { $in: task_ids }});
        if (deleteResult.deletedCount == 0) {
            throw `Task ${task_ids} not exists`;
        }
        callback(null, task_ids);
    } catch (err) {
        console.error(`deleteTasks:${err}`);
        callback(err, null);
    } finally {
         if (database) {
            database.close();
        }
    }
};

/**
Delete task results with a set of task id
*/
const deleteTaskResults = async (task_ids, callback) => {
    let database = null;
    try {
        if (task_ids == undefined) {
            throw 'task id is null';
        }
        database = await connectDatabase();
        const collection = database.db(dbName).collection(resultCollection);
        const deleteResult = await collection.deleteMany({ task_id: { $in: task_ids }});
        if (deleteResult.deletedCount == 0) {
            throw `Task ${task_ids} not exists`;
        }
        callback(null, task_ids);
    } catch (err) {
        console.error(`deleteTaskResults:${err}`);
        callback(err, null);
    } finally {
         if (database) {
            database.close();
        }
    }
};

/**
Update task information into the database
*/
const updateSingleTask = async (oneTask, callback) => {
    let database = null;
    try {
        if (oneTask == undefined || oneTask.task_id == undefined) {
            throw 'task id is null';
        }
        database = await connectDatabase();
        oneTask.task_id = parseInt(oneTask.task_id);
        // delete the existing task result record with the task id
        const deleteResult = await deleteSingleTask(database, oneTask);
        if (deleteResult.deletedCount == 0) {
            throw `Task ${oneTask.task_id} not exists`;
        }
        // insert a new test result with the task id
        const insertResult = await insertSingleTask(database, oneTask);
        if (insertResult.insertedCount == 0) {
            throw `Fail to update Task ${oneTask.task_id}`;
        }
        callback(null, oneTask.task_id);
    } catch (err) {
        console.error(`updateSingleTask:${err}`);
        callback(err, null);
    } finally {
        if (database) {
            database.close();
        }
    }
};

/**
Insert a task into the database with an increased task id
*/
const insertSingleTaskWithAutoId = async (oneTask, callback) => {
    let database = null;
    try {
        database = await connectDatabase();
        const collection = database.db(dbName).collection(taskCollection);
        // get the task with the max task id value
        const queryResult = await collection.find({}, { task_id: 1 })
                                            .sort({ task_id: -1 }).limit(1)
                                            .toArray();
        let newTaskID = 1;
        if (queryResult.length > 0) {
          // get a new task id
          newTaskID = parseInt(queryResult[0].task_id) + 1;
        }
        oneTask.task_id = parseInt(newTaskID);
        oneTask.status = "Pending";
        oneTask.runningTime = "0";
        oneTask.createdAt = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        // insert a task into the database
        const insertResult = await insertSingleTask(database, oneTask);
        if (insertResult.insertedCount == 0) {
            throw `Fail to insert Task ${oneTask.task_id}`;
        }
        callback(null, oneTask);
    } catch (err) {
        console.error(`insertSingleTaskWithAutoId:${err}`);
        callback(err, null);
    } finally {
        if (database) {
            database.close();
        }
    }
};

/**
Delete a task from the database with a task id
*/
const deleteOneTask = function (taskId, callback) {
  try {
    MongoClient.connect(
      url,
      { useUnifiedTopology: true },
      function (err, client) {
        if (err !== null) {
          console.log(`deleteOneTask, MongoClient.connect: err:${err}`);
          return callback(err, null);
        }
        const collection = client.db(dbName).collection(taskCollection);
        collection.deleteOne({ task_id: parseInt(taskId) }, function (err, result) {
          console.log(`deleteOneTask: err:${err}, result:${result}`);
          callback(err, result);
          client.close();
        });
      }
    );
  } catch (err) {
    console.log(`An error occurred invoking deleteOneTask:${err}`);
    callback(err, null);
  }
};

/**
Get all tasks of a user
parameter:
uidVal: uid of the user
isAdmin: true, the user is an administrator
*/
const findAllTasks = function (uidVal, isAdmin, callback) {
  try {
    if (uidVal == undefined) {
        throw 'user is null';
    }
    uidVal = uidVal.slice(1, -1);
    MongoClient.connect(
      url,
      { useUnifiedTopology: true },
      function (err, client) {
        if (err !== null) {
          console.log(`findAllTasks, MongoClient.connect: err:${err}`);
          return callback(err, null);
        }
        const collection = client.db(dbName).collection(taskCollection);
        // get the information of test tasks created by the user
        let query = collection.find({ uid: uidVal });
        // return all task information if the user is an administrator
        if (isAdmin !== undefined && isAdmin.toLowerCase() === 'true') {
            query = collection.find({ });
        }
        // execute the query and the task id of query tests are in ascending order
        query.sort( { task_id: 1 } ).toArray(function (err, docs) {
          console.log(docs.length);
          callback(err, JSON.stringify(docs));
          client.close();
        });
      }
    );
  } catch (err) {
    console.log(`An error occurred invoking findAllTasks:${err}`);
    callback(err, null);
  }
};

/**
Get the latest result of tasks created by a user
parameter:
query: contain two parts, the user id and admin (true, the user is an administrator)
*/
const findRecentTaskResult = function (query, callback) {
  try {
    if (query.uid == undefined) {
        throw 'user is null';
    }
    uidVal = query.uid.slice(1, -1);
    MongoClient.connect(
      url,
      { useUnifiedTopology: true },
      function (err, client) {
        if (err !== null) {
          console.log(`findRecentTaskResult, MongoClient.connect: err:${err}`);
          return callback(err, null);
        }
        const collection = client.db(dbName).collection(resultCollection);
        // get the result of test tasks created by the user
        let find = collection.find({ uid: uidVal });
        // return all task results if the user is an administrator
        if (query.admin === 'true') {
            find = collection.find({});
        }
        // execute the query and the test time of query tests are in descending order
        find.sort( { test_time: -1 }).toArray(function (err, docs) {
          let result = {}
          if (docs.length > 0) {
            result = docs[0];
          }
          callback(err, JSON.stringify(result));
          client.close();
        });

      }
    );
  } catch (err) {
    console.log(`An error occurred invoking findAllTasks:${err}`);
    callback(err, null);
  }
};

/**
Get the result of a test task with the task id
parameter:
query: contain two parts, the user id and admin (true, the user is an administrator)
task id: the id of the task
*/
const findRecentTaskResultByTaskId = function (query, taskId, callback) {
  try {
    if (query.uid == undefined) {
        throw 'user is null';
    }
    if (taskId == undefined) {
        throw 'task id is null';
    }
    uidVal = query.uid.slice(1, -1);
    MongoClient.connect(
      url,
      { useUnifiedTopology: true },
      function (err, client) {
        if (err !== null) {
          console.log(`findRecentTaskResultByTaskId, MongoClient.connect: err:${err}`);
          return callback(err, null);
        }
        const collection = client.db(dbName).collection(resultCollection);
        let find = collection.find({ uid:uidVal, task_id: parseInt(taskId) });
        // return all task results if the user is an administrator
        if (query.admin === 'true') {
            find = collection.find({task_id: parseInt(taskId) });
        }
        // execute the query and the test time of query tests are in descending order
        find.sort( { test_time: -1 }).toArray(function (err, docs) {
          let result = {}
          if (docs.length > 0) {
            result = docs[0];
          }
          callback(err, JSON.stringify(result));
          client.close();
        });

      }
    );
  } catch (err) {
    console.log(`An error occurred invoking findRecentTaskResultByTaskId:${err}`);
    callback(err, null);
  }
};

/**
Get information of a task with a task ID
*/
const findOneTask = function (taskId, callback) {
  try {
    MongoClient.connect(
      url,
      { useUnifiedTopology: true },
      function (err, client) {
        if (err !== null) {
          console.log(`findOneTask, MongoClient.connect: err:${err}`);
          return callback(err, null);
        }
        const collection = client.db(dbName).collection(taskCollection);
        collection.find({ task_id: parseInt(taskId) }).toArray(function (err, docs) {
          callback(err, JSON.stringify(docs));
          client.close();
        });
      }
    );
  } catch (err) {
    console.log(`An error occurred invoking findOneTask:${err}`);
    callback(err, null);
  }
};

/**
Get the information of a user account with uid
*/
const findOneAccount = function (uid, callback) {
  try {
    if (uid == undefined) {
        throw 'user is null';
    }
    uid = uid.slice(1, -1);
    MongoClient.connect(
      url,
      { useUnifiedTopology: true },
      function (err, client) {
        if (err !== null) {
          console.log(`findOneAccount, MongoClient.connect: err:${err}`);
          return callback(err, null);
        }
        const collection = client.db(dbName).collection(accountCollection);
        collection.find({ uid: uid }).toArray(function (err, docs) {
          callback(err, JSON.stringify(docs));
          client.close();
        });
      }
    );
  } catch (err) {
    console.log(`An error occurred invoking findOneAccount:${err}`);
    callback(err, null);
  }
};

/**
async method: Get an idle Android device
Parameter:
desiredPhone: contains the RAM information of a required device
*/
const findIdleDevice = function (desiredPhone, callback) {
  try {
    if (desiredPhone === undefined) {
        throw new Error("Need the information of phone");
    }
    configArray = desiredPhone.split(" ");
    ramSize = "";
    if (configArray.length < 4) {
        throw new Error("The value of the phone parameter is invalid");
    }
    ramSize = configArray[2];
    MongoClient.connect(
      url,
      { useUnifiedTopology: true },
      function (err, client) {
        if (err !== null) {
          console.log(`findIdleDevice, MongoClient.connect: err:${err}`);
          return callback(err, null);
        }
        const collection = client.db(dbName).collection(deviceCollection);
         // execute the query and the usage count of query tests are in ascending order
        collection.find({ RAM: ramSize, status: 'Idle' }).sort( { usage_count: 1 } ).limit(1).toArray(function (err, docs) {
          callback(err, docs);
          client.close();
        });
      }
    );
  } catch (err) {
    console.log(`An error occurred invoking findIdleDevice:${err}`);
    callback(err, null);
  }
};

/**
sync method: Get an idle Android device
Parameter:
desiredPhone: contains the RAM information of a required device
*/
const findIdleDeviceSync = async (desiredPhone) => {
  try {
    if (desiredPhone === undefined) {
        throw new Error("Need the information of phone");
    }
    configArray = desiredPhone.split(" ");
    ramSize = "";
    if (configArray.length < 4) {
        throw new Error("The value of the phone parameter is invalid");
    }
    ramSize = configArray[2];
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const collection = client.db(dbName).collection(deviceCollection);
    // execute the query and the usage count of query tests are in ascending order
    const docs = await collection.find({ RAM: ramSize, status: 'Idle' })
                                 .sort( { usage_count: 1 } ).limit(1).toArray();
    return docs;
  } catch (err) {
    console.log(`An error occurred invoking findIdleDevice:${err}`);
    return null;
  }
};

/**
Get all device information
*/
const findAllDevices = function (callback) {
  try {
    MongoClient.connect(
      url,
      { useUnifiedTopology: true },
      function (err, client) {
        if (err !== null) {
          console.log(`findAllDevices, MongoClient.connect: err:${err}`);
          return callback(err, null);
        }
        const collection = client.db(dbName).collection(deviceCollection);
        collection.find({ }).sort( { device_id: 1 } ).toArray(function (err, docs) {
          callback(err, JSON.stringify(docs));
          client.close();
        });
      }
    );
  } catch (err) {
    console.log(`An error occurred invoking findAllDevices:${err}`);
    callback(err, null);
  }
};

/**
Get setting information related to a user
Parameter:
uid: the user id
*/
const getSettings = function (uid, callback) {
  try {
    if (uid == undefined) {
        throw 'user is null';
    }
    uid = uid.slice(1, -1);
    MongoClient.connect(
      url,
      { useUnifiedTopology: true },
      function (err, client) {
        if (err !== null) {
          console.log(`getSettings, MongoClient.connect: err:${err}`);
          return callback(err, null);
        }
        const collection = client.db(dbName).collection(settingCollection);
        collection.find({ uid: uid }).toArray(function (err, docs) {
          let result = {};
          if (docs.length > 0) {
            result = docs[0];
          }
          callback(err, JSON.stringify(result));
          client.close();
        });
      }
    );
  } catch (err) {
    console.log(`An error occurred invoking getSettings:${err}`);
    callback(err, null);
  }
};

/**
Get the ranking list of Android apps' performance value
parameter:
uidVal: the user id
isAdmin: true, the user is an administrator
*/
const queryPerfFunc = function (client, uidVal, isAdmin) {
    let collection = {};
    let queryExp = {};
    // get the ranking list based on all the test results if the user is an administrator
    if (isAdmin !== undefined && isAdmin.toLowerCase() === "true" ) {
        collection = client.db(dbName).collection(statPerfRankings);
        queryExp = collection.find({ }).sort( { time_cold_start: 1 });
    } else {
        // get the ranking list based on the results of tasks created by the user
        collection = client.db(dbName).collection(statPerfRankings);
        queryExp = collection.find({ uid: uidVal });
    }
    return queryExp;
};

/**
Get the ranking list of Android apps' stability value
parameter:
uidVal: the user id
isAdmin: true, the user is an administrator
*/
const queryStabFunc = function (client, uidVal, isAdmin) {
    let collection = {};
    let queryExp = {};
    // get the ranking list based on all the test results if the user is an administrator
    if (isAdmin !== undefined && isAdmin.toLowerCase() === "true" ) {
        collection = client.db(dbName).collection(statStabRankings);
        queryExp = collection.find({ }).sort( { crash_rate: 1 });
    } else {
        // get the ranking list based on the results of tasks created by the user
        collection = client.db(dbName).collection(statStabRankings);
        queryExp = collection.find({ uid: uidVal });
    }
    return queryExp;
};

/**
Get the ranking list of Android apps' performance value
parameter:
uidVal: the user id
isAdmin: true, the user is an administrator
*/
const getPerformanceRankings = function (uidVal, isAdmin, callback) {
  try {
    if (uidVal == undefined) {
        throw 'user is null';
    }
    uidVal = uidVal.slice(1, -1);
    MongoClient.connect(
      url,
      { useUnifiedTopology: true },
      function (err, client) {
        if (err !== null) {
          console.log(`getPerformanceRankings, MongoClient.connect: err:${err}`);
          return callback(err, null);
        }
        queryPerfFunc(client, uidVal, isAdmin).toArray(function (err, docs) {
          docs = filter(docs, rankingCount);
          callback(err, JSON.stringify(docs));
          client.close();
        });
      }
    );
  } catch (err) {
    console.log(`An error occurred invoking getPerformanceRankings:${err}`);
    callback(err, null);
  }
};

/**
 Get results with a certain count
*/
const filter = function (docs, limitedCount) {
    resultArr = []
    distList = []
    for (const doc of docs) {
        if (resultArr.length > limitedCount) {
            break;
        }
        if (distList.indexOf(doc.app_name) >= 0) {
            continue;
        }
        resultArr.push(doc);
        distList.push(doc.app_name);
    }
    return resultArr;
};

/**
Get the ranking list of Android apps' stability value
parameter:
uidVal: the user id
isAdmin: true, the user is an administrator
*/
const getStabilityRankings = function (uidVal, isAdmin, callback) {
  try {
    if (uidVal == undefined) {
        throw 'user is null';
    }
    uidVal = uidVal.slice(1, -1);
    MongoClient.connect(
      url,
      { useUnifiedTopology: true },
      function (err, client) {
        if (err !== null) {
          console.log(`getStabilityRankings, MongoClient.connect: err:${err}`);
          return callback(err, null);
        }
        queryStabFunc(client, uidVal, isAdmin).toArray(function (err, docs) {
          // Get results with a certain count
          docs = filter(docs, rankingCount);
          callback(err, JSON.stringify(docs));
          client.close();
        });
      }
    );
  } catch (err) {
    console.log(`An error occurred invoking getStabilityRankings:${err}`);
    callback(err, null);
  }
};

/**
Save the information of a user account
*/
const saveAccount = async (account, callback) => {
    let database = null;
    try {
        if (account === undefined || account.uid === undefined) {
          throw 'uid NOT exists';
        }
        database = await connectDatabase();
        const options = { upsert: true };
        const filter = { uid: account.uid };
        // set the fields that require to be updated
        const updateDoc = {
          $set: {
            first_name: account.first_name,
            last_name: account.last_name,
            email: account.email,
            phone: account.phone,
            state: account.state,
            country: account.country,
          },
        };
        const collection = database.db(dbName).collection(accountCollection);
        const result = await collection.updateOne(filter, updateDoc, options);
        callback(null, result);
    } catch (err) {
        console.error(`saveAccount:${err}`);
        callback(err, null);
    } finally {
        if (database) {
            database.close();
        }
    }
};

/**
Save the setting information
*/
const saveSettings = async (setting, callback) => {
    let database = null;
    try {
        if (setting === undefined || setting.uid === undefined) {
          throw 'uid NOT exists';
        }
        setting.uid = setting.uid.slice(1, -1);
        database = await connectDatabase();
        const options = { upsert: true };
        const filter = { uid: setting.uid };
        // set the fields that require to be updated
        const updateDoc = {
          $set: {
            notifications: setting.notifications,
            messages: setting.messages,
          },
        };
        const collection = database.db(dbName).collection(settingCollection);
        const result = await collection.updateOne(filter, updateDoc, options);
        callback(null, result);
    } catch (err) {
        console.error(`saveSettings:${err}`);
        callback(err, null);
    } finally {
        if (database) {
            database.close();
        }
    }
};

/**
Update the status of a certain Android device with the status value
Parameter:
para_device_id: device id
para_status: the status value of the device
*/
const updateDeviceStatus = async (para_device_id, para_status) => {
    let database = null;
    result = null;
    try {
        if (para_device_id == null || para_device_id == undefined) {
            throw 'device id is null';
        }
        if (para_status == null || para_status == undefined) {
            throw 'device status id is null';
        }
        console.log(`updateDeviceStatus, para_device_id: ${para_device_id}, status: ${para_status}`);
        database = await connectDatabase();
        const options = { upsert: false };
        const filter = { device_id: { $in: para_device_id } };
        // set the field that requires to be updated
        let updateDoc = {
          $set: {
            status: para_status
          },
        };
        // increase the usage count of the device if the status is Ongoing
        if (para_status === 'Ongoing') {
            updateDoc = {
              $set: {
                status: para_status
              },
              $inc: {
                usage_count: 1
              },
            };
        }
        const collection = database.db(dbName).collection(deviceCollection);
        result = await collection.updateMany(filter, updateDoc, options);
        console.log(`collection.updateMany, ${result}`);
    } catch (err) {
        console.error(`updateDeviceStatus:${err}`);
        result = {'error': err};
    } finally {
        if (database) {
            database.close();
        }
    }
    return result;
};

/**
Set the task's status as 'Finished' value and update the runningTime field
Parameter:
para_task_id: task id
para_running_time: the task's running time'
*/
const completeTask = async (para_task_id, para_running_time, callback) => {
    let database = null;
    try {
        database = await connectDatabase();
        const options = { upsert: true };
        const filter = { task_id: parseInt(para_task_id) };
        // set the fields that require to be updated
        const updateDoc = {
          $set: {
            status: 'Finished',
            runningTime: para_running_time
          },
        };
        const collection = database.db(dbName).collection(taskCollection);
        const result = await collection.updateOne(filter, updateDoc, options);
        callback(null, result);
    } catch (err) {
        console.error(`completeTask:${err}`);
        callback(err, null);
    } finally {
        if (database) {
            database.close();
        }
    }
};

/**
Update the user's profile photo information
*/
const updatePhoto = async (photo, callback) => {
    let database = null;
    try {
        if (photo === undefined || photo.uid === undefined) {
            throw 'uid NOT exists';
        }
        database = await connectDatabase();
        const options = { upsert: false };
        const filter = { uid: photo.uid };
        // set the avatar information
        const updateDoc = {
          $set: {
            avatar: photo.avatar,
          },
        };
        const collection = database.db(dbName).collection(accountCollection);
        const result = await collection.updateOne(filter, updateDoc, options);
        callback(null, result);
    } catch (err) {
        console.error(`updatePhoto:${err}`);
        callback(err, null);
    } finally {
        if (database) {
            database.close();
        }
    }
};

/**
Update a task's status
Parameter:
para_task_id: task task_id
para_status: status
*/
const updateTaskStatus = async (para_task_id, para_status) => {
    let database = null;
    result = null;
    try {
        if (para_task_id == null || para_task_id == undefined) {
            throw 'task id is null';
        }
        if (para_status == null || para_status == undefined) {
            throw 'task status is null';
        }
        database = await connectDatabase();
        const options = { upsert: false };
        const filter = { task_id: para_task_id };
        // set the field that requires to be updated
        const updateDoc = {
          $set: {
            status: para_status
          },
        };
        const collection = database.db(dbName).collection(taskCollection);
        result = await collection.updateMany(filter, updateDoc, options);
    } catch (err) {
        console.error(`updateTaskStatus:${err}`);
        result = {'error': err};
    } finally {
        if (database) {
            database.close();
        }
    }
    return result;
};

module.exports = {
  deleteOneTask,
  deleteTasks,
  findAllTasks,
  findOneTask,
  findRecentTaskResult,
  insertSingleTaskWithAutoId,
  insertTaskResult,
  updateSingleTask,
  saveAccount,
  saveSettings,
  findOneAccount,
  findAllDevices,
  getSettings,
  getPerformanceRankings,
  getStabilityRankings,
  updatePhoto,
  completeTask,
  deleteTaskResults,
  findRecentTaskResultByTaskId,
  findIdleDevice,
  updateDeviceStatus,
  getDeviceStat,
  updateTaskStatus,
  findIdleDeviceSync
};
