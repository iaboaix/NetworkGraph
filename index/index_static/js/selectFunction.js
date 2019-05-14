/*
* @project: NetworkGraph
* @file: selectFunction.js
* @author: dangzhiteng
* @email: 642212607@qq.com
* @date: 2019.5.14
*/

// 点击选中节点
function selectNode(node) {
    d3.select(this).classed("finded", false);
    // 右键菜单打开 停止布局计算
    if (d3.event.which == 3) {
        stopLayout();
    }
    node.selected = true;
    d3.select(this).classed("selected", true);
}

// 右键按条件选择节点
function selectNodes(type) {
    var selected_nodes = data.nodes.filter(function(node, i) {
        return node.selected;
    });
    var parent_nodes = [];
    if (type === 2) {
        data.links.forEach(function(link, i) {
            if ( selected_nodes.indexOf(link.target) > -1) { 
                link.source.selected = false;
                parent_nodes.push(link.source);
            }
        });
    }
    data.links.forEach(function(link, i) {
        // 选取中父节点
        if (selected_nodes.indexOf(link.target) > -1 && type == 0) {
            link.source.selected = true;
        }
        // 选取中子节点
        else if (selected_nodes.indexOf(link.source) > -1 && type == 1) {
            link.target.selected = true;
        }
        // 选取中同级
        else if (parent_nodes.indexOf(link.source) > -1 && type == 2) {
            link.target.selected = true;
        }
        // 选取中关联
        else if (selected_nodes.indexOf(link.source) > -1 && type == 3) { 
            link.target.selected = true;
        }
        else if (selected_nodes.indexOf(link.target) > -1 && type == 3) { 
            link.source.selected = true;
        }
    });
    refreshState();
}

// 刷新节点选中状态
function refreshState() {
    node_elements.each(function(node) {
        if(node.selected == true) {
            d3.select(this).classed("selected", true);
        }
    });
}

// 框选功能
data.nodes.forEach(function(d) {
    d.selected = false;
    d.previouslySelected = false;
});

var brush_event = d3.brush()
    .extent([[0, 0], [window.innerWidth, window.innerHeight]])
    .on("start", brushStarted)
    .on("brush", brushed)
    .on("end", brushEnded);

brush_svg.call(brush_event);

function brushStarted() {
    if (d3.event.sourceEvent.type !== "end") {
        node_elements.classed("selected", false);
        data.nodes.forEach(function(node) {
            node.selected = false;
        });
    }
}

function brushed() {
  if (d3.event.sourceEvent.type !== "end") {
    var selection = d3.event.selection;
    node_elements.classed("selected", function(d) {
      return d.selected = d.previouslySelected ^
        (selection != null
        && selection[0][0] <= d.x && d.x < selection[1][0]
        && selection[0][1] <= d.y && d.y < selection[1][1]);
    });
  }
}

function brushEnded() {
    if (d3.event.selection != null) {
      d3.select(this).call(d3.event.target.move, null);
    }
}