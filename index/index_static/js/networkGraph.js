/*
* @project: NetworkGraph
* @file: networkGraph.js
* @author: dangzhiteng
* @email: 642212607@qq.com
* @date: 2019.5.14
*/

// 定义右键菜单选项
var node_menu = [
    [
        {
            text: "展开节点",
            func: function() {
                // id为节点id
                var id = Number($(this).attr("id"));
                var click_node = d3.select(this);
                var node_data = click_node.datum();
                if (node_data.border === true) {
                    alert("此节点为边界节点，无法展开。");
                }
                $.post("expand", JSON.stringify({ "node": { "label": node_data.label, "name": node_data.name} }), function(cur_data, status){
                    var cur_data = JSON.parse(cur_data);
                    var need_redraw = false;
                    cur_data.nodes.forEach(function(cur_node) {
                        var add = true;
                        data.nodes.forEach(function(node) {
                            if (cur_node.id === node.id) {
                                add = false;
                            }
                        })
                        if(add === true) { 
                            data.nodes.push(cur_node); 
                            need_redraw = true;
                        }
                    })
                    cur_data.links.forEach(function(cur_link) {
                        var add = true;
                        data.links.forEach(function(link) {
                            if (cur_link.source === link.source.id && cur_link.target === link.target.id) {
                                add = false;
                            }
                        })
                        if(add === true) { 
                            data.links.push(cur_link); 
                            need_redraw = true;
                        }
                    })
                    if (need_redraw === true) {
                        updateData(data);
                    }
                    else {
                        node_data["border"] = true;
                        click_node.append("text")
                            .attr("class", "tip")
                            .attr("transform", "translate(15, -15)")
                            .text("×");
                    }
                });
            }
        },
        {
            text: "创建关系",
            func: function() {
                var node_data = d3.select(this).datum();
                var drag_line = temp_layout.append("line")
                    .attr("stroke", "#00FFFB")
                    .style("stroke-width", 1)
                    .style("opacity", "0")
                    .attr("x1", node_data.x)
                    .attr("y1", node_data.y)
                    .attr("marker-end", "url(#resolved)");
                container.on("mousemove.add-link", function() {
                    translate_scale_rotate = getTranslateAndScaleAndRotate("#network-graph");
                    scale = translate_scale_rotate.k;
                    drag_line.attr("x2", (d3.event.x - translate_scale_rotate.x) / scale)
                        .attr("y2", (d3.event.y - translate_scale_rotate.y) / scale);
                    drag_line.style("opacity", 1);
                });
                node_elements.selectAll("circle")
                    .classed("cursor-target", true)
                    .on("click.add-link", function(node) {
                        drag_line.attr("x2", node.x)
                            .attr("y2", node.y);
                        var new_data = {"source": node_data.id, "target": node.id, "label": "test"};
                        data.links.push(new_data);
                        updateData(data);
                        drag_line.remove();
                        clearEvents();
                    });
            }
        },
        {
            text: "删除节点",
            func: function() {
                removeNode(d3.select(this).datum());
                updateData(data);
            }
        },
        {
            text: "选中父节点",
            func: function() {
                selectNodes(0);
            }
        },        
        {
            text: "选中子节点",
            func: function() {
                selectNodes(1);
            }
        },        
        {
            text: "选中同级",
            func: function() {
                selectNodes(2);
            }
        },        
        {
            text: "选中关联",
            func: function() {
                selectNodes(3);
            }
        }
    ]
];

var link_menu = [
    [
        {
            text: "删除关系",
            func: function() {
                this.remove();
                data.links.splice(d3.select(this).datum().index, 1);
                updateData(data);
            }
        }
    ]
];

