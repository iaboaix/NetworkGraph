import os
import json
from index.neo4j import Neo4jToJson
from django.shortcuts import render
from django.http import HttpResponse

data_neo4j = Neo4jToJson()
# Create your views here.
def index(request):
    data = {'nodes': [], 'links': []}
    try:
        data = data_neo4j.start()
    except:
        print('ERROR neo4j未启动')
    return render(request, 'index.html', {
        'tips': get_tips(),
        'file_list': get_file_list(),
        'default_data': data
        })

def expand(request):
    if request.POST:
        node = json.loads(request.body.decode())['node']
        data = data_neo4j.expand(node)
    return HttpResponse(json.dumps(data))

def upload(request):
    if request.method == 'POST':
        data = dict()
        file_obj = request.FILES.get('file')
        with open(os.path.join('index', 'index_static', 'data', 'private_data', file_obj.name), 'wb+') as file:
            for chunk in file_obj.chunks():
                file.write(chunk)
            file.seek(0)
            data = file.read()
        return HttpResponse(data)

def get_public_data(request):
    if request.method == 'POST':
        file_name = json.loads(request.body.decode())['file_name']
        with open(os.path.join('index', 'index_static', 'data', 'public_data', file_name), 'rb') as file:
            data = file.read()
            return HttpResponse(data)

def get_file_list():
    return os.listdir(os.path.join('index', 'index_static', 'data', 'public_data'))

def get_tips():
    tips = []
    with open(os.path.join('index', 'tips.txt'), 'r') as file:
        tip = file.readline()
        while len(tip) != 0:
            tips.append(tip)
            tip = file.readline()
    return tips