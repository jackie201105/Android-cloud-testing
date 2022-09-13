/**
* File name: account.js
* Author: HongMing
* Function: used to provide all APIs about Account Management
*/

// Initialize the database class
const database = require("../middleware/database");

/**
Get the information of a user account
*/
const findOneAccount = (req, res) => {
  try {
    // the user id of the user account
    const uid = req.query.uid;
    // get the user information by the user id
    database.findOneAccount(uid, function (err, result) {
      if (err !== null) {
        return res
          .status(500)
          .send({ message: `Could not get account ${uid}:${err}` });
      }
      return res
        .status(200)
        .send({ message: "Get one account successfully", value: result });
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not get one account:${err}` });
  }
};

/**
Save the information of a user account
*/
const saveAccount = (req, res) => {
  try {
    // the account information that needs to be updated into the database
    const account = JSON.parse(req.query.account);
    database.saveAccount(account, function (err, result) {
      if (err !== null) {
        return res
          .status(500)
          .send({ message: `Could not save account: ${account === undefined ? '': account}:${err}` });
      }
      return res
        .status(200)
        .send({ message: "Save one account successfully", value: result });
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not save the account:${err}` });
  }
};

/**
Save the information of a user profile's photo
*/
const updatePhoto = (req, res) => {
  try {
    // get the information of the photo
    const photo = JSON.parse(JSON.stringify(req.query.photo));
    const paraPhoto = JSON.parse(photo);
    // save the information into the database
    database.updatePhoto(paraPhoto, function (err, result) {
      if (err !== null) {
        return res
          .status(500)
          .send({ message: `Could not update photo:${err}` });
      }
      return res
        .status(200)
        .send({ message: "update photo successfully", value: result });
    });
  } catch (err) {
    return res.status(500).send({ message: `Could not update photo:${err}` });
  }
};

module.exports = {
  findOneAccount,
  saveAccount,
  updatePhoto
};