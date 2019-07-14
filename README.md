# NetworkGraph

[![Demo](https://img.shields.io/badge/D3-NetworkGraph-green.svg)](http://148.70.238.152/)
[![Demo](https://img.shields.io/badge/QQ%E7%BE%A4-144973444-blue.svg)](https://jq.qq.com/?_wv=1027&k=5oRv4zr)
[![Demo](https://img.shields.io/badge/license-MIT-lightgrey.svg)](https://github.com/iaboaix/NetworkGraph/blob/master/LICENSE)

如果对您有帮助，请点击:star:  

## 项目预览
[http://148.70.238.152/](http://148.70.238.152/)  

## QQ群
[QQ群【D3网络图可视化】](https://jq.qq.com/?_wv=1027&k=5oRv4zr)  

## 系统预览
![Image text](https://github.com/iaboaix/NetworkGraph/blob/master/others/preview.jpg)

## NetworkGraph.js模块使用方法

### 下载最新模块
[NetworkGraph.min.js](https://github.com/iaboaix/NetworkGraph/blob/master/others/NetworkGraph/NetworkGraph.min.js)

### 示例代码
### 
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <script type="text/javascript" src="d3.js"></script>
    <script type="text/javascript" src="NetworkGraph.min.js"></script>
    <style>
        html {
            height: 100%;
        }
        body {
            width: 100%;
            height: 100%;
        }
        #vis {
            width: 100%;
            height: 100%;
            margin: 0 auto;
        }
    </style>
    <title>NetworkGraph</title>
</head>
<body>
    <svg id="vis"></svg>
    <script>
        var network_graph = new NetworkGraph("vis");
        var data0 = {
            "nodes": [
                { "id": 0, "label": "Person",  "size": 30 },
                { "id": 1, "label": "Company", "size": 10 },
                { "id": 2, "label": "Company", "size": 15 },
                { "id": 3, "label": "Company" }
            ],
            "links": [
                { "type": "EMPLOY", "source": 0, "target": 1 },
                { "type": "EMPLOY", "source": 1, "target": 2 },
                { "type": "EMPLOY", "source": 2, "target": 3 },
                { "type": "EMPLOY", "source": 0, "target": 2 }
            ]
        };
        var data1 = {
            "nodes": [
                { "id": 10, "label": "Person"  },
                { "id": 11, "label": "Company" },
                { "id": 12, "label": "Company" },
                { "id": 13, "label": "Company" },
                { "id": 14, "label": "Person"  },
                { "id": 15, "label": "Company" },
                { "id": 16, "label": "Company" },
                { "id": 17, "label": "Company" }
            ],
            "links": [
                { "type": "EMPLOY", "source": 10, "target": 11 },
                { "type": "EMPLOY", "source": 11, "target": 12 },
                { "type": "EMPLOY", "source": 12, "target": 13 },
                { "type": "EMPLOY", "source": 12, "target": 14 },
                { "type": "EMPLOY", "source": 15, "target": 16 },
                { "type": "EMPLOY", "source": 17, "target": 15 },
                { "type": "EMPLOY", "source": 11, "target": 15 },
                { "type": "EMPLOY", "source": 12, "target": 16 }
            ]
        };
        var links = [
            { "source": 0, "target": 10, "type": "0-10" },
            { "source": 1, "target": 11, "type": "1-11" }
        ]
        var graph0 = network_graph.drawNetworkGraph(data0, "force", 300, 400);
        var graph1 = network_graph.drawNetworkGraph(data1, "radius", 900, 400);
        graph1.connectGraph(graph0, links);
    </script>
</body>
</html>
```
### 使用效果
![Image text](https://github.com/iaboaix/NetworkGraph/blob/master/others/NetworkGraph.jpg)

## [Donate-打赏](Donate)
<a href="javascript:;" alt="微信"><img src="others/wechat.jpg" height="300" width="300"></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:;" alt="支付宝"><img src="others/alipay.jpg" height="300" width="300"></a>