import json
from index.neo4j import Neo4jToJson
from django.shortcuts import render
from django.http import HttpResponse

data_neo4j = Neo4jToJson()
# Create your views here.
def index(request):
    data = data_neo4j.start()
    return render(request, 'index.html', {'Dict': json.dumps(data)})

def post(request):
    if request.POST:
        node = request.POST["node"]
        data = data_neo4j.expand(node);
    return HttpResponse(json.dumps(data))