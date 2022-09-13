# File name: case_sequence_op.py
# Author: HongMing
# Function: The script is used to automatically test buttons
#           of all user interfaces of an Android app.

import time
from datetime import datetime
import multiprocessing
from uiautomator2 import Direction

# Initialize variables
app_tested = None
app_start_xpath = None
d = None
clicked_list = []
is_finished = False
test_process = None
# set the sleep timeout (unit: second)
default_sleep_interval = 1
# set the timeout for starting an Android app
app_start_timeout = 2
# set the timeout for clicking an Android app
click_timeout = 1
# Initialize the index of screenshots of user interfaces of an Android app
screenshot_index = 0
# Set the type of clickable buttons
scroll_view = '//androidx.recyclerview.widget.RecyclerView'
clickable_xpath = '//*[@clickable="true"]'


def start_app(app_name, is_cold=True):
    """
    Start an Android app
    @param app_name: package name of an Android app
    @param is_cold: true, cold start
    @return: true: start the app successfully
    """
    is_success = True
    try:
        print('start_app:' + app_name)
        d.app_start(app_name, stop=is_cold)
    except:
        is_success = False
        print('Warning: fail to start app %s' % app_name)
        # raise
    finally:
        if not is_success:
            return False
        # check if the app is started successfully
        return check_if_start()


def stop_app(app_name):
    """
    Stop an Android app
    @param app_name: package name of an Android app
    @return: true: stop the app successfully
    """
    is_error = False
    try:
        d.app_stop(app_name)
    except:
        is_error = True
        print('Error: fail to stop app %s' % app_name)
    finally:
        return is_error


def get_next_item():
    """
    find the next clickable item of user interfaces of an Android app
    @return: the xpath of the next clickable item
    """
    global d
    result = None
    for comp in d.xpath(clickable_xpath).all():
        # the clickable item has to be one of the tested Android app
        if comp.info['packageName'] != app_tested:
            continue
        str_comp = str(comp)
        if str_comp not in clicked_list:
            # the next item has been not clicked yet
            result = comp
            clicked_list.append(str_comp)
            break
    return result


def click_items_iterable(image_folder="."):
    """
    Click items of user interfaces of an Android app sequentially
    @param image_folder: the directory for storing images
    @return: true: the app has been restarted.
    """
    global d
    global screenshot_index
    # find the next clickable item
    ele = get_next_item()
    is_restart = False
    while ele is not None:
        ele = get_next_item()
        if ele is None:
            break
        print(ele.info)
        # click the item
        ele.click()
        # take a screenshot of the item
        screen_image = image_folder + "/" + str(screenshot_index)
        ele.screenshot().save(screen_image + "_btn.png")
        time.sleep(click_timeout)
        d.screenshot(screen_image + "_screen.png")
        screenshot_index += 1
        scroll_event()
        # click the back button
        d.press('back')
        time.sleep(click_timeout)
        if not d.xpath(app_start_xpath).exists:
            is_restart = True
            break
    print('finish')
    return is_restart


def scroll_event():
    """
    scroll user interfaces of an Android app
    @return: true, scroll user interfaces successfully
    """
    if not d.xpath(scroll_view).exists:
        print('Warning: No scroll component!')
        return False
    el = d.xpath(scroll_view).get()
    el.scroll(Direction.FORWARD)
    el.scroll(Direction.BACKWARD)
    el.scroll(Direction.HORIZ_FORWARD)
    el.scroll(Direction.HORIZ_BACKWARD)
    print('scroll_event')
    time.sleep(click_timeout)
    return True


def test_click_event(result_folder):
    """
    click all items of user interfaces sequentially
    @param result_folder: a folder that stores test results
    @return: true: No error when clicking items
    """
    while click_items_iterable(result_folder):
        if not start_app(app_tested, False):
            return False
    return True


def check_if_start():
    """
    check if starting an Android app successfully
    @return: true, successfully
    """
    # the app is started successfully if there are clickable items on the user interfaces
    d.xpath(app_start_xpath).wait(timeout=app_start_timeout)
    return d.xpath(app_start_xpath).exists


def start_task(p_test_seconds, device, app, result_folder, p_is_finished, p_lock):
    """
    start a task of clicking buttons
    of user interfaces of an Android app
    @param p_test_seconds: total test time
    @param device: the Android device used for testing apps
    @param app: the tested Android app
    @param result_folder: a directory for storing results
    @param p_is_finished: true, the task is finished
    @param p_lock: lock object
    @return: true, there are errors when testing
    """
    global d
    global app_tested
    global app_start_xpath
    app_tested = app
    app_start_xpath = "//*[contains(@package,'" + app_tested + "')]"
    d = device
    current_time = datetime.now()
    try:
        while (datetime.now() - current_time).total_seconds() < p_test_seconds:
            print('-------sequent test loop----')
            # start the app
            if not start_app(app_tested):
                return False
            # click items of user interfaces sequentially
            test_click_event(result_folder)
            # sleep for a while
            time.sleep(default_sleep_interval)
    except:
        print('Warning in start_task')
    p_lock.acquire()
    p_is_finished = True
    p_lock.release()
    print('All the steps are finished')
    return True


def start_test(device, app, result_folder, test_interval=10):
    """
    start a task of clicking buttons
    of user interfaces of an Android app
    @param device: an Android device
    @param app: the package name of the app
    @param result_folder: a directory for storing results
    @param test_interval: total test time
    """
    global is_finished, test_process
    is_finished = multiprocessing.Manager().Value(bool, False)
    test_seconds = test_interval * 60
    # create a new process to execute the test
    test_process = multiprocessing.Process(target=start_task,
                                           args=(test_seconds, device, app, result_folder, is_finished,
                                                 multiprocessing.Lock()))
    test_process.start()
    current_time = datetime.now()
    is_overtime = False
    while not is_finished.value:
        # check if time out
        if (datetime.now() - current_time).total_seconds() > test_seconds:
            stop_test()
            is_overtime = True
            break
        time.sleep(default_sleep_interval)
    if not is_overtime:
        # stop the test
        stop_test()


def stop_test():
    """
    stop the task
    """
    global is_finished, test_process
    if test_process is None:
        print('Error: StartCase, process is None')
        return
    test_process.terminate()
    test_process.join()
    is_finished = True