var create_menu = [
    [
        {
            text: "创建节点",
            func: function() {
                var attr_table = d3.select("#attr-table")
                    .style("display", "block");
                var attr_tbody = attr_table.select("tbody");
                attr_tbody.selectAll("*").remove();
                attr_tbody.append("tr")
                    .append("td")
                    .text("节点属性设置")
                    .attr("colspan", 2)
                    .style("text-align", "center");
                var new_data = {};
                for (var attr in data.nodes[0]) {
                    if (["x", "y", "vx", "vy", "index", "selected", "previouslySelected", "color"].indexOf(attr) > -1) {
                        continue;
                    }
                    else {
                        new_data[attr] = null;
                        var cur_tr = attr_tbody.append("tr");
                        if (attr != "label") {
                            cur_tr.append("td")
                                .text(attr);
                            cur_tr.append("td")
                                .append("input")
                                .attr("id", attr);  
                        }
                        else {
                            cur_tr.append("td")   
                                .text("label");
                            var select = cur_tr.append("td")
                                .append("select")
                                .attr("id", attr);
                            support_labels.forEach(function(label) {
                                select.append("option")
                                    .text(label);
                            })
                        }

                    }
                }
                var button_layout = attr_tbody.append("tr")
                    .append("td")
                    .attr("colspan", 2)
                    .append("div");

                button_layout.append("button")
                    .text("确认")
                    .classed("attr-button", true)
                    .on("click", function() {
                        clearEvents();
                        attr_table.style("display", "none");
                        for (attr in new_data) {
                            new_data[attr] = document.getElementById(attr).value;
                        }
                        create_node(new_data);
                        clearEvents();
                    });
                button_layout.append("button")
                    .text("取消")
                    .classed("attr-button", true)
                    .on("click", function() {
                        attr_table.style("display", "none");
                    });
            }
        },
        {
            text: "全部展开",
            func: function() {
                alert("还没写");
            }
        }
    ]
];

// 初始化三个变量 节点/关系/关系文字/对象
var node_elements = null;
var link_elements = null;
var link_text_elements = null;

// 用来记录新建节点的 x y 坐标
var create_x = 0;
var create_y = 0;

var linkForce = d3.forceLink()
    .id(function (link) { return link.id })
    .strength(NETWORKCONFIG.link_strength);

var simulation = d3.forceSimulation()
    .force("link", linkForce)
    .on("end", function() {
        stopLayout();
    });

// 更新数据
updateData(data);

function updateData(data) {
    drawNetworkGraph(data);
    drawBarGraph(data);
}

function setNetworkInfo(data) {
    var network_info = d3.select("#network-info");
    network_info.selectAll(".info").remove();
    network_info.append("p")
        .attr("class", "info")
        .text("节点数目：" + data.nodes.length);
    network_info.append("p")
        .attr("class", "info")
        .text("关系数目：" + data.links.length);
}

function drawNetworkGraph(data) {
	setNetworkInfo(data);
    startLayout();
    if (NETWORKCONFIG.layout === 0) {
        linkForce.strength(NETWORKCONFIG.link_strength);
        simulation.alpha(1)
            .alphaDecay(0.002)
            .alphaMin(0.002)
            .force("r", null)
            .force("charge", d3.forceManyBody().strength(NETWORKCONFIG.node_charge).distanceMax(400))
            .force("center", d3.forceCenter((window.innerWidth - 30) / 2, (window.innerHeight - 30) / 2))
            .force("collision", d3.forceCollide(NETWORKCONFIG.node_size));
    }
    else if (NETWORKCONFIG.layout === 1){
        data.nodes.forEach(function(node) {
            node.x = 0;
            node.y = 0;
        })
        linkForce.strength(0);
        simulation.force("charge", d3.forceCollide().radius(NETWORKCONFIG.node_size * 1.5))
            .force("r", d3.forceRadial(300, (window.innerWidth - 30) / 2, (window.innerHeight - 30) / 2))
            .alpha(5)
            .alphaDecay(0.1)
            .alphaMin(0.02);
    }
    else if(NETWORKCONFIG.layout === 2) {
        drawTree();
    }

    // 连线对象
    link_elements = link_layout.selectAll("path")
        .data(data.links);
    link_elements.exit().remove();
    link_elements = link_elements.enter()
        .append("path")
        .attr("class", "link")
        .merge(link_elements)
        .attr("id", function(link, i){ return "link-" + i; })
        .on("mousedown.select-link", selectLink)
        .on("mouseover.hover-link", hoverLink);

    // 连线的文字
    link_text_elements = text_layout.selectAll("text")
        .data(data.links);
    link_text_elements.exit().remove();
    link_text_elements = link_text_elements.enter()
        .append("text")
        .attr("class", "link-text")
        .style("font-size", 10)
        .merge(link_text_elements)
        .style("display", SHOWCONFIG.link_text == true ? "block" : "none");
    link_text_elements.selectAll("textPath").remove();
    link_text_elements.append("textPath")
        .attr("xlink:href", function (link, i) { return "#link-" + i; })
        .text(function(link) { return link.label; });

    // 节点对象
    node_elements = node_layout.selectAll(".node")
        .data(data.nodes);
    node_elements.exit().remove();
    node_elements = node_elements.enter()
        .append("g")
        .attr("class", "node")
        .merge(node_elements)
        .on("mousedown.select-node", selectNode)
        .on("mouseover.hover-link", hoverNode)
        .call(d3.drag()
            .on("start", drag_start)
            .on("drag", draging)
            .on("end", drag_end));
    node_elements.selectAll("text").remove();
    node_elements.selectAll("circle").remove();
    node_elements.append("circle")
        .attr("r", NETWORKCONFIG.node_size);
    node_elements.append("text")
        .attr("class", "node-text")
        .attr("dy", ".35em")
        .attr("x", function (node) {
            return textBreaking(d3.select(this), node.name);
        })
        .style("display", SHOWCONFIG.node_text === true ? "block" : "none");
    node_elements.filter(function(node) { return node.border === true; })
        .append("text")
        .attr("class", "tip")
        .attr("transform", "translate(15, -15)")
        .text("x");
    fill_circle();

    simulation.nodes(data.nodes)
        .on("tick", tick)
        .force("link")
        .links(data.links);
    simulation.restart();

    // 绑定右键菜单
    $(".node").smartMenu(node_menu, {
        name: "node_menu"
    });
    $(".link").smartMenu(link_menu, {
        name: "link_menu"
    });
}

