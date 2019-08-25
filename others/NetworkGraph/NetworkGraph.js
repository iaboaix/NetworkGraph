/*
* @project: NetworkGraph
* @file: NetworkGraph.js
* @author: dangzhiteng
* @email: 642212607@qq.com
* @date: 2019.7.12
*/

(function() {

    const DEFAULT = {
        "graph": {
            "layout_mode": "force",  // force: 力引导布局  radius: 圆布局
            "analyse_mode": false,   // 是否为场景分析
            "gravitation": 0.03,     // 吸引力
            "repulsion": -400,       // 排斥力
            "calculate_state": true, // 是否正在计算
        },
        "node": {
            "node_scale": 1,         // 节点缩放比例
            "node_size": 25,         // 节点大小
            "node_color": "black",   // 节点颜色
            "node_opacity": "1",     // 节点透明度
            "fill": "label"          // 节点文字填充字段
        },
        "link": {
            "link_scale": 1,         // 边宽缩放比例
            "link_width": 2,         // 边宽度
            "link_color": "#00FFFB", // 连线颜色
        },
        "show_status": {
            "node_text": true,
            "link_text": true,
            "marker": true
        }
    };

    var graph_count = -1;

    const DATA_DEMO = {
        "nodes": [
            {
                "id": 0,
                "label": "Person",
                "size": 30,
                "properties": {
                    "role": "自然人股东",
                    "name": "刘德",
                    "image": "http://148.70.238.152/static/image/github.png"
                }
            },
            {
                "id": 1,
                "label": "Company",
                "size": 10,
                "properties": {
                    "registCapi": "5000.000",
                    "name": "有品信息科技有限公司",
                    "econKind": "有限责任公司(自然人投资或控股)",
                    "status": "存续"
                }
            },
            {
                "id": 2,
                "size": 15,
                "label": "Company",
                "properties": {
                    "name": "有品信息科技有限公司",
                }
            },
            {
                "id": 3,
                "label": "Company",
                "properties": {
                    "registCapi": "5000.000",
                }
            }
        ],
        "links": [
            {
                "type": "EMPLOY",
                "source": 0,
                "target": 1,
                "properties": {
                    "role": "董事"
                }
            },
            {
                "type": "EMPLOY",
                "source": 1,
                "target": 2,
                "properties": {
                    "role": "董事"
                }
            },
            {
                "type": "EMPLOY",
                "source": 2,
                "target": 3,
                "properties": {
                    "role": "董事"
                }
            },
            {
                "type": "EMPLOY",
                "source": 0,
                "target": 2,
                "properties": {
                    "role": "董事"
                }
            }
        ]
    };

    function getDemoData() {
        return DATA_DEMO;
    }

    // 绘制网络图
    function drawNetworkGraph(data, settings, x, y) {
        let cur_settings = {};
        Object.keys(DEFAULT).forEach(setting => {
            if(typeof settings[setting] !== "undefined") {
                cur_settings[setting] = Object.assign({}, DEFAULT[setting], settings[setting]);
            } else {
                cur_settings[setting] = Object.assign({}, DEFAULT[setting]);
            }
        })
        graph_count += 1;
        let graph_index = graph_count;
        let __data__ = {"nodes": [], "links": []};
        __data__ = JSON.parse(JSON.stringify(typeof data !== "undefined" ? data : __data__));

        let center_x = typeof arguments[2] !== "undefined" ? x : svg_rect.width  / 2;
        let center_y = typeof arguments[3] !== "undefined" ? y : svg_rect.height / 2;
        // 力导引布局模拟力
        let force_simulation = d3.forceSimulation()
            .alpha(1)
            .alphaDecay(0.002)
            .alphaMin(0.002)
            .force("r", null)
            .force("center", d3.forceCenter(center_x, center_y))
            .force("link", d3.forceLink().id(node => node.id).strength(cur_settings.graph.gravitation))
            .force("charge", d3.forceManyBody().strength(cur_settings.graph.repulsion))
            .force("collision", d3.forceCollide(cur_settings.node.node_size))
            .on("tick", __tick__)
            .on("end", function() {
                stopLayout();
            });
        
        // 圆布局模拟力
        let radius_simulation = d3.forceSimulation()
            .alpha(1)
            .alphaDecay(0.01)
            .alphaMin(0.002)
            .force("r", d3.forceRadial(100, center_x, center_y))
            .force("center", d3.forceCenter(center_x, center_y))
            .force("link", d3.forceLink().id(node => node.id).strength(0))
            .force("collision", d3.forceCollide(cur_settings.node.node_size))
            .on("tick", __tick__)
            .on("end", function() {
                stopLayout();
            });
        
        // 初始化
        let network_graph = container.append("g")
                .attr("id", "network_graph")
                .style("user-select", "none")
                .style("font-size", 7)
                .style("text-anchor", "middle");

        // 添加缩放
        vis.call(d3.zoom()
                .scaleExtent([0.1,10])
                .on("zoom", () => {
                    container.attr("transform", d3.event.transform);
                }))
            .on("dblclick.zoom", null);

        network_graph.append("g").attr("id", "temp_layout");
        network_graph.append("g").attr("id", "link_layout");
        network_graph.append("g").attr("id", "node_layout");
        let defs_layout = network_graph.append("g").attr("id", "defs_layout");
        defs_layout.append("pattern")
            .attr("id", "pattern-0")
            .append("image")
            .attr("xlink:href", graph_image);
        defs_layout.append("pattern")
            .attr("id", "pattern-1")
            .append("image")
            .attr("xlink:href", link_image);
        defs_layout.append("pattern")
            .attr("id", "pattern-2")
            .append("image")
            .attr("xlink:href", remove_image);
        defs_layout.selectAll("pattern")
            .attr("width", "100%")
            .attr("height", "100%")
            .select("image")
            .attr("width", 20)
            .attr("height", 20);
                
        let node_elements = [];
        let link_elements = [];
        __updateData__(__data__);

        function __tick__() {
            node_elements.attr("transform", node => "translate(" + node.x + "," + node.y + ")");
            link_elements.select(".link-path")
                .attr("d", link => __getLinkPath__(link));
            link_elements.select("text")
                .attr("dx", link => __getLinkTextDx__(link))
                // .attr("dy", link => __getLinkTextDy__(link))
                // .attr("transform", link => __getLinkTextRotate__(link));
            if (connect_elements.length !== 0) {
                connect_elements.select(".link-path")
                    .attr("d", link => __getLinkPath__(link));
                connect_elements.selectAll(".link")
                    .select("text").attr("dx", link => __getLinkTextDx__(link))
                    // .attr("dy", link => __getLinkTextDy__(link))
                    // .attr("transform", link => __getLinkTextRotate__(link));
            }
        }

        // 绘制节点
        function __drawNodes__(nodes) {
            node_elements = network_graph.select("#node_layout")
                .selectAll("g")
                .data(nodes);
            node_elements.exit().remove();
            let node_elements_enter = node_elements.enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", node => {
                    return ("x" in node) && ("y" in node) ? "translate(" + node.x + ", " + node.y + ")" : "";
                })
                .on("mousedown.select-node", __selectNode__)
                .on("mouseenter.enter-node", __enterNode__)
                .on("mouseleave.leave-node", __leaveNode__)
                .on("dblclick", __showMenu__)
                .call(d3.drag()
                    .on("start", __dragStart__)
                    .on("drag", __draging__)
                    .on("end", __dragEnd__));

            // 背景圆
            node_elements_enter.append("circle")
                .attr("class", "background-circle")
                .style("cursor", "move")
                .style("stroke-opacity", "0")
                .style("stroke-width", "16px")
                .style("stroke", "#68bdf6bf");

            // 节点圆
            node_elements_enter.append("circle")
                .attr("class", "foreground-circle")
                .style("fill", "#1e98ce")
                .style("cursor", "move")
                .style("stroke-width", "3px")
                .style("stroke", "#18769f");

            node_elements = node_elements.merge(node_elements_enter);
            node_elements.selectAll("circle")
                .attr("r", node => {
                    if(!("size" in node)) {
                        node["size"] = cur_settings.node.node_size;
                    }
                    return node.size * cur_settings.node.node_scale;
                });
            fillText();
        }

        // 填充节点内的文字
        function fillText() {
            node_elements.select("text").remove();
            node_elements.filter(node => { return typeof node.label !== "undefined" ? true : false})
                .append("text")
                .text(node => (typeof node[cur_settings.node.fill] !== "undefined" ? node[cur_settings.node.fill] : node.label) + "")
                .attr("x", function (node) {
                    return __textBreaking__(d3.select(this), 
                        (typeof node[cur_settings.node.fill] !== "undefined" ? node[cur_settings.node.fill] : node.label) + "");
                })
                .attr("dy", ".35em")
                .style("display", cur_settings.show_status.node_text === true ? "block" : "none")
                .style("pointer-events", "none")
                .style("fill", "white");
        }

        // 切割文字
        function __textBreaking__(d3text, text) {
            var len = text.length;
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
                    .text(top_text);
                d3text.append("tspan")
                    .attr("x", 0)
                    .attr("y", mid_y)
                    .text(mid_text);
                d3text.append("tspan")
                    .attr("x", 0)
                    .attr("y", bot_y)
                    .text(bot_ext);
            }
        }

        // 绘制关系
        function __drawLinks__(links, element) {
            // 重置 link 的 path_count、 path_index 字段
            links.forEach(link => {
                link["path_count"] = 1;
                link["path_index"] = 0;
                link["reverse"] = false;
            });
            // 更新 link 的 path_count、 path_index 字段
            for(let i = 1; i < links.length; i++) {
                for(let j = 0; j < i; j++) {
                    if (links[j].source === links[i].source && links[j].target === links[i].target) {
                        links[i].path_count = links[j].path_count += 1;
                        links[i].path_index = links[i].path_count - 1;
                    } else if(links[j].source === links[i].target && links[j].target === links[i].source) {
                        links[i].path_count = links[j].path_count += 1;
                        links[i].path_index = links[i].path_count - 1;
                        links[i].reverse = true;
                    }
                }
            }
            let temp_link_elements = element.selectAll("g")
                .data(links);
                temp_link_elements.exit().remove();
            let temp_link_elements_enter = temp_link_elements.enter()
                .append("g")
                .attr("class", "link");
            temp_link_elements_enter.append("path")
                .attr("class", "link-path")
                .style("fill", "none")
                .style("cursor", "pointer")
                .style("stroke", "#6f7071");
            temp_link_elements_enter.append("marker")
                .attr("class", "link-marker")
                .attr("markerUnits", "userSpaceOnUse")
                .attr("viewBox", "0 -50 100 100")//坐标系的区域
                .attr("refY", 0)
                .attr("markerWidth", 12)//标识的大小
                .attr("markerHeight", 12)
                .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
                .append("path")
                .attr("d", "M20,0 L0,-30 L90,0 L0,30 L20,0") //箭头的路径 
                .style("fill", "#000000");
            temp_link_elements_enter.append("text")
                .attr("class", "link-text")
                .attr("dx", link => __getLinkTextDx__(link))
                .attr("dy", 4)
                // .attr("transform", link => __getLinkTextRotate__(link))
                .append("textPath")
                .style("font-size", "10px")
                .style("fill", "#000000")
                .style("display", cur_settings.show_status.link_text === true ? "block" : "none");
            temp_link_elements = temp_link_elements.merge(temp_link_elements_enter)
            temp_link_elements.select("marker")
                .attr("id", link => "marker-" + graph_index + "-" + link.index)
                .attr("refX", link => link.target.size * 10 + 70);
            temp_link_elements.select(".link-path")
                .attr("id", link => "link" + graph_index + "-" + link.index)
                .attr("d", link => __getLinkPath__(link))
                .attr("marker-end", link => "url(#marker-" + graph_index + "-" + link.index + ")")
                .style("stroke-width", link => {
                    if(!("width" in link)) {
                        link["width"] = cur_settings.link.link_width;
                    }
                    return link.width;
                })
                .on("mousedown.select-link", __selectLink__)
                .on("mouseover.hover-link", __hoverLink__);
            temp_link_elements.select("textPath")
                .text(link => link.type)
                .attr("href", link => "#link" + graph_index + "-" + link.index);
            arguments[2] ? connect_elements = temp_link_elements : link_elements = temp_link_elements;
        }

        function __selectNode__(node) {
            stopLayout();
            node["selected"] = true;
            d3.select(this).classed("selected", true);
        }

        // 显示菜单
        function __showMenu__(node) {
            stopLayout();
            // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
            // rx：x轴半径
            // ry：y轴半径
            // x-axis-rotation：指椭圆的X轴与水平方向顺时针方向夹角，可以想像成一个水平的椭圆绕中心点顺时针旋转的角度
            // large-arc-flag：1表示大角度弧线，0为小角度弧线。
            // sweep-flag：1为顺时针方向，0为逆时针方向
            // x：结束点x坐标
            // y：结束点y坐标
            let r_min = (node.size ? node.size : cur_settings.node.size) + 8;
            let r_max = r_min + 30;
            let p0x   = Math.cos(175 / 360 * Math.PI);
            let p0y   = Math.sin(175 / 360 * Math.PI);
            let p1x   = Math.cos( 55 / 360 * Math.PI);
            let p1y   = Math.sin( 55 / 360 * Math.PI);
            let b     = -(2 * p1x + 2 * Math.sqrt(3) * p1y);
            let c     = Math.pow(p1x, 2) + 3 * Math.pow(p1y, 2) + 2 * Math.sqrt(3) * p1x * p1y - 3 * Math.pow(r_max, 2);
            let p2x   = (Math.sqrt(Math.pow(b, 2) - 16 * c) - b) / 8;
            let p2y   = Math.sqrt(Math.pow(r_max, 2) - Math.pow(p2x, 2));
            let p3x   = p0x;
            let p3y   = Math.sqrt(1 - Math.pow(p3x, 2));;
            let path = "M" + (r_min * p0x) + ", -" + (r_min * p0y) + " " +
                        "A" + r_min + ", " + r_min + " 0 0, 1 " + (r_min * p1x) + ", " + (r_min * p1y) +
                        "L" + p2x + "," + p2y + " " +
                        "A" + r_max + ", " + r_max + " 0 0, 0 " + (r_max * p3x) + ", -" + (r_max * p3y) + 
                        "L" + (r_min * p0x) + ",-" + (r_min * p0y);
            d3.selectAll(".menu").remove();
            let menu_items = d3.select(this)
                .selectAll(".menu")
                .data([0, 1, 2])
                .enter()
                .append("g")
                .attr("class", "menu");
            menu_items.append("path")
                .attr("id", (_, i) => "menu-path" + i)
                .attr("d", path)
                .attr("transform", (_, i) => "rotate(" + (i * 120) + " 0, 0)")
                .style("fill", "#bcbcbc")
                .style("stroke", "#000000")
                .style("stroke-width", 0)
                .on("mouseenter", function () {
                    d3.select(this)
                        .style("stroke-width", 1)
                        .style("fill", "#bcbcbca1");
                })
                .on("mouseleave", function() {
                    d3.select(this)
                        .style("stroke-width", 0)
                        .style("fill", "#bcbcbc");
                })
                .on("click.menu", function(menu) {
                    let source_node = d3.select(this.parentNode.parentNode).datum();
                    if (menu === 0) {
                        __expandNode__(node);
                    } else if (menu === 1) {
                        let drag_line = d3.select("#temp_layout")
                            .append("line")
                            .attr("x1", node.x)
                            .attr("y1", node.y)
                            .style("stroke", "#6f7071")
                            .style("stroke-width", "2px")
                            .style("opacity", "0");
                        vis.on("mousemove.add-link", () => {
                                let translate_scale_rotate = __getTranslateAndScaleAndRotate__("#container");
                                let scale = translate_scale_rotate.k;
                                drag_line.attr("x2", (d3.event.x - svg_rect.x - translate_scale_rotate.x) / scale)
                                    .attr("y2", (d3.event.y - svg_rect.y - translate_scale_rotate.y) / scale);
                                drag_line.style("opacity", 1);
                            });
                        node_elements.selectAll("circle")
                            .style("cursor", "pointer")
                            .on("click.add-link", target_node => {
                                drag_line.remove();
                                vis.on("mousemove.add-link", null);
                                node_elements.selectAll("circle")
                                    .style("cursor", "move")
                                    .on("click.add-link", null);
                                addLink(source_node, target_node, "TEST");
                            });
                    } else if (menu === 2) {
                        removeNode(node);
                    }
                });
            menu_items.append("rect")
                .attr("class", "menu-icon")
                .attr("id", (_, i) => "menu-icon-" + i)
                .attr("width", "20")
                .attr("height", "20")
                .style("fill", (_, i) => "url(#pattern-" + i + ")")
                .style("pointer-events", "none");
            d3.select("#menu-icon-0")
                .attr("transform", "translate(" + (r_max - 28) + ", -" + (6 * r_max / 16) + ")");
            d3.select("#menu-icon-1")
                .attr("transform", "translate(-10," + (r_max - 28) + ")");
            d3.select("#menu-icon-2")
                .attr("transform", "translate(" + (7 - r_max) + ", -" + (6 * r_max / 16) + ")");
        }

        // 进入节点
        function __enterNode__(node) {
            d3.select(this)
                .select(".background-circle")
                .style("stroke-opacity", 0.8);
        }

        // 离开节点
        function __leaveNode__(node) {
            d3.select(this)
                .select(".background-circle")
                .style("stroke-opacity", 0);
        }

        // 扩展节点
        function __expandNode__(node) {
            console.log(node);
        }

        function __selectLink__() {

        }

        function __hoverLink__() {

        }

        // 记录拖拽的节点和相关联的边 提高效率
        var drag_check = false,
            drag_nodes = [],
            rela_links = [];

        // 节点拖拽
        function __dragStart__(node) {
            d3.event.sourceEvent.stopPropagation();
            stopLayout();
            drag_nodes = node_elements.filter(node => node.selected);
            rela_links = link_elements.filter(link => {
                let check = false;
                drag_nodes.each(node => {
                    if (node.id === link.source.id || node.id === link.target.id) {
                        check = true;
                    }
                })
                return check;
            });
        }

        function __draging__(node) {
            drag_nodes.attr("transform", node => 
                "translate(" + (node.x += d3.event.dx) + "," + (node.y += d3.event.dy) + ")");
            rela_links.select("path")
                .attr("d", link => __getLinkPath__(link));
            rela_links.select("text")
                .attr("dx", link => __getLinkTextDx__(link))
                // .attr("dy", link => __getLinkTextDy__(link))
                // .attr("transform", link => __getLinkTextRotate__(link));
            if(drag_check === false) {
                __lowLight__(node_elements, drag_nodes);
                __lowLight__(link_elements, rela_links);
                drag_check = true;
            }
            if (connect_elements.length !== 0) {
                connect_elements.select(".link-path")
                    .attr("d", link => __getLinkPath__(link));
                connect_elements.select("text")
                    .attr("dx", link => __getLinkTextDx__(link))
                    // .attr("dy", link => __getLinkTextDy__(link))
                    // .attr("transform", link => __getLinkTextRotate__(link));
            }
        }

        function __dragEnd__(node) {
            d3.event.sourceEvent.stopPropagation();
            if (!d3.event.sourceEvent.ctrlKey) {
                node.selected = false;
                d3.select(this).classed("selected", false);
            }
            node_elements.style("opacity", 1);
            link_elements.style("opacity", 1);
            drag_check = false;
        }

        function __lowLight__(selection_all, selection_part) {
            selection_all.style("opacity", 0.3);
            selection_part.style("opacity", 1);
        }

        // 生成关系连线路径
        function __getLinkPath__(link) {
            let path = "";
            let sx = link.source.x;
            let sy = link.source.y;
            let tx = link.target.x;
            let ty = link.target.y;
            if(link.source === link.target){  
                let dr = 30 / link.path_count;  
                path = "M" + sx + ", " + sy + "A" + dr + ", " + dr + " 0 1,1 " + tx + ", " + (ty + 1);  
            }else if(link.path_count % 2 === 1 && link.path_index === 0){
                path = "M" + sx + "," + sy + " L" + tx + "," + ty;
            } else {
                let dx = link.target.x - link.source.x
                let dy = link.target.y - link.source.y
                let index = link.path_index;
                if (link.path_count % 2 === 1) {
                    index -= 1;
                }
                let r = Math.sqrt(dx * dx + dy * dy) * Math.ceil((index + 1) / 2);
                let sweep = Math.pow(-1, link.path_index) === -1 ? 0 : 1;
                if (link.reverse === true) {
                    sweep = sweep === 0 ? 1 : 0;
                }
                path = "M" + sx + "," + sy + "A" + r + "," + r + " 0 0, " + sweep + " " + tx + "," + ty;
            }
            return path;
        }

        // 获取文字位置
        function __getLinkTextDx__(link) {
            let sx = link.source.x;
            let sy = link.source.y;
            let tx = link.target.x;
            let ty = link.target.y;
            let distance = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
            return distance / 2;
        }

        // function __getLinkTextDy__(link) {
        //     let dy = 2;
        //     if(link.source !== link.target && link.path_count % 2 === 1 && link.path_index != 0){
        //         dy = -2 * Math.pow(-1, link.path_index) * (Math.floor(link.path_index / 2) + 1);
        //     }
        //     return dy;
        // }

        // 获取文字旋转角度
        function __getLinkTextRotate__(link) {
            let sx = link.source.x;
            let sy = link.source.y;
            let tx = link.target.x;
            let ty = link.target.y;
            let rotate = sx < tx ? 0 : 180;
            return "rotate(" + rotate + ", " + (sx + tx) / 2 + " " + (sy + ty) / 2 + ")";
        }

        // 获取元素 transform 属性并格式化
        function __getTranslateAndScaleAndRotate__(element) {
            var transform = d3.select(element).attr("transform");
            var match_translate_scale = transform && /translate/.test(transform) && /scale/.test(transform) && transform.match(/translate\(([^\)]+)\)\s?scale\(([^\)]+)/);
            var translate = match_translate_scale && match_translate_scale[1].split(",") || [0, 0];
            var k = match_translate_scale && match_translate_scale[2] || 1;
            var match_rotate = transform && /rotate/.test(transform) && transform.match(/\s?rotate\(([^\)]+)/);
            var rotate = match_rotate && match_rotate[1] || 0;
            var x = translate[0];
            var y = translate[1];
            return {"x": x, "y": y, "k": k, "rotate": rotate};
        }
        
        // 更新数据
        function __updateData__(data) {
            stopLayout();
            __data__ = data;
            if (cur_settings.graph.layout_mode === "force") {
                force_simulation.nodes(__data__.nodes)
                    .force("link")
                    .links(__data__.links);
            } else if (cur_settings.graph.layout_mode === "radius") {
                __data__.nodes.forEach(node => {
                    delete node.x;
                    delete node.y;
                });
                radius_simulation.nodes(__data__.nodes)
                    .force("link")
                    .links(__data__.links);
            }
            
            __drawNodes__(__data__.nodes);
            __drawLinks__(__data__.links, network_graph.select("#link_layout"));
            startLayout();
        }

        function getData() {
            return __data__;
        }

        // 开始布局
        function startLayout() {
            cur_settings.graph.calculating = true;
            d3.select("#network-status").style("animation", "calc ease 1s infinite");
            if (cur_settings.graph.layout_mode === "force") {
                force_simulation.alpha(1)
                    .alphaDecay(0.01)
                    .alphaMin(0.002)
                    .restart();
            } else if (cur_settings.graph.layout_mode === "radius") {
                radius_simulation.alpha(2)
                    .alphaDecay(0.05)
                    .alphaMin(0.001)
                    .restart();
            }
        }

        // 停止布局
        function stopLayout() {
            cur_settings.graph.calculating = false;
            d3.select("#network-status").style("animation", "none");
            force_simulation.stop();
            radius_simulation.stop();
        }

        function changeLayoutMode(mode) {
            cur_settings.graph.layout_mode = mode;
            __updateData__(__data__);
        }

        function changeAnalyseMode(mode) {
            cur_settings.graph.analyse_mode = mode;
            __updateData__(__data__);
        }

        // 添加节点
        function addNode(node, x, y) {
            node["x"] = arguments[1] ? x : svg_rect.width / 2;
            node["y"] = arguments[2] ? y : svg_rect.height / 2;
            __data__.nodes.push(node);
            __updateData__(__data__);
        }

        // 添加关系
        function addLink(snode, tnode, type) {
            let source = snode,
                target = tnode;
            if(typeof snode !== "object") {
                node_elements.each(node => { 
                    if(node.id == snode) {
                        source = node;
                    } 
                });
            }
            if(typeof tnode !== "object") {
                node_elements.each(node => { 
                    if(node.id == tnode) {
                        target = node;
                    }
                });
            }
            __data__.links.push({source: source, target: target, type: type});
            __updateData__(__data__);
        }
            
        // 删除节点
        function removeNode(node) {
            if(typeof node !== "object") {
                node_elements.each(cur_node => {
                    if(cur_node.id == node) {
                        node = cur_node;
                    }
                })
            }
            __data__.nodes.splice(node.index, 1);
            __data__.links = __data__.links.filter(link => link.source !== node && link.target !== node);
            link_elements.filter(link => link.source === node || link.target === node).remove();
            if (connect_elements.length !== 0) {
                connect_elements.filter(link => link.source === node || link.target === node).remove();
            }
            let remove_node = node_elements.filter(cur_node => cur_node === node);
            remove_node.selectAll("circle")
                .style("stroke-width", 0)
                .transition()
                .duration(300)
                .ease(d3.easeLinear)
                .attr("r", 0);
            setTimeout(() => {
                remove_node.remove();
            }, 300);
        }

        // 删除关系
        function removeLink(link) {
            __data__.links.splice(link.index, 1);
            let source = link.source.id,
                target = link.target.id;
            link_elements.each(function(link) { 
                if(link.source.id === source && link.target.id === target) {
                    d3.select(this).remove();
                }
            });
        }

        // 连接图
        function connectGraph(graph, links, force) {
            links.forEach(link => {
                __data__.nodes.forEach(node => {
                    if(node.id === link.source) {
                        link.source = node;
                    } else if(node.id === link.target) {
                        link.target = node;
                    }
                })
                let graph_data = graph.getData();
                graph_data.nodes.forEach(node => {
                    if(node.id === link.source) {
                        link.source = node;
                    } else if(node.id === link.target) {
                        link.target = node;
                    }
                })
            })
            if(force === true) {
                force_simulation.force("link", d3.forceLink().id(function (node) { return node.id })
                    .strength(0.005))
                    .force("charge", d3.forceManyBody().strength(cur_settings.graph.repulsion))
                    .force("link")
                    .links(links);
            }
            __drawLinks__(links, connect_layout, "0");
        }

        return {
            getData: getData,
            startLayout: startLayout,
            stopLayout: stopLayout,
            changeLayoutMode: changeLayoutMode,
            changeAnalyseMode: changeAnalyseMode,
            fillText: fillText,
            addNode: addNode,
            removeNode: removeNode,
            addLink: addLink,
            removeLink: removeLink,
            connectGraph: connectGraph,
        }
    }

    var vis = null,
        container = null,
        connect_layout = null,
        connect_elements = [];

    var svg_rect = Object();

    function NetworkGraph(element) {
        vis = d3.select("#" + (typeof element !== "undefined" ? element : "body"));
        vis.on("click", () => {
                d3.selectAll(".menu").remove();
            });
        container = vis.append("g")
            .attr("id", "container");
        connect_layout = container.append("g")
            .attr("id", "connect_layout");
        svg_rect = document.getElementById(element).getBoundingClientRect();
        return {
            getDemoData: getDemoData,
            drawNetworkGraph: drawNetworkGraph,
        };
    }
    window.NetworkGraph = NetworkGraph;
    const graph_image = "data:image/svg+xml;base64," +
    "PD94bWwgdmVyc2lvbj0nMS4wJyBlbmNvZGluZz0naXNvLTg4NTktMSc/Pgo8IURPQ1RZUEUgc3ZnIFBVQkx" +
    "JQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICdodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS" +
    "4xL0RURC9zdmcxMS5kdGQnPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnL" +
    "zIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjI2Ljk5IDIyNi45OSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cu" +
    "dzMub3JnLzE5OTkveGxpbmsiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDIyNi45OSAyMjYuOTkiPgo" +
    "gIDxnPgogICAgPHBhdGggZD0ibTIyNC4yNDgsNjcuMjUyYy0yLjkwOC01LjQzMi03Ljc1Ny05LjQwNS0xMy" +
    "42NTQtMTEuMTg5LTUuODk3LTEuNzg1LTEyLjEzNi0xLjE2NS0xNy41NjcsMS43NDMtNS40MzEsMi45MDktO" +
    "S40MDUsNy43NTgtMTEuMTg5LDEzLjY1NS0xLjE4OSwzLjkyOC0xLjI4Niw4LjAwNC0wLjM3NiwxMS44OTVs" +
    "LTI0LjkwNSwxMy4zMzZjLTcuNTc1LTEwLjYzNS0xOS4zODMtMTguMDQ0LTMyLjk1LTE5Ljc1MXYtMjEuMjU" +
    "zYzkuODE4LTIuNjQ4IDE3LjA2NS0xMS42MjYgMTcuMDY1LTIyLjI2OSAwLTEyLjcxOC0xMC4zNDctMjMuMD" +
    "Y1LTIzLjA2NS0yMy4wNjVzLTIzLjA2NiwxMC4zNDctMjMuMDY2LDIzLjA2NmMwLDEwLjY0MyA3LjI0OCwxO" +
    "S42MjEgMTcuMDY1LDIyLjI2OXYyMS4yNTFjLTE3LjMyOCwyLjE4MS0zMS43OTUsMTMuNjY0LTM4LjIyMywy" +
    "OS4yODRsLTI3LjI1Ny03LjM0NGMwLjAwNi0zLjk5Ny0xLjAxMi03Ljk0NS0zLjA2LTExLjUwMi0zLjA3My0" +
    "1LjM0LTguMDQyLTkuMTY0LTEzLjk5LTEwLjc2Ny0xMi4yODQtMy4zMS0yNC45NjMsMy45OTEtMjguMjcyLD" +
    "E2LjI3MS0xLjYwMyw1Ljk0OS0wLjc5MywxMi4xNjYgMi4yOCwxNy41MDVzOC4wNDIsOS4xNjQgMTMuOTksM" +
    "TAuNzY3YzEuOTk3LDAuNTM4IDQuMDIzLDAuODA0IDYuMDM4LDAuODA0IDMuOTg1LDAgNy45Mi0xLjA0MyAx" +
    "MS40NjgtMy4wODQgMy41NTctMi4wNDcgNi40MjEtNC45NDggOC40MjQtOC40MDdsMjcuMjU4LDcuMzQ1Yy0" +
    "wLjI5NCwyLjE0MS0wLjQ1OSw0LjMyMi0wLjQ1OSw2LjU0MyAwLDExLjAyMSAzLjc1OSwyMS4xNzUgMTAuMD" +
    "Q5LDI5LjI3bC0xOS45ODUsMTkuOTg1Yy04LjgxNC01LjA2NC0yMC4yNzQtMy44NTktMjcuNzk4LDMuNjYzL" +
    "TguOTkzLDguOTkzLTguOTkzLDIzLjYyNiAwLDMyLjYyIDQuNDk3LDQuNDk3IDEwLjQwMyw2Ljc0NSAxNi4z" +
    "MSw2Ljc0NSA1LjkwNiwwIDExLjgxMy0yLjI0OCAxNi4zMS02Ljc0NSA3LjUyMy03LjUyNCA4LjcyOC0xOC4" +
    "5ODQgMy42NjMtMjcuNzk3bDE5Ljk4NS0xOS45ODVjOC4wOTUsNi4yOSAxOC4yNDgsMTAuMDQ5IDI5LjI3LD" +
    "EwLjA0OXMyMS4xNzUtMy43NTkgMjkuMjctMTAuMDQ5bDE5Ljk4NSwxOS45ODVjLTUuMDY0LDguODE0LTMuO" +
    "DYsMjAuMjc0IDMuNjYzLDI3Ljc5NyA0LjQ5Nyw0LjQ5NyAxMC40MDMsNi43NDUgMTYuMzEsNi43NDUgNS45" +
    "MDcsMCAxMS44MTMtMi4yNDkgMTYuMzEtNi43NDUgOC45OTMtOC45OTMgOC45OTMtMjMuNjI2IDAtMzIuNjI" +
    "tNy41MjMtNy41MjMtMTguOTg0LTguNzI3LTI3Ljc5Ny0zLjY2M2wtMTkuOTg1LTE5Ljk4NWM2LjI5LTguMD" +
    "k1IDEwLjA0OS0xOC4yNDggMTAuMDQ5LTI5LjI3IDAtNi4wMjEtMS4xMy0xMS43ODEtMy4xNzEtMTcuMDkzb" +
    "DI0Ljg4Ny0xMy4zMjZjMi43MzQsMi45MTUgNi4xOCw1LjA5MyAxMC4xMDksNi4yODIgMi4yMDgsMC42Njgg" +
    "NC40NjUsMC45OTkgNi43MDksMC45OTkgMy43NDgsMCA3LjQ2MS0wLjkyNCAxMC44NTgtMi43NDMgNS40MzI" +
    "tMi45MDggOS40MDUtNy43NTcgMTEuMTg5LTEzLjY1NHMxLjE2My0xMi4xMzctMS43NDUtMTcuNTY4em0tMT" +
    "UuMTExLDIwLjY0MmMtMi42MDUsMS4zOTYtNS41OTgsMS42OTMtOC40MjcsMC44MzYtMi44MjktMC44NTUtN" +
    "S4xNTUtMi43NjItNi41NS01LjM2OC0xLjM5Ni0yLjYwNS0xLjY5Mi01LjU5OS0wLjgzNi04LjQyOCAwLjg1" +
    "NS0yLjgyOSAyLjc2Mi01LjE1NSA1LjM2OC02LjU1IDEuNjMtMC44NzMgMy40MTEtMS4zMTYgNS4yMDktMS4" +
    "zMTYgMS4wNzYsMCAyLjE1OSwwLjE1OSAzLjIxOCwwLjQ3OSAyLjgyOSwwLjg1NSA1LjE1NSwyLjc2MiA2Lj" +
    "U1LDUuMzY4IDEuMzk2LDIuNjA1IDEuNjkyLDUuNTk4IDAuODM2LDguNDI3LTAuODU1LDIuODMxLTIuNzYyL" +
    "DUuMTU3LTUuMzY4LDYuNTUyem0tNTUuNzI3LDM2LjQ2YzAsMTkuNzQyLTE2LjA2MiwzNS44MDQtMzUuODA0" +
    "LDM1LjgwNHMtMzUuODA0LTE2LjA2Mi0zNS44MDQtMzUuODA0IDE2LjA2Mi0zNS44MDQgMzUuODA0LTM1Ljg" +
    "wNCAzNS44MDQsMTYuMDYyIDM1LjgwNCwzNS44MDR6bS00Ni44NjktOTAuOTM0YzAtNi4xMDIgNC45NjQtMT" +
    "EuMDY1IDExLjA2NS0xMS4wNjVzMTEuMDY1LDQuOTY0IDExLjA2NSwxMS4wNjVjMCw2LjEwMS00Ljk2NCwxM" +
    "S4wNjUtMTEuMDY1LDExLjA2NXMtMTEuMDY1LTQuOTY0LTExLjA2NS0xMS4wNjV6bS04Ni4zNDUsNzYuMTQ3" +
    "Yy0yLjg1NC0wLjc2OS01LjIzNy0yLjYwNC02LjcxMS01LjE2NS0xLjQ3NS0yLjU2Mi0xLjg2My01LjU0NC0" +
    "xLjA5NC04LjM5OCAxLjU4Ny01Ljg5MiA3LjY3Mi05LjM5MyAxMy41NjMtNy44MDYgMi44NTQsMC43NjkgNS" +
    "4yMzcsMi42MDMgNi43MTIsNS4xNjUgMS40NzQsMi41NjIgMS44NjIsNS41NDQgMS4wOTMsOC4zOTgtMS41O" +
    "DcsNS44OTItNy42Nyw5LjM5My0xMy41NjMsNy44MDZ6bTM2LjAwNyw5MS44MzljLTQuMzEzLDQuMzE0LTEx" +
    "LjMzNCw0LjMxNC0xNS42NDksMC00LjMxNC00LjMxNC00LjMxNC0xMS4zMzQgMC0xNS42NDkgMi4xNTctMi4" +
    "xNTcgNC45OTEtMy4yMzUgNy44MjUtMy4yMzUgMi44MzMsMCA1LjY2NywxLjA3OSA3LjgyNCwzLjIzNSA0Lj" +
    "MxNCw0LjMxNSA0LjMxNCwxMS4zMzUgMCwxNS42NDl6bTEzOC40NTUtMTUuNjQ5YzQuMzE0LDQuMzE0IDQuM" +
    "zE0LDExLjMzNCAwLDE1LjY0OS00LjMxMyw0LjMxNC0xMS4zMzQsNC4zMTQtMTUuNjQ5LDAtNC4zMTQtNC4z" +
    "MTQtNC4zMTQtMTEuMzM0IDAtMTUuNjQ5IDIuMTU3LTIuMTU3IDQuOTkxLTMuMjM1IDcuODI1LTMuMjM1IDI" +
    "uODMzLDAgNS42NjcsMS4wNzggNy44MjQsMy4yMzV6Ii8+CiAgPC9nPgo8L3N2Zz4K";
    const link_image  = "data:image/svg+xml;base64," +
    "Cjxzdmcgdmlld0JveD0iMCAwIDE3IDE2IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9" +
    "yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIGNsYXNzPS" +
    "JzaS1nbHlwaCBzaS1nbHlwaC1saW5rLTEiPjx0aXRsZT44MjA8L3RpdGxlPjxkZWZzPjwvZGVmcz48ZyBzd" +
    "HJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48" +
    "ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxLjAwMDAwMCwgNS4wMDAwMDApIiBmaWxsPSIjNDM0MzQzIj48cmV" +
    "jdCB4PSI0IiB5PSIyIiB3aWR0aD0iNi45NzkiIGhlaWdodD0iMC45NTkiIGNsYXNzPSJzaS1nbHlwaC1maW" +
    "xsIj48L3JlY3Q+PGc+PHBhdGggZD0iTTEzLjYwNCwwIEw5LjM4NSwwIEM4LjY0MiwwIDguMDM1LDAuNTkxI" +
    "DguMDM1LDEuMzE4IEw4LjAzNSwzLjY2MiBDOC4wMzUsNC4zODggOC42NDEsNC45NzkgOS4zODUsNC45Nzkg" +
    "TDEzLjYwNCw0Ljk3OSBDMTQuMzQ4LDQuOTc5IDE0Ljk1Miw0LjM4NyAxNC45NTIsMy42NjIgTDE0Ljk1Miw" +
    "xLjMxOCBDMTQuOTUxLDAuNTkxIDE0LjM0OCwwIDEzLjYwNCwwIEwxMy42MDQsMCBaIE0xNC4wMjQsMy42Nz" +
    "kgQzE0LjAyNCwzLjg3MSAxMy44NTMsNC4wMjcgMTMuNjQzLDQuMDI3IEw5LjMyNSw0LjAyNyBDOS4xMTUsN" +
    "C4wMjcgOC45NDUsMy44NzIgOC45NDUsMy42NzkgTDguOTQ1LDEuMzAyIEM4Ljk0NSwxLjExIDkuMTE1LDAu" +
    "OTUzIDkuMzI1LDAuOTUzIEwxMy42NDMsMC45NTMgQzEzLjg1MywwLjk1MyAxNC4wMjQsMS4xMDkgMTQuMDI" +
    "0LDEuMzAyIEwxNC4wMjQsMy42NzkgTDE0LjAyNCwzLjY3OSBaIiBjbGFzcz0ic2ktZ2x5cGgtZmlsbCI+PC" +
    "9wYXRoPjxwYXRoIGQ9Ik01LjYyMSwwIEwxLjM3NywwIEMwLjYyOCwwIDAuMDIsMC41OTEgMC4wMiwxLjMxO" +
    "CBMMC4wMiwzLjY2MiBDMC4wMiw0LjM4OCAwLjYyOCw0Ljk3OSAxLjM3Nyw0Ljk3OSBMNS42MjEsNC45Nzkg" +
    "QzYuMzY5LDQuOTc5IDYuOTc3LDQuMzg3IDYuOTc3LDMuNjYyIEw2Ljk3NywxLjMxOCBDNi45NzgsMC41OTE" +
    "gNi4zNjksMCA1LjYyMSwwIEw1LjYyMSwwIFogTTYuMDQ5LDMuNjYyIEM2LjA0OSwzLjg1MSA1Ljg3Nyw0Lj" +
    "AwNSA1LjY2OCw0LjAwNSBMMS4zNSw0LjAwNSBDMS4xNDEsNC4wMDUgMC45NjksMy44NTIgMC45NjksMy42N" +
    "jIgTDAuOTY5LDEuMzE4IEMwLjk2OSwxLjEyOSAxLjE0MSwwLjk3NCAxLjM1LDAuOTc0IEw1LjY2OCwwLjk3" +
    "NCBDNS44NzcsMC45NzQgNi4wNDksMS4xMjggNi4wNDksMS4zMTggTDYuMDQ5LDMuNjYyIEw2LjA0OSwzLjY" +
    "2MiBaIiBjbGFzcz0ic2ktZ2x5cGgtZmlsbCI+PC9wYXRoPjwvZz48L2c+PC9nPjwvc3ZnPg==";
    const remove_image = "data:image/svg+xml;base64," +
    "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9" +
    "vbi5pbyAtLT4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cD" +
    "ovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxL" +
    "jEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cu" +
    "dzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDU" +
    "xMiI+CjxnPgo8L2c+Cgk8cGF0aCBkPSJNNDAwIDY0aC0yODhjLTI2LjUxIDAtNDggMjEuNDktNDggNDh2MT" +
    "ZoMzg0di0xNmMwLTI2LjUxLTIxLjQ5LTQ4LTQ4LTQ4ek0zMTYuMTYgMzJsNy4wNTggNTAuNWgtMTM0LjQzN" +
    "mw3LjA1Ny01MC41aDEyMC4zMjF6TTMyMCAwaC0xMjhjLTEzLjIgMC0yNS40OTUgMTAuNjk2LTI3LjMyMSAy" +
    "My43NjlsLTkuMzU3IDY2Ljk2MmMtMS44MjcgMTMuMDczIDcuNDc4IDIzLjc2OSAyMC42NzggMjMuNzY5aDE" +
    "2MGMxMy4yIDAgMjIuNTA1LTEwLjY5NiAyMC42NzktMjMuNzY5bC05LjM1Ny02Ni45NjJjLTEuODI3LTEzLj" +
    "A3My0xNC4xMjItMjMuNzY5LTI3LjMyMi0yMy43Njl2MHpNNDA4IDE2MGgtMzA0Yy0xNy42IDAtMzAuNjk2I" +
    "DE0LjM0MS0yOS4xMDMgMzEuODY5bDI2LjIwNiAyODguMjYzYzEuNTkzIDE3LjUyNyAxNy4yOTcgMzEuODY4" +
    "IDM0Ljg5NyAzMS44NjhoMjQwYzE3LjYgMCAzMy4zMDQtMTQuMzQxIDM0Ljg5Ny0zMS44NjhsMjYuMjA1LTI" +
    "4OC4yNjNjMS41OTQtMTcuNTI4LTExLjUwMi0zMS44NjktMjkuMTAyLTMxLjg2OXpNMTkyIDQ0OGgtNDhsLT" +
    "E2LTIyNGg2NHYyMjR6TTI4OCA0NDhoLTY0di0yMjRoNjR2MjI0ek0zNjggNDQ4aC00OHYtMjI0aDY0bC0xN" +
    "iAyMjR6IiBmaWxsPSIjMDAwMDAwIiAvPgo8L3N2Zz4K";
})();