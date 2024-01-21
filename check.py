import sys
import os
import time
import datetime

def exist(ti):
    for f in files:
        if f.endswith('.mp4'):
            s=float(f.replace('.mp4','').split('-')[0])
            t=float(f.replace('.mp4','').split('-')[1])
            if s<=ti<=t:
                return [s,t]
            
date=False
start=False
end=False

if len(sys.argv)>1:
    try:
        date=sys.argv[1]
        start=sys.argv[2]
        end=sys.argv[3]
    except:
        pass

if not date:
    date=input('Enter target date:')
if not start:
    start='00:00:01'
if not end:
    end='23:59:59'

# 处理日期
if ':' in date:
    date_fr=date.split(':')[0]
    date_to=date.split(':')[1]
    pre=''
    for i in range(3-len(date_to.split('-'))):
        pre=pre+date_fr.split('-')[i]+'-'
    date_to=pre+date_to
else:
    date_fr=date
    date_to=date

st=time.mktime(time.strptime(f'{date_fr} {start}', "%Y-%m-%d %H:%M:%S"))
en=time.mktime(time.strptime(f'{date_to} {end}', "%Y-%m-%d %H:%M:%S"))

print(f'Calculating...  ',end='',flush=True)
ans=[]
for date in os.listdir(f'/Records/'):
    if date.endswith('/'):
        date=date[:-1]
    if (date==date_fr or date==date_to) or (st<=time.mktime(time.strptime(f'{date}', "%Y-%m-%d"))<=en):
        try:
            files=os.listdir(f'/Records/{date}/')
        except:
            raise Exception('Data Not Found')

        arr=[]
        minn=-1
        for i in files:
            if i.endswith('.mp4'):
                min=99999999999
                mint=-1
                for f in files:
                    if f.endswith('.mp4'):
                        s=float(f.replace('.mp4','').split('-')[0])
                        t=float(f.replace('.mp4','').split('-')[1])
                        if s<min and s>minn and (t>st and s<en):
                            min=s
                            mint=t
                if mint==-1:
                    break
                minn=min
                arr.append([min,mint])
        
        if arr==[]:
            continue
        
        fr=arr[0][0]
        for i in range(1,len(arr)):
            if arr[i][0]-arr[i-1][1]>3:
                ans.append([fr,arr[i-1][1]])
                fr=arr[i][0]
        ans.append([fr,arr[-1][1]])
print('Done')

time.sleep(0.5)

minn=[-1]
for i in ans:
    min=[99999999999]
    for j in ans:
        if j[0]<min[0] and minn[0]<j[0]:
            min=j
    minn=min
    print(time.strftime("%Y-%m-%d  %H:%M:%S  ", time.localtime(min[0]))+time.strftime("--  %H:%M:%S", time.localtime(min[1])))