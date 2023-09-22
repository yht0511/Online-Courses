import os
import upload
import threading
import utils
from settings import *
import record


def upload_thread(path):
    res = upload.upload(path)
    if res:
        # 删除文件
        utils.remove(path)
    else:
        # 重试
        upload_thread(path)


# 初始化
# 临时文件夹
if not os.path.exists(temp_folder):
    os.mkdir(temp_folder)

while True:
    path = record.record(record_interval)
    t = threading.Thread(target=upload_thread, args=(path,))
    t.daemon = True
    t.start()
