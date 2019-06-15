import json
from py2neo import Graph, Node, Relationship

# graph = Graph("http://localhost:7474",username="neo4j",password="000000")
# tx = graph.begin()
js = dict()
with open("./Trump.json", "rb") as file:
    data = file.read()
    js = json.loads(data)
#     nodes = js["nodes"]
#     links = js["links"]
#     for link in links:
#         s_node = Node(nodes[link["source"]]["type"], "label" = nodes[link["source"]]["label"])
#         print(s_node)
#         # tx.create(Relationship(Node(s_type, "label" = nodes[s_id]["label"], "life" = s_life), link_label, Node(t_type, "label" = nodes[t_id]["label"], "life" = t_life)))
#         # print(nodes[s_id]["label"], link["label"], nodes[t_id]["label"])
#     tx.commit()
import csv

csvf = open("nodes.csv", 'w', newline='', encoding="utf-8-sig")
w = csv.writer(csvf)
w.writerow(("id:ID", "label:LABEL", "label", "name", "life", "image"))
for node in js["nodes"]:
    life = ""
    try:
        life = node["life"]
    except:
        pass
    label = "default"
    try:
        label = node["label"]
    except:
        pass
    image = ""
    try:
        image = node["image"]
    except:
        pass
    w.writerow((node["id"], label, label, node["name"], life, image))
csvf.close()

csvf = open("links.csv", 'w', newline='', encoding="utf-8-sig")
w = csv.writer(csvf)
w.writerow((":START_ID", ":END_ID", "label:TYPE"))
for link in js["links"]:
    label = ""
    try:
        label = link["label"]
    except:
        pass
    w.writerow((int(link["source"]), int(link["target"]), link["label"]))
csvf.close()