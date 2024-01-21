import os
import time
import hashlib
from settings import *

def protected(fr,to):
    fr=float(fr)
    to=float(to)
    frt=int(time.strftime("%H%M", time.localtime(fr)))
    tot=int(time.strftime("%H%M", time.localtime(to)))
    if 1340>frt>1200 or 1340>tot>1200 or (frt<1200 and tot>1340):
        return True
    if 1850>frt>1800 or 1850>tot>1800 or (frt<1800 and tot>1850):
        return True
    if time.strftime("%A", time.localtime(fr))=='Sunday':
        return True
    return False

def verify(code):
    for i in range(-10,11):
        if hashlib.md5(f'{admin_code} - time:{int(time.time())+i}'.encode()).hexdigest()==code:
            return True
    return False