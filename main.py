# 希沃直播程序
from settings import *
from tornado import web, httpserver, ioloop, websocket
import threading
import sync
import time
import os
import handlers
import utils
import reprocess
import clear
import web_rep

if __name__ == '__main__':
    # 初始化文件
    if not os.path.exists(save_folder):
        os.mkdir(save_folder)
    if os.path.exists(temp_folder):
        utils.remove(temp_folder)
    os.mkdir(temp_folder)
    # 启动服务器
    app = web.Application(handlers=[
        (r"/dates", handlers.dates_handler),
        (r"/check_code", handlers.password_handler),
        (r"/check", handlers.check_handler),
        (r"/list", handlers.list_handler),
        (r"/records/(.*)", web_rep.StaticFileHandler, {'path': save_folder}),
        (r"/(.*)", web.StaticFileHandler,
         {'path': 'statics/', 'default_filename': "index.html"}),
    ],
        template_path='./')
    http_server = httpserver.HTTPServer(app)
    http_server.listen(port=http_port, address=http_host)
    print("程序已启动.\n地址:http://{}:{}/index.html".format(http_host, http_port))
    # 启动同步线程
    sync.sync()
    # 启动后处理线程
    reprocess.run()
    # 启动清扫线程
    clear.run()
    ioloop.IOLoop.instance().start()
