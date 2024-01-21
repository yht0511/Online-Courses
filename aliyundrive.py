import datetime
import os
import sys
import time
import utils
from settings import *

def login_status():
    """检测账号是否已登录

    Returns:
        bool: 登陆状态
    """
    if '未登录账号' in utils.cmd('aliyunpan who'):
        return False
    return True

def usage():
    """使用百分比

    Returns:
        float: 百分比
    """
    res=utils.cmd('aliyunpan quota')
    return float(res.split('比率: ')[1][:-2])

def remove(path):
    """删除云盘文件

    Args:
        path (str): 云盘路径

    Returns:
        bool: 是否成功
    """
    res=utils.cmd(f'aliyunpan rm {path}')
    if '操作成功' in res:
        res=utils.cmd(f'aliyunpan recycle delete -all')
        if '清空回收站成功' in res:
            return True
    return False

def ls(path):
    """列出云盘文件

    Args:
        path (str): 云盘文件夹路径

    Returns:
        list: 文件名
    """
    res=utils.cmd(f'aliyunpan ls {path}')
    if '当前目录:' in res:
        res=res.split('文件(目录)')[1].splitlines()[1:-2]
        for i in range(len(res)):
            res[i]=res[i].split(' ')
            for j in range(len(res[i])):
                if res[i][len(res[i])-1-j]!='':
                    res[i]=res[i][len(res[i])-1-j]
                    break
        return res
    time.sleep(1)
    print(f'[ERROR] 阿里云盘无法列出目录,重试中...')
    return ls(path)
    
def clear():
    while usage()>maximum_usage:
        dirs=ls(download_folder)
        y=9999
        m=9999
        d=9999
        min_dir=''
        for di in dirs:
            di=di.replace('/','')
            if y>int(di.split('-')[0]):
                y=int(di.split('-')[0])
                min_dir=di
            elif y==int(di.split('-')[0]) and m>int(di.split('-')[1]):
                m=y>int(di.split('-')[1])
                min_dir=di
            elif y==int(di.split('-')[0]) and m==int(di.split('-')[1]) and d>int(di.split('-')[2]):
                d=int(di.split('-')[2])
                min_dir=di
        remove(f'{download_folder}/{min_dir}')
    return True

def download(path,save_path):
    """下载云盘文件

    Args:
        path (str): 云盘路径

    Returns:
        bool: 下载状态
    """
    # 未登录
    if not login_status():
        print('阿里云盘未登录!退出...')
        sys.exit()
    res=utils.cmd(f'aliyunpan download {path} --saveto {save_path} -p 20')
    if '下载结束, 时间' in res:
        return True
    else:
        return False
    
