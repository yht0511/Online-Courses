import pyaudio
from win32 import win32api, win32gui, win32print
import win32con

# 文件设置
temp_folder = 'temp'

# 云盘设置
upload_folder = '/Data' # 云盘文件夹
maximum_usage = 90 # 最大使用限度

# 录制设置
record_interval = 10 * 60 # 录制时间间隔

# 录像设置
hDC = win32gui.GetDC(0)
screen_size = (int(win32print.GetDeviceCaps(hDC, win32con.DESKTOPHORZRES)/2), int(win32print.GetDeviceCaps(hDC, win32con.DESKTOPVERTRES)/2)) # 屏幕分辨率
frame_rate = 3 # 帧率

# 录音设置
audio_format = pyaudio.paInt16
audio_channels = 1
audio_sampwidth = 2
audio_rate = 44100
audio_chunk_size = 1024
