/*
* @project: NetworkGraph
* @file: tools.js
* @author: dangzhiteng
* @email: 642212607@qq.com
* @date: 2019.5.14
*/

// 屏蔽右键菜单
document.oncontextmenu = function(ev) {
    ev.preventDefault();
}

// 圆内文字切分
function textBreaking(d3text, text) {
    var len = 0;
    try {
        len = text.length;
    } catch(error) {
        console.log("Warning: nodes缺少name标签！");
        return;
    }
    if (len <= 4) {
        d3text.append("tspan")
            .attr("x", 0)
            .attr("y", 2)
            .text(text);
    } else {
        var top_text = text.substring(0, 4);
        var mid_text = text.substring(4, 9);
        var bot_ext = text.substring(9, len);
        var top_y = -9;
        var mid_y = 2;
        var bot_y = 10;
        if (len < 10) {
            top_y += 5;
            mid_y += 5;
        } else {
            bot_ext = text.substring(9, 11) + "...";
        }

        d3text.text("");
        d3text.append("tspan")
            .attr("x", 0)
            .attr("y", top_y)
            .text(function () {
                return top_text;
            });
        d3text.append("tspan")
            .attr("x", 0)
            .attr("y", mid_y)
            .text(function () {
                return mid_text;
            });
        d3text.append("tspan")
            .attr("x", 0)
            .attr("y", bot_y)
            .text(function () {
                return bot_ext;
            });
    }
}

// 生成关系连线路径
function genLinkPath(link, link_type) {
    var path = null;
    var temp = 0;
    var sx = link.source.x;
    var sy = link.source.y;
    var tx = link.target.x;
    var ty = link.target.y;
    var dx = (tx - sx) / 8;
    var dy = (ty - sy) / 8;
    var x1 = sx + dx;
    var y1 = sy + dy;
    var x2 = sx + dx * 2;
    var y2 = sy + dy * 2;
    var x3 = sx + dx * 3;
    var y3 = sy + dy * 3;
    var x4 = sx + dx * 4;
    var y4 = sy + dy * 4;
    var x7 = sx + dx * 7;
    var y6 = sy + dy * 6;
    if (link_type === "slink") {
        path = "M" + sx + "," + sy + " L" + tx + "," + ty;
    }
    else if (link_type === "clink") {
        path = "M " + sx + "," + sy + " C" + x1 + "," + y2 + " " + x2 + "," + y3 + " " + x4 + "," + y4 + " S" + x7 + "," + y6 + " " + tx + "," + ty;
    }
    else if (link_type === "hlink") {
        path = "M " + sx + "," + sy + " L" + x4 + "," + sy + " " + " L" + x4 + "," + ty + " L" + tx + "," + ty;
    }
    else if (link_type === "vlink") {
        path = "M " + sx + "," + sy + " L" + sx + "," + y4 + " " + " L" + tx + "," + y4 + " L" + tx + "," + ty;
    }
    return path;
}

// 获取文字位置
function getLinkTextDx(link) {
    let sx = link.source.x;
    let sy = link.source.y;
    let tx = link.target.x;
    let ty = link.target.y;
    var distance = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
    return distance / 2;
}

d3.select("#background-color-button")
    .on("change", function() {
        container.style("background-color", this.value);
    })