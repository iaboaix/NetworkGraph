from py2neo import Graph, Node, Relationship

class Neo4jToJson:

    def __init__(self):
        self.graph = Graph("http://localhost:7474",username="neo4j",password="000000")

    def start(self):
        results = self.graph.run("MATCH (p:Person{name: 'Lana Wachowski'})-[]->(m:Movie) " 
                                "RETURN m.title as movie, collect(p.name) as cast LIMIT 25")
        nodes = []
        rels = []
        for movie, cast in results:
            nodes.append({"id": movie, "label":movie, "type": "movie"})
            for name in cast:
                actor = {"id": name, "label":name, "type": "actor"}
                try:
                    source = nodes.index(actor)
                except ValueError:
                    nodes.append(actor)
                rels.append({"source": name, "target": movie, "label": "test"})
        return {"nodes": nodes, "links": rels}

    def expand(self, node):
        results = self.graph.run("MATCH (p:Person)-[]->(m:Movie{title: '" + node + "'}) "
                                "RETURN m.title as movie, p.name as cast LIMIT 25")
        nodes = []
        rels = []
        for movie, cast in results:
            actor = {"id": cast, "label":cast, "type": "actor"}
            nodes.append(actor)
            rels.append({"source": node, "target": cast, "label": "test"})
        return {"nodes": nodes, "links": rels}

if __name__ == '__main__':
    neo4j = Neo4jToJson()
    neo4j.post()