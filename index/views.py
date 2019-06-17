import os
import json
import sqlite3
from time import strftime, localtime
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
        'tip_list': __get_tip_list__(),
        'file_list': __get_file_list__(),
        'background_list': __get_background_list__(),
        'comment_list': __get_comment_list__(),
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

def add_comment(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode())
        username = data['username']
        comment = data['comment-content']
        db_conn = sqlite3.connect('NetworkGraph.db')
        cursor = db_conn.cursor()
        sql = 'insert into Comments (username, comment, time) values ("{0}", "{1}", "{2}")' \
              .format(username, comment, strftime("%Y-%m-%d %H:%M:%S", localtime()))
        cursor.execute(sql)
        db_conn.commit()
    return HttpResponse(json.dumps({"status": True}))

def get_public_data(request):
    if request.method == 'POST':
        file_name = json.loads(request.body.decode())['file_name']
        with open(os.path.join('index', 'index_static', 'data', 'public_data', file_name), 'rb') as file:
            data = file.read()
            return HttpResponse(data)

def __get_file_list__():
    return os.listdir(os.path.join('index', 'index_static', 'data', 'public_data'))

def __get_tip_list__():
    tips = []
    with open(os.path.join('index', 'tips.txt'), 'r', encoding='utf8') as file:
        tip = file.readline()
        while len(tip) != 0:
            tips.append(tip)
            tip = file.readline()
    return tips

def __get_background_list__():
    background_list = []
    for background in os.listdir(os.path.join('index', 'index_static', 'image', 'background')):
        background_list.append(background)
    return background_list

def __get_comment_list__():
    db_conn = sqlite3.connect('NetworkGraph.db')
    cursor = db_conn.cursor()
    sql = 'select * from Comments'
    comment_list = cursor.execute(sql).fetchall()
    return comment_list

