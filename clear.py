import time
import json
import os
import psutil
import utils
import threading
from settings import *

def scan_thread():
    while True:
        dates=os.listdir(save_folder)
        dates.sort()
        dates.reverse()
        if psutil.disk_usage('/').percent>disk_maximum_usage:
            print(f'删除旧存档:{save_folder}/{dates[-1]}')
            utils.remove(f'{save_folder}/{dates[-1]}')
        time.sleep(1)
    
def run():
    t=threading.Thread(target=scan_thread)
    t.daemon=True
    t.start()
