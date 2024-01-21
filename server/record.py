import os
import cv2
import numpy as np
import pyaudio
import wave
from PIL import ImageGrab
import threading
import time
import datetime
import pyautogui
from settings import *

record_buf = []


def record_audio_thread():
    """录制音频到缓冲区
    """
    global record_buf
    audio_stream = pyaudio.PyAudio().open(
        format=audio_format,
        channels=audio_channels,
        rate=audio_rate,
        input=True,
        frames_per_buffer=audio_chunk_size
    )
    while True:
        audio_data = audio_stream.read(audio_chunk_size)      # 读出声卡缓冲区的音频数据
        record_buf.append(audio_data)       # 将读出的音频数据追加到record_buf列表


def record_audio(path=f'{temp_folder}/audio.wav'):
    """保存音频缓冲区
        
        path (str, optional): 保存路径. 
    """
    global record_buf
    audio_file = wave.open(path, 'wb')
    audio_file.setnchannels(audio_channels)
    audio_file.setsampwidth(audio_sampwidth)
    audio_file.setframerate(audio_rate)
    audio_file.writeframes("".encode().join(record_buf))
    record_buf = []
    audio_file.close()


def record_video(Time=10,path=f'{temp_folder}/video.avi'):
    """录制视频

    Args:
        Time (int, optional): 录制时间.
        
        path (str, optional): 保存路径. 
    """
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    video_writer = cv2.VideoWriter(
        path, fourcc, frame_rate, screen_size)
    start_time = time.time()
    frame_num=0
    while time.time()-start_time < Time:
        while (time.time()-start_time)*frame_rate < frame_num:
            time.sleep(0.001)
        try:
            img = pyautogui.screenshot()
            img = cv2.resize(cv2.cvtColor(np.asarray(img), cv2.COLOR_RGB2BGR),screen_size)
            video_writer.write(img)
            frame_num+=1
        except:
            pass
    video_writer.release()


def record(Time=10):
    """录制音视频

    Args:
        Time (int, optional): 录制时间. Defaults to 10.
    """
    global record_buf
    
    # 名称
    name=f'{round(time.time(),3)}-{round(time.time()+Time,3)}'
    folder=f'{temp_folder}/{str(datetime.date.today())}/{name}'
    # 创建文件夹
    os.makedirs(folder)
    
    record_video(Time,f'{folder}/video.avi')
    record_audio(f'{folder}/audio.wav')
    
    return folder


t = threading.Thread(target=record_audio_thread)
t.daemon = True
t.start()
