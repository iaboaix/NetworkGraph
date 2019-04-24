import os
import json
from index.neo4j import Neo4jToJson
from django.shortcuts import render
from django.http import HttpResponse

data_neo4j = Neo4jToJson()
# Create your views here.
def index(request):
    data = {"nodes": [], "links": []}
    support_label = ["default", "male", "female", "bus", "qq", "wechat", "phone",
                    "Donald-John-Trump", "us", "germany", "Ivanka-Trump",
                    "twitter", "机构", "职位", "迈克·彭斯", "苏世民", "米奇·麦康奈尔",
                    "詹姆斯·马蒂斯", "约翰·凯利", "妮基·黑利", "特里·布兰斯塔德",
                    "美国财政部", "美国国防部", "美国国务院", "美国联邦", "美国司法部"]
    try:
        data = data_neo4j.start()
    except:
        print("ERROR neo4j未启动")
    return render(request, 'index.html', {
        'List': json.dumps(support_label),
        'Dict': json.dumps(data)
        })

def expand(request):
    if request.POST:
        node = json.loads(request.body.decode())["node"]
        data = data_neo4j.expand(node)
    return HttpResponse(json.dumps(data))

def upload(request):
    if request.method == 'POST':
        data = dict()
        file_obj = request.FILES.get('file')
        with open(os.path.join('index', 'index_static/data', file_obj.name), 'rb+') as file:
            for chunk in file_obj.chunks():
                file.write(chunk)
            file.seek(0)
            data = file.read()
        return HttpResponse(data)