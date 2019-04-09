import json
from index.neo4j import Neo4jToJson
from django.shortcuts import render
from django.http import HttpResponse

data_neo4j = Neo4jToJson()
# Create your views here.
def index(request):
    data = data_neo4j.start()
    support_type = ["default", "male", "female", "bus", "qq", "wechat", "phone",
    				"Donald-John-Trump", "us", "gemenary", "Ivanka-Trump",
    				"twitter", "美国财政部", "美国国务院", "美国联邦",
    				"美国国防部", "美国司法部"]
    return render(request, 'index.html', {
    	'List': json.dumps(support_type),
    	'Dict': json.dumps(data)
    	})

def expand(request):
    if request.POST:
        node = request.POST["node"]
        data = data_neo4j.expand(node)
    return HttpResponse(json.dumps(data))