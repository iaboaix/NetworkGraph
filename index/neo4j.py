from py2neo import Graph, Node, Relationship

class Neo4jToJson:

    def __init__(self):
        self.graph = Graph("http://localhost:7474",username="neo4j",password="000000")

    def start(self):
        return self.query_node("Donald-John-Trump", "Donald John Trump")

    def expand(self, node):
        return self.query_node(node["label"], node["name"])

    def query_node(self, label, name):
        s_rels = self.graph.run("MATCH r=(n:`{0}`)-[]->() WHERE n.name = '{1}' RETURN r" \
                    .format(label, name)).data()
        t_rels = self.graph.run("MATCH r=(n:`{0}`)<-[]-() WHERE n.name = '{1}' RETURN r" \
                    .format(label, name)).data()
        nodes = list()
        rels = list()
        for rel in s_rels:
            s_node = self.create_node(rel["r"].start_node)
            t_node = self.create_node(rel["r"].end_node)
            rel_label = list(rel["r"].relationships[0].types())[0]
            cur_rel = {"source": s_node["id"], "target": t_node["id"], "label": rel_label};
            if cur_rel not in rels:
                rels.append(cur_rel)
            if s_node not in nodes:
                nodes.append(s_node)
            if t_node not in nodes:
                nodes.append(t_node)
        for rel in t_rels:
            s_node = self.create_node(rel["r"].end_node)
            t_node = self.create_node(rel["r"].start_node)
            rel_label = list(rel["r"].relationships[0].types())[0]
            cur_rel = {"source": s_node["id"], "target": t_node["id"], "label": rel_label};
            if cur_rel not in rels:
                rels.append(cur_rel)
            if s_node not in nodes:
                nodes.append(s_node)
            if t_node not in nodes:
                nodes.append(t_node)
        return {"nodes": nodes, "links": rels}

    def create_node(self, neo4j_node):
        node = {"id": neo4j_node["id"], "label": neo4j_node["label"], "name": neo4j_node["name"]}
        try:
            node["life"] = neo4j_node["life"]
        except:
            pass
        return node


if __name__ == '__main__':
    neo4j = Neo4jToJson()
    print(neo4j.start())