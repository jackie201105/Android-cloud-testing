/**
* File name: settings.js
* Author: HongMing
* Function: used to create a python process to start test scripts
*/

//Initialize the database class
const database = require("../middleware/database");

/**
Get the user's setting information
*/
const getSettings = (req, res) => {
  try {
    const uid = req.query.uid;
    // Query the setting information with the uid
    database.getSettings(uid, function (err, result) {
      if (err !== null) {
        return res
          .status(500)
          .send({ message: `Could not get settings:${err}` });
      }
      return res
        .status(200)
        .send({ message: "Get all settings successfully", value: result });
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not get all settings:${err}` });
  }
};

/**
Save the user's setting information
*/
const saveSettings = (req, res) => {
  try {
    const setting = JSON.parse(req.query.setting);
    database.saveSettings(setting, function (err, result) {
      if (err !== null) {
        return res
          .status(500)
          .send({ message: `Could not save settings:${err}` });
      }
      return res
        .status(200)
        .send({ message: "save settings successfully", value: result });
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not save setting:${err}` });
  }
};

module.exports = {
 getSettings,
 saveSettings
};