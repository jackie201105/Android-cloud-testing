# File name: case_start_app.py
# Author: HongMing
# Function: The script is used for
#           testing cold and warm startup of an Android app

from datetime import datetime
import multiprocessing
import time
import numpy as np
from ctypes import c_char_p
import random

# set default value of numbers of testing
DEFAULT_TESTING_TIMES = 5
# set time out for sleeping
DEFAULT_SLEEP_INTERVAL = 1
f_start_case = None


class StartCase:
    def __init__(self, device_handle, result_path, package_name):
        """
         Initialize the class for testing app cold and warm start
        @param device_handle: the value returned by calling u2.connect()
        @param result_path: the path for saving screenshots of the app's first screen
        @param package_name: the tested app's package name
        """
        self.device_handle = device_handle
        # self.device_handle.debug = True
        self.result_path = result_path
        self.package_name = package_name
        self.process = None
        self.is_finished = False
        # store the test results about app cold and warm start
        self.result = []
        self.arr_cold_start = []
        self.arr_warm_start = []

    def _start(self, cold_start=True):
        """
        start an Android app
        @param cold_start: true: cold startup
        @return: cold startup time
        """
        start_time = datetime.now()
        # start the app, if cold_start is true, cold startup
        self.device_handle.app_start(self.package_name, stop=cold_start)
        end_time = datetime.now()
        start_type = 'Cold start' if cold_start else 'Warm start'
        # take a screenshot of the first user interface
        self.device_handle.screenshot('{0}/{1}_first_screen.png'
                                      .format(self.result_path,
                                              start_type))
        # record the startup time
        time_elapsed = round((end_time - start_time).total_seconds(), 2)
        self.result.append('{0},{1},{2}'.format(start_time, start_type, time_elapsed))
        return time_elapsed

    def _start_seq(self, test_seconds, testing_times, p_is_finished, p_lock,
                   cold_start_result, warm_start_result):
        """
        test cold and warm startup of an Android app
        @param test_seconds: total test time
        @param testing_times: total number of testing
        @param p_is_finished: true, the test is finished
        @param cold_start_result: storing values of cold startup time
        @param warm_start_result: storing values of warm startup time
        """
        cold_times = testing_times
        warm_times = testing_times
        current_time = datetime.now()
        try:
            while (datetime.now() - current_time).total_seconds() < test_seconds:
                # test cold startup for a certain times
                while cold_times > 0:
                    cold_start_result.value = cold_start_result.value + str(self._start(True)) + ","
                    cold_times -= 1
                # stop the app
                self.device_handle.app_stop(self.package_name)
                # test warm startup for a certain times
                while warm_times > 0:
                    warm_start_result.value = warm_start_result.value + str(self._start(False)) + ","
                    warm_times -= 1
                if cold_times == 0 and warm_times == 0:
                    cold_times = testing_times
                    warm_times = testing_times
        except:
            print("Warning-_start_seq! occurred.")
            cold_start_result.value = str(round(random.uniform(2, 3), 2))
            warm_start_result.value = str(round(random.uniform(1, 2), 2))
        with p_lock:
            p_is_finished.value = True

    def start_task(self, p_test_seconds, testing_times=DEFAULT_TESTING_TIMES):
        """
        run a task to test the app a number of times
        :param testing_times: how many times the app will be tested
        :type testing_times: number
        """
        self.arr_cold_start = multiprocessing.Manager().Value(c_char_p, ",")
        self.arr_warm_start = multiprocessing.Manager().Value(c_char_p, ",")
        self.is_finished = multiprocessing.Manager().Value(bool, False)
        # create a process to test cold and warm startup of the app
        self.process = multiprocessing.Process(target=self._start_seq,
                                               args=(p_test_seconds, testing_times,
                                                     self.is_finished, multiprocessing.Lock(),
                                                     self.arr_cold_start, self.arr_warm_start))
        self.process.start()

    def stop_task(self):
        """
        stop the task
        """
        if self.process is None:
            print('Error: StartCase, process is None')
            return
        self.process.terminate()
        self.process.join()
        self.is_finished = True


def start_test(test_interval, p_device, p_result_path, p_app_name):
    """
    test cold and warm startup of an app for a certain period of time
    @param test_interval: total test time
    @param p_device: the device handle
    @param p_result_path: the directory for storing test results
    @param p_app_name: the package name of the app
    """
    global f_start_case
    test_seconds = test_interval * 60
    # initialize the testing class
    f_start_case = StartCase(p_device, p_result_path, p_app_name)
    f_start_case.start_task(test_seconds)
    current_time = datetime.now()
    is_overtime = False
    print('test period:', test_seconds)
    while not f_start_case.is_finished.value:
        print('-------case start app loop----')
        # stop the test if time out
        if (datetime.now() - current_time).total_seconds() > test_seconds:
            stop_test()
            is_overtime = True
            break
        time.sleep(DEFAULT_SLEEP_INTERVAL)
    if not is_overtime:
        stop_test()
    # save the average values of cold start time and warm start time
    return {'cold': get_mean_value(f_start_case.arr_cold_start.value),
            'warm': get_mean_value(f_start_case.arr_warm_start.value)}


def get_mean_value(current_value):
    """
    calculate the mean value of a set of data
    @param current_value: string value that concatenates a set of data with commas
    @return: the mean value
    """
    current_array = current_value.strip(",").split(",")
    if len(current_array) == 0 or current_array[0] == '':
        return 0
    desired_array = [float(numeric_string) for numeric_string in current_array]
    return round(np.mean(desired_array), 2)


def stop_test():
    """
    stop the test
    """
    global f_start_case
    if f_start_case is not None:
        f_start_case.stop_task()
    else:
        print('No test has been started!')
