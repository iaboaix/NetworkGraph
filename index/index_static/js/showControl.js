/*
* @project: NetworkGraph
* @file: showControl.js
* @author: dangzhiteng
* @email: 642212607@qq.com
* @date: 2019.5.14
*/

var SHOWCONFIG = {
    "screen": false,
    "brush": false,
    "info": true,
    "bar_chart": false,
    "node_text": true,
    "link_text": false,
    "marker": true,
    "color": false,
    "tips": true,
    "right_box": {
        "comments-box": false,
        "public-data-box": false,
        "route-box": false,
        "setting-box": false,
    }
};

// 信息显示开关
d3.select("#info-show")
    .on("click", function() {
        d3.select(this).classed("high-light", SHOWCONFIG.info = !SHOWCONFIG.info);
        d3.select("#info-layout").style("animation", SHOWCONFIG.info === true ? "show-info 1s forwards" : "hide-info 1s forwards");
    });

// 贴心小提示显示开关
d3.select("#tips-button")
    .on("click", function() {
        d3.select(this).classed("high-light", SHOWCONFIG.tips = !SHOWCONFIG.tips);
        d3.select("#tips-layout").style("animation", SHOWCONFIG.tips === true ? "show-info 1s forwards" : "hide-info 1s forwards");
    });

// 柱状图显示开关
d3.select("#bar-graph-show")
    .on("click", function () {
        d3.select(this).classed("high-light", SHOWCONFIG.bar_chart = !SHOWCONFIG.bar_chart);
        d3.select("#bar-graph")
            .attr("transform", "translate(" + (window.innerWidth - BARCONFIG.width + 2) + ", " + 32 + ")")
        if (SHOWCONFIG.bar_chart === true) {
            bar_graph.style("animation", "show-bar-chart 1s forwards");
        }
        else {
            bar_graph.style("animation", "hide-bar-chart 1s forwards");
        }
    });

// 节点标签显示开关
d3.select("#node-button").on("click", function() {
        d3.select(this).classed("high-light", SHOWCONFIG.node_text = !SHOWCONFIG.node_text);
        node_layout.selectAll("text").style("display", SHOWCONFIG.node_text === true ? "block" : "none");
    });

// 关系标签显示开关
d3.select("#link-button")
    .on("click", function() {
        d3.select(this).classed("high-light", SHOWCONFIG.link_text = !SHOWCONFIG.link_text);
        text_layout.selectAll("text").style("display", SHOWCONFIG.link_text === true ? "block" : "none");
    });

// 箭头显示开关
d3.select("#marker-button")
    .on("click", function() {
        d3.select(this).classed("high-light", SHOWCONFIG.marker = !SHOWCONFIG.marker);
        link_layout.selectAll("marker")
            .select("path")
            .style("display", SHOWCONFIG.marker === true ? "block" : "none");
    });

function changeBoxState(box) {
    let need_show = true;
    Object.keys(SHOWCONFIG.right_box).forEach(key => {
        if (SHOWCONFIG.right_box[key] === true) {
            SHOWCONFIG.right_box[key] = false;
            d3.select("#" + key).style("animation", "hide-box 1s forwards");
            d3.select("#" + key.replace("box", "button")).classed("high-light", false);
            if (key === box) { 
                need_show = false;
            }
        }
    })
    if (need_show === true) {
        SHOWCONFIG.right_box[box] = true;
        d3.select("#" + box).style("animation", "show-box 1s forwards");
        d3.select("#" + box.replace("box", "button")).classed("high-light", true)
    }
}


// 留言面板显示开关
d3.select("#comments-button")
    .on("click", function() {
        changeBoxState("comments-box");
    });
comments_layout[0].scrollTop = comments_layout[0].scrollHeight;

// 公共数据面板显示开关
d3.select("#public-data-button")
    .on("click", function() {
        changeBoxState("public-data-box");
    });

// 设置面板显示开关
d3.selectAll("#setting-button")
    .on("click", function() {
        changeBoxState("setting-box");
    });

// 路径查找显示开关
d3.select("#route-button")
    .on("click", function() {
        changeBoxState("route-box");
    });

// 配色条显示开关
d3.select("#color-button")
    .on("click", function() {
        SHOWCONFIG.color = !SHOWCONFIG.color;
        d3.select(this)
            .style("animation", SHOWCONFIG.color === true ? "rotate ease-in 2s" : "rerotate ease-out 2s")
        d3.select("#color-layout")
            .style("animation", SHOWCONFIG.color === true ? "show-color-layout ease-in 2s forwards" : "hide-color-layout ease-out 2s forwards")
    });

// 全屏切换
d3.select("#screen-button")
    .on("click", function() {
        SHOWCONFIG.screen = !SHOWCONFIG.screen;
        SHOWCONFIG.screen === true ? enterFullScreen() : exitFullScreen();
        d3.select("#screen-switch")
            .attr("class", SHOWCONFIG.screen === true ? "fa fa-compress" : "fa fa-expand");
    });

// shift 点击切换框选
document.onkeydown = function(ev) {
    var e = ev || window.ev || arguments.callee.caller.arguments[0];
    if(e && e.keyCode === 16){
        SHOWCONFIG.brush = !SHOWCONFIG.brush;
        brush_svg.style("display", SHOWCONFIG.brush === true ? "block" : "none");
    }
};

//进入全屏
function enterFullScreen() {
    var de = document.documentElement;
    if (de.requestFullscreen) {
        de.requestFullscreen();
    } else if (de.mozRequestFullScreen) {
        de.mozRequestFullScreen();
    } else if (de.webkitRequestFullScreen) {
        de.webkitRequestFullScreen();
    }
}

//退出全屏
function exitFullScreen() {
    var de = document;
    if (de.exitFullscreen) {
        de.exitFullscreen();
    } else if (de.mozCancelFullScreen) {
        de.mozCancelFullScreen();
    } else if (de.webkitCancelFullScreen) {
        de.webkitCancelFullScreen();
    }
}