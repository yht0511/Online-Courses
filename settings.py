# 配置文件

# HTTP服务器
http_port = 80
http_host = '0.0.0.0'
admin_code='tclab'

# 同步设置
expiration = 3  # 过期天数
disk_maximum_usage = 90  # 最大存储占用量
remote_disk_maximum_usage = 60 # 最大云盘占用量
sync_period = 60  # 同步周期
download_folder = '/Data'  # 云盘文件夹
save_folder = '/Records'  # 本地保存文件夹
temp_folder = '/Temp'  # 临时文件夹
maximum_thread_num = 3  # 线程数量
maximum_transcoding_num = 1  # 转码数量

# 转换设置
record_interval = 10 * 60  # 录制时间间隔
