from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib import staticfiles

from django.conf.urls import url
 
from . import view
 
urlpatterns = [
    url(r'^index$', view.index),
]

#设置静态文件路径
urlpatterns += staticfiles_urlpatterns()