import sys
import os
import time
import datetime

date=False
start=False
end=False
op='/root/output.mkv'
op1=False

if len(sys.argv)>1:
    try:
        date=sys.argv[1]
        start=sys.argv[2]
        end=sys.argv[3]
        op1=sys.argv[4]
    except:
        pass

if not date:
    date=input('Enter target date:')
if not start:
    start=input('Enter start time(H:M:S):')
if not end:
    end=input('Enter end time(H:M:S):')
if not op1:
    op1=input(f'Enter output path({op}):')
if op1:
    op=op1
    
start=time.mktime(time.strptime(f'{date} {start}', "%Y-%m-%d %H:%M:%S"))
end=time.mktime(time.strptime(f'{date} {end}', "%Y-%m-%d %H:%M:%S"))

try:
    files=os.listdir(f'/Records/{date}/')
except:
    raise Exception('Video Not Found')

if os.path.exists('/root/.tmp/'):
    os.popen('rm /root/.tmp -r').read()
os.mkdir('/root/.tmp/')

merge=[]
for f in files:
    if f.endswith('.mp4'):
        if float(f.replace('.mp4','').split('-')[0])<=end and float(f.replace('.mp4','').split('-')[1])>=start:
            # time_drawtext=f'-vf drawtext="expansion=strftime:basetime=$(date +%s -d \'{time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(float(f.replace(".mp4","").split("-")[0])))}\'):fontfile=arial.ttf:x=w-tw:fontcolor=green:fontsize=30:text=\'%Y-%m-%d  %H\\:%M\\: %S\'\"'
            print(f'Transcoding {f}...  ',end='',flush=True)
            if os.path.exists(f'/Records/{date}/{f.replace(".mp4",".srt")}'):
                os.popen(f'ffmpeg -v 0 -i /Records/{date}/{f} -i /Records/{date}/{f.replace(".mp4",".srt")} -c copy /root/.tmp/{f.replace(".mp4","")}.mkv').read()
            else:
                os.popen(f'ffmpeg -v 0 -i /Records/{date}/{f} /root/.tmp/{f.replace(".mp4","")}.mkv').read()
            merge.append(f)
            print('Done')

merge_file=open('/root/.tmp/merge.txt','w')  
l=len(merge)
minimum=False
for m1 in range(l):
    min=9999999999999
    min_m=''
    for m2 in merge:    
        if float(m2.replace(".mp4","").split('-')[0])<min:
            min=float(m2.replace(".mp4","").split('-')[0])
            min_m=m2
    if not minimum:
        minimum=min
    merge_file.write(f'file \'{min_m.replace(".mp4","")}.mkv\'\n')
    merge.remove(min_m)
merge_file.close()
print(f'Merging...  ',end='',flush=True)
os.popen(f'ffmpeg -f concat -v 0 -i /root/.tmp/merge.txt -c copy /root/.tmp/merge.mkv').read()
print('Done')
print(f'Cutting...  ',end='',flush=True)
os.popen(f'ffmpeg -v 0 -ss {start-minimum} -to {end-minimum} -i /root/.tmp/merge.mkv -c:v copy -c:a copy {op}').read()
print('Done')
print(f'Cleaning...  ',end='',flush=True)
os.popen('rm /root/.tmp/ -r').read()
print('Done')
print(f'Output:{op}')