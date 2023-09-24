import tornado
import json
import os
import utils
from settings import *

class dates_handler(tornado.web.RequestHandler):
    """
    获取已存档的日期表
    """

    def get(self):
        l=os.listdir(save_folder)
        l.sort()
        l.reverse()
        self.write(json.dumps(l))

class list_handler(tornado.web.RequestHandler):
    """
    获取某日期的视频文件列表
    """

    def get(self):
        query=self.get_query_arguments('date')[0]
        # 检验数据
        for i in query.split('-'):
            a=int(i)
        Data=[]
        # 获取信息
        files=os.listdir(f'{save_folder}/{query}/')
        for file in files:
            json_file=file.replace('.mp4','.json')
            if file.endswith('.mp4') and os.path.exists(f'{save_folder}/{query}/{json_file}'):
                f=open(f'{save_folder}/{query}/{json_file}','r',encoding='utf-8')
                data=json.loads(f.read())
                f.close()
                Data.append(data)
        # 返回信息
        self.write(json.dumps(Data))
