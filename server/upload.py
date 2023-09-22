import datetime
import os
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
    try:
        return float(res.split('比率: ')[1][:-2])
    except:
        return usage()

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
    try:
        if '当前目录:' in res:
            res=res.split('文件(目录)')[1].splitlines()[1:-2]
            for i in range(len(res)):
                res[i]=res[i].split(' ')
                for j in range(len(res[i])):
                    if res[i][len(res[i])-1-j]!='':
                        res[i]=res[i][len(res[i])-1-j]
                        break
            return res
    except:
        pass
    return False
    
def clear():
    while usage()>maximum_usage:
        dirs=ls(upload_folder)
        y=9999
        m=9999
        d=9999
        min_dir=''
        for d in dirs:
            if y>int(d.split('-')[0]):
                y=int(d.split('-')[0])
                min_dir=d
            elif y==int(d.split('-')[0]) and m>int(d.split('-')[1]):
                m=y>int(d.split('-')[1])
                min_dir=d
            elif y==int(d.split('-')[0]) and m==int(d.split('-')[1]) and d>int(d.split('-')[2]):
                d=int(d.split('-')[2])
                min_dir=d
        remove(f'{upload_folder}/{min_dir}')
    return True

def upload(path):
    """上传到云盘

    Args:
        path (str): 本地路径

    Returns:
        bool: 上传状态
    """
    # 未登录
    if not login_status():
        return False
    # 使用超额度
    if usage() > maximum_usage:
        clear()
    res=utils.cmd(f'aliyunpan upload {path} {upload_folder}/{str(datetime.date.today())}')
    
    if '上传结束, 时间' in res:
        return True
    else:
        return False
    