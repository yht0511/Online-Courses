import os


def cmd(command):
    """运行CMD指令

    Args:
        command (str): 命令

    Returns:
        str: 返回信息
    """
    po=os.popen(command)
    res=po.buffer.read().decode('utf-8')
    return res

def remove(path):
    """递归删除文件夹

    Args:
        path (str): 文件夹路径
    """
    if not os.path.exists(path):
        return
    dirs=os.listdir(path)
    for dir in dirs:
        if os.path.isfile(f'{path}/{dir}'):
            os.remove(f'{path}/{dir}')
        else:
            remove(f'{path}/{dir}')
    os.removedirs(path)