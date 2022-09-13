# coding=utf-8
# File name: upload_result.py
# Author: HongMing
# Function: The script is used for storing real-time logs of an Android app

import requests


def send_task_result(result):
    """
    send HTTP request to store test results into the MongoDB database
    @param result:
    """
    para_request = wrap_task_result(result)
    url = 'http://localhost:8080/insert_task_result?'
    x = requests.post(url + para_request)
    print(x.text)


def wrap_task_result(task_result):
    """
    transform the task result into string format
    @param task_result: task result object
    @return: string format of the result
    """
    post_request = ""
    for key in task_result.keys():
        post_request = post_request + str(key) + "=" + str(task_result[key]) + "&"
    return post_request.strip('&')
