# File name: device_test.py
# Author: HongMing
# Function: the main entry point for automated testing scripts

import os
import sys
import datetime
import time
import csv
import uiautomator2 as u2
from uiautomator2.ext.perf import Perf
from test_case import case_sequence_op, case_start_app
from utils import logcat_monitor
from utils import upload_result
import math

d = None
ext_perf = None


def connect(wifi):
    """
    connect to an Android device through its wifi address
    @param wifi: the wifi addrss of the device
    @return: true, connect the device successfully
    """
    global d
    is_connect = True
    try:
        d = u2.connect(wifi)
    except:
        is_connect = False
        print('Error: the device %s is NOT connected' % wifi)
    finally:
        return is_connect


def monitor_perf(app, result_folder):
    """
    monitor the performance value of the Android app
    @param app: package name of the Android app
    @param result_folder: a directory that stores performance data
    """
    global d
    global ext_perf
    ext_perf = Perf(d, app)
    ext_perf.csv_output = "{0}/perf.csv".format(result_folder)
    ext_perf.start()


def create_result_folder(test_result_folder):
    """
    create a directory with timestamp name
    @param test_result_folder: its parent directory
    @return: [the new directory, current time, formatted timestamp value]
    """
    dir_name = None
    current_dt = datetime.datetime.now()
    try:
        dir_name = test_result_folder + current_dt.strftime("%Y%m%d%H%M%S")
        # create a directory with a timestamp name
        os.makedirs(dir_name)
        print("Create Result folder: ", dir_name)
    except FileExistsError:
        print("Error: Fail to Result folder: ", dir_name)
    return [dir_name, current_dt, current_dt.strftime("%Y%m%d%H%M%S")]


def analyse_fps(result_folder):
    """
    extract Frame Per Second (FPS) information from the performance file
    @param result_folder: the directory storing the performance file
    @return: get the latest FPS value
    """
    file = '{0}/perf.csv'.format(result_folder)
    try:
        if not os.path.exists(file):
            return 0
        with open(file, newline='') as csvfile:
            # read data from the performance file
            spamreader = csv.reader(csvfile, delimiter=' ', quotechar='|')
            for row in spamreader:
                if len(row) == 0:
                    continue
                array = row[len(row) - 1].split(',')
                if len(array) == 0:
                    continue
                # extract FPS value from each line of data
                fps = array[len(array) - 1]
                try:
                    if math.ceil(float(fps)) > 0:
                        return fps
                except:
                    continue
    except:
        print('warning-analyse_fps')
    return 0


def start_test(para_task_id, para_uid, para_device_id,
               wifi_address, app_tested, test_result_folder, test_interval):
    """
    start a test including startup (cold and warm start) and sequential click
    @param para_task_id: the test task id
    @param para_uid: the user id
    @param para_device_id: the Android device id
    @param wifi_address: the wifi address of the Android device
    @param app_tested: the package name of the app
    @param test_result_folder: the directory that stores test results
    @param test_interval: the total test time
    @return: test result JSON object
    """
    global d
    var_result = {'cold': 0, 'warm': 0}
    var_current_dt = datetime.datetime.now()
    var_analysis_result = {'crash': 0, 'anr': 0}
    var_result_path = ''
    try:
        if not connect(wifi_address):
            raise Exception('Device not connected')
        # create a directory that stores test results
        result_folder, var_current_dt, var_result_path = create_result_folder(test_result_folder)
        if result_folder is None:
            raise Exception('Folder not created')
        print('Start to monitor the performance data of the app')
        # start monitoring the real-time logs
        l_analysis_ = logcat_monitor.LogcatMonitor(wifi_address, app_tested, result_folder)
        l_analysis_.start()
        # store real-time performance data
        monitor_perf(app_tested, result_folder)
        # test sequential clicks
        case_sequence_op.start_test(d, app_tested, result_folder, test_interval * 0.01)
        # test warm and cold startup
        var_result = case_start_app.start_test(test_interval * 0.99, d, result_folder, app_tested)
        print('Collecting the performance data')
        l_analysis_.stop()
        print('var_result:{0}, l_analysis_.result:{1}'.format(var_result, l_analysis_.result))
        print('FINISHED---cold:{0}, warm:{1}, anr:{2}, crash:{3}'.format(var_result['cold'], var_result['warm'],
                                                                         l_analysis_.result['anr'],
                                                                         l_analysis_.result['crash']))
        var_analysis_result = l_analysis_.result
        ext_perf.stop()
        ext_perf.csv2images(None, result_folder)
    except Exception:
        print('warning in start test, waiting for 30 seconds', sys.exc_info()[0])
        time.sleep(30)
    # extract Frame Per Second (FPS) information from the performance file
    var_fps = analyse_fps(result_folder)
    print('Finished!')
    return {'task_id': para_task_id, 'time_cold_start': var_result['cold'], 'fps': var_fps,
            'crash_rate': var_analysis_result['crash'] / (test_interval * 60),
            'anr_rate': var_analysis_result['anr'] / (test_interval * 60),
            'device_id': para_device_id,
            'test_time': var_current_dt.strftime("%Y-%m-%d %H:%M:%S"),
            'uid': para_uid, 'result_url': var_result_path}


if __name__ == "__main__":
    # package_name
    v_app_tested = ""
    v_wifi_address = ""
    # set the directory that stores test results
    v_test_result_folder = os.path.dirname(os.path.realpath(__file__)) + "/test_results/"
    v_test_interval = 0
    uid = ""
    task_id = 0
    device_id = 0
    print('Passed parameters:{0}'.format(sys.argv))
    if len(sys.argv) != 7:
        print('Insufficient information, {0}'.format(sys.argv))
        exit(1)
    task_id = sys.argv[1]
    uid = sys.argv[2]
    device_id = sys.argv[3]
    v_wifi_address = sys.argv[4]
    v_app_tested = sys.argv[5]
    v_test_interval = float(sys.argv[6])
    try:
        time_start = datetime.datetime.now()
        # start a test
        result = start_test(task_id, uid, device_id, v_wifi_address,
                            v_app_tested, v_test_result_folder, v_test_interval)
        # record the total running time
        result['runningTime'] = round((datetime.datetime.now() - time_start).total_seconds() / 60, 2)
        # update test result to the back end through an HTTP request
        upload_result.send_task_result(result)
    except:
        print('Warning-------{0}'.format(sys.exc_info()[0]))
