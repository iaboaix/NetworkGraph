import json

nodes = []
links = []
added_id = []
data = None
with open("relation.json", "r", encoding="utf-8-sig") as file:
	data = json.loads(file.read())
for item in data:
	id1 = str(item["id1"])
	id2 = str(item["id2"])
	name1 = str(item["name1"])
	name2 = str(item["name2"])
	if(item["id1"] not in added_id):
		added_id.append(id1)
		nodes.append({"id": id1, "name": name1, "image": name1 + "_" + id1 + ".jpg"})
	if(item["id2"] not in added_id):
		added_id.append(id2)
		nodes.append({"id": id2, "name": name2, "image": name2 + "_" + id2 + ".jpg"})
	links.append({"source": id1, "target": id2, "label": item["relationship"]})
with open("result.json", "w", encoding="utf8") as file:
	file.write(json.dumps({"nodes": nodes, "links": links}, ensure_ascii=False).replace("},", "},\n"))
		