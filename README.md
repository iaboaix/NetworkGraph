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
    <!-- 引入d3.v5.js 和 NetworkGraph.js --->
    <script type="text/javascript" src="d3.v5.js"></script>
    <script type="text/javascript" src="NetworkGraph.js"></script>
    <style>
        #vis {
            width: 500px;
            height: 500px;
            margin: 0 auto;
        }
    </style>
    <title>NetworkGraph</title>
</head>
<body>
    <!-- 创建一个 id 为 vis 的 div 容器 -->
    <div id="vis"></div>
    <script>
        var network = new NetworkGraph("#vis");
        var data = network.getDemoData();
        network.drawNetworkGraph(data);
    </script>
</body>
</html>
```
### 使用效果
![Image text](https://github.com/iaboaix/NetworkGraph/blob/master/others/NetworkGraph.jpg)