$("#container").smartMenu(create_menu, {
    name: "create_menu"
});

function tick() {
    node_elements.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    link_elements.attr("d", function(link) { return genLinkPath(link, NETWORKCONFIG.line_style); })
        .attr("marker-end", "url(#resolved)");
    link_text_elements.attr("dx", function(link) { return getLineTextDx(link); });
}

// 点击清空所有选中
container.on("click", function() {
    if (d3.event.ctrlKey === false) {
        d3.selectAll(".selected")
            .classed("selected", false);
        d3.selectAll(".finded")
            .classed("finded", false);
        d3.selectAll(".route")
            .classed("route", false);
        node_elements.each(function(d) {
            d.selected = false;
        });
    }
}).on("mousedown", function() {
    if (d3.event.which === 3) {
        create_x = d3.event.x;
        create_y = d3.event.y;
    }
});

// 清除所有临时绑定
function clearEvents() {
    container.on("mousemove.add-link", null);
    node_elements.selectAll("circle")
            .on("click.add-link", null)
            .classed("cursor-target", false);
    temp_layout.selectAll("line").remove();
}

// 新建节点
function create_node(node) {
    var translate_scale_rotate = getTranslateAndScaleAndRotate("#network-graph");
    node.x = (create_x - translate_scale_rotate.x) / translate_scale_rotate.k;
    node.y = (create_y - translate_scale_rotate.y) / translate_scale_rotate.k;
    data.nodes.push(node);
    updateData(data);
}

// 删除节点
function removeNode(node) {
    data.nodes.splice(node.index, 1);
    data.links = data.links.filter(function(link) {
        if (link.source !== node && link.target !== node) {
            return true;
        }
    });

    node_elements.filter(function(cur_node) {
        if (cur_node === node) {
            return true;
        }
    }).remove();

    link_elements.filter(function(link) {
        if (link.source === node || link.target === node) {
            return true;
        }
    }).remove();

    link_text_elements.filter(function(link) {
        if (link.source === node || link.target === node) {
            return true;
        }
    }).remove();
}

// 颜色标记
d3.selectAll(".color-item")
    .on("click", function() {
        var click_item = d3.select(this);
        markColor(click_item.style("background-color"));
        d3.select("#color-marker")
            .style("left", this.offsetLeft + 2 + "px")
            .style("color", click_item.style("background-color"));
    });

d3.select("#node-color").on("change", function () {
    markColor(this.value);
});

