# coding=utf-8
# File name: logcat_monitor.py
# Author: HongMing
# Function: The script is used for storing real-time logs of an Android app

import multiprocessing
import re
import subprocess
from datetime import datetime
from dateutil.parser import parse


class LogcatAnalyzer:
    def __init__(self, log_file, package_name):
        """
        initialize the class
        @param log_file: used for storing real-time logs of the tested app
        @param package_name: the package name of the tested app
        """
        self.log_file = log_file
        self.package_name = package_name
        self.process = None
        self.debug = False
        self.anr_count = 0
        self.crash_count = 0
        self.result = {}

    def _validate_log(self, line):
        """
        format the line of log
        @param line: a line of log text
        @return: formatted log
        """
        line_no_space = line.strip()
        split_array = line_no_space.split(' ')
        try:
            return parse(' '.join([split_array[0], split_array[1]]))
        except:
            if self.debug:
                print('Fail to convert data to date:{0}'.format(line_no_space))
            return ''

    def _analyze_log(self, para_anr_count, para_crash_count):
        """
        analyse the number of ANR and Crash errors
        @param para_anr_count: stores the number of ANR
        @param para_crash_count: stores the number of Crash
        """
        # the log format of an ANR error
        anr_key_word = r"ANR\s+in\s+" + self.package_name
        # the log format of a Crash error
        crash_key_word = r"\d+\/{0}\s.*AndroidRuntime".format(self.package_name)
        anr_count = 0
        crash_count = 0
        result = []
        try:
            with open(self.log_file) as file:
                for line in file:
                    crash_result = None
                    # search ANR errors in the log file
                    anr_result = re.search(anr_key_word, line)
                    if anr_result is not None:
                        anr_count += 1
                    else:
                        # search crash errors in the log file
                        crash_result = re.search(crash_key_word, line)
                        if crash_result is not None:
                            crash_count += 1
                    if anr_result is None and crash_result is None:
                        continue
                    result.append("{0},{1}".format(
                        self._validate_log(line), "ANR" if anr_result else "Crash"))
        except:
            print('Error:_analyze_log')
            # print(traceback.format_exc())
        result.append("ANR count: {0}, Crash count: {1}".format(anr_count, crash_count))
        # store the count of ANR errors
        para_anr_count.value = anr_count
        # store the count of Crash errors
        para_crash_count.value = crash_count
        print(result)

    def start(self):
        """
        create a process to analyse the Android log file
        """
        self.anr_count = multiprocessing.Value('i')
        self.crash_count = multiprocessing.Value('i')
        self.process = multiprocessing.Process(target=self._analyze_log, args={self.anr_count,self.crash_count })
        self.process.start()
        self.process.join()
        self.result = {'anr': self.anr_count.value, 'crash': self.crash_count.value}

    def stop(self):
        """
        stop analysing the log file
        """
        if self.process is None:
            print('Error: LogcatAnalyzer, process is None')
            return
        self.process.terminate()
        self.process.join()


class LogcatMonitor:
    def __init__(self, device, package_name, result_folder):
        """
        initialize the class which is used to save android logs in real time
        :param device: IP address of the tested device
        :type device: String
        :param package_name: the package's name of the tested app
        :type package_name: String
        """
        self.log_file_name = None
        self.stream_log = None
        self.proc_monitor = None
        self.device = device
        self.package_name = package_name
        self.result = {}
        self.test_result_folder = result_folder
        self._create_log_file()
        self.log_analysis = LogcatAnalyzer(self.log_file_name, self.package_name)

    def _create_log_file(self):
        """
        create a log file with timestamp name
        """
        now_time = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.log_file_name = self.test_result_folder + "/Logcat_" + now_time + ".txt"
        self.stream_log = open("%s" % self.log_file_name, "wb")

    def cleanup(self):
        """
        stop all processes
        """
        self.proc_monitor.terminate()
        self.proc_monitor.kill()
        self.stream_log.close()
        self.log_analysis.stop()

    def start(self):
        """
        Start to monitor and save android logs in real time
        """
        command = ["adb", "-s", self.device, "shell", "logcat", "-v", "threadtime"]
        self.proc_monitor = subprocess.Popen(
            args=command,
            stdin=None, stdout=self.stream_log,
            stderr=self.stream_log, shell=False)

    def stop(self, is_force=False):
        """
        Stop to save android logs, and analyse the ANR and Crash logs
        :param is_force: if true, the android logs will be not analysed.
        """
        self.proc_monitor.terminate()
        self.proc_monitor.kill()
        self.stream_log.close()
        if not is_force:
            self.log_analysis.start()
            self.result = self.log_analysis.result