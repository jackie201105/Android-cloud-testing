/**
* File name: file.handle.js
* Author: HongMing
* Function: used to provide all APIs about storing and deleting Android app files
*/

// Initialise APIs related to storage
const util = require("util");
const multer = require("multer");
const fs = require("fs");
// set the max size of the stored Android app file
const maxSize = 200 * 1024 * 1024;

/**
Save the Android app file to a certain directory
*/
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

/**
Call storage function to save an Android app file
*/
let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);

/**
Remove files from a certain directory
*/
const removeFile = async (files, callback) => {
  if (files == undefined) {
    return callback(`Fail to remove files: the parameter files is empty`);
  }
  let fileArray = [];
  if (Array.isArray(files)) {
    fileArray = files;
  } else {
    fileArray.push(files);
  }
  fileArray = fileArray.filter(function (file) {
    return file && String(file).trim() !== "";
  });
  if (fileArray.length == 0) {
    return callback(`Fail to remove files: the parameter files is empty`);
  }
  let msg = "";
  for (index in fileArray) {
    let fileName = fileArray[index];
    try {
      // remove the file from the directory '__uploadDir'
      await fs.promises.unlink(__uploadDir.concat(fileName));
    } catch (err) {
      msg = msg.concat(fileName).concat("+");
      console.log(`Fail to remove the file ${fileName}: ${err}`);
    }
  }
  msg = msg.slice(0, -1);
  callback(msg);
};
module.exports = {
  uploadFileMiddleware,
  removeFile,
};
