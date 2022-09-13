/**
* File name: apk.analyse.js
* Author: HongMing
* Function: used to provide all APIs of analysing Android apps file
*/

// Initialize API classes
const ApkParser = require("app-info-parser/src/apk");

/**
Extract the Android app information from the Android app's file
*/
const extractAPK = (fileName) =>
  new ApkParser(__uploadDir.concat(fileName)).parse();

module.exports = {
  extractAPK,
};
