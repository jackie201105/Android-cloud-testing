/**
* File name: device.js
* Author: HongMing
* Function: used to provide APIs related to device management
*/
// Initialize the database class
const database = require("../middleware/database");

/**
Get all devices information
*/
const findAllDevices = (req, res) => {
  try {
    database.findAllDevices( function (err, result) {
      if (err !== null) {
        return res
          .status(500)
          .send({ message: `Could not get all devices:${err}` });
      }
      return res
        .status(200)
        .send({ message: "Get all devices successfully", value: result });
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not get all devices:${err}` });
  }
};

/**
Get an idle device with a certain RAM size
*/
const findIdleDevice = (req, res) => {
  try {
    // Get an idle device with a certain RAM size that is included in the req.query.phone variable
    database.findIdleDevice(req.query.phone, function (err, result) {
      if (err !== null) {
        return res
          .status(500)
          .send({ message: `Could not get idle devices:${err}` });
      }
      return res
        .status(200)
        .send({ message: "Get idle devices successfully", value: result });
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not get idle devices:${err}` });
  }
};

/**
Update the status of the device
*/
const updateDeviceStatus = (req, res) => {
  try {
    if (req.query.device_id == undefined || req.query.status == undefined) {
        throw 'device id and status are required';
    }
    // call the data API to update the status of the device with the device id
    database.updateDeviceStatus(JSON.parse(req.query.device_id), req.query.status).then(function(result) {
        if (result['error'] != null) {
           return res.status(500).send({ message: `Could not update device status:${result['error'] }`});
        } else {
            return res.status(200).send({ message: "update device status successfully", value: result });
        }
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not update device status:${err}` });
  }
};

/**
Get the usage count information of all Android devices.
*/
const getDeviceStat = (req, res) => {
  try {
    database.getDeviceStat(function (err, result) {
      if (err !== null) {
        return res
          .status(500)
          .send({ message: `Could not get devices:${err}` });
      }
      return res
        .status(200)
        .send({ message: "Get devices successfully", value: result });
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not get devices:${err}` });
  }
};

module.exports = {
 findAllDevices,
 findIdleDevice,
 updateDeviceStatus,
 getDeviceStat
};