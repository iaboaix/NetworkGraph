import re
from py2neo import Graph, Node, Relationship

id_pattern = re.compile("\d+")

class Neo4jToJson:

    def __init__(self):
        self.graph = Graph("http://39.98.255.46:7474",username="neo4j",password="tcmsystem5652.")

    def start(self):
        return self.query("MATCH p=(){0}-[r:identification_and_combine]-{1}() RETURN p LIMIT 25")

    def expand(self, node):
        return self.query(node["id"])

    def query(self, sql):
        s_rels = self.graph.run(sql.format("", ">")).data()
        t_rels = list()
        relationships = s_rels + t_rels;
        nodes = list()
        rels = list()
        for rel in relationships:
            for node in rel['p'].nodes:
                temp_node = self.create_node(node)
                if(temp_node not in nodes):
                    nodes.append(temp_node)
            temp_rel = self.create_rel(rel['p'])
            if(temp_rel not in rels):
                rels.append(temp_rel)
        return {"nodes": nodes, "links": rels}

    def create_node(self, neo4j_node):
        id = re.findall(id_pattern, str(neo4j_node))[0]
        node = {"id": id}
        for key in neo4j_node:
            node[key] = neo4j_node[key]
        return node

    def create_rel(self, neo4j_rel):
        nums = re.findall(id_pattern, str(neo4j_rel))
        source = nums[0]
        target = nums[-1]
        return {"source": source, "target": target}

if __name__ == '__main__':
    neo4j = Neo4jToJson()
    print(neo4j.start())