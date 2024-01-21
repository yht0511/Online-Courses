import time
import json
import os
import utils
import threading
from settings import *

def get_subtitle(video):
    srt_path=video.replace('.mp4','.srt')
    if not os.path.exists(srt_path):
        print(f'转换字幕:{video}')
        res=utils.cmd(f'bcut_asr {video}')
        if '未识别到语音' in res:
            f=open(srt_path,'w')
            f.write('')
            f.close()
    try:
        f=open(srt_path,'r',encoding='utf-8')
        data=f.read()
        f.close()
    except:
        return False
    times=data.split('\n\n')
    Data=[]
    if times!=['']:
        for d in times:
            d1=d.split('\n')
            ti=d1[1].split(' --> ')
            fr=int(ti[0].split(',')[1])/1000+int(ti[0].split(',')[0].split(':')[0])*3600+int(ti[0].split(',')[0].split(':')[1])*60+int(ti[0].split(',')[0].split(':')[2])
            to=int(ti[1].split(',')[1])/1000+int(ti[1].split(',')[0].split(':')[0])*3600+int(ti[1].split(',')[0].split(':')[1])*60+int(ti[1].split(',')[0].split(':')[2])
            Data.append({
                'from':fr,
                'to':to,
                'text':d1[2]
            })
    return Data

def scan_thread():
    while True:
        try:
            dates=os.listdir(save_folder)
            dates.sort()
            dates.reverse()
            for date in dates:
                videos=os.listdir(f'{save_folder}/{date}')
                for video in videos:
                    path=f'{save_folder}/{date}/{video}'
                    json_path=path.replace('.mp4','.json')
                    if path.endswith('.mp4') and not os.path.exists(json_path):
                        print(f'开始构建JSON信息:{path}')
                        srt_data=get_subtitle(path)
                        if srt_data==False:
                            print(f'JSON信息构建失败:{path}')
                            continue
                        data={
                            'name':video,
                            'path':f'/records/{date}/{video}',
                            'subtitle':srt_data,
                            'duration':float(json.loads(utils.cmd(f'ffprobe -i {path}  -show_entries  format=duration  -v quiet -print_format json'))['format']['duration']),
                            'size':os.path.getsize(path),
                            'from':video.replace('.mp4','').split('-')[0],
                            'to':video.replace('.mp4','').split('-')[1]
                            }
                        f=open(json_path,'w',encoding='utf-8')
                        f.write(json.dumps(data,ensure_ascii=False))
                        f.close()
                        print(f'JSON信息构建完成:{path}')
        except Exception as e:
            print(f'[ERROR] 构建JSON信息时发生错误!')
            print(e)
        time.sleep(1)
    
def run():
    t=threading.Thread(target=scan_thread)
    t.daemon=True
    t.start()