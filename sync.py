# 同步录像
import json
import os
import sys
import threading
import time
import aliyundrive
import datetime
from dateutil import parser
import utils
from settings import *


def check_unsync_files(full_check=False):
    """同步视频文件

    Args:
        full_check (bool, optional): 是否完全检查. Defaults to False.
    """
    global thread_num
    dates = aliyundrive.ls(download_folder)
    if not dates:
        return
    if not full_check:
        if str(datetime.date.today())+'/' in dates:
            dates = [str(datetime.date.today())]
        else:
            dates = []
    for date in dates:
        gap = (parser.parse(str(datetime.date.today())) - parser.parse(date)).days
        if gap < expiration:
            files = aliyundrive.ls(f'{download_folder}/{date}')
            # 如果没有,就下载
            for file in files:
                file = file[:-1]
                if not os.path.exists(f'{save_folder}/{date}/{file}.mp4'):
                    while thread_num>=maximum_thread_num:
                        time.sleep(0.1)
                    print(f'下载文件:{save_folder}/{date}/{file}.mp4')
                    t=threading.Thread(target=sync_file,args=(f'{date}/{file}',))
                    t.daemon=True
                    t.start()
                    thread_num+=1

def sync_file(path):
    """同步单个视频文件

    Args:
        path (str): 云盘文件路径
    """
    global thread_num,transcoding_num
    aliyundrive.download(f'{download_folder}/{path}', temp_folder)
    while transcoding_num>=maximum_transcoding_num:
        time.sleep(0.1)
    transcoding_num+=1
    date = path.split("/")[0].replace(' ','')
    name = path.split("/")[-1].replace(' ','')
    if not os.path.exists(f'{save_folder}/{date}'):
        os.mkdir(f'{save_folder}/{date}')
    try:
        # 获取视频长度
        video_duration = float(json.loads(utils.cmd(
            f'ffprobe -i {temp_folder}/{download_folder}/{path}/video.avi  -show_entries  format=duration  -v quiet -print_format json'))['format']['duration'])
        # 获取音频长度
        audio_duration = float(json.loads(utils.cmd(
            f'ffprobe -i {temp_folder}/{download_folder}/{path}/audio.wav  -show_entries  format=duration  -v quiet -print_format json'))['format']['duration'])
        # 拉伸视频
        utils.cmd(
            f'ffmpeg  -i {temp_folder}/{download_folder}/{path}/video.avi -filter:v "setpts={record_interval/video_duration}*PTS" -preset ultrafast {temp_folder}/{download_folder}/{path}/sync.mp4')
        # 获取视频长度
        video_duration = float(json.loads(utils.cmd(
            f'ffprobe -i {temp_folder}/{download_folder}/{path}/sync.mp4  -show_entries  format=duration  -v quiet -print_format json'))['format']['duration'])
        # 拉伸音频
        utils.cmd(
            f'ffmpeg  -i {temp_folder}/{download_folder}/{path}/audio.wav -filter:a atempo="{audio_duration/video_duration}" {temp_folder}/{download_folder}/{path}/sync.wav')
        # 结合音视频
        utils.cmd(
            f'ffmpeg -i {temp_folder}/{download_folder}/{path}/sync.mp4 -i {temp_folder}/{download_folder}/{path}/sync.wav -c:v copy -c:a aac -strict experimental {save_folder}/{date}/{name}.mp4')
        # 删除临时文件
        utils.remove(f'{temp_folder}{download_folder}/{path}')
    except:
        pass
    thread_num-=1
    transcoding_num-=1

def sync_thread():
    """同步线程,首次完全检查,然后每隔同步周期对文件进行部分检查
    """
    check_unsync_files(True) # 首次完全检查
    while True:
        try:
            # 每隔同步周期对文件进行部分检查
            check_unsync_files()
            time.sleep(sync_period)
        except:
            sys.exit()


def sync():
    """启动同步线程
    """
    t = threading.Thread(target=sync_thread)
    t.daemon = True
    t.start()

thread_num=0
transcoding_num=0