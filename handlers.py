import tornado
import json
import os
import utils
from settings import *
import security
import _check

class dates_handler(tornado.web.RequestHandler):
    """
    获取已存档的日期表
    """

    def get(self):
        l=os.listdir(save_folder)
        l.sort()
        l.reverse()
        self.write(json.dumps(l))
      
class password_handler(tornado.web.RequestHandler):
    """
    验证密钥是否正确
    """

    def get(self):
        try:
            code=self.get_query_arguments('code')[0]
        except:
            code=''
        if security.verify(code):
            self.write('1')
        else:
            self.write('0')
              
class check_handler(tornado.web.RequestHandler):
    """
    检查视频文件
    """

    def get(self):
        date=self.get_query_arguments('date')[0]
        try:
            code=self.get_query_arguments('code')[0]
        except:
            code=''
        if security.verify(code) or True:
            self.write({'status':1,'message':_check.check(date)})
        else:
            self.write('0')

class list_handler(tornado.web.RequestHandler):
    """
    获取某日期的视频文件列表
    """

    def get(self):
        query=self.get_query_arguments('date')[0]
        try:
            code=self.get_query_arguments('code')[0]
        except:
            code=''
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
                data['protected']=False
                if security.protected(data['from'],data['to']):
                    data['protected']=True
                    if not security.verify(code):
                        del data['subtitle']
                Data.append(data)
        # 返回信息
        self.write(json.dumps(Data))
