/*
* @project: NetworkGraph
* @file: treeGraph.js
* @author: dangzhiteng
* @email: 642212607@qq.com
* @date: 2019.5.14
*/

function drawTree() {
    // var middleData = {};
    // var nodesBak = data.nodes.concat();
    // var linksBak = data.links.concat();
    // //将数据整理为树状结构
    // nodesBak.forEach(function(d) {
    //     if(d.id == 0){
    //         var temp = {
    //             name: d.id,
    //             children:[]
    //         };
    //         var treeData = toTreeData(linksBak);
    //         function toTreeData(data) {
    //             var pos={};
    //             var tree=[];
    //             var i=0;
    //             while(linksBak.length != 0){
    //                 if(linksBak[i].source.id == d.id){
    //                     tree.push({
    //                         name: linksBak[i].target.id,
    //                         children: []
    //                     });
    //                     pos[linksBak[i].target.id] = [tree.length-1];
    //                     linksBak.splice(i, 1);
    //                     i--;
    //                 } else {
    //                     var posArr = pos[linksBak[i].source.id];
    //                     if (posArr != undefined) {
    //                         var obj = tree[posArr[0]];
    //                         for(var j = 1; j < posArr.length; j++) {
    //                             obj = obj.children[posArr[j]];
    //                         }

    //                         obj.children.push({
    //                             name: linksBak[i].target.id,
    //                             children: []
    //                         });
    //                         pos[linksBak[i].target.id] = posArr.concat([obj.children.length-1]);
    //                         linksBak[i].splice(i,1);
    //                         i--;
    //                     }
    //                 }
    //                 i++;
    //                 if (i > linksBak.length - 1) {
    //                     i=0;
    //                 }
    //             }
    //             return tree;
    //         }
    //         temp.children = treeData;
    //         middleData = temp;
    //     }
    // });
    var tree_data = {
     "name": "0",
     "children": [
       {
        "name": "Interactive tools",
        "children": [
         {
          "name": "Browser-based",
          "children": [
           {
            "name": "Datawrapper",
           },
           {
            "name": "Google Sheets",
           },
           {
            "name": "plotly",
           },
           {
            "name": "RAW",
           }
          ]
         },
         {
          "name": "Desktop",
          "children": [
           {
            "name": "Tableau Desktop",
           },
           {
            "name": "Tableau Public",
           }
          ]
         }
        ]
       },
       {
        "name": "Coding",
        "children": [
         {
          "name": "JavaScript",
          "children": [
           {
            "name": "Charting libraries",
            "children": [
             {
              "name": "InfoVis"
             },
             {
              "name": "Mapping",
             },
             {
              "name": "MetricsGraphics.js"
             },
             {
              "name": "NVD3",
             },
             {
              "name": "Sigma",
             }
            ]
           }
          ]
         },
         {
          "name": "Other",
          "children": [
           {
            "name": "Python",
            "children": [
             {
              "name": "Bokeh" 
             }
            ]
           },
           {
            "name": "R",
            "children": [
             {
              "name": "Shiny"
             }
            ]
           }
          ]
         }
        ]
       }
     ]
    }
    //使用树状布局计算位置
    var tree = d3.tree()
        .size([450,450]);
    var tempNodes = tree.nodes(tree_data);
    //重启布局以改变位置
    force.start();
    force.on("tick",function(){
        //在运动前强制修改节点坐标为树状结构
        tempNodes.forEach(function(d, i) {
            nodes[d.name].x = d.x;
            nodes[d.name].y = d.y
        });
        node_elements.attr("transform", function(d) { return "translate(" + d.x + "," + (d.y + 10) + ")"; });
    })
}