var network_config = {
    "layout": "force",
    "calculating": true,
    "isBrush": false,
    "node_text_state": true,
    "link_text_state": false,
    "marker_state": true,
    "setting_state": false,
    "screen_state": false,
    "bar_state": false,
    "node_size": 15,
    "special": false,
    "node_charge": -300,
    "link_strength": 0.5,
    "line_type": 0,
    "info_show_state": true
}

var bar_config = {  
	width: 400,
	height: 300,
	top: 20, 
	bottom: 70, 
	left: 20, 
	right: 20,
}

var container = d3.select("#container");

var bar_graph = d3.select("#bar-graph")
        .attr("width", bar_config.width)
        .attr("height", bar_config.height)
        .style("opacity", 0);

var brush_svg = container.append("g")
        .attr("class", "brush-svg")
        .style("display", "none");

var network_graph = d3.select("#network-graph");

var defs_layout = network_graph.append("defs");

var temp_layout = network_graph.append("g")
        .attr("class", "temp-layout");

var link_layout = network_graph.append("g")
        .attr("class", "link-layout");

var text_layout = network_graph.append("g")
        .attr("class", "text-layout");

var node_layout = network_graph.append("g")
        .attr("class", "node-layout");

// 箭头
var marker = network_graph.append("marker")
    .attr("id", "resolved")
    .attr("markerUnits", "userSpaceOnUse")
    .attr("viewBox", "0 -5 10 10")//坐标系的区域
    .attr("refX", network_config.node_size + 7)//箭头坐标
    .attr("refY", 0)
    .attr("markerWidth", 18)//标识的大小
    .attr("markerHeight", 12)
    .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
    .attr("stroke-width", 2)//箭头宽度
    .append("path")
    .attr("class", "link")
    .attr("d", "M2,0 L0,-3 L9,0 L0,3 L2,0") //箭头的路径 
    .style("fill", "#00FFFB");

// 颜色比例尺
var color = d3.scaleOrdinal(d3.schemeCategory10);

// 请求图片 为典型场景分析准备
support_labels.forEach(function(label) {
    defs_layout.append("pattern")
        .attr("id", label)
        .attr("width", "100%")
        .attr("height", "100%")
        .append("image")
        .attr("width", network_config.node_size * 2)
        .attr("height", network_config.node_size * 2)
        .attr("xlink:href", "static/image/label/" + label + ".jpg");
})