var width = window.innerWidth
var height = window.innerHeight

var svg = d3.select('#svg')
    .attr('width', width)
    .attr('height', height);

var brush_svg = svg.append("g")
        .attr("class", "brush_svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "none");

var container = d3.select("#container");

d3.json("static/data/test.json").then(function(data) {

	let temp_layout = container.append("g")
	        .attr("class", "temp_layout");
    let link_layout = container.append("g")
	        .attr("class", "link_layout");
	let text_layout = container.append('g')
	        .attr("class", "text_layout");
	let node_layout = container.append("g")
	        .attr("class", "node_layout");

	// 箭头
    var marker = container.append("marker")
        .attr("id", "resolved")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("viewBox", "0 -5 10 10")//坐标系的区域
        .attr("refX", 24)//箭头坐标
        .attr("refY", 0)
        .attr("markerWidth", 12)//标识的大小
        .attr("markerHeight", 12)
        .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
        .attr("stroke-width",2)//箭头宽度
        .append("path")
        .attr("d", "M2,0 L0,-3 L9,0 L0,3 M2,0 L0,3")//箭头的路径
        .attr("fill","green")//箭头颜色
        .style("opacity", "0");

    update(data);
    function update(data) {
    	// data.nodes.forEach(function(d, i) { d.isNew = false; });
    	// 连线对象
	    let linkElements = link_layout.selectAll("path")
	        .data(data.links);
	    linkElements.exit().remove();
	    linkElements = linkElements.enter()
	        .append("path")
	        .attr('class', 'line')
	        .merge(linkElements)
	        .attr("id", function( link, i ){ return 'link-' + i; })
	        .on("mousedown.select-link", selectLink)
	        .on("mouseover.hover-link", hoverLink);

	    // 连线的文字
	    let linkTextElements = text_layout.selectAll('text')
	        .data(data.links);
	    linkTextElements.exit().remove();
	    linkTextElements = linkTextElements.enter()
	        .append('text')
	        .style('font-size', 10)
	        .merge(linkTextElements);
	    linkTextElements.selectAll("textPath").remove();
	    linkTextElements.append('textPath')
	        .attr('xlink:href', function (link, i) { return '#link-' + i; })
	        .text(function(link) { return link.label; });

	    // 节点对象
	    let nodeElements = node_layout.selectAll(".node")
	        .data(data.nodes);
	    nodeElements.exit().remove();
		nodeElements = nodeElements.enter()
	        .append("g")
	        .attr("class", "node")
	        .merge(nodeElements);

	    nodeElements.append("circle")
	        .attr("r", function () { return 16; })
	        .on("mousedown.select-node", selectNode)
	        .on("mouseover.hover-link", hoverNode);

	    nodeElements.append("text")
	    	.attr("class", "node_text")
	        .attr("font-size", 5)
	        .attr("dy", ".35em")
	        .attr("x", function (node) {
	        	return textBreaking(d3.select(this), node.label);
	        });

	    let linkForce = d3
	        .forceLink()
	        .id(function (link) { return link.id })
	        .strength(0.7);

	    let simulation = d3
	        .forceSimulation()
	        .velocityDecay(0.1)
	        .alphaMin(0.05)
	        .force('link', linkForce)
	        .force('charge', d3.forceManyBody().strength(-300))
	        .force('center', d3.forceCenter(width / 2 + 150, height / 2))
	        .alpha(1);

	    simulation.nodes(data.nodes)
	        .on('tick', draw)
	        .force("link").links(data.links);

	    function draw() {
	        nodeElements.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	        linkElements.attr("d", function(link) { return genLinkPath(link); })
	            .attr("marker-end", "url(#resolved)");
	        linkTextElements.attr("dx", function(link) { return getLineTextDx(link); });
	    }

	    // 点击清空所有选中
        svg.on("click", function() {
	        if (!d3.event.ctrlKey) {
	            d3.selectAll(".selected")
	                .classed("selected", false);
	            nodeElements.filter(function(d) {
	                d.selected = false;
	            });
	        }
	    });

	    // 定义托拽
	    let drag = d3.drag()
	        .on('start', dragstartFn)
	        .on('drag', dragFn)
	        .on('end', dragendFn);
	    nodeElements.call(drag);

		function dragstartFn(node) {
		    d3.event.sourceEvent.stopPropagation();
		}

		function dragFn(node) {
		    nodeElements.filter(function(d) { return d.selected; })
				.each(function (node) {
					node.x += d3.event.dx;
					node.y += d3.event.dy;
					d3.select(this)
					  .attr("transform", "translate(" + node.x + "," + node.y + ")");
				})
		    linkElements.attr("d", function(link) {	return genLinkPath(link); })
	 		linkTextElements.attr("dx", function(link) { return getLineTextDx(link) });
		}

		function dragendFn(node) {
		 	if (!d3.event.sourceEvent.ctrlKey) {
		        node.selected = false;
		        d3.select(this).classed("selected", false);
		    }
		}

	    // 定义菜单选项
	    var userMenuData = [
	        [
	            {
	                text: "展开节点",
	                func: function() {
	                // id为节点id
	                var id = Number($(this).attr("id"));
	                c = d3.select(this).datum().label
	                alert("你想查" + c);
	                }
	            },
	            {
	                text: "收起节点",
	            },
	            {
	                text: "删除",
	                func: function() {
	                    removeNode(d3.select(this).datum());
	                }
	            }
	        ]
	    ];

	    // 事件监听方式添加事件绑定
	    $("#svg").smartMenu(userMenuData, {
	      name: "chatRightControl",
	      container: "g.node"
	    });

	    // 删除节点
	    function removeNode(node) {
	        data.nodes.splice(node.index, 1);
	        data.links = data.links.filter(function(link) {
	            if (link.source !== node && link.target !== node) {
	                return true;
	            }
	        });
	        nodeElements.filter(function(cur_node) {
	        	if (cur_node == node) {
	        		return true;
	        	}
	        }).remove();
	        linkElements.filter(function(link) {
	            if (link.source == node || link.target == node) {
	                return true;
	            }
	        }).remove();
	        linkTextElements.filter(function(link) {
	            if (link.source == node || link.target == node) {
	                return true;
	            }
	        }).remove();
	    }

	    d3.select("#delete_node")
	    	.on("click", function() {
	    		svg.attr("class", "cursor_delete");
	    		nodeElements.selectAll("circle")
	    			.attr("class", "cursor_delete")
	    			.on("click.delete_node", function(node) {
	    				removeNode(node);
	    				svg.classed("cursor_delete",false);
			    		nodeElements.selectAll("circle")
			    			.classed("cursor_delete", false)
			    			.on("click.delete_node", null);
	    			});
	    	});

	    // 新建节点
	    d3.select("#creat_node").on("click", function () {
	    	let attr_table = d3.select("#attr_table")
	    		.style("display", "block");
	    	let attr_tbody = attr_table.select("tbody");
	    	attr_tbody.selectAll("*").remove();
	    	attr_tbody.append("tr")
	    		.append("td")
	    		.text("节点属性设置")
	    		.attr("colspan", 2)
	    		.style("text-align", "center");
	    	var new_data = {};
	    	for (let attr in data.nodes[0])	{
	    		if (['x', 'y', 'vx', 'vy', 'index', 'selected', 'previouslySelected'].indexOf(attr) > -1) {
	    			continue;
	    		}
	    		else {
	    			new_data[attr] = null;
	    			let cur_td = attr_tbody.append("tr");
	    			cur_td.append("td")
	    				.text(attr);
	    			cur_td.append("td")
	    				.append("input")
	    				.attr("id", attr);
	    		}
	    	}
	    	let button_layout = attr_tbody.append("tr")
	    		.append("td")
	    		.attr("colspan", 2)
	    		.append("div");

			button_layout.append("button")
				.text("确认")
				.attr("class", "left_button")
				.on("click", function() {
					attr_table.style("display", "none");
					svg.classed("cursor_add", true);
					svg.on("click.create-node", function () {
						for (attr in new_data) {
							new_data[attr] = document.getElementById(attr).value;
						}
						new_data.x = d3.event.x;
						new_data.y = d3.event.y - 30;
						// new_data.isNew = true;
			            data.nodes.push(new_data);
			            update(data);
			      //       let new_node = node_layout.selectAll(".new_node")
			      //       	.data([new_data])
			      //       	.enter()
			      //       	.append("g")
			      //       	.attr("class", "node")
			      //       	.attr("transform", function(node) { return "translate(" + node.x + "," + node.y + ")"; })
			      //       	.call(drag);
			      //       new_node.append("circle")
					    //     .attr("r", function () { return 16; })
					    //     .on("mousedown", selectNode)
					    //     .on("mouseover", hoverNode);
					    // new_node.append("text")
					    // 	.attr("class", "node_text")
					    //     .attr("font-size", 5)
					    //     .attr("dy", ".35em")
					    //     .attr("x", function (node) {
					    //     	return textBreaking(d3.select(this), node.label);
					    //     });
					    // nodeElements = nodeElements.merge(new_node);
			            svg.on("click.create-node", null);
						svg.classed("cursor_add", false);
					});
				});
			button_layout.append("button")
				.text("取消")
				.attr("class", "left_button")
				.on("click", function() {
					attr_table.style("display", "none");
	        	});
    	});

    	// 新建关系
		let first_node = null;
		let second_node = null;
    	d3.select("#creat_link")
    		.on("click", function () {
    			let drag_line = temp_layout.append("line")
    				.attr("stroke", "#00FFFB")
    				.style("stroke-width", 1)
    				.style("opacity", "0");
    			d3.selectAll(".node")
    				.on("click.first-node", function(node) {
    					first_node = node;
    					drag_line.attr("x1", node.x)
    						.attr("y1", node.y);
    					svg.on("mousemove.add-link", function() {
    						translate_scale = getTranslateAndScale();
    						scale = translate_scale.scale;
    						translate = translate_scale.translate;
    						drag_line.attr("x2", (d3.event.x - translate[0]) / scale)
    							.attr("y2", ((d3.event.y - 30) - translate[1]) / scale);
    						drag_line.style("opacity", 1);
    					})
    					d3.selectAll(".node")
							.on("click.first-node", null);
    					d3.selectAll(".node")
    						.on("click.second-node", function(node) {
    						second_node = node;
    						svg.on("mousemove.add-link", null);
    						drag_line.attr("x2", node.x)
    							.attr("y2", node.y);
    						d3.selectAll(".node")
    							.on("click.second-node", null);
    						let new_data = {"source": first_node.id, "target": second_node.id, "strength": 0.7, "label": "5g-技术"};
    						data.links.push(new_data);
    						drag_line.remove();
    						update(data);
    					})
    				});
    		})

    	// 框选功能
	    data.nodes.forEach(function(d) {
	        d.selected = false;
	        d.previouslySelected = false;
	    });

	    brushEvent = d3.brush()
	        .extent([[0, 0], [width, height]])
	        .on("start", brushStarted)
	        .on("brush", brushed)
	        .on("end", brushEnded);

	    brush_svg.call(brushEvent);

	    function brushStarted() {
	        if (d3.event.sourceEvent.type !== "end") {
	            nodeElements.classed("selected", false);
	            data.nodes.map(function(node) {
	                node.selected = false;
	            });
	        }
	    }

	    function brushed() {
	      if (d3.event.sourceEvent.type !== "end") {
	        var selection = d3.event.selection;
	        nodeElements.classed("selected", function(d) {
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
    }

    // svg缩放
    // var zoom = d3.zoom()
    // 	.scaleExtent([0.1, 10])
    // 	.on("zoom", zoomed);
    // svg.call(zoom)
    // 	.on('dblclick.zoom', null);
    svg.call(d3.zoom().on("zoom", function () {
    	container.attr("transform", d3.event.transform);
    	brush_svg.attr("transform", d3.event.transform);
    }))

    d3.select("#zoom_out").on("click", function() {
       zoom.scaleBy(container, 2);
    });      

    d3.select("#zoom_in").on("click", function() {
       zoom.scaleBy(container, 0.5);
    });      

    d3.select("#zoom_reset").on("click", function() {
       container.call(zoom.transform, d3.zoomIdentity);
    });

    // 重新布局
    d3.select("#reset").on("click", function() {
        update(data);
    });

    // 框选模式
    var isBrush = false;
    d3.select("#brush_mode")
        .on("click", function () {
            isBrush = !isBrush;
            if (isBrush) {
                d3.select(this).classed("on", true);
                brush_svg.style("display", "block");
            }
            else {
                d3.select(this).classed("on", false);
                brush_svg.style("display", "none");
            }
        })

    // 节点标签显示开关
    var node_text_state = false;
    var node_switch = d3.select("#node_switch");
    var node_text = d3.selectAll(".node_text");

    node_switch.on("click", function() {
        if (node_text_state) {
            node_switch.select("i").attr("class","fa fa-toggle-off");
            node_text.style("display", "none");
        }
        else {
            node_switch.select("i").attr("class","fa fa-toggle-on");
            node_text.style("display", "block");
        }
        node_text_state = !node_text_state;
    });

    // 关系标签显示开关
    var link_text_state = false;
    var link_switch = d3.select("#link_switch");
    var link_text = d3.selectAll(".link_text");

    link_switch.on("click", function() {
        if (link_text_state) {
            link_switch.select("i").attr("class","fa fa-toggle-off");
            link_text.style("display", "none");
        }
        else {
            link_switch.select("i").attr("class","fa fa-toggle-on");
            link_text.style("display", "block");
        }
        link_text_state = !link_text_state;
    });

    // 箭头显示开关
    var marker_state = false;
    var marker_switch = d3.select("#marker_switch");

    marker_switch.on("click", function() {
        if (marker_state) {
            marker_switch.select("i").attr("class","fa fa-toggle-off");
            d3.select("marker").select("path").style("opacity", "0");
        }
        else {
            marker_switch.select("i").attr("class","fa fa-toggle-on");
            d3.select("marker").select("path").style("opacity", "1");
        }
        marker_state = !marker_state;
    });

    // 调整图参数
    d3.select("#node_size").on("input propertychange", function() {
        var size = this.value;
        nodeElements.selectAll("circle").attr("r", function(node, i){
            return size;
        });
    });

    d3.select("#node_opacity").on("input propertychange", function() {
        var opacity = this.value;
        nodeElements.style("opacity", function(node, i){
            return opacity;
        });
    });      

    d3.select("#node_stroke").on("input propertychange", function() {
        var stroke_width = this.value;
        nodeElements.selectAll("circle").style("stroke-width", function(node, i){
            return stroke_width;
        });
    });

    d3.select("#link_strength").on("input propertychange", function() {
    	simulation.force("link").strength(+this.value);
	    simulation.alpha(1).restart();
    });

    d3.select("#line_color").on("change", function() {
    	d3.selectAll("path").style("stroke", this.value);
    });

    d3.select("#line_stroke_width").on("input propertychange", function() {
        var line_stroke_width = this.value;
        linkElements.style("stroke-width", function(node, i){
            return line_stroke_width;
        });
    });

    // 缩放功能实现
    function zoomed() {
        container.attr("transform", d3.event.transform);
    }
    
    // 颜色标记
    d3.selectAll(".color_item")
      .on("click", changeColor);

    function changeColor() {
        nodeElements.filter(function(d) { return d.selected; })
            .attr("fill", d3.select(this).style("background-color"));
    }

    d3.select("#node_color").on("change", function () {
        nodeElements.filter(function(d) { return d.selected; })
            .attr("fill", this.value);
    });

    d3.select("#setting_button").on("click", changeShowState);
    var setting_box = d3.select("#setting_box");
    var hide_setting = d3.select("#hide_setting")
                         .on("click", hideSettingBox);
    var isShow = false;
    function changeShowState() {
        isShow = !isShow;
        if (isShow) {
            setting_box.style("display", "block");
        }
        else {
            setting_box.style("display", "none");
        }
    }
    function hideSettingBox() {
        isShow = false;
        setting_box.style("display", "none");
    }

    d3.select("#resize").on("click", resize);
    var check = true;
    var resize_button = d3.select("#resize").select("i");
    function resize() {
        if (check) {
            enterFullScreen()
            resize_button.attr("class","fa fa-compress");
        }
        else {
            exitFullScreen()
            resize_button.attr("class","fa fa-expand");
        }
        check = !check;
    }

    // 功能区按钮
    function getNeighbors() {
    	var neighbors = [];
    	selected_nodes = data.nodes.filter(function (node) {return node.selected});
  		data.links.forEach(function (link) {
  			selected_nodes.forEach(function (node) {
  				if(node.id === link.target.id) { neighbors.push(link.source.id) }
  				else if (node.id === link.source.id) { neighbors.push(link.target.id) }
  			})
  		})
		  return neighbors
	}

    d3.select("#selecct_correlation")
        .on("click", selecct_correlation);

    function selecct_correlation() {
    	neighbors = getNeighbors();
    	d3.selectAll(".node").each(function(node) {
    		if(neighbors.indexOf(node.id) > -1) {
    			d3.select(this).classed("selected", true);
    			node.selected = true;
    		}
    	});
	}
})

function textBreaking(d3text, text) {
    const len = text.length;
    if (len <= 4) {
        d3text.append('tspan')
            .attr('x', 0)
            .attr('y', 2)
            .text(text);
    } else {
        const topText = text.substring(0, 4);
        const midText = text.substring(4, 9);
        let botText = text.substring(9, len);
        let topY = -9;
        let midY = 2;
        let botY = 10;
        if (len <= 10) {
            topY += 5;
            midY += 5;
        } else {
            botText = text.substring(9, 11) + '...';
        }

        d3text.text('');
        d3text.append('tspan')
            .attr('x', 0)
            .attr('y', topY)
            .text(function () {
                return topText;
            });
        d3text.append('tspan')
            .attr('x', 0)
            .attr('y', midY)
            .text(function () {
                return midText;
            });
        d3text.append('tspan')
            .attr('x', 0)
            .attr('y', botY)
            .text(function () {
                return botText;
            });
    }
}

// 生成关系连线路径
function genLinkPath(link) {
    var sx = link.source.x;
    var tx = link.target.x;
    var sy = link.source.y;
    var ty = link.target.y;

    return 'M' + sx + ',' + sy + ' L' + tx + ',' + ty;
}

function getLineTextDx(link) {

    const sx = link.source.x;
    const sy = link.source.y;
    const tx = link.target.x;
    const ty = link.target.y;

    const distance = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));

    // const textLength = link.label.length;
    const textLength = link.label.length;
    const deviation = 8; // 调整误差
    const dx = (distance - 3 * textLength) / 2;

    return dx;
}

// 掠过显示节点信息
function hoverNode(node) {
    var node_info = d3.select("#node_info")
        .style("display", "block");
    node_info.selectAll(".info").remove();
    for (var key in node) {
        if (['x', 'y', 'vx', 'vy', 'index', 'selected', 'previouslySelected'].indexOf(key.toString()) != -1) {
            continue;
        }
        node_info.append('p')
            .attr("class", "info")
            .text(key + ": " + node[key]);
    }
}

// 点击选中节点
function selectNode(node) {
    node.selected = true;
    d3.select(this.parentNode).classed("selected", true);
}

// 掠过显示关系信息
function hoverLink(link) {
    var link_info = d3.select("#link_info")
                      .style("display", "block");
    link_info.selectAll(".info").remove();
    for(var key in link){
        // if(['x', 'y', 'vx', 'vy', 'index', 'selected', 'previouslySelected']
        //     .indexOf(item.toString()) != -1) {
        //     continue;
        // }
    var temp = link_info.append('p')
                .attr("class", "info")
    if (key != "source" && key != "target") {
        temp.text(key + ": " + link[key]);
    }
    else {
        temp.text(key + ": " + link[key]["label"]);
    }                    
    }
}

// 点击选中边
function selectLink(link) {
    link.selected = true;
    d3.select(this).classed("selected", true);
}

//获取transform
function getTranslateAndScale() {
    let transform = container.attr("transform");
    let matchArr = transform && /translate/.test(transform) && /scale/.test(transform) && transform.match(/translate\(([^\)]+)\)\s?scale\(([^\)]+)/);
    let translate = matchArr && matchArr[1].split(",") || [0, 0];
    let scale = matchArr && matchArr[2] || 1;
    return {translate, scale}
}