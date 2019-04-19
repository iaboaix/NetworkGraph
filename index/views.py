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
                    "twitter", "机构", "职位"]
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