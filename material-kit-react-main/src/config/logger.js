/**
* File name: logger.js
* Author: HongMing
* Function: control log switch
*/

const logger = () => {
  let oldConsoleLog = null;
  const pub = {};

  pub.enableLogger = function enableLogger() {
    if (oldConsoleLog == null) return;
    // enable logger function
    window.console.log = oldConsoleLog;
  };

  pub.disableLogger = function disableLogger() {
    oldConsoleLog = console.log;
    // disable logger function
    window.console.log = () => {};
  };

  return pub;
};

export default logger;
