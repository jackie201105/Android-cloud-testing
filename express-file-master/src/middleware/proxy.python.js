/**
* File name: proxy.python.js
* Author: HongMing
* Function: used to create a python process to start test scripts
*/

//Initialize the database class
const database = require("../middleware/database");

/**
Start test scripts by creating a python process
Parameters:
task_id: task id, uid: user id, device_id: device id,
device_wifi_address: the device's wifi address,
app_package_tested: package name of the tested Android app
test_interval: the total test time
*/
const call_python_script = async (task_id, uid,
    device_id, device_wifi_address, app_package_tested, test_interval) => {
     var spawn = require('child_process').spawn;
     // spawn a child process to run the python script
     var process = spawn('python3', [__dirname + "/../../../testPy/device_test.py",
                        task_id,
                        uid,
                        device_id,
                        device_wifi_address,
                        app_package_tested,
                        test_interval]);
     process.stdout.on('data',function(data){
        // log the print information generated by the test scripts
        console.log(`stdout: ${data}}`);
     });
     process.on('close', (code) => {
        console.log(`child process close all stdio: ${code}`);
     });
};

module.exports = {
    call_python_script,
};
