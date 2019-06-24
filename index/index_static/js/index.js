/*
* @project: NetworkGraph
* @file: index.js
* @author: dangzhiteng
* @email: 642212607@qq.com
* @date: 2019.5.14
*/
var NETWORKCONFIG = {
    "layout_style": 0,       // 0: 力引导布局, 1: 圆布局, 2: 树布局
    "calculate_state": true, // 是否正在计算
    "analyse_mode": false,   // 分析模式
    "gravitation": 0.5,      // 吸引力
    "repulsion": -300,       // 排斥力
    "node_size": 15,         // 节点大小
    "node_color": "black",   // 节点颜色
    "node_opacity": "1",     // 节点透明度
    "link_width": 1,         // 边宽度
    "link_color": "#00FFFB", // 连线颜色
    "link_type": "slink",   // slink: 直线, curve: 曲线, hlink: 横直线, vlink: 竖直线
    "node_scale": 1,
    "link_scale": 1,
};

var BARCONFIG = {  
	"width": 400,
	"height": 300,
	"top": 20, 
	"bottom": 70, 
	"left": 20, 
	"right": 20,
}

var container = d3.select("#container");

var bar_graph = d3.select("#bar-graph")
        .attr("width", BARCONFIG.width)
        .attr("height", BARCONFIG.height)
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

// 颜色比例尺
var color = d3.scaleOrdinal(d3.schemeCategory10);

// 初始化配色条
var color_bar = d3.select("#color-bar");
for (var i = 0; i <= 1; i += 0.01) {
    color_bar.append("div")
        .attr("class", "color-item")
        .style("background-color", d3.interpolateSinebow(i));
}

d3.select("#background-select")
    .on("change", function() {
        let style = "";
        if (this.value !== "未选择") {
            style = "url(static/image/background/" + this.value + ")";
        } else {
            style = d3.select("#background-color-button").value;
        }
        container.style("background", style);
        container.style("background-size", "cover");
    })

var tip_id = 0;
setTip(0);
setInterval(() => {
    setTip((tip_id++) % 3);
}, 3000)

d3.selectAll(".tip-switch")
    .on("click", function() {
        setTip(tip_id = $(this)[0].id);
    }) 

function setTip(index) {
    $("#tips-content").html(tip_list[index]);
    $(".tip-switch").removeClass("tip-switch-high-light");
    $(".tip-switch").eq(index).addClass("tip-switch-high-light");
}

// 留言功能
var font_count = $("#font-count");
$("#user-comment").on("change", function() {
    font_count.text($(this).val().length);
});
$("#user-comment").on("keydown", function() {
    font_count.text($(this).val().length);
});
$("#user-comment").on("keyup", function() {
    font_count.text($(this).val().length);
});

$("#comment-button").on("click", () => {
    let username = $("#username")[0].textContent;
    let comment = $("#user-comment").val();
    $.post("comment", JSON.stringify({ "username": username, "comment-content": comment}), function(_, status){
        if (status === "success") {
            addComment(username, comment);
            $("#user-comment").val("");
        } else {
        	alert("留言失败！");
        }
    })
});

const comments_layout = $("#comments-layout");
function addComment(username, comment) {
	comments_layout.append(
        "<div class=\"comment-item\">\
            <div class=\"comment-user-title\">\
                <div class=\"comment-user-image\" style=\"background: url(static/image/userhead/" + username + ".jpg); background-size: cover;\">\
                </div><div class=\"comment-user-name\">" + username + "</div>\
                </div>\
            <div class=\"comment-content\">" + comment + "</div>\
            <div class=\"comment-time\">" + "刚刚" + "</div>\
        </div>"
    );
    comments_layout.animate({scrollTop: comments_layout[0].scrollHeight}, 1000);
}