function markColor(color_value) {
    var select_elements = d3.selectAll(".selected");
    var find_elements = d3.selectAll(".finded");
    select_elements.each(function(node) {
        node["color"] = color_value;
    });
    find_elements.each(function(node) {
        node["color"] = color_value;
    });
    fill_circle();
}

// 调整图参数
// 节点大小
d3.select("#node-size").on("input propertychange", function() {
    NETWORKCONFIG.node_size = parseFloat(this.value);
    d3.select("marker").attr("refX", NETWORKCONFIG.node_size + 7);
    node_elements.selectAll("circle").attr("r", NETWORKCONFIG.node_size);
    d3.selectAll("image")
        .attr("width", NETWORKCONFIG.node_size * 2)
        .attr("height", NETWORKCONFIG.node_size * 2);
});

// 节点透明度
d3.select("#node-opacity").on("input propertychange", function() {
    node_elements.select("circle").style("fill-opacity", this.value);
});      

// 节点轮廓宽度
d3.select("#node-stroke").on("input propertychange", function() {
    node_elements.select("circle").style("stroke-width", this.value);
});

// 节点斥力
d3.select("#node-charge").on("input propertychange", function() {
    NETWORKCONFIG.node_charge = - this.value;
    simulation.force("charge", d3.forceManyBody().strength(NETWORKCONFIG.node_charge));
    startLayout();
});

// 连接强度
d3.select("#link-strength").on("input propertychange", function() {
    NETWORKCONFIG.link_strength = parseFloat(this.value);
    simulation.force("link").strength(NETWORKCONFIG.link_strength);
    startLayout();
});

// 关系线颜色
d3.select("#line-color").on("change", function() {
    d3.selectAll(".link")
        .style("stroke", this.value);
    d3.select("marker")
        .select("path")
        .style("fill", this.value)
        .style("stroke", this.value);
});

// 关系线宽
d3.select("#line-stroke-width").on("input propertychange", function() {
    link_elements.style("stroke-width", this.value);
});

// 连线样式
var line_style_buttons = d3.selectAll(".line-style");
line_style_buttons.on("click", function() {
        line_style_buttons.classed("high-light", false);
        d3.select(this).classed("high-light", true);
        NETWORKCONFIG.line_style = this.value;
        tick();
    });

// 布局切换开关
var layout_switch_buttons = d3.selectAll(".layout-switch");
layout_switch_buttons.on("click", function() {
        if (this.value === "2") {
            alert("点击右下方进入github协助完成树图布局。");
            return;
        }
        layout_switch_buttons.classed("high-light", false);
        d3.select(this).classed("high-light", true)
        NETWORKCONFIG.layout = parseInt(this.value);
        drawNetworkGraph(data);
    })

function fill_circle() {
    if (NETWORKCONFIG.special === true) {
        node_elements.select("circle")
            .style("fill", function(node) {
                return (node.label != "undefined" && support_labels.indexOf(node.label) > -1) ? "url(#" + node.label + ")" : "url(#default)";
            })
            .style("stroke", function(node) {
                if ("color" in node) {
                    return node.color;
                }
                else {
                    var color_index = support_labels.indexOf(node.label);
                    node["color"] = color(color_index > -1 ? color_index : 0);
                    return node.color;
                }
            });
    }
    else {
        node_elements.select("circle")
            .style("fill", function(node) {
                if ("color" in node) {
                    return node.color;
                }
                else {
                    var color_index = support_labels.indexOf(node.label);
                    node["color"] = color( color_index > -1 ? color_index : 0);
                    return node.color;
                }
            })
            .style("stroke", function(node) {
                return "white";
            });
    }
}

// 节点拖拽
function drag_start(node) {
    stopLayout();
    d3.event.sourceEvent.stopPropagation();
}

function draging(node) {
    node_elements.filter(function(d) { return d.selected; })
        .each(function (node) {
            node.x += d3.event.dx;
            node.y += d3.event.dy;
            d3.select(this).attr("transform", "translate(" + node.x + "," + node.y + ")");
        });
    link_elements.attr("d", function(link) { return genLinkPath(link, NETWORKCONFIG.line_style); });
    link_text_elements.attr("dx", function(link) { return getLineTextDx(link); });
}

