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
        self.write(json.dumps(os.listdir(save_folder)))

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
            if file.endswith('.mp4'):
                if not os.path.exists(f'{save_folder}/{query}/{file}.json'):
                    data={
                        'name':file,
                        'path':f'/records/{query}/{file}',
                        'duration':float(json.loads(utils.cmd(f'ffprobe -i {save_folder}/{query}/{file}  -show_entries  format=duration  -v quiet -print_format json'))['format']['duration']),
                        'size':os.path.getsize(f'{save_folder}/{query}/{file}'),
                        'from':file.replace('.mp4','').split('-')[0],
                        'to':file.replace('.mp4','').split('-')[1],
                        }
                    f=open(f'{save_folder}/{query}/{file}.json','w',encoding='utf-8')
                    f.write(json.dumps(data,ensure_ascii=False))
                    f.close()
                else:
                    f=open(f'{save_folder}/{query}/{file}.json','r',encoding='utf-8')
                    data=json.loads(f.read())
                    f.close()
                Data.append(data)
        # 返回信息
        self.write(json.dumps(Data))