function drag_end(node) {
    if (!d3.event.sourceEvent.ctrlKey) {
        node.selected = false;
        d3.select(this).classed("selected", false);
    }
}

// 布局 开始/暂停 按钮
d3.select("#stop-button").on("click", function() {
    NETWORKCONFIG.calculating === true ? stopLayout() : startLayout();
});

// 开始布局
function startLayout() {
    NETWORKCONFIG.calculating = true;
    d3.select("#network-status").style("animation", "calc ease 1s infinite");
    d3.select("#stop-button-text").text("停止布局");
    simulation.alpha(1).restart();
}

// 停止布局
function stopLayout() {
    NETWORKCONFIG.calculating = false;
    d3.select("#network-status").style("animation", "none");
    d3.select("#stop-button-text").text("重新布局");
    simulation.stop();
}

// 掠过显示节点信息
function hoverNode(node) {
    var node_info = d3.select("#node-info");
    node_info.selectAll(".info").remove();
    var exclude_attr = ["x", "y", "vx", "vy", "selected", "previouslySelected", "color"];
    for (var key in node) {
        if (exclude_attr.indexOf(key.toString()) != -1) {
            continue;
        }
        node_info.append("p")
            .attr("class", "info")
            .text(key + ": " + node[key]);
    }
}

// 点击选中关系
function selectLink(link) {
    link.selected = true;
    d3.select(this).classed("selected", true);
}

// 掠过显示关系信息
function hoverLink(link) {
    var link_info = d3.select("#link-info");
    link_info.selectAll(".info").remove();
    var exclude_attr = ["x", "y", "vx", "vy", "index", "selected", "previouslySelected"];
    for(var key in link){
        // 可用来排除一些属性
        // if(exclude_attr.indexOf(item.toString()) != -1) {
        //     continue;
        // }
        var temp = link_info.append("p")
            .attr("class", "info");
        if (key != "source" && key != "target") {
            temp.text(key + ": " + link[key]);
        }
        else {
            temp.text(key + ": " + link[key]["label"]);
        }                    
    }
}

// 查找节点
d3.select("#search-line")
    .on("keypress", function() {
        if (d3.event.key === "Enter") {
            find_node_name();
        }
    });
d3.select("#search-button")
    .on("click", find_node_name);

function find_node_name() {
    var node_name = $("#search-line").val();
    var is_find = false;
    node_elements.each(function(node) {
        if (node.name === node_name) {
            d3.select(this).classed("finded", true);
            is_find = true;
        }
    })
    if (is_find === false) {
        alert("未查找到此节点");
    }
}

// 切换分析模式
d3.select("#analyse-button")
    .on("click", function() {
        NETWORKCONFIG.special = !NETWORKCONFIG.special;
        d3.select("#analyse-switch").attr("class", NETWORKCONFIG.special === true ? "fa fa-toggle-on" : "fa fa-toggle-off");
        fill_circle();
    });

// 最短路径查找
d3.select("#begin-find")
    .on("click", function() {
        var source_index = parseInt($("#source-node-index").val());
        var target_index = parseInt($("#target-node-index").val());
        if (source_index === "" || target_index === "" || source_index === "NAN" || target_index === "NAN") {
            alert("请正确输入源节点和目标节点index！");
            return
        }
        var paths = find_route(data, source_index, target_index);
        paths.forEach(function(path) {
            link_elements.each(function(link) {
                if ((path.indexOf(link.source.index) > -1) && (path.indexOf(link.target.index) > -1)) {
                    d3.select(this).classed("route", true);
                }
            });
        });
    });

// 渐变 先不用
// radial_gradient = defs_layout.append("radialGradient")
//     .attr("id", "orange_red")
//     .attr("cx", "50%")
//     .attr("cy", "50%")
//     .attr("r", "50%")
//     .attr("fx", "50%")
//     .attr("fy", "50%");
// radial_gradient.append("stop")
//     .attr("offset", "0%")
//     .attr("stop-color", "blue");
// radial_gradient.append("stop")
//     .attr("offset", "50%")
//     .attr("stop-color", "orange");
// radial_gradient.append("stop")
//     .attr("offset", "100%")
//     .attr("stop-color", "red");